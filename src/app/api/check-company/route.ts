
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const type = searchParams.get('type') || 'NAME'; // NAME, MC, DOT
  const token = searchParams.get('token');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Captcha token is missing' }, { status: 403 });
  }

  // Verify Captcha
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // Use Env or Google Test Secret Key
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const captchaRes = await fetch(verifyUrl, { method: 'POST' });
    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 403 });
    }
  } catch (e) {
    console.error('Captcha Error', e);
    return NextResponse.json({ error: 'Captcha verification error' }, { status: 500 });
  }

  // Map our types to FMCSA query params
  // https://safer.fmcsa.dot.gov/query.asp
  // Parameters often seen:
  // searchtype: ANY (Name), USDOT, MC_MX
  // query_param: Name, USDOT, MC_MX
  // query_string: <value>

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
    // FMCSA search is POST usually, or GET with params. Let's try POST as forms usually are.
    // Actually safer often accepts GET too, but let's stick to POST if mimicking form.
    // Wait, query.asp is often often accessed via GET in examples? Let's try POST to be safe.

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

    // Check if we are on a list page or a snapshot page.
    // Snapshot page usually has "Company Snapshot" header.
    const pageTitle = $('title').text();
    const isSnapshot = pageTitle.includes('Company Snapshot') || $('h2, h3, b').text().includes('Company Snapshot');

    if (isSnapshot) {
      // Parse Snapshot
      // Parse Snapshot
      const entityType = parseField($, 'Entity Type:');
      const legalName = parseField($, 'Legal Name:');
      const dbaName = parseField($, 'DBA Name:');
      const usdot = parseField($, 'USDOT Number:');
      const mcNumber = parseField($, 'MC/MX/FF Number(s):');
      const powerUnits = parseField($, 'Power Units:');
      const drivers = parseField($, 'Drivers:');

      // Check for Motor Vehicles authorization
      // Based on HTML, it's in a table under "Cargo Carried" or similar?
      // Actually we saw "Cargo Carried:" header.
      // And then rows like: <td>X</td> <td>Motor Vehicles</td>
      const authorizedForMotorVehicles = parseCargoCarried($, 'Motor Vehicles');

      // Determine Broker/Carrier
      let status = 'UNKNOWN';
      const etUpper = entityType.toUpperCase();
      const isCarrier = etUpper.includes('CARRIER');
      const isBroker = etUpper.includes('BROKER');

      if (isCarrier && isBroker) status = 'BOTH';
      else if (isCarrier) status = 'CARRIER';
      else if (isBroker) status = 'BROKER';
      else if (etUpper) status = etUpper; // e.g. "SHIPPER" or nothing

      return NextResponse.json({
        type: 'SNAPSHOT',
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
      // It's a list or no results
      // Look for rows in query tables. 
      // Table often has headers: Name, Location, Type, etc.
      // This part is trickier to genericize without seeing HTML.
      // We will try to find links to query.asp?searchtype=...

      const results: any[] = [];
      // Select all rows that look like results. 
      // Usually there's a table with class 'queryfield' or similar, or just standard table.
      // Let's look for th headers matching 'Name', 'USDOT' etc.

      $('tr').each((i, el) => {
        const cells = $(el).find('td, th');
        // The structure seen in debug_intercity.html:
        // <tr>
        //   <th scope="rpw" ...><a href="...">INTERCITY LINES INC</a></th>
        //   <td ...>WARREN, MA</td>
        // </tr>

        const linkEl = $(el).find('a[href*="query.asp"]');

        if (linkEl.length > 0) {
          const nameVal = linkEl.text().trim();
          const href = linkEl.attr('href');

          // Try to get location from the next cell
          let locationVal = '';
          const parentCell = linkEl.closest('td, th');
          const nextCell = parentCell.next('td, th');
          if (nextCell.length > 0) {
            locationVal = nextCell.text().trim();
          }

          // Extract DOT or value from href to help with precise searching later
          // href example: query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&...&query_string=223672&...
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
              id: idVal, // The DOT/MC number found in the link
              idType: idType,
              url: href
            });
          }
        }
      });

      return NextResponse.json({
        type: 'LIST',
        count: results.length,
        message: 'Multiple results found or no direct snapshot. Please refine search.',
        results // In a real app we'd parse this better, but for now we might just handle the "exact match" case primarily or guide user.
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
