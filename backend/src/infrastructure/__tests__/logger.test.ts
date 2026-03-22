import { Logger } from '../logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('log_levels', () => {
    it('should log INFO messages to console.log', () => {
      logger.info('Test info message');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.level).toBe('INFO');
      expect(output.message).toBe('Test info message');
      expect(output.timestamp).toBeDefined();
    });

    it('should log ERROR messages to console.error', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(output.level).toBe('ERROR');
    });

    it('should log WARN messages to console.log', () => {
      logger.warn('Test warn message');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.level).toBe('WARN');
    });

    it('should log DEBUG messages to console.log', () => {
      logger.debug('Test debug message');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.level).toBe('DEBUG');
    });

    it('should not include meta when not provided', () => {
      logger.info('No meta');
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta).toBeUndefined();
    });

    it('should include meta when provided', () => {
      logger.info('With meta', { key: 'value' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta).toEqual({ key: 'value' });
    });
  });

  describe('PII_masking', () => {
    it('should mask email addresses', () => {
      logger.info('Test', { email: 'john@example.com' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.email).toBe('j***@example.com');
    });

    it('should redact invalid email', () => {
      logger.info('Test', { email: 'noemail' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.email).toBe('[REDACTED]');
    });

    it('should mask phone numbers', () => {
      logger.info('Test', { phone: '612345678' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.phone).toBe('6****5678');
    });

    it('should redact short phone numbers', () => {
      logger.info('Test', { phone: '1234' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.phone).toBe('[REDACTED]');
    });

    it('should mask firstName', () => {
      logger.info('Test', { firstName: 'John' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.firstName).toBe('J***');
    });

    it('should mask lastName', () => {
      logger.info('Test', { lastName: 'Doe' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.lastName).toBe('D***');
    });

    it('should redact empty firstName', () => {
      logger.info('Test', { firstName: '' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.firstName).toBe('[REDACTED]');
    });

    it('should redact address', () => {
      logger.info('Test', { address: '123 Main St' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.address).toBe('[REDACTED]');
    });

    it('should redact password fields', () => {
      logger.info('Test', { password: 'secret123' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.password).toBe('[REDACTED]');
    });

    it('should redact token fields', () => {
      logger.info('Test', { authToken: 'abc123' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.authToken).toBe('[REDACTED]');
    });

    it('should redact secret fields', () => {
      logger.info('Test', { clientSecret: 'xyz789' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.clientSecret).toBe('[REDACTED]');
    });

    it('should mask nested objects', () => {
      logger.info('Test', { user: { email: 'test@test.com', name: 'safe' } });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.user.email).toBe('t***@test.com');
      expect(output.meta.user.name).toBe('safe');
    });

    it('should pass through non-sensitive fields', () => {
      logger.info('Test', { id: 123, status: 'active' });
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.meta.id).toBe(123);
      expect(output.meta.status).toBe('active');
    });
  });
});
