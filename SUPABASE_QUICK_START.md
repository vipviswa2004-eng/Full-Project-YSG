# 🚀 Quick Start: Supabase Image Storage

## ⚡ 5-Minute Setup

### 1. Create Supabase Account
Go to: https://supabase.com → Sign up (FREE)

### 2. Create Project
- Name: `yathes-sign-galaxy`
- Region: Mumbai (or closest to you)
- Wait ~2 minutes

### 3. Create Storage Bucket
Storage → New Bucket → Name: `product-images` → ✅ Public → Create

### 4. Get Credentials
Settings → API → Copy:
- Project URL
- anon public key

### 5. Update .env
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_key_here
```

### 6. Set Policies
Storage → Policies → product-images → New Policy:

**Policy 1 (Read):**
- Name: Public Read
- Operation: SELECT
- Definition: `true`

**Policy 2 (Upload):**
- Name: Public Upload
- Operation: INSERT
- Definition: `true`

### 7. Restart Server
```bash
# Stop server (Ctrl+C)
node server.js
```

### 8. Test Upload
Admin Panel → Upload Image → Check console for:
```
✅ Image uploaded to Supabase: https://...
```

### 9. Migrate Existing Images (Optional)
```bash
node migrate_images_to_supabase.js
```

## ✅ Done!
All images now stored in Supabase Cloud! 🎉

---

**Free Tier:** 1GB storage, 2GB bandwidth/month
**Docs:** https://supabase.com/docs/guides/storage
