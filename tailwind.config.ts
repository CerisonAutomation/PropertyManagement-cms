import type { Config } from 'tailwindcss';

export default {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
		},
		screens: {
			// Ultra small mobile devices
			xs: '320px',
			// Small mobile devices
			sm: '375px',
			// Standard mobile devices
			md: '425px',
			// Large mobile / Small tablets
			lg: '768px',
			// Tablets
			xl: '1024px',
			// Small desktops
			'2xl': '1280px',
			// Standard desktops
			'3xl': '1440px',
			// Large desktops
			'4xl': '1680px',
			// Ultra wide desktops
			'5xl': '1920px',
			// 4K monitors
			'6xl': '2560px',
			// Ultra wide 4K
			'7xl': '3440px',
		},
		extend: {
			fontFamily: {
				serif: ["'Playfair Display'", 'serif'],
				script: ["'Playfair Display'", 'serif'],
				sans: ["'Inter'", 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				luxuryGold: 'hsl(var(--luxury-gold))',
				'gold-light': 'hsl(var(--luxury-gold-light))',
				'gold-dark': 'hsl(var(--luxury-gold-dark))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
				},
			},
			fontSize: {
				// Responsive font sizes for perfect readability
				xs: ['0.75rem', { lineHeight: '1rem' }],
				sm: ['0.875rem', { lineHeight: '1.25rem' }],
				base: ['1rem', { lineHeight: '1.5rem' }],
				lg: ['1.125rem', { lineHeight: '1.75rem' }],
				xl: ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
				// Mobile-specific sizes
				'mobile-xs': ['0.8125rem', { lineHeight: '1.25rem' }],
				'mobile-sm': ['0.9375rem', { lineHeight: '1.25rem' }],
				'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
				'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
				'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
			},
			spacing: {
				// Enhanced spacing for perfect layouts
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
				'144': '36rem',
				'160': '40rem',
				'176': '44rem',
				'192': '48rem',
				'208': '52rem',
				'224': '56rem',
				'240': '60rem',
				'256': '64rem',
				'288': '72rem',
				'320': '80rem',
				'384': '96rem',
				'512': '128rem',
				'640': '160rem',
				'768': '192rem',
				'896': '224rem',
				'1024': '256rem',
			},
			maxWidth: {
				// Responsive max widths for perfect content fitting
				xs: '20rem',
				sm: '24rem',
				md: '28rem',
				lg: '32rem',
				xl: '36rem',
				'2xl': '42rem',
				'3xl': '48rem',
				'4xl': '56rem',
				'5xl': '64rem',
				'6xl': '72rem',
				'7xl': '80rem',
				'8xl': '88rem',
				prose: '65ch', // Optimal reading width
				'mobile-full': '100vw',
				'tablet-full': '100vw',
				'desktop-full': '100vw',
			},
			minWidth: {
				// Minimum widths for perfect touch targets
				'44': '11rem', // 44px minimum touch target
				'48': '12rem', // 48px comfortable touch target
				'56': '14rem', // 56px large touch target
				'64': '16rem', // 64px extra large touch target
			},
			height: {
				// Responsive heights for perfect sections
				screen: '100vh',
				'screen-sm': '100vh',
				'screen-md': '100vh',
				'screen-lg': '100vh',
				'screen-xl': '100vh',
				'screen-2xl': '100vh',
				'screen-3xl': '100vh',
				'screen-4xl': '100vh',
				'screen-5xl': '100vh',
				'screen-6xl': '100vh',
				'screen-7xl': '100vh',
				mobile: '100vh',
				tablet: '100vh',
				desktop: '100vh',
			},
			aspectRatio: {
				// Perfect aspect ratios for all content
				'4/3': '4 / 3',
				'3/2': '3 / 2',
				'16/9': '16 / 9',
				'21/9': '21 / 9',
				'1/1': '1 / 1',
				'2/1': '2 / 1',
				'3/1': '3 / 1',
				'4/1': '4 / 1',
				'9/16': '9 / 16',
				'2/3': '2 / 3',
				'3/4': '3 / 4',
				'9/21': '9 / 21',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
				'3xl': 'calc(var(--radius) + 12px)',
				full: '9999px',
			},
			boxShadow: {
				// Enhanced shadows for depth
				soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
				medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
				strong: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 25px -5px rgba(0, 0, 0, 0.1)',
				colored:
					'0 10px 40px -10px rgba(251, 191, 36, 0.15), 0 4px 25px -5px rgba(251, 191, 36, 0.1)',
			},
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				md: '8px',
				lg: '16px',
				xl: '24px',
				'2xl': '40px',
				'3xl': '64px',
			},
			transitionDuration: {
				DEFAULT: '150ms',
				'0': '0ms',
				'75': '75ms',
				'100': '100ms',
				'150': '150ms',
				'200': '200ms',
				'300': '300ms',
				'500': '500ms',
				'700': '700ms',
				'1000': '1000ms',
			},
			transitionTimingFunction: {
				DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
				in: 'cubic-bezier(0.4, 0, 1, 1)',
				out: 'cubic-bezier(0, 0, 0.2, 1)',
				'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
				bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
				swift: 'cubic-bezier(0.15, 0, 0.15, 1)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-in-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
				'fade-in-down': 'fade-in-down 0.5s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				float: 'float 3s ease-in-out infinite',
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			},
			gridTemplateColumns: {
				'13': 'repeat(13, minmax(0, 1fr))',
				'14': 'repeat(14, minmax(0, 1fr))',
				'15': 'repeat(15, minmax(0, 1fr))',
				'16': 'repeat(16, minmax(0, 1fr))',
				'17': 'repeat(17, minmax(0, 1fr))',
				'18': 'repeat(18, minmax(0, 1fr))',
				'19': 'repeat(19, minmax(0, 1fr))',
				'20': 'repeat(20, minmax(0, 1fr))',
			},
			gridTemplateRows: {
				'13': 'repeat(13, minmax(0, 1fr))',
				'14': 'repeat(14, minmax(0, 1fr))',
				'15': 'repeat(15, minmax(0, 1fr))',
				'16': 'repeat(16, minmax(0, 1fr))',
				'17': 'repeat(17, minmax(0, 1fr))',
				'18': 'repeat(18, minmax(0, 1fr))',
				'19': 'repeat(19, minmax(0, 1fr))',
				'20': 'repeat(20, minmax(0, 1fr))',
			},
		},
	},
	plugins: [
		require('tailwindcss-animate'),
		// Plugin for responsive container queries
		({ addUtilities, theme }) => {
			addUtilities({
				'.container-fluid': {
					width: '100%',
					paddingLeft: theme('spacing.4'),
					paddingRight: theme('spacing.4'),
					marginLeft: 'auto',
					marginRight: 'auto',
				},
				'.container-content': {
					maxWidth: theme('maxWidth.prose'),
					marginLeft: 'auto',
					marginRight: 'auto',
					paddingLeft: theme('spacing.4'),
					paddingRight: theme('spacing.4'),
				},
				'.touch-manipulation': {
					touchAction: 'manipulation',
				},
				'.no-scroll': {
					overflow: 'hidden',
				},
				'.scroll-smooth': {
					scrollBehavior: 'smooth',
				},
				'.screen-reader-only': {
					position: 'absolute',
					width: '1px',
					height: '1px',
					padding: '0',
					margin: '-1px',
					overflow: 'hidden',
					clip: 'rect(0, 0, 0, 0)',
					whiteSpace: 'nowrap',
					borderWidth: '0',
				},
			});
		},
	],
} satisfies Config;
