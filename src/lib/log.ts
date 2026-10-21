type Level = "info" | "warn" | "error";

/**
 * Structured server log line. Never pass secrets or full personal data –
 * use references and ids instead.
 */
export function log(level: Level, event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...data });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
