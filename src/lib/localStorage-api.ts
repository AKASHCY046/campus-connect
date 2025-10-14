// LocalStorage API service for canteen operations
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  category: string;
  prepTime: number;
  calories: number;
  veg: boolean;
  popular: boolean;
  image: string;
  createdAt: string;
}

export interface Order {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  status: 'pending' | 'ready' | 'picked';
  studentId: string;
  studentName: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  name: string;
  price: number;
  available?: boolean;
  category?: string;
  prepTime?: number;
  calories?: number;
  veg?: boolean;
  popular?: boolean;
  image?: string;
}

export interface CreateOrderData {
  itemId: string;
  qty: number;
  studentId: string;
  studentName: string;
}

// LocalStorage keys
const MENU_ITEMS_KEY = 'canteen_menu_items';
const ORDERS_KEY = 'canteen_orders';

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Menu API
export const menuApi = {
  // Get all menu items
  getAll: (): Promise<MenuItem[]> => {
    return new Promise((resolve) => {
      const items = getFromStorage<MenuItem[]>(MENU_ITEMS_KEY, []);
      resolve(items);
    });
  },

  // Create new menu item
  create: (data: CreateMenuItemData): Promise<MenuItem> => {
    return new Promise((resolve) => {
      const items = getFromStorage<MenuItem[]>(MENU_ITEMS_KEY, []);
      const newItem: MenuItem = {
        id: generateId(),
        ...data,
        available: data.available ?? true,
        category: data.category ?? 'Main Course',
        prepTime: data.prepTime ?? 15,
        calories: data.calories ?? 0,
        veg: data.veg ?? true,
        popular: data.popular ?? false,
        image: data.image ?? '',
        createdAt: new Date().toISOString()
      };
      
      items.unshift(newItem);
      saveToStorage(MENU_ITEMS_KEY, items);
      resolve(newItem);
    });
  },

  // Update menu item
  update: (id: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    return new Promise((resolve, reject) => {
      const items = getFromStorage<MenuItem[]>(MENU_ITEMS_KEY, []);
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        reject(new Error('Menu item not found'));
        return;
      }
      
      items[index] = { ...items[index], ...data };
      saveToStorage(MENU_ITEMS_KEY, items);
      resolve(items[index]);
    });
  },

  // Delete menu item
  delete: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const items = getFromStorage<MenuItem[]>(MENU_ITEMS_KEY, []);
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        reject(new Error('Menu item not found'));
        return;
      }
      
      items.splice(index, 1);
      saveToStorage(MENU_ITEMS_KEY, items);
      resolve();
    });
  }
};

// Orders API
export const ordersApi = {
  // Get pending orders (for canteen in-charge)
  getPending: (): Promise<Order[]> => {
    return new Promise((resolve) => {
      const orders = getFromStorage<Order[]>(ORDERS_KEY, []);
      const pendingOrders = orders.filter(order => order.status === 'pending');
      resolve(pendingOrders);
    });
  },

  // Get user orders
  getUserOrders: (studentId: string): Promise<Order[]> => {
    return new Promise((resolve) => {
      const orders = getFromStorage<Order[]>(ORDERS_KEY, []);
      const userOrders = orders.filter(order => order.studentId === studentId);
      resolve(userOrders);
    });
  },

  // Create new order
  create: (data: CreateOrderData): Promise<Order> => {
    return new Promise((resolve, reject) => {
      const orders = getFromStorage<Order[]>(ORDERS_KEY, []);
      const menuItems = getFromStorage<MenuItem[]>(MENU_ITEMS_KEY, []);
      
      const menuItem = menuItems.find(item => item.id === data.itemId);
      if (!menuItem) {
        reject(new Error('Menu item not found'));
        return;
      }
      
      if (!menuItem.available) {
        reject(new Error('Item not available'));
        return;
      }
      
      const newOrder: Order = {
        id: generateId(),
        itemId: data.itemId,
        itemName: menuItem.name,
        qty: data.qty,
        status: 'pending',
        studentId: data.studentId,
        studentName: data.studentName,
        totalAmount: menuItem.price * data.qty,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      orders.unshift(newOrder);
      saveToStorage(ORDERS_KEY, orders);
      resolve(newOrder);
    });
  },

  // Mark order as picked up
  markPicked: (id: string): Promise<Order> => {
    return new Promise((resolve, reject) => {
      const orders = getFromStorage<Order[]>(ORDERS_KEY, []);
      const index = orders.findIndex(order => order.id === id);
      
      if (index === -1) {
        reject(new Error('Order not found'));
        return;
      }
      
      orders[index] = {
        ...orders[index],
        status: 'picked',
        updatedAt: new Date().toISOString()
      };
      
      saveToStorage(ORDERS_KEY, orders);
      resolve(orders[index]);
    });
  }
};

// Analytics API
export const analyticsApi = {
  getAnalytics: (): Promise<{
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    todayRevenue: number;
  }> => {
    return new Promise((resolve) => {
      const orders = getFromStorage<Order[]>(ORDERS_KEY, []);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = orders.filter(order => 
        new Date(order.createdAt) >= today
      );
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      resolve({
        totalOrders,
        todayOrders: todayOrders.length,
        totalRevenue,
        todayRevenue
      });
    });
  }
};

// Health check
export const healthApi = {
  check: (): Promise<{ status: string; timestamp: string }> => {
    return new Promise((resolve) => {
      resolve({
        status: 'OK',
        timestamp: new Date().toISOString()
      });
    });
  }
};
