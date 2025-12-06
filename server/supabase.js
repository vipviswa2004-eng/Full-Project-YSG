const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found in .env file');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Upload an image to Supabase Storage
 * @param {Buffer|File} file - The file to upload
 * @param {string} fileName - The name for the file
 * @param {string} bucket - The storage bucket name (default: 'product-images')
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadImage(file, fileName, bucket = 'product-images') {
    try {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(uniqueFileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            url: publicUrl,
            path: data.path
        };
    } catch (error) {
        console.error('Error uploading to Supabase:', error);
        throw error;
    }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - The path of the file to delete
 * @param {string} bucket - The storage bucket name
 */
async function deleteImage(filePath, bucket = 'product-images') {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting from Supabase:', error);
        throw error;
    }
}

/**
 * Upload multiple images to Supabase Storage
 * @param {Array} files - Array of files to upload
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<Array<{url: string, path: string}>>}
 */
async function uploadMultipleImages(files, bucket = 'product-images') {
    try {
        const uploadPromises = files.map((file, index) => {
            const fileName = file.originalname || `image-${index}.jpg`;
            return uploadImage(file.buffer, fileName, bucket);
        });

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
}

/**
 * List all files in a bucket
 * @param {string} bucket - The storage bucket name
 * @param {string} path - Optional path within the bucket
 */
async function listImages(bucket = 'product-images', path = '') {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(path, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error listing images:', error);
        throw error;
    }
}

module.exports = {
    supabase,
    uploadImage,
    deleteImage,
    uploadMultipleImages,
    listImages
};
