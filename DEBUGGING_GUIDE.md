# 🔍 Debugging Guide - Database Sync Not Working

## The Issue
You mentioned that cart, wishlist, and admin changes are not persisting after refresh.

## Most Likely Cause: **You're Not Logged In!**

The database sync **only works when you're logged in**. Here's why:

### How It Works:
1. **Without Login** → Data saves to **localStorage only** (lost on different devices)
2. **With Login** → Data saves to **both localStorage AND MongoDB** (persists everywhere)

---

## 🧪 How to Test & Debug

### Step 1: Open Browser Console
1. Open your app in browser (http://localhost:5173)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab

### Step 2: Check If You're Logged In
Look for these console messages when you add to cart/wishlist:

**If NOT logged in, you'll see:**
```
⚠️ Not logged in - cart saved to localStorage only
⚠️ Not logged in - wishlist saved to localStorage only
```

**If logged in, you'll see:**
```
💾 Syncing cart to database for user: your@email.com Cart items: 1
✅ Cart synced successfully
```

### Step 3: Login First!
If you see the "Not logged in" warning:

1. Click the **Login** button in the navbar (top right)
2. Either:
   - **Sign in with Google** (recommended)
   - OR enter your email and click "Sign In"
3. You should see your email/avatar in the navbar

### Step 4: Try Again
After logging in:
1. Add items to cart
2. Add items to wishlist  
3. Check console - you should see "✅ Cart synced successfully"
4. Refresh the page
5. Items should still be there!

---

## 🛠️ Admin Panel Changes

For admin panel changes to persist:

### Requirements:
1. **Must be logged in** as admin email:
   - `signgalaxy31@gmail.com` OR
   - `viswakumar2004@gmail.com`

2. **Check console** when saving:
   - You should see network requests to `/api/products`
   - Check for any error messages

### Debug Steps:
1. Open **Network** tab in DevTools
2. Edit a product and click "Save Changes"
3. Look for POST request to `http://localhost:5000/api/products`
4. Click on it to see:
   - **Status**: Should be 200 (success)
   - **Response**: Should show the saved product with `_id`

---

## 🚨 Common Issues & Solutions

### Issue 1: "Not logged in" message
**Solution**: Click Login button and sign in with Google or email

### Issue 2: Cart/wishlist empty after refresh (even when logged in)
**Possible causes:**
- Backend server not running
- MongoDB not connected
- Network errors

**Check:**
1. Is backend running? (Should see "MongoDB Connected" in server terminal)
2. Check browser console for error messages
3. Check Network tab for failed requests

### Issue 3: Admin changes not saving
**Check:**
1. Are you logged in as admin email?
2. Check console for "Failed to save product" errors
3. Check Network tab for `/api/products` request status

### Issue 4: Database connection errors
**Solution:**
```bash
# Make sure MongoDB is running
# Then restart the server
cd server
node server.js
```

---

## 📊 What to Look For in Console

### Good Signs ✅
```
💾 Syncing cart to database for user: test@example.com Cart items: 3
✅ Cart synced successfully
💾 Syncing wishlist to database for user: test@example.com Wishlist items: 2
✅ Wishlist synced successfully
```

### Bad Signs ❌
```
⚠️ Not logged in - cart saved to localStorage only
❌ Cart sync failed: Failed to fetch
❌ Wishlist sync failed: TypeError
```

---

## 🎯 Quick Test Checklist

- [ ] Backend server is running (`node server.js`)
- [ ] Frontend is running (`npm run dev`)
- [ ] MongoDB is connected (check server console)
- [ ] **You are logged in** (see email in navbar)
- [ ] Console shows "✅ synced successfully" messages
- [ ] Network tab shows successful API calls

---

## 💡 Pro Tip

If you want to test without logging in every time, the app still works with localStorage - but data won't sync across devices or persist in the database. For full functionality, **always login first**!

---

## 🆘 Still Not Working?

If you've checked everything above and it's still not working:

1. **Clear browser cache and localStorage:**
   - Open Console
   - Type: `localStorage.clear()`
   - Refresh page

2. **Check server logs:**
   - Look at the terminal running `node server.js`
   - Any errors there?

3. **Restart everything:**
   ```bash
   # Stop both servers (Ctrl+C)
   # Then restart:
   cd server && node server.js
   cd frontend && npm run dev
   ```

4. **Share console errors:**
   - Take a screenshot of any red errors in console
   - Share the Network tab showing failed requests
