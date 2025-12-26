const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {Buffer|string} file - The file buffer or path to upload
 * @param {string} fileName - The name for the file (used as public_id)
 * @param {string} folder - The folder name (default: 'product-images')
 * @returns {Promise<{url: string, public_id: string}>}
 */
async function uploadImage(file, fileName, folder = 'product-images') {
    try {
        // Sanitize public_id: remove extension, replace spaces/special chars with hyphens, add timestamp
        const basename = fileName.split('.')[0];
        const sanitizedName = basename
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-') // replace non-alphanumeric with hyphen
            .replace(/-+/g, '-')       // replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, '');     // trim leading/trailing hyphens

        const publicId = `${sanitizedName}-${Date.now()}`;

        // Helper to optimize URL
        const optimizeUrl = (url) => {
            if (!url) return url;
            return url.replace('/upload/', '/upload/f_auto,q_auto/');
        };

        // If file is a Buffer, we need to use upload_stream
        if (Buffer.isBuffer(file)) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: folder,
                        public_id: publicId,
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve({
                            url: optimizeUrl(result.secure_url),
                            public_id: result.public_id
                        });
                    }
                );
                uploadStream.end(file);
            });
        }

        // If file is a path or URL
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            public_id: publicId,
            resource_type: 'auto'
        });

        return {
            url: optimizeUrl(result.secure_url),
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 */
async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of files to upload
 * @param {string} folder - The folder name
 * @returns {Promise<Array<{url: string, public_id: string}>>}
 */
async function uploadMultipleImages(files, folder = 'product-images') {
    try {
        const uploadPromises = files.map((file, index) => {
            const fileName = file.originalname || `image-${index}-${Date.now()}`;
            return uploadImage(file.buffer, fileName, folder);
        });

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
}

module.exports = {
    cloudinary,
    uploadImage,
    deleteImage,
    uploadMultipleImages
};
