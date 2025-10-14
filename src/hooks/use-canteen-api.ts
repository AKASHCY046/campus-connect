import { useState, useEffect, useCallback } from 'react';
import { menuApi, ordersApi, analyticsApi, MenuItem, Order, CreateMenuItemData, CreateOrderData } from '@/lib/api';
import { useUser } from '@clerk/clerk-react';

// Menu hooks
export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await menuApi.getAll();
      setMenuItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const createMenuItem = useCallback(async (data: CreateMenuItemData) => {
    try {
      const newItem = await menuApi.create(data);
      setMenuItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create menu item');
    }
  }, []);

  const updateMenuItem = useCallback(async (id: string, data: Partial<MenuItem>) => {
    try {
      const updatedItem = await menuApi.update(id, data);
      setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update menu item');
    }
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      await menuApi.delete(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete menu item');
    }
  }, []);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
};

// Orders hooks
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pendingOrders = await ordersApi.getPending();
      setOrders(pendingOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const markOrderPicked = useCallback(async (id: string) => {
    try {
      await ordersApi.markPicked(id);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark order as picked');
    }
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    markOrderPicked,
  };
};

// User orders hook
export const useUserOrders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = user?.id || 'anonymous';
  const studentName = user?.fullName || user?.firstName || 'Student';

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userOrders = await ordersApi.getUserOrders(studentId);
      setOrders(userOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user orders');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId !== 'anonymous') {
      fetchUserOrders();
    }
  }, [fetchUserOrders, studentId]);

  const createOrder = useCallback(async (data: Omit<CreateOrderData, 'studentId' | 'studentName'>) => {
    try {
      const orderData: CreateOrderData = {
        ...data,
        studentId,
        studentName,
      };
      const newOrder = await ordersApi.create(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create order');
    }
  }, [studentId, studentName]);

  return {
    orders,
    loading,
    error,
    refetch: fetchUserOrders,
    createOrder,
    studentId,
    studentName,
  };
};

// Analytics hook
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<{
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    todayRevenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
