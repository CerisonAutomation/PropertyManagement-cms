import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { trackWebVitals } from '@/lib/vercel-analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';
import CmsPage from './pages/CmsPage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import QloApps from './pages/QloApps';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 10 * 60 * 1000,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

const AppContent = () => {
	useEffect(() => {
		// Initialize Vercel Analytics for performance monitoring
		trackWebVitals();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Index />} />
				<Route path="/admin" element={<Admin />} />
				<Route path="/pms" element={<QloApps />} />
				<Route path="/:slug" element={<CmsPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

const App = () => (
	<ErrorBoundary>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<AppContent />
			</TooltipProvider>
		</QueryClientProvider>
	</ErrorBoundary>
);

export default App;
