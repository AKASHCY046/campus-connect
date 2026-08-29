import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMenuItems, createOrder, getOrders, updateOrderStatus } from './canteen';
import { initializeSampleData } from '../sample-data';

// Force the localStorage fallback path.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
  );
  initializeSampleData();
});

describe('canteen service (offline)', () => {
  it('returns the seeded menu and honours the available filter', async () => {
    const all = await getMenuItems();
    expect(all.length).toBeGreaterThan(0);

    const available = await getMenuItems({ available: true });
    expect(available.every((m) => m.available)).toBe(true);
    expect(available.length).toBeLessThan(all.length); // Chocolate Brownie is off-menu
  });

  it('places an order and reflects it in the user\'s order list', async () => {
    const menu = await getMenuItems({ available: true });
    const order = await createOrder('u_student', [
      { menu_item_id: menu[0].id, quantity: 2 },
    ], 'Alex Johnson');

    expect(order.total_amount).toBe(menu[0].price * 2);
    expect(order.status).toBe('pending');

    const mine = await getOrders('u_student');
    expect(mine).toHaveLength(1);
    expect(mine[0].id).toBe(order.id);

    const others = await getOrders('someone-else');
    expect(others).toHaveLength(0);
  });

  it('advances an order through ready -> picked', async () => {
    const menu = await getMenuItems({ available: true });
    const order = await createOrder('u_student', [{ menu_item_id: menu[0].id, quantity: 1 }]);

    const ready = await updateOrderStatus(order.id, 'ready');
    expect(ready.status).toBe('ready');

    const picked = await updateOrderStatus(order.id, 'picked');
    expect(picked.status).toBe('picked');
  });
});
