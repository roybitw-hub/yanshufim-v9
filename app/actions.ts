'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createItem, setFeedState, updateItem } from '@/lib/data';
import { addDays, todayIL } from '@/lib/dates';

export interface SignalMeta { kind?: string; courseId?: string | null; itemId?: string | null; version?: string }

export async function feedAction(key: string, op: 'read' | 'unread' | 'pin' | 'unpin' | 'snooze', meta: SignalMeta = {}) {
  const patch =
    op === 'read' ? { read: true, pinned: false } :
    op === 'unread' ? { read: false } :
    op === 'pin' ? { pinned: true } :
    op === 'unpin' ? { pinned: false } :
    { snoozedUntil: addDays(todayIL(), 1) };
  await setFeedState(key, patch, meta);
  revalidatePath('/');
}

export async function itemAction(itemId: string, patch: { attendance?: string; learning?: string; status?: string; pinned?: boolean }) {
  await updateItem(itemId, patch);
  revalidatePath('/');
  revalidatePath(`/items/${itemId}`);
}

export async function addItemAction(form: FormData) {
  const type = String(form.get('type') || 'מטלה') as 'מטלה' | 'שלב' | 'מבחן' | 'שיעור' | 'אירוע';
  const title = String(form.get('title') || '').trim();
  const courseId = String(form.get('courseId') || '');
  const date = String(form.get('date') || '') || null;
  const parentId = String(form.get('parentId') || '') || null;
  if (!title || !courseId) return;
  const id = await createItem({ type, title, courseId, date, parentId });
  revalidatePath('/');
  redirect(id ? `/items/${id}` : `/courses/${courseId}`);
}
