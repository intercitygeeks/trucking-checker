
const fs = require('fs');

async function run() {
    // Direct link found in previous step: query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=223672
    const fmcsaUrl = 'https://safer.fmcsa.dot.gov/query.asp';

    // We can just use the same POST approach but with specific DOT
    const formData = new URLSearchParams();
    formData.append('searchtype', 'ANY');
    formData.append('query_type', 'queryCarrierSnapshot');
    formData.append('query_param', 'USDOT');
    formData.append('query_string', '223672'); // Intercity Lines Inc

    console.log('Fetching details for DOT 223672...');
    try {
        const response = await fetch(fmcsaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: formData.toString(),
        });

        const text = await response.text();
        console.log('Status:', response.status);

        fs.writeFileSync('debug_details.html', text);
        console.log('Saved to debug_details.html');

    } catch (e) {
        console.error(e);
    }
}

run();
