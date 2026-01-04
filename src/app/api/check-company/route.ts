
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function getSecretKey() {
  return process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
}

function generateSessionToken(): string {
  const timestamp = Date.now().toString();
  const secret = getSecretKey();
  const signature = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  // Return base64 of timestamp:signature for easy transport
  return Buffer.from(`${timestamp}:${signature}`).toString('base64');
}

function verifySessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [timestampStr, signature] = decoded.split(':');

    if (!timestampStr || !signature) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiration
    if (Date.now() - timestamp > SESSION_DURATION_MS) return false;

    // Verify signature
    const secret = getSecretKey();
    const expectedSignature = crypto.createHmac('sha256', secret).update(timestampStr).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const type = searchParams.get('type') || 'NAME'; // NAME, MC, DOT
  const captchaToken = searchParams.get('token');
  const sessionToken = searchParams.get('sessionToken');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  let isVerified = false;

  // 1. Try Session Token first
  if (sessionToken && verifySessionToken(sessionToken)) {
    isVerified = true;
  }
  // 2. Fallback to Captcha Token
  else if (captchaToken) {
    // Verify Captcha with Google
    try {
      const secretKey = getSecretKey();
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
      const captchaRes = await fetch(verifyUrl, { method: 'POST' });
      const captchaData = await captchaRes.json();

      if (captchaData.success) {
        isVerified = true;
      }
    } catch (e) {
      console.error('Captcha Error', e);
    }
  }

  if (!isVerified) {
    return NextResponse.json({ error: 'Security verification failed. Please try the captcha again.' }, { status: 403 });
  }

  // Generate a fresh session token (slides the window) or new one
  const newSessionToken = generateSessionToken();

  // Map our types to FMCSA query params
  // ... (rest of the scraping logic)

  // NOTE: I need to preserve the scraping logic below locally or use the tool to replace only the top part.
  // The tool instructions say "ReplacementContent... must be a complete drop-in replacement of the TargetContent".
  // I will target the top part of the file up to the FMCSA logic setup.

  let queryParam = 'NAME';

  switch (type.toUpperCase()) {
    case 'MC':
      queryParam = 'MC_MX';
      break;
    case 'DOT':
      queryParam = 'USDOT';
      break;
    case 'NAME':
    default:
      queryParam = 'NAME';
      break;
  }

  const fmcsaUrl = 'https://safer.fmcsa.dot.gov/query.asp';
  const formData = new URLSearchParams();
  formData.append('searchtype', 'ANY');
  formData.append('query_type', 'queryCarrierSnapshot');
  formData.append('query_param', queryParam);
  formData.append('query_string', query);

  try {
    const response = await fetch(fmcsaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: formData.toString(),
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const pageTitle = $('title').text();
    const isSnapshot = pageTitle.includes('Company Snapshot') || $('h2, h3, b').text().includes('Company Snapshot');

    if (isSnapshot) {
      // Parse Snapshot
      const entityType = parseField($, 'Entity Type:');
      const legalName = parseField($, 'Legal Name:');
      const dbaName = parseField($, 'DBA Name:');
      const usdot = parseField($, 'USDOT Number:');
      const mcNumber = parseField($, 'MC/MX/FF Number(s):');
      const powerUnits = parseField($, 'Power Units:');
      const drivers = parseField($, 'Drivers:');

      const authorizedForMotorVehicles = parseCargoCarried($, 'Motor Vehicles');

      let status = 'UNKNOWN';
      const etUpper = entityType.toUpperCase();
      const isCarrier = etUpper.includes('CARRIER');
      const isBroker = etUpper.includes('BROKER');

      if (isCarrier && isBroker) status = 'BOTH';
      else if (isCarrier) status = 'CARRIER';
      else if (isBroker) status = 'BROKER';
      else if (etUpper) status = etUpper;

      return NextResponse.json({
        type: 'SNAPSHOT',
        sessionToken: newSessionToken, // RETURN TOKEN
        data: {
          legalName,
          dbaName,
          usdot,
          mcNumber,
          entityType,
          status,
          powerUnits,
          drivers,
          authorizedForMotorVehicles,
          phone: parseField($, 'Phone'),
          address: $('#physicaladdressvalue').text().trim(),
          mailingAddress: $('#mailingaddressvalue').text().trim(),
          safetyRating: parseSafetyRating($),
          safetyRatingDate: parseSafetyRatingDate($),
          usdotStatus: parseField($, 'USDOT Status'),
          operatingAuthorityStatus: parseField($, 'Operating Authority Status')
        }
      });
    } else {
      const results: any[] = [];

      $('tr').each((i, el) => {
        const cells = $(el).find('td, th');
        const linkEl = $(el).find('a[href*="query.asp"]');

        if (linkEl.length > 0) {
          const nameVal = linkEl.text().trim();
          const href = linkEl.attr('href');

          let locationVal = '';
          const parentCell = linkEl.closest('td, th');
          const nextCell = parentCell.next('td, th');
          if (nextCell.length > 0) {
            locationVal = nextCell.text().trim();
          }

          let idVal = '';
          let idType = 'NAME';

          if (href) {
            const urlParams = new URLSearchParams(href.split('?')[1]);
            if (urlParams.get('query_param') === 'USDOT') {
              idVal = urlParams.get('query_string') || '';
              idType = 'DOT';
            } else if (urlParams.get('query_param') === 'MC_MX') {
              idVal = urlParams.get('query_string') || '';
              idType = 'MC';
            }
          }

          if (nameVal && href) {
            results.push({
              name: nameVal,
              location: locationVal,
              id: idVal,
              idType: idType,
              url: href
            });
          }
        }
      });

      return NextResponse.json({
        type: 'LIST',
        sessionToken: newSessionToken, // RETURN TOKEN
        count: results.length,
        message: 'Multiple results found or no direct snapshot. Please refine search.',
        results
      });
    }

  } catch (error) {
    console.error('FMCSA Scrape Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from FMCSA' }, { status: 500 });
  }
}

function parseField($: cheerio.CheerioAPI, label: string): string {
  // FMCSA layout is older HTML. Often <th>Label:</th> <td>Value</td>
  // Or <td><font>Label:</font></td> ...
  // We search for an element containing the label, then look at next sibling or cell.

  // Strategy: Find any element containing text `label`
  // Then traverse up to a TH or TD, then look for next TD.

  // Normalize label
  const labelSearch = label.toLowerCase();

  let foundVal = '';

  $('th, td').each((i, el) => {
    if (foundVal) return; // break if found
    const text = $(el).text().trim().toLowerCase();

    // Check for exact-ish match "Label:" or "Label"
    if (text === labelSearch || text === labelSearch + ':' || text.startsWith(labelSearch + ':')) {
      // The value is likely in the next sibling TD
      const nextTd = $(el).next('td');
      if (nextTd.length > 0) {
        foundVal = nextTd.text().trim();
      } else {
        // maybe it's in the next row? (rare for this site)
      }
    }
  });

  return foundVal;
}

function parseCargoCarried($: cheerio.CheerioAPI, cargoType: string): boolean {
  // Logic: Find the cell containing the cargo type text (e.g., "Motor Vehicles")
  // Then check the PREVIOUS cell for an "X".
  // <tr> <td class="queryfield">X</td> <td><FONT ...>Motor Vehicles</FONT></td> </tr>

  let isAuthorized = false;

  $('td').each((i, el) => {
    if (isAuthorized) return;
    const text = $(el).text().trim();
    if (text.toLowerCase() === cargoType.toLowerCase()) {
      const prevTd = $(el).prev('td');
      if (prevTd.length > 0 && prevTd.text().trim().toUpperCase() === 'X') {
        isAuthorized = true;
      }
    }
  });

  return isAuthorized;
}

function parseSafetyRating($: cheerio.CheerioAPI): string {
  // Look for the Safety Rating section. 
  // Usually: <A href="#Safety">Safety Rating</A> ... <TD>SATISFACTORY</TD>
  // In the HTML provided:
  // <A name="Safety">Safety Rating</A> ... 
  // It is often in a table row with header "Safety Rating:"
  // Searching for text "Safety Rating:" in parseField might work if the label matches.
  // Let's rely on parseField but double check the label in HTML.
  // HTML has: <A href="#Safety">Safety Rating</A> inside a H4.
  // Then below that is a table with "Safety Rating:"? 
  // Actually, looking at other FMCSA pages, usually there's a row:
  // TH: Safety Rating:
  // TD: Satisfactory
  // TD: Rating Date: ...
  return parseField($, 'Safety Rating');
}

function parseSafetyRatingDate($: cheerio.CheerioAPI): string {
  return parseField($, 'Rating Date');
}
