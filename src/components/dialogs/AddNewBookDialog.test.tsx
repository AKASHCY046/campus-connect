import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { AddNewBookDialog } from './AddNewBookDialog';
import { getBooks } from '@/lib/services/library';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
});

describe('AddNewBookDialog', () => {
  it('accepts an ISBN written with dashes and adds the book', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    renderWithProviders(<AddNewBookDialog onCreate={onCreate} />);

    await user.click(screen.getByRole('button', { name: /add new book/i }));

    await user.type(screen.getByPlaceholderText(/enter book title/i), 'Refactoring');
    await user.type(screen.getByPlaceholderText(/enter author name/i), 'Martin Fowler');
    await user.type(screen.getByPlaceholderText(/isbn/i), '978-0134757599');

    await user.click(screen.getByRole('button', { name: /add book/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    const books = await getBooks({ search: 'Refactoring' });
    expect(books).toHaveLength(1);
  });

  it('shows a validation error for a too-short ISBN', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddNewBookDialog />);

    await user.click(screen.getByRole('button', { name: /add new book/i }));
    await user.type(screen.getByPlaceholderText(/enter book title/i), 'X');
    await user.type(screen.getByPlaceholderText(/enter author name/i), 'Y');
    await user.type(screen.getByPlaceholderText(/isbn/i), '123');
    await user.click(screen.getByRole('button', { name: /add book/i }));

    expect(await screen.findByText(/isbn must have 10 or 13 digits/i)).toBeInTheDocument();
  });
});
