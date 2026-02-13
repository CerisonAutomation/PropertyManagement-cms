import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Enhanced theme configuration with enterprise themes
export const enterpriseThemes = {
	light: {
		name: 'Light',
		colors: {
			background: '0 0% 100%',
			foreground: '222.2 84% 4.9%',
			card: '0 0% 100%',
			cardForeground: '222.2 84% 4.9%',
			popover: '0 0% 100%',
			popoverForeground: '222.2 84% 4.9%',
			primary: '221.2 83.2% 53.3%',
			primaryForeground: '210 40% 98%',
			secondary: '210 40% 96%',
			secondaryForeground: '222.2 84% 4.9%',
			muted: '210 40% 96%',
			mutedForeground: '215.4 16.3% 46.9%',
			accent: '210 40% 96%',
			accentForeground: '222.2 84% 4.9%',
			destructive: '0 84.2% 60.2%',
			destructiveForeground: '210 40% 98%',
			border: '214.3 31.8% 91.4%',
			input: '214.3 31.8% 91.4%',
			ring: '221.2 83.2% 53.3%',
			chart1: '12 76% 61%',
			chart2: '173 58% 39%',
			chart3: '197 37% 24%',
			chart4: '43 74% 66%',
			chart5: '27 87% 67%',
		},
	},
	dark: {
		name: 'Dark',
		colors: {
			background: '222.2 84% 4.9%',
			foreground: '210 40% 98%',
			card: '222.2 84% 4.9%',
			cardForeground: '210 40% 98%',
			popover: '222.2 84% 4.9%',
			popoverForeground: '210 40% 98%',
			primary: '217.2 91.2% 59.8%',
			primaryForeground: '222.2 84% 4.9%',
			secondary: '217.2 32.6% 17.5%',
			secondaryForeground: '210 40% 98%',
			muted: '217.2 32.6% 17.5%',
			mutedForeground: '215 20.2% 65.1%',
			accent: '217.2 32.6% 17.5%',
			accentForeground: '210 40% 98%',
			destructive: '0 62.8% 30.6%',
			destructiveForeground: '210 40% 98%',
			border: '217.2 32.6% 17.5%',
			input: '217.2 32.6% 17.5%',
			ring: '224.3 76.3% 94.1%',
			chart1: '220 70% 50%',
			chart2: '160 60% 45%',
			chart3: '30 80% 55%',
			chart4: '280 65% 60%',
			chart5: '340 75% 55%',
		},
	},
	blue: {
		name: 'Ocean Blue',
		colors: {
			background: '0 0% 100%',
			foreground: '240 10% 3.9%',
			card: '0 0% 100%',
			cardForeground: '240 10% 3.9%',
			popover: '0 0% 100%',
			popoverForeground: '240 10% 3.9%',
			primary: '240 5.9% 10%',
			primaryForeground: '0 0% 98%',
			secondary: '240 4.8% 95.9%',
			secondaryForeground: '240 3.8% 46.1%',
			muted: '240 4.8% 95.9%',
			mutedForeground: '240 3.8% 46.1%',
			accent: '240 4.8% 95.9%',
			accentForeground: '240 5.9% 10%',
			destructive: '0 84.2% 60.2%',
			destructiveForeground: '0 0% 98%',
			border: '240 5.9% 90%',
			input: '240 5.9% 90%',
			ring: '240 5.9% 10%',
			chart1: '12 76% 61%',
			chart2: '173 58% 39%',
			chart3: '197 37% 24%',
			chart4: '43 74% 66%',
			chart5: '27 87% 67%',
		},
	},
	green: {
		name: 'Forest Green',
		colors: {
			background: '0 0% 100%',
			foreground: '240 10% 3.9%',
			card: '0 0% 100%',
			cardForeground: '240 10% 3.9%',
			popover: '0 0% 100%',
			popoverForeground: '240 10% 3.9%',
			primary: '142.1 76.2% 36.3%',
			primaryForeground: '355.7 100% 97.3%',
			secondary: '240 4.8% 95.9%',
			secondaryForeground: '240 3.8% 46.1%',
			muted: '240 4.8% 95.9%',
			mutedForeground: '240 3.8% 46.1%',
			accent: '240 4.8% 95.9%',
			accentForeground: '142.1 76.2% 36.3%',
			destructive: '0 84.2% 60.2%',
			destructiveForeground: '0 0% 98%',
			border: '240 5.9% 90%',
			input: '240 5.9% 90%',
			ring: '142.1 76.2% 36.3%',
			chart1: '12 76% 61%',
			chart2: '173 58% 39%',
			chart3: '197 37% 24%',
			chart4: '43 74% 66%',
			chart5: '27 87% 67%',
		},
	},
	purple: {
		name: 'Royal Purple',
		colors: {
			background: '0 0% 100%',
			foreground: '240 10% 3.9%',
			card: '0 0% 100%',
			cardForeground: '240 10% 3.9%',
			popover: '0 0% 100%',
			popoverForeground: '240 10% 3.9%',
			primary: '262.1 83.3% 57.8%',
			primaryForeground: '210 40% 98%',
			secondary: '240 4.8% 95.9%',
			secondaryForeground: '240 3.8% 46.1%',
			muted: '240 4.8% 95.9%',
			mutedForeground: '240 3.8% 46.1%',
			accent: '240 4.8% 95.9%',
			accentForeground: '240 5.9% 10%',
			destructive: '0 84.2% 60.2%',
			destructiveForeground: '0 0% 98%',
			border: '240 5.9% 90%',
			input: '240 5.9% 90%',
			ring: '262.1 83.3% 57.8%',
			chart1: '12 76% 61%',
			chart2: '173 58% 39%',
			chart3: '197 37% 24%',
			chart4: '43 74% 66%',
			chart5: '27 87% 67%',
		},
	},
	highContrast: {
		name: 'High Contrast',
		colors: {
			background: '0 0% 100%',
			foreground: '0 0% 0%',
			card: '0 0% 100%',
			cardForeground: '0 0% 0%',
			popover: '0 0% 100%',
			popoverForeground: '0 0% 0%',
			primary: '0 0% 0%',
			primaryForeground: '0 0% 100%',
			secondary: '0 0% 96.1%',
			secondaryForeground: '0 0% 9%',
			muted: '0 0% 96.1%',
			mutedForeground: '0 0% 45.1%',
			accent: '0 0% 96.1%',
			accentForeground: '0 0% 9%',
			destructive: '0 84.2% 60.2%',
			destructiveForeground: '0 0% 98%',
			border: '0 0% 90%',
			input: '0 0% 90%',
			ring: '0 0% 0%',
			chart1: '12 76% 61%',
			chart2: '173 58% 39%',
			chart3: '197 37% 24%',
			chart4: '43 74% 66%',
			chart5: '27 87% 67%',
		},
	},
} as const;

export type EnterpriseTheme = keyof typeof enterpriseThemes;

interface ThemeContextType {
	theme: EnterpriseTheme;
	setTheme: (theme: EnterpriseTheme) => void;
	systemTheme: 'light' | 'dark';
	themes: typeof enterpriseThemes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}

interface EnterpriseThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: EnterpriseTheme;
	storageKey?: string;
}

export function EnterpriseThemeProvider({
	children,
	defaultTheme = 'light',
	storageKey = 'enterprise-theme',
}: EnterpriseThemeProviderProps) {
	const [theme, setThemeState] = useState<EnterpriseTheme>(defaultTheme);
	const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

	useEffect(() => {
		const stored = localStorage.getItem(storageKey) as EnterpriseTheme;
		if (stored && enterpriseThemes[stored]) {
			setThemeState(stored);
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

		const handleChange = (e: MediaQueryListEvent) => {
			setSystemTheme(e.matches ? 'dark' : 'light');
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [storageKey]);

	const setTheme = (newTheme: EnterpriseTheme) => {
		setThemeState(newTheme);
		localStorage.setItem(storageKey, newTheme);

		// Apply theme to CSS variables
		const root = document.documentElement;
		const themeColors = enterpriseThemes[newTheme].colors;

		Object.entries(themeColors).forEach(([key, value]) => {
			root.style.setProperty(`--${key}`, value);
		});

		// Add high contrast styles if needed
		if (newTheme === 'highContrast') {
			root.setAttribute('data-high-contrast', 'true');
		} else {
			root.removeAttribute('data-high-contrast');
		}
	};

	// Apply theme on mount and when theme changes
	useEffect(() => {
		setTheme(theme);
	}, [theme]);

	const value: ThemeContextType = {
		theme,
		setTheme,
		systemTheme,
		themes: enterpriseThemes,
	};

	return (
		<ThemeContext.Provider value={value}>
			<NextThemesProvider
				attribute="class"
				defaultTheme={theme}
				enableSystem
				disableTransitionOnChange
			>
				{children}
			</NextThemesProvider>
		</ThemeContext.Provider>
	);
}
