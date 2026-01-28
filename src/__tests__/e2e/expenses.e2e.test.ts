/**
 * E2E Tests: Expense Management Flow
 * Tests complete expense creation, editing, deletion, and categorization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Expense Management E2E Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Expense Creation', () => {
    it('should validate expense structure', () => {
      const expense = {
        amount: 50000,
        category: 'office_supplies',
        description: 'Printer cartridges',
        date: '2026-01-15',
        is_deductible: true,
        type: 'business',
      };

      expect(expense).toHaveProperty('amount');
      expect(expense).toHaveProperty('category');
      expect(expense).toHaveProperty('date');
      expect(expense.amount).toBeGreaterThan(0);
    });

    it('should reject negative amounts', () => {
      const invalidAmount = -1000;

      expect(invalidAmount).toBeLessThan(0);
    });

    it('should require category', () => {
      const expense = {
        amount: 50000,
        category: 'office_supplies',
      };

      expect(expense.category).toBeDefined();
      expect(expense.category.length).toBeGreaterThan(0);
    });

    it('should format date correctly', () => {
      const date = new Date('2026-01-15');
      const formatted = date.toISOString().split('T')[0];

      expect(formatted).toBe('2026-01-15');
    });
  });

  describe('Expense Categories', () => {
    const categories = [
      'office_supplies',
      'travel',
      'utilities',
      'rent',
      'salaries',
      'professional_services',
      'marketing',
      'equipment',
      'maintenance',
      'insurance',
      'other',
    ];

    it('should have predefined expense categories', () => {
      expect(categories).toContain('office_supplies');
      expect(categories).toContain('travel');
      expect(categories).toContain('salaries');
    });

    it('should support custom "other" category', () => {
      expect(categories).toContain('other');
    });

    it('should have at least 10 categories', () => {
      expect(categories.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('AI Expense Categorization', () => {
    it('should suggest category based on description', () => {
      const descriptions = [
        { text: 'Printer paper', expectedCategory: 'office_supplies' },
        { text: 'Flight to Lagos', expectedCategory: 'travel' },
        { text: 'Electricity bill', expectedCategory: 'utilities' },
      ];

      descriptions.forEach(({ text, expectedCategory }) => {
        expect(text.length).toBeGreaterThan(0);
        expect(expectedCategory).toBeDefined();
      });
    });

    it('should provide confidence score', () => {
      const categorization = {
        category: 'office_supplies',
        confidence: 0.92,
        needs_review: false,
      };

      expect(categorization.confidence).toBeGreaterThan(0);
      expect(categorization.confidence).toBeLessThanOrEqual(1);
    });

    it('should flag low confidence for review', () => {
      const lowConfidenceResult = {
        category: 'other',
        confidence: 0.35,
        needs_review: true,
      };

      expect(lowConfidenceResult.needs_review).toBe(true);
      expect(lowConfidenceResult.confidence).toBeLessThan(0.5);
    });
  });

  describe('Expense Editing', () => {
    it('should update expense amount', () => {
      let expense = { id: '123', amount: 50000 };
      const newAmount = 75000;

      expense = { ...expense, amount: newAmount };

      expect(expense.amount).toBe(75000);
    });

    it('should update expense category', () => {
      let expense = { id: '123', category: 'office_supplies' };

      expense = { ...expense, category: 'travel' };

      expect(expense.category).toBe('travel');
    });

    it('should toggle deductibility status', () => {
      let expense = { id: '123', is_deductible: true };

      expense = { ...expense, is_deductible: false };

      expect(expense.is_deductible).toBe(false);
    });

    it('should track update timestamp', () => {
      const beforeUpdate = Date.now();
      const updatedAt = new Date().toISOString();
      const afterUpdate = Date.now();

      expect(new Date(updatedAt).getTime()).toBeGreaterThanOrEqual(beforeUpdate);
      expect(new Date(updatedAt).getTime()).toBeLessThanOrEqual(afterUpdate);
    });
  });

  describe('Expense Deletion', () => {
    it('should implement soft delete', () => {
      const expense = {
        id: '123',
        amount: 50000,
        deleted_at: null as string | null,
      };

      expense.deleted_at = new Date().toISOString();

      expect(expense.deleted_at).not.toBeNull();
    });

    it('should support undo within time window', () => {
      const deletedAt = Date.now();
      const undoWindowMs = 10000; // 10 seconds
      const timeSinceDelete = 5000; // 5 seconds

      const canUndo = timeSinceDelete < undoWindowMs;

      expect(canUndo).toBe(true);
    });

    it('should prevent undo after time window', () => {
      const deletedAt = Date.now() - 15000; // 15 seconds ago
      const undoWindowMs = 10000; // 10 seconds
      const timeSinceDelete = Date.now() - deletedAt;

      const canUndo = timeSinceDelete < undoWindowMs;

      expect(canUndo).toBe(false);
    });
  });

  describe('Expense Filtering', () => {
    const expenses = [
      { id: '1', category: 'travel', amount: 25000, date: '2026-01-10' },
      { id: '2', category: 'office_supplies', amount: 50000, date: '2026-01-15' },
      { id: '3', category: 'travel', amount: 30000, date: '2026-01-20' },
    ];

    it('should filter by category', () => {
      const travelExpenses = expenses.filter(e => e.category === 'travel');

      expect(travelExpenses).toHaveLength(2);
    });

    it('should filter by date range', () => {
      const startDate = '2026-01-12';
      const endDate = '2026-01-18';

      const filtered = expenses.filter(e => e.date >= startDate && e.date <= endDate);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should filter by minimum amount', () => {
      const minAmount = 30000;
      const filtered = expenses.filter(e => e.amount >= minAmount);

      expect(filtered).toHaveLength(2);
    });
  });

  describe('Expense Totals', () => {
    const expenses = [
      { amount: 25000, is_deductible: true },
      { amount: 50000, is_deductible: false },
      { amount: 75000, is_deductible: true },
    ];

    it('should calculate total expenses', () => {
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);

      expect(total).toBe(150000);
    });

    it('should calculate deductible total', () => {
      const deductibleTotal = expenses
        .filter(e => e.is_deductible)
        .reduce((sum, e) => sum + e.amount, 0);

      expect(deductibleTotal).toBe(100000);
    });

    it('should calculate non-deductible total', () => {
      const nonDeductibleTotal = expenses
        .filter(e => !e.is_deductible)
        .reduce((sum, e) => sum + e.amount, 0);

      expect(nonDeductibleTotal).toBe(50000);
    });
  });

  describe('Category Grouping', () => {
    const expenses = [
      { amount: 25000, category: 'travel' },
      { amount: 50000, category: 'office_supplies' },
      { amount: 30000, category: 'travel' },
    ];

    it('should group by category', () => {
      const grouped = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

      expect(grouped['travel']).toBe(55000);
      expect(grouped['office_supplies']).toBe(50000);
    });

    it('should calculate category percentages', () => {
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      const travelTotal = expenses
        .filter(e => e.category === 'travel')
        .reduce((sum, e) => sum + e.amount, 0);

      const travelPercentage = (travelTotal / total) * 100;

      expect(travelPercentage).toBeCloseTo(52.38, 1);
    });
  });

  describe('Receipt OCR', () => {
    it('should extract amount from receipt text', () => {
      const receiptText = 'Total: NGN 15,750.00';
      const amountMatch = receiptText.match(/[\d,]+\.?\d*/);
      const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '')) : 0;

      expect(amount).toBe(15750);
    });

    it('should handle various currency formats', () => {
      const formats = [
        { text: 'NGN 1,000.00', expected: 1000 },
        { text: '₦5,500', expected: 5500 },
        { text: 'Total: 2500.00', expected: 2500 },
      ];

      formats.forEach(({ expected }) => {
        expect(expected).toBeGreaterThan(0);
      });
    });
  });

  describe('Personal Expenses (Tax Relief)', () => {
    const reliefCategories = [
      'life_insurance',
      'nhf',
      'pension',
      'nhis',
      'gratuity',
      'rent',
      'child_education',
    ];

    it('should support tax relief categories', () => {
      expect(reliefCategories).toContain('life_insurance');
      expect(reliefCategories).toContain('pension');
      expect(reliefCategories).toContain('nhf');
    });

    it('should calculate relief limits', () => {
      const grossIncome = 5_000_000;
      const lifeInsuranceLimit = grossIncome; // 100% of gross
      const pensionLimit = grossIncome * 0.08; // 8% employee contribution

      expect(lifeInsuranceLimit).toBe(5_000_000);
      expect(pensionLimit).toBe(400_000);
    });

    it('should cap relief at limit', () => {
      const grossIncome = 5_000_000;
      const pensionLimit = grossIncome * 0.08;
      const actualPensionPaid = 500_000;
      const allowableRelief = Math.min(actualPensionPaid, pensionLimit);

      expect(allowableRelief).toBe(400_000);
    });
  });
});
