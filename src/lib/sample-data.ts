// Sample data for localStorage initialization
import { MenuItem } from './localStorage-api';

export const sampleMenuItems: MenuItem[] = [
  {
    id: 'menu_001',
    name: 'Chicken Biryani',
    price: 120,
    available: true,
    category: 'Main Course',
    prepTime: 20,
    calories: 650,
    veg: false,
    popular: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'menu_002',
    name: 'Paneer Butter Masala',
    price: 100,
    available: true,
    category: 'Main Course',
    prepTime: 15,
    calories: 580,
    veg: true,
    popular: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'menu_003',
    name: 'Masala Dosa',
    price: 60,
    available: true,
    category: 'Main Course',
    prepTime: 10,
    calories: 450,
    veg: true,
    popular: true,
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'menu_004',
    name: 'Samosa (2 pcs)',
    price: 30,
    available: true,
    category: 'Snacks',
    prepTime: 5,
    calories: 280,
    veg: true,
    popular: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'menu_005',
    name: 'Cold Coffee',
    price: 50,
    available: true,
    category: 'Beverages',
    prepTime: 5,
    calories: 180,
    veg: true,
    popular: false,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'menu_006',
    name: 'Veg Sandwich',
    price: 40,
    available: true,
    category: 'Snacks',
    prepTime: 8,
    calories: 320,
    veg: true,
    popular: false,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
    createdAt: new Date().toISOString()
  }
];

// Initialize localStorage with sample data if empty
export const initializeSampleData = () => {
  const existingMenuItems = localStorage.getItem('canteen_menu_items');
  if (!existingMenuItems) {
    localStorage.setItem('canteen_menu_items', JSON.stringify(sampleMenuItems));
    console.log('🍽️ Sample menu items loaded!');
  }
  
  const existingOrders = localStorage.getItem('canteen_orders');
  if (!existingOrders) {
    localStorage.setItem('canteen_orders', JSON.stringify([]));
    console.log('📋 Orders storage initialized!');
  }
};
