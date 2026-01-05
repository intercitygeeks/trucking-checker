const crypto = require('crypto');

const SESSION_DURATION_MS = 10 * 60 * 1000;
const SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

function generateSessionToken() {
    const timestamp = Date.now().toString();
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(timestamp).digest('hex');
    return Buffer.from(`${timestamp}:${signature}`).toString('base64');
}

function verifySessionToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [timestampStr, signature] = decoded.split(':');

        if (!timestampStr || !signature) {
            console.log('Split failed');
            return false;
        }

        const timestamp = parseInt(timestampStr, 10);
        if (isNaN(timestamp)) {
            console.log('Timestamp NaN');
            return false;
        }

        if (Date.now() - timestamp > SESSION_DURATION_MS) {
            console.log('Expired');
            return false;
        }

        const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(timestampStr).digest('hex');

        // Mimic the route logic
        const isValid = (signature === expectedSignature);
        // note: using === for simplicity in debug script, route uses timingSafeEqual
        if (!isValid) console.log(`Signature mismatch. Got ${signature}, want ${expectedSignature}`);
        return isValid;
    } catch (e) {
        console.log('Exception', e);
        return false;
    }
}

// Test
const token = generateSessionToken();
console.log('Generated Token:', token);
const isValid = verifySessionToken(token);
console.log('Is Valid:', isValid);

// Test delay
setTimeout(() => {
    console.log('Testing after delay...');
    console.log('Is Valid (Delayed):', verifySessionToken(token));
}, 1000);
