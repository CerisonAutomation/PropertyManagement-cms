/**
 * Intelligent Autocomplete System
 * Uses AI-powered suggestions for better content creation
 */

export interface AutocompleteSuggestion {
	text: string;
	confidence: number;
	type: 'word' | 'phrase' | 'sentence' | 'emoji';
	context?: string;
}

export interface AutocompleteConfig {
	enabled: boolean;
	minChars: number;
	maxSuggestions: number;
	debounceMs: number;
	smartSuggestions: boolean;
	learningMode: boolean;
}

export class AutocompleteEngine {
	private config: AutocompleteConfig;
	private history: string[] = [];
	private patterns: Map<string, RegExp> = new Map();

	constructor(config: Partial<AutocompleteConfig> = {}) {
		this.config = {
			enabled: true,
			minChars: 2,
			maxSuggestions: 5,
			debounceMs: 300,
			smartSuggestions: true,
			learningMode: true,
			...config,
		};

		this.initializePatterns();
	}

	private initializePatterns(): void {
		// Common property management terms
		this.patterns.set('property', /property|properties|apartment|house|flat|villa/gi);
		this.patterns.set('rental', /rental|rent|lease|tenant/gi);
		this.patterns.set('location', /malta|gozo|sliema|st julians|paceville/gi);
		this.patterns.set('price', /€|price|cost|fee|rate/gi);
		this.patterns.set('amenities', /pool|gym|balcony|garage|garden|terrace/gi);
	}

	async getSuggestions(
		text: string,
		cursorPosition: number,
		context?: any
	): Promise<AutocompleteSuggestion[]> {
		if (!this.config.enabled || text.length < this.config.minChars) {
			return [];
		}

		const beforeCursor = text.substring(0, cursorPosition);
		const currentWord = this.extractCurrentWord(beforeCursor);

		if (currentWord.length < this.config.minChars) {
			return [];
		}

		const suggestions: AutocompleteSuggestion[] = [];

		// Get suggestions from history
		if (this.config.learningMode) {
			const historySuggestions = await this.getSuggestionsFromHistory(currentWord);
			suggestions.push(...historySuggestions);
		}

		// Get context-based suggestions
		if (this.config.smartSuggestions && context) {
			const contextSuggestions = await this.getContextBasedSuggestions(currentWord, context);
			suggestions.push(...contextSuggestions);
		}

		// Get template suggestions
		const templateSuggestions = await this.getTemplateSuggestions(currentWord);
		suggestions.push(...templateSuggestions);

		// Remove duplicates and sort by confidence
		const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
		const sortedSuggestions = uniqueSuggestions.sort((a, b) => b.confidence - a.confidence);

		return sortedSuggestions.slice(0, this.config.maxSuggestions);
	}

	private extractCurrentWord(text: string): string {
		const match = text.match(/(\w+)$/);
		return match ? match[1] : '';
	}

	private async getSuggestionsFromHistory(partial: string): Promise<AutocompleteSuggestion[]> {
		const matches = this.history
			.filter((phrase) => phrase.toLowerCase().startsWith(partial.toLowerCase()))
			.slice(0, 3)
			.map((phrase) => ({
				text: phrase,
				confidence: 0.8,
				type: 'word' as const,
			}));

		return matches;
	}

	private async getContextBasedSuggestions(
		partial: string,
		context: any
	): Promise<AutocompleteSuggestion[]> {
		const suggestions: AutocompleteSuggestion[] = [];

		// Check current section type
		if (context.sectionType === 'hero') {
			if (partial.toLowerCase().startsWith('malta')) {
				suggestions.push(
					{ text: "Malta's Premier Property Management", confidence: 0.95, type: 'phrase' },
					{ text: 'Malta Properties', confidence: 0.85, type: 'word' }
				);
			}
		}

		if (context.sectionType === 'features') {
			if (partial.toLowerCase().startsWith('prof')) {
				suggestions.push(
					{ text: 'Professional Management', confidence: 0.9, type: 'phrase' },
					{ text: 'Profit Maximization', confidence: 0.85, type: 'phrase' }
				);
			}
		}

		return suggestions;
	}

	private async getTemplateSuggestions(partial: string): Promise<AutocompleteSuggestion[]> {
		const templates = [
			'Full-service property management',
			'Professional rental management',
			'Malta & Gozo coverage',
			'24/7 guest support',
			'Guaranteed rental income',
			'Professional photography included',
			'Revenue optimization strategies',
			'Expert local knowledge',
			'Comprehensive property care',
			'Transparent pricing structure',
		];

		return templates
			.filter((template) => template.toLowerCase().startsWith(partial.toLowerCase()))
			.slice(0, 2)
			.map((template) => ({
				text: template,
				confidence: 0.75,
				type: 'phrase' as const,
			}));
	}

	private deduplicateSuggestions(suggestions: AutocompleteSuggestion[]): AutocompleteSuggestion[] {
		const seen = new Set<string>();
		return suggestions.filter((s) => {
			if (seen.has(s.text)) {
				return false;
			}
			seen.add(s.text);
			return true;
		});
	}

	learn(text: string): void {
		if (text.length > 10 && this.config.learningMode) {
			this.history.push(text);
			// Keep only last 1000 entries
			if (this.history.length > 1000) {
				this.history = this.history.slice(-1000);
			}
		}
	}

	updateConfig(newConfig: Partial<AutocompleteConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}

	getConfig(): AutocompleteConfig {
		return { ...this.config };
	}
}

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutocomplete(getContext: () => any, config?: Partial<AutocompleteConfig>) {
	const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const engineRef = useRef<AutocompleteEngine | null>(null);
	const debounceRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		engineRef.current = new AutocompleteEngine(config);
	}, [config]);

	const getSuggestions = useCallback(
		async (text: string, cursorPosition: number) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			setIsLoading(true);

			debounceRef.current = setTimeout(async () => {
				if (!engineRef.current) return;

				const context = getContext();
				const newSuggestions = await engineRef.current.getSuggestions(
					text,
					cursorPosition,
					context
				);
				setSuggestions(newSuggestions);
				setIsLoading(false);
			}, engineRef.current?.getConfig().debounceMs || 300);
		},
		[getContext]
	);

	const learn = useCallback((text: string) => {
		engineRef.current?.learn(text);
	}, []);

	return {
		suggestions,
		isLoading,
		getSuggestions,
		learn,
	};
}
