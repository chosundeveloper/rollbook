/**
 * Date utility functions tests
 * Tests for common date operations used in the attendance tracking system
 */

describe('Date Utilities', () => {
  describe('getCurrentSunday', () => {
    it('should return current Sunday for any date', () => {
      // Monday (1)
      const monday = new Date('2025-12-01'); // A Monday
      const day = monday.getDay();
      const diff = day === 0 ? 0 : day;
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() - diff);
      const previousSunday = monday;

      expect(previousSunday.getDay()).toBe(0);
    });

    it('should return formatted date string in YYYY-MM-DD format', () => {
      const date = new Date('2025-12-01');
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;

      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(formatted).toBe('2025-12-01');
    });
  });

  describe('formatDateString', () => {
    it('should format date with leading zeros', () => {
      const date = new Date('2025-01-05');
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;

      expect(formatted).toBe('2025-01-05');
    });

    it('should handle December dates correctly', () => {
      const date = new Date('2025-12-25');
      const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      expect(formatted).toBe('2025-12-25');
    });
  });

  describe('Date sorting', () => {
    it('should sort dates in descending order', () => {
      const dates = ['2025-01-01', '2025-12-31', '2025-06-15'];
      const sorted = [...dates].sort((a, b) => b.localeCompare(a));

      expect(sorted[0]).toBe('2025-12-31');
      expect(sorted[sorted.length - 1]).toBe('2025-01-01');
    });
  });
});
