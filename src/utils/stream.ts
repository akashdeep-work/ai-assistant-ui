const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const extractTextFromJson = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;

  const directKeys = ['content', 'delta', 'chunk', 'text', 'message', 'response', 'answer', 'token'];

  for (const key of directKeys) {
    const fieldValue = record[key];

    if (typeof fieldValue === 'string') return fieldValue;
  }

  const choices = record.choices;

  if (Array.isArray(choices) && choices.length > 0) {
    const firstChoice = choices[0] as Record<string, unknown>;
    const delta = firstChoice.delta as Record<string, unknown> | undefined;
    const message = firstChoice.message as Record<string, unknown> | undefined;

    if (typeof delta?.content === 'string') return delta.content;
    if (typeof message?.content === 'string') return message.content;
    if (typeof firstChoice.text === 'string') return firstChoice.text;
  }

  return '';
};

export const parseStreamLine = (rawLine: string): string => {
  const trimmedLine = rawLine.trim();

  if (!trimmedLine || trimmedLine === '[DONE]') return '';
  if (trimmedLine.startsWith('event:') || trimmedLine.startsWith('id:')) return '';

  const payload = trimmedLine.startsWith('data:') ? trimmedLine.slice(5).trim() : trimmedLine;

  if (!payload || payload === '[DONE]') return '';

  const json = tryParseJson(payload);

  if (json) {
    return extractTextFromJson(json);
  }

  return payload;
};

export const parseBufferedStream = (buffer: string, onChunk: (chunk: string) => void) => {
  const lines = buffer.split(/\r?\n/);
  const remaining = lines.pop() ?? '';

  for (const line of lines) {
    const chunk = parseStreamLine(line);

    if (chunk) onChunk(chunk);
  }

  return remaining;
};