import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import visualizer from 'vite-bundle-analyzer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
// 🚀 EXPERT CONFIG - Every millisecond matters
export default defineConfig(({ mode, command }) => ({
	// ============================================
	// SERVER CONFIGURATION
	// ============================================
	server: {
		host: '::',
		port: 8080,
		hmr: {
			overlay: false,
		},
		cors: true,
		// Security headers
		headers: {
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
		},
		// HTTP/2 Server Push
		http2: true,
		// Faster file watching
		watch: {
			usePolling: false,
			ignored: ['**/node_modules/**', '**/.git/**'],
		},
	},

	// ============================================
	// PREVIEW CONFIGURATION
	// ============================================
	preview: {
		port: 4173,
		host: true,
		headers: {
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
			// Aggressive caching for production
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	},

	// ============================================
	// PLUGINS - Optimized Order
	// ============================================
	plugins: [
		// React with SWC - FASTEST compiler
		react({
			// SWC plugins for additional optimization
			plugins: [
				// Auto-generate component metadata for debugging
			],
			// Babel-like transforms (optional - SWC is faster)
			parserConfig: (id) => {
				// Skip node_modules for faster parsing
				if (id.includes('node_modules')) {
					return {
						syntax: 'ecmascript',
						jsx: true,
					};
				}
			},
		}),

		// ============================================
		// PWA CONFIGURATION - Offline First
		// ============================================
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
			manifest: {
				name: 'Christiano Property Management',
				short_name: 'Christiano PM',
				description: 'Enterprise-grade Property Management CMS',
				theme_color: '#000000',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				orientation: 'portrait-primary',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'monochrome',
					},
				],
			},
			workbox: {
				// Aggressive caching
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
				runtimeCaching: [
					// API calls - Network First
					{
						urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\//i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'supabase-api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24, // 24 hours
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					// Static images - Cache First
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|avif)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					// Fonts - Cache First with long TTL
					{
						urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'font-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					// HTML pages - Stale While Revalidate
					{
						urlPattern: /\.(?:html|htm)$/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'html-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24, // 24 hours
							},
						},
					},
				],
			},
		}),

		// Bundle analyzer in analyze mode
		mode === 'analyze' && visualizer(),
	].filter(Boolean),

	// ============================================
	// PATH ALIASES - Clean imports
	// ============================================
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@components': path.resolve(__dirname, './src/components'),
			'@hooks': path.resolve(__dirname, './src/hooks'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@api': path.resolve(__dirname, './src/api'),
			'@types': path.resolve(__dirname, './src/types'),
			'@assets': path.resolve(__dirname, './src/assets'),
			'@pages': path.resolve(__dirname, './src/pages'),
			'@lib': path.resolve(__dirname, './src/lib'),
			'@styles': path.resolve(__dirname, './src/styles'),
		},
		// Resolve extensions in order of likelihood
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
	},

	// ============================================
	// BUILD OPTIMIZATION - Expert Level
	// ============================================
	build: {
		// Target modern browsers for smaller bundles
		target: 'esnext',
		// Use esbuild for fastest minification
		minify: 'esbuild',
		// Generate source maps in dev only
		sourcemap: mode === 'development',
		// CSS code splitting
		cssCodeSplit: true,
		// Module preload for faster loading
		modulePreload: {
			polyfill: true,
			resolveDependencies: (filename, deps) => {
				// Optimize dependency loading order
				return deps.sort((a, b) => {
					// Prioritize core dependencies
					if (a.includes('react') && !b.includes('react')) return -1;
					if (b.includes('react') && !a.includes('react')) return 1;
					return 0;
				});
			},
		},
		// Report compressed size for accurate bundle analysis
		reportCompressedSize: true,
		// Warning limit for chunk sizes
		chunkSizeWarningLimit: 500, // Reduced for better performance
		// Inline small assets as base64
		assetsInlineLimit: 4096, // 4KB
		// Empty outDir before build
		emptyOutDir: true,
		// Enable CSS code splitting
		cssCodeSplit: true,

		// ============================================
		// ROLLUP CHUNKING - Optimized for caching
		// ============================================
		rollupOptions: {
			// Advanced chunk splitting strategy
			output: {
				// Manual chunks - split by dependency type
				manualChunks: (id) => {
					// Skip node_modules checks in production for speed
					if (!id.includes('node_modules')) return;

					// React Core - MUST be cached
					if (/react(-dom|-router(-dom)?)?/.test(id)) {
						return 'vendor-react';
					}

					// Radix UI - Split each component for tree-shaking
					if (/@radix-ui\/react-/.test(id)) {
						const match = id.match(/@radix-ui\/react-(\w+)/);
						const component = match?.[1];
						if (component) {
							return `radix-${component}`;
						}
					}

					// Heavy vendor libraries
					if (/recharts/.test(id)) return 'vendor-charts';
					if (/framer-motion/.test(id)) return 'vendor-motion';
					if (/embla-carousel/.test(id)) return 'vendor-carousel';
					if (/@supabase/.test(id)) return 'vendor-supabase';
					if (/@tanstack/.test(id)) return 'vendor-query';
					if (/zod/.test(id)) return 'vendor-validation';
					if (/date-fns/.test(id)) return 'vendor-date';

					// Form libraries
					if (/react-hook-form|@hookform/.test(id)) return 'vendor-forms';

					// Icons (Lucide is large)
					if (/lucide-react/.test(id)) return 'vendor-icons';

					// Default vendor chunk
					return 'vendor-misc';
				},

				// Optimized file naming with content hashes
				chunkFileNames: 'js/chunks/[name]-[hash].js',
				entryFileNames: 'js/[name]-[hash].js',
				assetFileNames: (assetInfo) => {
					const info = assetInfo.name?.split('.') || [];
					const ext = info[info.length - 1];

					// Separate image formats
					if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(ext)) {
						return 'images/[name]-[hash][extname]';
					}
					// CSS files
					if (ext === 'css') {
						return 'css/[name]-[hash][extname]';
					}
					// Fonts
					if (['woff', 'woff2', 'eot', 'ttf', 'otf'].includes(ext)) {
						return 'fonts/[name]-[hash][extname]';
					}
					// Other assets
					return 'assets/[name]-[hash][extname]';
				},
			},
			treeshake: {
				moduleSideEffects: (id) => {
					// Assume node_modules don't have side effects
					if (id.includes('node_modules')) {
						return false;
					}
					return true;
				},
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
			},
		},

		// ============================================
		// ESBUILD MINIFICATION OPTIONS
		// ===========================================
		esbuildOptions: {
			// Drop console in production
			drop: mode === 'production' ? ['console', 'debugger'] : [],
			// Legal comments handling
			legalComments: 'none',
			// Target specific browsers for smaller output
			target: 'esnext',
			// Tree shaking
			treeShaking: true,
			// Minify expressions
			minifyIdentifiers: true,
			minifySyntax: true,
			minifyWhitespace: true,
		},
	},

	// ============================================
	// DEPENDENCY OPTIMIZATION
	// ==========================================
	optimizeDeps: {
		// Pre-bundle these dependencies
		include: [
			'react',
			'react-dom',
			'react-router-dom',
			'@supabase/supabase-js',
			'@tanstack/react-query',
			'date-fns',
			'clsx',
			'tailwind-merge',
			'lucide-react',
			'framer-motion',
			'zod',
			'recharts',
			'react-hook-form',
		],
		// Exclude server-side from browser bundle
		exclude: ['express', 'cors', 'helmet', 'morgan', 'compression'],
		// Keep deps cached longer
		maxConcurrency: 8,
		// Esbuild for faster optimization
		esbuildOptions: {
			target: 'esnext',
		},
	},

	// ============================================
	// ENVIRONMENT VARIABLES
	// ==========================================
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		__VITE_MODE__: JSON.stringify(mode),
		// Disable development warnings in production
		__DEV__: JSON.stringify(mode === 'development'),
	},

	// ============================================
	// CSS CONFIGURATION
	// ==========================================
	css: {
		// Source maps in dev
		devSourcemap: mode === 'development',
		// PostCSS configuration
		postcss: './postcss.config.js',
		preprocessorOptions: {
			// SCSS config (optional)
		},
	},

	// ============================================
	// EXPERIMENTAL FEATURES
	// ==========================================
	experimental: {
		// Render built URLs
		renderBuiltUrl: (filename, { hostType }) => {
			if (hostType === 'js') {
				return { js: `/${filename}` };
			}
			return { relative: true };
		},
		// Faster HMR
		hmrPartialAccept: true,
		// Optimize deps
		optimizeDeps: {
			include: ['react', 'react-dom'],
		},
	},

	// ============================================
	// LEGACY BROWSER SUPPORT (if needed)
	// ==========================================
	// Set to false for modern browsers only (smaller bundles)
	// Set to ['es2015'] for legacy support (larger bundles)
	esbuild: {
		// JSX transformation
		jsxImportSource: 'react',
		jsx: 'automatic',
		// Drop features not supported by target
		target: 'esnext',
	},
}));
