const THREAD_IDS_KEY = 'ai_assistant_thread_ids';

export const createThreadId = () => {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return `thread_${randomPart}`;
};

export const getStoredThreadIds = (): string[] => {
  try {
    const rawValue = localStorage.getItem(THREAD_IDS_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter((item): item is string => typeof item === 'string' && item.length > 0);
  } catch {
    return [];
  }
};

export const saveThreadIds = (threadIds: string[]) => {
  const uniqueThreadIds = Array.from(new Set(threadIds));
  localStorage.setItem(THREAD_IDS_KEY, JSON.stringify(uniqueThreadIds));

  return uniqueThreadIds;
};

export const ensureThreadId = (threadId: string) => {
  const existingThreadIds = getStoredThreadIds();

  if (existingThreadIds.includes(threadId)) return existingThreadIds;

  return saveThreadIds([threadId, ...existingThreadIds]);
};

export const removeThreadId = (threadId: string) => {
  const updatedThreadIds = getStoredThreadIds().filter((item) => item !== threadId);
  saveThreadIds(updatedThreadIds);

  return updatedThreadIds;
};