# Campus Connect - Backend Integration Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- Git

### 1. Install Backend Dependencies

**Option A: Using the setup script (Recommended)**
```bash
# Windows
./setup-backend.bat

# Linux/Mac
./setup-backend.sh
```

**Option B: Manual setup**
```bash
# Create backend directory
mkdir backend
cd backend

# Copy package.json
cp ../package-server.json package.json

# Install dependencies
npm install

# Create environment file
echo PORT=3000 > .env
echo MONGODB_URI=mongodb://localhost:27017/campus-connect >> .env
echo NODE_ENV=development >> .env
```

### 2. Start the Backend Server
```bash
cd backend
npm run dev
```

### 3. Start the Frontend
```bash
# In a new terminal
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campus-connect
NODE_ENV=development
```

### MongoDB Setup

**Local MongoDB:**
1. Install MongoDB locally
2. Start MongoDB service
3. Ensure it's running on `mongodb://localhost:27017`

**MongoDB Atlas (Cloud):**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## 📱 Features Implemented

### Canteen In-charge Dashboard
- ✅ **Add Menu Items**: Full form with all fields (name, price, category, prep time, calories, etc.)
- ✅ **Edit Menu Items**: Toggle availability, update details
- ✅ **Delete Menu Items**: Remove items from menu
- ✅ **Bulk Operations**: Toggle all items availability at once
- ✅ **Order Management**: View pending orders, mark as picked up
- ✅ **Analytics**: Real-time sales data, revenue tracking
- ✅ **Reports**: Download detailed sales reports
- ✅ **Refresh Data**: Manual refresh functionality

### Student Dashboard
- ✅ **Dynamic Menu**: Real-time menu from database
- ✅ **Category Filtering**: Filter by Main Course, Snacks, Beverages, Desserts
- ✅ **Shopping Cart**: Add/remove items, quantity management
- ✅ **Order Placement**: Place orders with real-time updates
- ✅ **Order History**: View all past orders with status
- ✅ **Real-time Updates**: Live order status updates

## 🗄️ Database Schema

### MenuItem Collection
```javascript
{
  id: String (UUID),
  name: String,
  price: Number,
  available: Boolean,
  category: String,
  prepTime: Number,
  calories: Number,
  veg: Boolean,
  popular: Boolean,
  image: String,
  createdAt: Date
}
```

### Order Collection
```javascript
{
  id: String (UUID),
  itemId: String,
  itemName: String,
  qty: Number,
  status: String ('pending' | 'ready' | 'picked'),
  studentId: String,
  studentName: String,
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 API Endpoints

### Menu Management
- `GET /api/canteen/menu` - Get all menu items
- `POST /api/canteen/menu` - Create new menu item
- `PUT /api/canteen/menu/:id` - Update menu item
- `DELETE /api/canteen/menu/:id` - Delete menu item

### Order Management
- `GET /api/canteen/orders/pending` - Get pending orders
- `GET /api/canteen/orders/me?studentId=xxx` - Get user orders
- `POST /api/canteen/orders` - Create new order
- `PUT /api/canteen/orders/pickup/:id` - Mark order as picked up

### Analytics
- `GET /api/canteen/analytics` - Get sales analytics
- `GET /api/health` - Health check

## 🎯 Usage Instructions

### For Canteen In-charge:
1. Navigate to `/canteen-incharge`
2. **Menu Tab**: Add, edit, delete menu items
3. **Orders Tab**: View and manage pending orders
4. **Analytics Tab**: View sales data and download reports

### For Students:
1. Navigate to `/canteen`
2. Browse available menu items
3. Add items to cart
4. Place orders
5. Track order status

## 🐛 Troubleshooting

### Backend Issues
- **Port 3000 in use**: Change PORT in `.env` file
- **MongoDB connection failed**: Check MongoDB is running and connection string is correct
- **Dependencies not found**: Run `npm install` in backend directory

### Frontend Issues
- **API calls failing**: Ensure backend is running on port 3000
- **Data not loading**: Check browser console for errors
- **Authentication issues**: Ensure Clerk is properly configured

### Common Solutions
1. **Clear browser cache** and refresh
2. **Restart both servers** (frontend and backend)
3. **Check MongoDB connection** in backend logs
4. **Verify environment variables** are set correctly

## 📈 Next Steps

1. **Authentication**: Add proper user authentication
2. **Real-time Updates**: Implement WebSocket for live updates
3. **Image Upload**: Add image upload for menu items
4. **Payment Integration**: Add payment processing
5. **Inventory Management**: Track ingredient quantities
6. **Advanced Analytics**: Add charts and detailed reporting

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the backend terminal for error messages
3. Verify MongoDB is running
4. Ensure all dependencies are installed
5. Check the network tab for failed API calls

## 📝 Notes

- The system uses Clerk for authentication
- All data is stored in MongoDB
- The backend runs on port 3000
- The frontend runs on port 5173 (Vite default)
- All API calls are made to `http://localhost:3000/api`
