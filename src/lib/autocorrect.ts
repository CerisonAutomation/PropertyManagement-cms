/**
 * Intelligent Auto-correct System
 * Fixes spelling and grammar errors in real-time
 */

export interface CorrectionSuggestion {
	original: string;
	corrected: string;
	confidence: number;
	type: 'spelling' | 'grammar' | 'punctuation' | 'capitalization';
}

export interface AutocorrectConfig {
	enabled: boolean;
	aggressive: boolean;
	checkGrammar: boolean;
	checkSpelling: boolean;
	checkCapitalization: boolean;
	customDictionary: Set<string>;
}

export class AutocorrectEngine {
	private config: AutocorrectConfig;
	private commonCorrections: Map<string, string> = new Map();
	private grammarRules: Array<{
		pattern: RegExp;
		replacement: string;
		type: 'spelling' | 'grammar' | 'punctuation' | 'capitalization';
	}> = [];

	constructor(config: Partial<AutocorrectConfig> = {}) {
		this.config = {
			enabled: true,
			aggressive: false,
			checkGrammar: true,
			checkSpelling: true,
			checkCapitalization: true,
			customDictionary: new Set(),
			...config,
		};

		this.initializeCommonCorrections();
		this.initializeGrammarRules();
	}

	private initializeCommonCorrections(): void {
		// Property management specific corrections
		this.commonCorrections.set('recieve', 'receive');
		this.commonCorrections.set('seperate', 'separate');
		this.commonCorrections.set('definately', 'definitely');
		this.commonCorrections.set('occured', 'occurred');
		this.commonCorrections.set('acommodate', 'accommodate');
		this.commonCorrections.set('maintainance', 'maintenance');
		this.commonCorrections.set('availible', 'available');
		this.commonCorrections.set('guarenteed', 'guaranteed');
		this.commonCorrections.set('recomend', 'recommend');
		this.commonCorrections.set('priviledge', 'privilege');
	}

	private initializeGrammarRules(): void {
		this.grammarRules = [
			// Capitalization rules
			{
				pattern: /\bi\b/g,
				replacement: 'I',
				type: 'capitalization',
			},
			// Double spaces
			{
				pattern: /\s{2,}/g,
				replacement: ' ',
				type: 'punctuation',
			},
			// Missing apostrophe in contractions
			{
				pattern: /\bwont\b/gi,
				replacement: "won't",
				type: 'spelling',
			},
			{
				pattern: /\bcant\b/gi,
				replacement: "can't",
				type: 'spelling',
			},
			{
				pattern: /\bdont\b/gi,
				replacement: "don't",
				type: 'spelling',
			},
			{
				pattern: /\bwont\b/gi,
				replacement: "won't",
				type: 'spelling',
			},
			// Missing apostrophe in possessives
			{
				pattern: /(\w+)s\b/g,
				replacement: "$1's",
				type: 'grammar',
			},
			// Extra punctuation
			{
				pattern: /[!?.,]{2,}/g,
				replacement: '$1',
				type: 'punctuation',
			},
		];
	}

	async checkText(text: string): Promise<CorrectionSuggestion[]> {
		if (!this.config.enabled) {
			return [];
		}

		const corrections: CorrectionSuggestion[] = [];

		// Check spelling
		if (this.config.checkSpelling) {
			corrections.push(...this.checkSpelling(text));
		}

		// Check grammar
		if (this.config.checkGrammar) {
			corrections.push(...this.checkGrammar(text));
		}

		// Check capitalization
		if (this.config.checkCapitalization) {
			corrections.push(...this.checkCapitalization(text));
		}

		return corrections;
	}

	private checkSpelling(text: string): CorrectionSuggestion[] {
		const corrections: CorrectionSuggestion[] = [];
		const words = text.split(/\b/);

		for (const word of words) {
			const lowerWord = word.toLowerCase();

			// Check common corrections
			if (this.commonCorrections.has(lowerWord)) {
				const corrected = this.commonCorrections.get(lowerWord)!;
				corrections.push({
					original: word,
					corrected: word.replace(lowerWord, corrected),
					confidence: 0.9,
					type: 'spelling',
				});
			}

			// Check against custom dictionary (skip if in dictionary)
			if (this.config.customDictionary.size > 0 && !this.config.customDictionary.has(lowerWord)) {
				// Check if it looks like a misspelled word (basic heuristic)
				if (this.isPotentialMisspelling(lowerWord)) {
					corrections.push({
						original: word,
						corrected: word,
						confidence: 0.3,
						type: 'spelling',
					});
				}
			}
		}

		return corrections;
	}

	private checkGrammar(text: string): CorrectionSuggestion[] {
		const corrections: CorrectionSuggestion[] = [];

		for (const rule of this.grammarRules) {
			if (rule.type === 'grammar' || rule.type === 'punctuation') {
				const matches = text.match(rule.pattern);
				if (matches) {
					corrections.push({
						original: matches[0],
						corrected: matches[0].replace(rule.pattern, rule.replacement),
						confidence: 0.85,
						type: rule.type,
					});
				}
			}
		}

		return corrections;
	}

	private checkCapitalization(text: string): CorrectionSuggestion[] {
		const corrections: CorrectionSuggestion[] = [];

		for (const rule of this.grammarRules) {
			if (rule.type === 'capitalization') {
				const matches = text.match(rule.pattern);
				if (matches) {
					corrections.push({
						original: matches[0],
						corrected: matches[0].replace(rule.pattern, rule.replacement),
						confidence: 0.95,
						type: rule.type,
					});
				}
			}
		}

		return corrections;
	}

	private isPotentialMisspelling(word: string): boolean {
		// Basic heuristic: looks like a word but has unusual patterns
		return (
			word.length > 3 &&
			/^[a-z]+$/.test(word) &&
			(word.includes('aa') ||
				word.includes('ee') ||
				word.includes('ii') ||
				word.includes('oo') ||
				word.includes('uu'))
		);
	}

	async applyCorrections(text: string): Promise<{ corrected: string; changes: number }> {
		let corrected = text;
		const corrections = await this.checkText(text);
		let changeCount = 0;

		for (const correction of corrections) {
			if (correction.original !== correction.corrected) {
				corrected = corrected.replace(correction.original, correction.corrected);
				changeCount++;
			}
		}

		return { corrected, changes: changeCount };
	}

	addToDictionary(word: string): void {
		this.config.customDictionary.add(word.toLowerCase());
	}

	removeFromDictionary(word: string): void {
		this.config.customDictionary.delete(word.toLowerCase());
	}

	updateConfig(newConfig: Partial<AutocorrectConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}

	getConfig(): AutocorrectConfig {
		return { ...this.config };
	}
}

import { useCallback, useState } from 'react';

export function useAutocorrect(config?: Partial<AutocorrectConfig>) {
	const [engine] = useState(() => new AutocorrectEngine(config));
	const [corrections, setCorrections] = useState<CorrectionSuggestion[]>([]);
	const [isChecking, setIsChecking] = useState(false);

	const checkText = useCallback(
		async (text: string) => {
			setIsChecking(true);
			const foundCorrections = await engine.checkText(text);
			setCorrections(foundCorrections);
			setIsChecking(false);
			return foundCorrections;
		},
		[engine]
	);

	const applyCorrections = useCallback(
		async (text: string) => {
			const result = await engine.applyCorrections(text);
			return result;
		},
		[engine]
	);

	return {
		corrections,
		isChecking,
		checkText,
		applyCorrections,
		engine,
	};
}
