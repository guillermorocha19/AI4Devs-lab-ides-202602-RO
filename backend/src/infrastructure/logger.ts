export class Logger {
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('INFO', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('ERROR', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('WARN', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('DEBUG', message, meta);
  }

  private log(level: string, message: string, meta?: Record<string, unknown>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta ? { meta: this.maskPII(meta) } : {}),
    };
    const output = level === 'ERROR' ? console.error : console.log;
    output(JSON.stringify(entry));
  }

  private maskPII(meta: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeywords = ['password', 'token', 'secret'];
    const masked: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(meta)) {
      const lowerKey = key.toLowerCase();

      if (sensitiveKeywords.some((kw) => lowerKey.includes(kw))) {
        masked[key] = '[REDACTED]';
        continue;
      }

      if (lowerKey === 'email' && typeof value === 'string') {
        const [local, domain] = value.split('@');
        masked[key] = local && domain ? `${local[0]}***@${domain}` : '[REDACTED]';
        continue;
      }

      if (lowerKey === 'phone' && typeof value === 'string') {
        masked[key] =
          value.length >= 5
            ? `${value[0]}${'*'.repeat(value.length - 5)}${value.slice(-4)}`
            : '[REDACTED]';
        continue;
      }

      if ((lowerKey === 'firstname' || lowerKey === 'lastname') && typeof value === 'string') {
        masked[key] = value.length > 0 ? `${value[0]}***` : '[REDACTED]';
        continue;
      }

      if (lowerKey === 'address') {
        masked[key] = '[REDACTED]';
        continue;
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        masked[key] = this.maskPII(value as Record<string, unknown>);
        continue;
      }

      masked[key] = value;
    }

    return masked;
  }
}
