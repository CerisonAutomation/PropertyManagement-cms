import { EnterpriseThemeProvider } from '@/lib/theme-provider';
import type React from 'react';

interface Props {
	children: React.ReactNode;
}

export default function EnterpriseThemeProviderWrapper({ children }: Props) {
	return <EnterpriseThemeProvider>{children}</EnterpriseThemeProvider>;
}
