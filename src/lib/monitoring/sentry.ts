export type MonitoringContext = {
  userId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export function captureException(error: unknown, context: MonitoringContext = {}): void {
  // Default console transport. Replace with Sentry SDK in production.
  console.error("[monitoring] exception", {
    error,
    context,
  });
}

export function captureMessage(message: string, context: MonitoringContext = {}): void {
  console.info("[monitoring] message", {
    message,
    context,
  });
}
