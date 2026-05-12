import { describe, it, expect } from 'vitest';
import { ensurePositive, ensureRateInRange } from '../src/electron/backend/services/utils/validation';

describe('Validation Utilities', () => {
  describe('ensurePositive', () => {
    it('should pass for positive numbers', () => {
      expect(() => ensurePositive(100, 'amount')).not.toThrow();
      expect(() => ensurePositive(0.01, 'rate')).not.toThrow();
    });

    it('should throw for zero', () => {
      expect(() => ensurePositive(0, 'amount')).toThrow('must be a number greater than zero');
    });

    it('should throw for negative numbers', () => {
      expect(() => ensurePositive(-5, 'amount')).toThrow('must be a number greater than zero');
    });

    it('should throw for NaN', () => {
      expect(() => ensurePositive(NaN, 'value')).toThrow('must be a number greater than zero');
    });
  });

  describe('ensureRateInRange', () => {
    it('should pass for valid rates', () => {
      expect(() => ensureRateInRange(0.5, 'rate')).not.toThrow();
      expect(() => ensureRateInRange(0, 'rate')).not.toThrow();
      expect(() => ensureRateInRange(1, 'rate')).not.toThrow();
    });

    it('should throw for values outside [0,1]', () => {
      expect(() => ensureRateInRange(1.5, 'rate')).toThrow('must be between 0 and 1');
      expect(() => ensureRateInRange(-1, 'rate')).toThrow('must be between 0 and 1');
    });

    it('should throw for undefined', () => {
      expect(() => ensureRateInRange(undefined, 'rate')).toThrow('is required');
    });
  });
});
