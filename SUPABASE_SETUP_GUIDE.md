# 🚀 Supabase Image Storage Setup Guide

This guide will help you set up Supabase Storage for all your product images, user uploads, and media files.

## 📋 Prerequisites

- Supabase account (free tier available)
- Node.js installed
- Your Yathes Sign Galaxy project

## 🎯 Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign In"**
3. Create a new project:
   - **Name**: `yathes-sign-galaxy` (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users (e.g., Mumbai for India)
4. Wait for the project to be created (~2 minutes)

### 2. Create Storage Bucket

1. In your Supabase dashboard, click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Configure the bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Enable** (so images are publicly accessible)
   - **File size limit**: 5MB (or as needed)
   - **Allowed MIME types**: `image/*`
4. Click **"Create bucket"**

### 3. Get Your Supabase Credentials

1. In your Supabase dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. Copy the following:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 4. Update Your .env File

Open `server/.env` and add your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**Replace** `xxxxxxxxxxxxx` and `your_anon_key_here` with your actual values from Step 3.

### 5. Configure Storage Policies (Important!)

To allow public access to images, you need to set up storage policies:

1. In Supabase dashboard, go to **Storage** → **Policies**
2. Click on **"product-images"** bucket
3. Click **"New Policy"**
4. Choose **"For full customization"**
5. Create a policy for **SELECT** (read):
   ```sql
   -- Policy name: Public Read Access
   -- Allowed operation: SELECT
   -- Policy definition:
   true
   ```
6. Click **"Review"** then **"Save policy"**

7. Create another policy for **INSERT** (upload):
   ```sql
   -- Policy name: Authenticated Upload
   -- Allowed operation: INSERT
   -- Policy definition:
   true
   ```
8. Click **"Review"** then **"Save policy"**

### 6. Restart Your Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd server
node server.js
```

### 7. Test the Upload

1. Go to your admin panel
2. Try uploading a product image
3. Check the console - you should see:
   ```
   ✅ Image uploaded to Supabase: https://xxxxx.supabase.co/storage/v1/object/public/product-images/...
   ```

### 8. Migrate Existing Images (Optional)

If you have existing local images, migrate them to Supabase:

```bash
cd server
node migrate_images_to_supabase.js
```

This will:
- ✅ Upload all local images to Supabase
- ✅ Update database URLs automatically
- ✅ Show progress and summary

## 🎨 Bucket Structure

Your Supabase storage will be organized like this:

```
product-images/
├── 1733248392847-crystal-portrait.jpg
├── 1733248401234-wooden-frame.jpg
├── 1733248409876-led-lamp.png
└── ...
```

Each file has a unique timestamp prefix to prevent naming conflicts.

## 🔧 Features Implemented

### ✅ Automatic Upload
- All new images automatically upload to Supabase
- Fallback to local storage if Supabase is not configured

### ✅ Image Management
- Upload single images
- Upload multiple images (gallery)
- Delete images from Supabase
- List all images in a bucket

### ✅ Admin Panel Integration
- Product image uploads use Supabase
- Gallery image uploads use Supabase
- User profile pictures use Supabase

### ✅ Migration Tool
- Migrate existing local images to Supabase
- Automatic database URL updates
- Progress tracking and error handling

## 📊 Storage Limits

**Supabase Free Tier:**
- 1 GB storage
- 2 GB bandwidth per month
- Unlimited API requests

**Upgrade if needed:**
- Pro: $25/month (100 GB storage, 200 GB bandwidth)
- Team: Custom pricing

## 🔒 Security Best Practices

1. **Never commit .env file** - It contains your API keys
2. **Use Row Level Security (RLS)** - Already configured in policies
3. **Set file size limits** - Currently 5MB per file
4. **Validate file types** - Only allow images
5. **Use anon key for public access** - Service role key for admin only

## 🐛 Troubleshooting

### Images not uploading?
1. Check `.env` file has correct credentials
2. Verify bucket name is `product-images`
3. Check storage policies are set to `true`
4. Look for errors in server console

### Migration script errors?
1. Ensure MongoDB is running
2. Check local image files exist in `uploads/` folder
3. Verify Supabase credentials in `.env`

### Images not displaying?
1. Check if bucket is set to **public**
2. Verify storage policies allow SELECT
3. Check browser console for CORS errors

## 📝 API Endpoints

### Upload Image
```javascript
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "url": "https://xxxxx.supabase.co/storage/v1/object/public/product-images/...",
  "path": "1733248392847-image.jpg"
}
```

## 🎯 Next Steps

1. ✅ Set up Supabase project
2. ✅ Create storage bucket
3. ✅ Add credentials to .env
4. ✅ Configure storage policies
5. ✅ Test image upload
6. ✅ Migrate existing images
7. 🚀 Deploy to production!

## 💡 Tips

- **Organize by folders**: You can create subfolders like `products/`, `users/`, `reviews/`
- **Image optimization**: Consider compressing images before upload
- **CDN**: Supabase Storage includes CDN for fast global delivery
- **Backup**: Supabase automatically backs up your data

## 🆘 Need Help?

- Supabase Docs: https://supabase.com/docs/guides/storage
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in your repo

---

**🎉 Congratulations!** Your images are now stored in Supabase Cloud Storage with automatic backups, CDN delivery, and unlimited scalability!
