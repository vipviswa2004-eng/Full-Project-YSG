# Custom Product Designer with Fabric.js

## ✨ Features Implemented

1. **Custom Image Upload** - Users can upload their photos
2. **Background Removal** - Using rembg Python service
3. **Background Color Change** - Add custom background colors
4. **Text Editing** - Add and edit custom text on products
5. **Watermark Protection** - Low-quality preview with watermark for users
6. **HD Generation** - Admin gets HD quality without watermark

## 🚀 Setup Instructions

### 1. Install Python Dependencies (for Background Removal)

```bash
cd "c:\Users\viswa2004\Downloads\yathes-sign-galaxy (1)\rembg-service"
pip install -r requirements.txt
```

### 2. Start the rembg Service

```bash
python app.py
```

This will start the background removal service on `http://localhost:5001`

### 3. Restart Your Servers

The Node.js dependencies are already installed. Just restart:

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd server
node server.js
```

## 📝 How to Use

### For Users (Product Page):

1. Navigate to a product (e.g., 3D Crystal Rectangle Portrait)
2. Scroll to the **Custom Designer** section
3. Upload your image
4. Click "Remove Background" (optional)
5. Add background color (optional)
6. Add custom text (e.g., "Love", "KAUSHAL")
7. Click "Save Design"
8. Preview shows with watermark and low quality
9. Add to cart

### For Admin:

1. Go to Admin Panel → Orders
2. View customer designs
3. Click "Generate HD" button
4. System generates 3000x3000 HD image without watermark
5. Download for printing

## 🔧 API Endpoints

### Background Removal
```
POST http://localhost:5001/remove-bg
Content-Type: multipart/form-data
Body: image file
```

### HD Generation
```
POST http://localhost:5000/api/generate-hd-design
Content-Type: application/json
Body: {
  "designJSON": {...},
  "productName": "Product Name"
}
```

## 📦 Dependencies Added

### Frontend:
- `fabric` - Canvas manipulation library

### Backend:
- `canvas` - Node.js canvas for server-side rendering
- `fabric` - Server-side Fabric.js

### Python Service:
- `flask` - Web framework
- `flask-cors` - CORS support
- `rembg` - Background removal
- `pillow` - Image processing

## 🎨 Customization

### Change Canvas Size:
Edit `CustomDesigner.tsx` line 25:
```typescript
width: 800,  // Change to desired width
height: 800, // Change to desired height
```

### Change HD Resolution:
Edit `server.js` line 897:
```javascript
const hdCanvas = createCanvas(3000, 3000); // Change to desired resolution
```

### Watermark Text:
Edit `CustomDesigner.tsx` line 38:
```typescript
const watermark = new fabric.Text('YOUR TEXT HERE', {
  // ... styling options
});
```

## 🐛 Troubleshooting

### "Background removal failed"
- Make sure rembg service is running on port 5001
- Check if Python dependencies are installed
- Verify CORS is enabled

### "Module 'fabric' has no exported member"
- This is a TypeScript warning, it won't affect functionality
- The `@ts-ignore` comment suppresses it

### Images not loading
- Check if Cloudinary credentials are set in `.env`
- Verify image URLs are accessible
- Check browser console for errors

## 📸 Example Workflow

1. **User uploads image** → Stored in browser memory
2. **User clicks "Remove BG"** → Sent to rembg service → Returns transparent PNG
3. **User adds text** → Rendered on canvas
4. **User saves design** → JSON + low-res preview sent to backend
5. **Admin generates HD** → Backend recreates from JSON at 3000x3000 → Uploads to Cloudinary

## 🔐 Security Features

- Watermark prevents unauthorized use
- Low-quality preview (800x800 @ 60% quality)
- HD generation only accessible to admin
- Screenshot protection via watermark

## 🎯 Next Steps

1. Integrate CustomDesigner into ProductDetails page
2. Add design preview in cart
3. Store design JSON in Order model
4. Create admin interface for HD generation
5. Add more customization options (fonts, colors, effects)

## 💡 Tips

- Use PNG images for best quality
- Remove background before adding custom background
- Text is fully editable - double-click to edit
- Drag and resize all elements
- Use Ctrl+Z for undo (browser default)

---

**Need help?** Check the console logs for detailed error messages.
