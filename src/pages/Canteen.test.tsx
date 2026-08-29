import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import Canteen from './Canteen';
import { initializeSampleData } from '@/lib/sample-data';
import { getOrders } from '@/lib/services/canteen';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  initializeSampleData();
  // a signed-in student session
  localStorage.setItem(
    'campus_connect_session',
    JSON.stringify({ id: 'u_student', email: 'student@campus.edu', full_name: 'Alex Johnson', role: 'Student' }),
  );
});

describe('Canteen page', () => {
  it('adds an item to the cart and places an order', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Canteen />);

    await waitFor(() => expect(screen.getByText('Chicken Biryani')).toBeInTheDocument());

    const firstAdd = screen.getAllByRole('button', { name: /add/i })[0];
    await user.click(firstAdd);

    expect(await screen.findByText('Total')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(async () => {
      const orders = await getOrders('u_student');
      expect(orders).toHaveLength(1);
    });
  });

  it('filters the menu by category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Canteen />);

    await waitFor(() => expect(screen.getByText('Cold Coffee')).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: 'Beverages' }));

    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText('Cold Coffee')).toBeInTheDocument();
    expect(within(panel).queryByText('Chicken Biryani')).not.toBeInTheDocument();
  });
});
