type Level = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  [key: string]: unknown;
}

function emit(level: Level, event: string, payload?: LogPayload, err?: unknown) {
  const record: Record<string, unknown> = {
    level,
    event,
    ts: new Date().toISOString(),
  };
  if (payload) Object.assign(record, payload);
  if (err) {
    record.err = err instanceof Error
      ? { name: err.name, message: err.message, stack: err.stack }
      : String(err);
  }
  const line = JSON.stringify(record);
  if (level === 'error' || level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (event: string, payload?: LogPayload) => emit('debug', event, payload),
  info: (event: string, payload?: LogPayload) => emit('info', event, payload),
  warn: (event: string, payload?: LogPayload) => emit('warn', event, payload),
  error: (event: string, err?: unknown, payload?: LogPayload) =>
    emit('error', event, payload, err),
};

export type Logger = typeof logger;
