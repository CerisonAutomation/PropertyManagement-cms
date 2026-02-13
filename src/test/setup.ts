import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
	createClient: vi.fn(() => ({
		from: vi.fn(() => ({
			select: vi.fn(() => Promise.resolve({ data: [], error: null })),
			insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
			update: vi.fn(() => Promise.resolve({ data: null, error: null })),
			delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
		})),
		auth: {
			getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
			onAuthStateChange: vi.fn(),
			signUp: vi.fn(),
			signInWithPassword: vi.fn(),
			signOut: vi.fn(),
		},
		storage: {
			from: vi.fn(() => ({
				upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
				getPublicUrl: vi.fn(() => ({ data: { publicUrl: '' } })),
			})),
		},
	})),
}));

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});
