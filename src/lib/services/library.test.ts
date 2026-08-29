import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getBooks,
  requestBook,
  getIssuedBooks,
  approveRequest,
  returnBook,
} from './library';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
});

describe('library service (offline)', () => {
  it('self-seeds the catalogue on first read', async () => {
    const books = await getBooks();
    expect(books.length).toBeGreaterThanOrEqual(5);
  });

  it('supports search filtering', async () => {
    const results = await getBooks({ search: 'clean code' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Clean Code');
  });

  it('runs the full request -> approve -> return loan cycle', async () => {
    const [book] = await getBooks();
    const before = book.available_copies;

    const req = await requestBook(book.id, 'u_student');
    expect(req.status).toBe('requested');

    let mine = await getIssuedBooks('u_student');
    expect(mine).toHaveLength(1);

    const approved = await approveRequest(req.id, book.id, new Date().toISOString());
    expect(approved.status).toBe('issued');

    const afterApprove = (await getBooks()).find((b) => b.id === book.id)!;
    expect(afterApprove.available_copies).toBe(before - 1);

    const returned = await returnBook(req.id);
    expect(returned.status).toBe('returned');

    const afterReturn = (await getBooks()).find((b) => b.id === book.id)!;
    expect(afterReturn.available_copies).toBe(before);

    mine = await getIssuedBooks('u_student');
    expect(mine.filter((b) => b.status === 'issued')).toHaveLength(0);
  });

  it('rejects a request for an unavailable book', async () => {
    const books = await getBooks();
    const target = books.find((b) => b.available_copies === 1)!;
    await requestBook(target.id, 'u1');
    const req = await getIssuedBooks('u1');
    await approveRequest(req[0].id, target.id, new Date().toISOString());

    await expect(requestBook(target.id, 'u2')).rejects.toThrow(/not available/i);
  });
});
