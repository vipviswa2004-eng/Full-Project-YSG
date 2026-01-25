const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Create a simple test image buffer
const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

const formData = new FormData();
formData.append('image', testImageBuffer, {
    filename: 'test.png',
    contentType: 'image/png'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/upload',
    method: 'POST',
    headers: formData.getHeaders()
};

console.log('📤 Testing upload endpoint...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

formData.pipe(req);
