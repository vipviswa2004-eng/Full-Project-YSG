# Deployment Configuration Guide

## 1. SPA Fallback (Critical for BrowserRouter)

Since we switched to `BrowserRouter`, you must configure your web server to redirect all 404 requests to `index.html`. This allows React Router to handle the routing on the client side.

### For Nginx
Add this `location /` block to your Nginx configuration site (usually in `/etc/nginx/sites-available/default` or `your-site.conf`):

```nginx
server {
    listen 80;
    server_name ucgoc.com www.ucgoc.com;
    
    root /var/www/your-project-path/frontend/dist; # Point to your build output
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy (Forward /api requests to your backend)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### For Vercel or Netlify
If you are deploying to Vercel or Netlify, simply ensuring a `vercel.json` or `_redirects` file exists is usually enough, or selecting "Create React App" / "Vite" preset during deployment will handle this automatically.

**netlify.toml (if using Netlify):**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**vercel.json (if using Vercel):**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## 2. Updated Domain References

We have replaced all occurrences of `signgalaxy.com` with `ucgoc.com` in:
- `server/server.js` (CORS, Email Footers, Sitemap generator)
- `frontend/src/components/SEO.tsx` (Canonical URLs, Metadata)
- `frontend/src/pages/Cart.tsx` (Guest checkout email)
- `frontend/public/robots.txt` (Sitemap URL)
- `server/generate_sitemap.js` (Sitemap generator)
- `frontend/public/sitemap.xml` (Re-generated)

## 3. Post-Deployment Verification
After deploying the latest code:
1. Visit `https://ucgoc.com/products` directly. It should load the products page, not the dashboard.
2. Check `https://ucgoc.com/robots.txt` – it should show the new sitemap URL.
3. Check `view-source:https://ucgoc.com/products` – verify `<link rel="canonical" href="https://ucgoc.com/products">`.
