import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import IntegrationsPanel from '@/components/admin/IntegrationsPanel';
import MediaManager from '@/components/admin/MediaManager';
import PageManager from '@/components/admin/PageManager';
import SectionEditor from '@/components/admin/SectionEditor';
import SettingsEditor from '@/components/admin/SettingsEditor';
import { Button } from '@/components/ui/button';
import {
	useCmsContent,
	useCmsSettings,
	useUpdateCmsContent,
	useUpdateCmsSetting,
} from '@/hooks/use-cms';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function Admin() {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<string>('dashboard');
	const [activeSection, setActiveSection] = useState<string>('hero');
	const { toast } = useToast();

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setLoading(false);
		});
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
		return () => subscription.unsubscribe();
	}, []);

	const { data: sections, isLoading: sectionsLoading } = useCmsContent();
	const { data: settings, isLoading: settingsLoading } = useCmsSettings();
	const updateContent = useUpdateCmsContent();
	const updateSetting = useUpdateCmsSetting();

	const handleSaveContent = async (sectionKey: string, content: Json, isVisible?: boolean) => {
		try {
			await updateContent.mutateAsync({ sectionKey, content, isVisible });
			toast({ title: '✓ Saved', description: `${sectionKey} updated successfully` });
		} catch {
			toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
		}
	};

	const handleSaveSetting = async (settingKey: string, value: Json) => {
		try {
			await updateSetting.mutateAsync({ key: settingKey, value });
			toast({ title: '✓ Saved', description: 'Setting updated' });
		} catch {
			toast({ title: 'Error', description: 'Failed to save setting', variant: 'destructive' });
		}
	};

	if (loading)
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
					<p className="text-sm text-muted-foreground">Loading admin...</p>
				</div>
			</div>
		);

	if (!session) return <AdminLogin />;

	// Check if user has admin role
	const userRole = (session.user?.user_metadata?.['role'] as string) || 'viewer';
	const isAdmin = userRole === 'admin' || userRole === 'super_admin';

	if (!isAdmin) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Access Denied</h1>
					<p className="text-muted-foreground mb-6">
						You don't have permission to access the admin panel.
					</p>
					<Button onClick={() => supabase.auth.signOut()}>Sign Out</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex">
			<AdminSidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				activeSection={activeSection}
				setActiveSection={setActiveSection}
				sections={sections || []}
				onLogout={() => supabase.auth.signOut()}
			/>
			<main className="flex-1 p-6 lg:p-8 overflow-y-auto">
				<div className="max-w-4xl mx-auto">
					{activeTab === 'dashboard' && (
						<AdminDashboard
							sections={sections || []}
							settings={settings || []}
							onNavigate={(tab, section) => {
								setActiveTab(tab);
								if (section) setActiveSection(section);
							}}
						/>
					)}
					{activeTab === 'media' && <MediaManager />}
					{activeTab === 'pages' && <PageManager />}
					{activeTab === 'sections' && (
						<SectionEditor
							sections={sections || []}
							activeSection={activeSection}
							isLoading={sectionsLoading}
							onSave={handleSaveContent}
							isSaving={updateContent.isPending}
						/>
					)}
					{activeTab === 'settings' && (
						<SettingsEditor
							settings={settings || []}
							isLoading={settingsLoading}
							onSave={handleSaveSetting}
							isSaving={updateSetting.isPending}
						/>
					)}
					{activeTab === 'integrations' && (
						<IntegrationsPanel settings={settings || []} onSaveSetting={handleSaveSetting} />
					)}
				</div>
			</main>
		</div>
	);
}
