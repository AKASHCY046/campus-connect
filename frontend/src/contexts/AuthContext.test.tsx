import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { generateInviteCode } from '@/lib/invitationCodes';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => localStorage.clear());

describe('AuthContext', () => {
  it('seeds demo users and signs in a known account', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('student@campus.edu', 'student123');
    });

    expect(result.current.user?.role).toBe('Student');
    expect(result.current.isSignedIn).toBe(true);
    expect(JSON.parse(localStorage.getItem('campus_connect_session')!).email).toBe(
      'student@campus.edu',
    );
  });

  it('rejects a wrong password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let error: unknown;
    await act(async () => {
      error = await result.current.login('student@campus.edu', 'wrong').catch((e) => e);
    });
    expect((error as Error).message).toMatch(/invalid email or password/i);
  });

  it('requires a valid invite code for staff signup', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let error: unknown;
    await act(async () => {
      error = await result.current
        .signUp('x@campus.edu', 'pw', 'X', 'Professor')
        .catch((e) => e);
    });
    expect((error as Error).message).toMatch(/invitation code is required/i);

    const code = generateInviteCode('Professor', 'u_admin').code;
    await act(async () => {
      await result.current.signUp('prof@campus.edu', 'pw', 'New Prof', 'Professor', code);
    });
    expect(result.current.user?.role).toBe('Professor');
  });

  it('lets a student sign up without a code and blocks/unblocks users', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signUp('newstudent@campus.edu', 'pw', 'New Student', 'Student');
    });
    const id = result.current.user!.id;

    act(() => result.current.blockUser(id));
    expect(result.current.getAllUsers().find((u) => u.id === id)?.status).toBe('BLOCKED');

    act(() => result.current.unblockUser(id));
    expect(result.current.getAllUsers().find((u) => u.id === id)?.is_active).toBe(true);
  });

  it('updates the profile name in place', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login('student@campus.edu', 'student123');
    });

    act(() => result.current.updateProfile({ full_name: 'Alex J.' }));
    expect(result.current.user?.full_name).toBe('Alex J.');
    expect(JSON.parse(localStorage.getItem('campus_connect_session')!).full_name).toBe('Alex J.');
  });
});
