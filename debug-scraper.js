
const fs = require('fs');

async function run() {
    const fmcsaUrl = 'https://safer.fmcsa.dot.gov/query.asp';
    const query = '80806';

    // Corrected params based on search
    const formData = new URLSearchParams();
    formData.append('searchtype', 'ANY');
    formData.append('query_type', 'queryCarrierSnapshot');
    formData.append('query_param', 'USDOT');
    formData.append('query_string', query);

    console.log('Fetching with corrected params...');
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
        console.log('Length:', text.length);
        fs.writeFileSync('debug_output_corrected.html', text);
        console.log('Saved to debug_output_corrected.html');

        if (text.includes('J.B. HUNT')) {
            console.log('SUCCESS: Found J.B. HUNT');
        } else {
            console.log('FAILURE: Did not find J.B. HUNT');
        }

    } catch (e) {
        console.error(e);
    }
}

run();
