import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateInviteCode,
  isValidCodeFormat,
  validateInviteCodeDetailed,
  getInviteCodeErrorMessage,
  markCodeUsed,
  getAllCodes,
  deleteCode,
  isStaffRole,
} from './invitationCodes';

beforeEach(() => localStorage.clear());

describe('isValidCodeFormat', () => {
  it('accepts admin-issued formats', () => {
    expect(isValidCodeFormat('PROF-A1B2')).toBe(true);
    expect(isValidCodeFormat('libr-99zz')).toBe(true);
  });
  it('rejects anything else', () => {
    expect(isValidCodeFormat('PROF-2024')).toBe(true); // format ok...
    expect(isValidCodeFormat('TEACHER-A1B2')).toBe(false);
    expect(isValidCodeFormat('PROF_A1B2')).toBe(false);
    expect(isValidCodeFormat('')).toBe(false);
  });
});

describe('validateInviteCodeDetailed', () => {
  it('flags an unknown code as not_found', () => {
    const res = validateInviteCodeDetailed('PROF-ZZZZ', 'Professor');
    expect(res.valid).toBe(false);
    expect(getInviteCodeErrorMessage(res)).toMatch(/does not exist/i);
  });

  it('accepts a freshly generated code for the matching role', () => {
    const entry = generateInviteCode('Librarian', 'u_admin');
    const res = validateInviteCodeDetailed(entry.code, 'Librarian');
    expect(res.valid).toBe(true);
    expect(getInviteCodeErrorMessage(res)).toBe('');
  });

  it('rejects a code used for the wrong role', () => {
    const entry = generateInviteCode('Librarian', 'u_admin');
    const res = validateInviteCodeDetailed(entry.code, 'Professor');
    expect(res).toEqual({ valid: false, reason: 'wrong_role', entry: undefined });
  });

  it('rejects an already-used code', () => {
    const entry = generateInviteCode('Canteen Staff', 'u_admin');
    markCodeUsed(entry.code, 'user_123');
    const res = validateInviteCodeDetailed(entry.code, 'Canteen Staff');
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reason).toBe('already_used');
  });
});

describe('code lifecycle', () => {
  it('generates, lists and deletes codes', () => {
    const a = generateInviteCode('Professor', 'u_admin');
    const b = generateInviteCode('Librarian', 'u_admin');
    expect(getAllCodes().map((c) => c.code).sort()).toEqual([a.code, b.code].sort());
    deleteCode(a.code);
    expect(getAllCodes().map((c) => c.code)).toEqual([b.code]);
  });
});

describe('isStaffRole', () => {
  it('identifies staff roles', () => {
    expect(isStaffRole('Professor')).toBe(true);
    expect(isStaffRole('Librarian')).toBe(true);
    expect(isStaffRole('Canteen Staff')).toBe(true);
    expect(isStaffRole('Student')).toBe(false);
    expect(isStaffRole('Admin')).toBe(false);
  });
});
