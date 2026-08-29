import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getForums,
  createForumThread,
  getStudyGroups,
  createStudyGroup,
} from './academic';
import { initializeSampleData } from '../sample-data';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  initializeSampleData();
});

describe('academic service (offline)', () => {
  it('reads seeded assignments and supports CRUD', async () => {
    const seeded = await getAssignments();
    expect(seeded.length).toBeGreaterThan(0);

    const [created] = await createAssignment({
      title: 'New Quiz',
      description: 'Chapter 4',
      subject: 'Networks',
      dueDate: new Date('2099-01-01'),
      maxScore: 10,
      createdBy: 'u_faculty',
    });
    expect(created.title).toBe('New Quiz');
    expect((await getAssignments()).some((a: any) => a.id === created.id)).toBe(true);

    await updateAssignment(created.id, { title: 'Renamed Quiz' });
    expect((await getAssignments()).find((a: any) => a.id === created.id)?.title).toBe('Renamed Quiz');

    await deleteAssignment(created.id);
    expect((await getAssignments()).some((a: any) => a.id === created.id)).toBe(false);
  });

  it('creates a forum thread with a join code', async () => {
    const [forum] = await createForumThread({
      topic: 'Recursion help',
      description: 'Struggling with base cases',
      category: 'Algorithms',
      tags: 'recursion',
      authorId: 'u_student',
      authorName: 'Alex',
    });
    expect(forum.joinCode).toMatch(/^[A-Z0-9]{6}$/);
    expect((await getForums()).some((f: any) => f.id === forum.id)).toBe(true);
  });

  it('creates a study group the creator is a member of', async () => {
    const [group] = await createStudyGroup({
      name: 'DSA Grind',
      subject: 'Algorithms',
      description: 'Daily practice',
      maxMembers: 8,
      createdBy: 'u_student',
    });
    expect(group.member_count).toBe(1);
    const memberships = JSON.parse(localStorage.getItem('campus_group_memberships') || '[]');
    expect(memberships.some((m: any) => m.resourceId === group.id && m.userId === 'u_student')).toBe(true);
    expect((await getStudyGroups()).some((g: any) => g.id === group.id)).toBe(true);
  });
});
