# 🚀 Campus Connect - Quick Start Guide

## Current Status
✅ **Frontend is running** at http://localhost:8082/
❌ **Backend needs to be started** for full functionality

## 🔧 To Get Everything Working:

### Step 1: Setup Backend (One-time setup)
```bash
# Run this command in your terminal:
./setup-backend.bat
```

### Step 2: Start Backend Server
```bash
# Option A: Use the startup script
./start-backend.bat

# Option B: Manual start
cd backend
npm run dev
```

### Step 3: Verify Everything is Working
1. **Backend**: http://localhost:3000/api/health
2. **Frontend**: http://localhost:8082/
3. **Canteen In-charge**: http://localhost:8082/canteen-incharge
4. **Student Canteen**: http://localhost:8082/canteen

## 🎯 What You Can Do Now:

### With Backend Running:
- ✅ Add menu items in canteen in-charge dashboard
- ✅ View dynamic menu in student dashboard
- ✅ Place orders and track them
- ✅ View analytics and download reports
- ✅ All data persists in MongoDB

### Without Backend (Current State):
- ❌ Menu items won't load
- ❌ Orders won't work
- ❌ Data won't persist

## 🐛 Troubleshooting:

### If Backend Won't Start:
1. **Check MongoDB is running**:
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud)

2. **Check port 3000 is free**:
   - Change PORT in backend/.env if needed

3. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

### If Frontend Has Issues:
1. **Clear browser cache** and refresh
2. **Check browser console** for errors
3. **Restart frontend**: `npm run dev`

## 📱 Features Available:

### Canteen In-charge Dashboard:
- Add/Edit/Delete menu items
- Manage orders
- View analytics
- Download reports
- Bulk operations

### Student Dashboard:
- Browse dynamic menu
- Add to cart
- Place orders
- Track order status
- View order history

## 🎉 You're All Set!

Once the backend is running, you'll have a fully functional canteen management system with:
- Real-time data
- Database persistence
- Order management
- Analytics and reporting
- Dynamic menu management

**Next**: Run `./setup-backend.bat` and then `./start-backend.bat` to get the full system working!
