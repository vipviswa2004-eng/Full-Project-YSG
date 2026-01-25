const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const testUpload = async () => {
    try {
        // Create a tiny test image
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        // Convert base64 to buffer
        const base64Data = testImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const formData = new FormData();
        formData.append('image', buffer, {
            filename: 'test-category.png',
            contentType: 'image/png'
        });

        console.log('📤 Sending upload request to http://localhost:5000/api/upload...');

        const response = await axios.post('http://localhost:5000/api/upload', formData, {
            headers: formData.getHeaders(),
            validateStatus: () => true // Don't throw on any status
        });

        console.log('\n📊 Response Status:', response.status);
        console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('❌ Request failed!');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', error.response.data);
        }
    }
};

testUpload();
