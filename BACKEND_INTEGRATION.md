# Campus Connect Backend Integration

This document explains the backend integration for the Campus Connect canteen system.

## 🚀 Quick Start

### 1. Setup Backend
```bash
# Run the setup script
./setup-backend.bat  # Windows
# or
./setup-backend.sh   # Linux/Mac
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

### 3. Start Frontend
```bash
npm run dev
```

## 📁 Backend Structure

```
backend/
├── server.js           # Main server file
├── package.json        # Backend dependencies
└── .env               # Environment variables
```

## 🔧 API Endpoints

### Menu Management
- `GET /api/canteen/menu` - Get all menu items
- `POST /api/canteen/menu` - Create new menu item
- `PUT /api/canteen/menu/:id` - Update menu item
- `DELETE /api/canteen/menu/:id` - Delete menu item

### Order Management
- `GET /api/canteen/orders/pending` - Get pending orders (canteen in-charge)
- `GET /api/canteen/orders/me?studentId=xxx` - Get user orders
- `POST /api/canteen/orders` - Create new order
- `PUT /api/canteen/orders/pickup/:id` - Mark order as picked up

### Analytics
- `GET /api/canteen/analytics` - Get sales analytics
- `GET /api/health` - Health check

## 🗄️ Database Schema

### MenuItem
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

### Order
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

## 🔄 Frontend Integration

### API Service (`src/lib/api.ts`)
- Centralized API client with TypeScript interfaces
- Error handling and response parsing
- Base URL configuration

### React Hooks (`src/hooks/use-canteen-api.ts`)
- `useMenuItems()` - Menu management
- `useOrders()` - Order management for canteen in-charge
- `useUserOrders()` - User order management
- `useAnalytics()` - Analytics data

### Updated Components
- **CanteenDashboard.tsx** - Dynamic menu management with add/edit/delete
- **Canteen.tsx** - Dynamic menu display and order placement

## 🎯 Features Implemented

### Canteen In-charge Dashboard
- ✅ Add new menu items with form dialog
- ✅ Toggle item availability
- ✅ Delete menu items
- ✅ View pending orders
- ✅ Mark orders as picked up
- ✅ Analytics dashboard with real-time data

### Student Dashboard
- ✅ Dynamic menu display from database
- ✅ Category filtering
- ✅ Shopping cart functionality
- ✅ Order placement
- ✅ Order history tracking
- ✅ Real-time order status updates

## 🔧 Environment Variables

Create a `.env` file in the backend directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campus-connect
NODE_ENV=development
```

## 🚨 Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (running on localhost:27017)
3. **npm** or **yarn**

## 🐛 Troubleshooting

### Backend Issues
- Ensure MongoDB is running
- Check if port 3000 is available
- Verify environment variables

### Frontend Issues
- Check if backend is running on port 3000
- Verify API endpoints are accessible
- Check browser console for errors

## 📈 Next Steps

1. Add authentication middleware
2. Implement real-time notifications
3. Add image upload for menu items
4. Implement payment integration
5. Add more analytics features
6. Implement inventory management
