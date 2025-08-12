const { createURL, randomInt, byteFormat } = require('@exzly-utils');

describe('Utils', () => {
  describe('createURL', () => {
    const req = {
      protocol: 'https',
      get: jest.fn().mockReturnValue('example.com'),
    };

    beforeEach(() => {
      process.env.WEB_ROUTE = '/web';
      process.env.API_ROUTE = '/api';
      process.env.ADMIN_ROUTE = '/admin';
    });

    it('should generate correct web URL', () => {
      const url = createURL(req, 'web', '/dashboard');
      expect(url).toBe('https:/example.com/web/dashboard');
    });

    it('should generate correct api URL', () => {
      const url = createURL(req, 'api', '/users');
      expect(url).toBe('https:/example.com/api/users');
    });

    it('should generate correct admin URL', () => {
      const url = createURL(req, 'admin', '/panel');
      expect(url).toBe('https:/example.com/admin/panel');
    });

    it('should return base URL if unknown name is passed', () => {
      const url = createURL(req, 'unknown');
      expect(url).toBe('https:/example.com');
    });
  });

  describe('byteFormat', () => {
    it('should format numbers less than 1000 digits count correctly', () => {
      expect(byteFormat(500)).toBe('0.5K');
    });

    it('should format numbers in thousands with "K" suffix', () => {
      expect(byteFormat(1500)).toBe('1.5K');
      expect(byteFormat(1000)).toBe('1K');
    });

    it('should format numbers in millions with "M" suffix', () => {
      expect(byteFormat(1_500_000)).toBe('1.5M');
      expect(byteFormat(1_000_000)).toBe('1M');
    });

    it('should format numbers in billions with "B" suffix', () => {
      expect(byteFormat(1_500_000_000)).toBe('1.5B');
      expect(byteFormat(1_000_000_000)).toBe('1B');
    });

    it('should format numbers in trillions with "T" suffix', () => {
      expect(byteFormat(1_500_000_000_000)).toBe('1.5T');
      expect(byteFormat(1_000_000_000_000)).toBe('1T');
    });

    it('should handle exact round numbers without decimal', () => {
      expect(byteFormat(2000)).toBe('2K');
    });
  });

  describe('randomInt', () => {
    it('should return a random number between min and max when length is false', () => {
      const value = randomInt(5, 15);
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(15);
    });

    it('should return a string of digits when length is given', () => {
      const code = randomInt(5, 10, 6);
      expect(typeof code).toBe('string');
      expect(code).toHaveLength(6);
      expect(/^\d+$/.test(code)).toBe(true);
    });

    it('should default to min=1 and max=10 when not specified', () => {
      const value = randomInt();
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    });
  });
});
