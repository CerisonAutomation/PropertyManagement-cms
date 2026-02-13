import { describe, expect, it } from 'vitest';
import { hashPassword, sanitizeInput, validateEmail } from './security';

describe('Security Utilities', () => {
	describe('sanitizeInput', () => {
		it('removes script tags', () => {
			const input = '<script>alert("test")</script>Hello';
			const output = sanitizeInput(input);
			expect(output).toBe('Hello');
		});

		it('handles HTML tags', () => {
			const input = '<div>Test content</div>';
			const output = sanitizeInput(input);
			expect(output).toBe('Test content');
		});

		it('preserves plain text', () => {
			const input = 'Hello World!';
			const output = sanitizeInput(input);
			expect(output).toBe('Hello World!');
		});
	});

	describe('validateEmail', () => {
		it('accepts valid email', () => {
			expect(validateEmail('test@example.com')).toBe(true);
		});

		it('rejects invalid email', () => {
			expect(validateEmail('invalid-email')).toBe(false);
			expect(validateEmail('test@')).toBe(false);
			expect(validateEmail('@example.com')).toBe(false);
		});
	});

	describe('hashPassword', () => {
		it('hashes password consistently', () => {
			const password = 'testPassword123';
			const hash1 = hashPassword(password);
			const hash2 = hashPassword(password);
			expect(hash1).toBe(hash2);
		});

		it('produces different hashes for different passwords', () => {
			const hash1 = hashPassword('password1');
			const hash2 = hashPassword('password2');
			expect(hash1).not.toBe(hash2);
		});
	});
});
