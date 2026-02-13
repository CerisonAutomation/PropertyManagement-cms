import AboutSection from '@/components/AboutSection';
import CTABanner from '@/components/CTABanner';
import FAQSection from '@/components/FAQSection';
import FloatingCTA from '@/components/FloatingCTA';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import PortfolioSection from '@/components/PortfolioSection';
import PricingSection from '@/components/PricingSection';
import ProcessSection from '@/components/ProcessSection';
import ProofStrip from '@/components/ProofStrip';
import TestimonialsSection from '@/components/TestimonialsSection';
import WizardModal from '@/components/WizardModal';
import { useState } from 'react';

const Index = () => {
	const [wizardOpen, setWizardOpen] = useState(false);
	const openWizard = () => setWizardOpen(true);

	return (
		<div className="min-h-screen bg-background snap-container">
			<Navbar onOpenWizard={openWizard} />
			<main id="main">
				<div className="snap-section">
					<Hero onOpenWizard={openWizard} />
				</div>
				<div className="snap-section">
					<ProofStrip />
				</div>
				<div className="snap-section">
					<ProcessSection onOpenWizard={openWizard} />
				</div>
				<div className="snap-section">
					<PortfolioSection />
				</div>
				<div className="snap-section">
					<PricingSection onOpenWizard={openWizard} />
				</div>
				<div className="snap-section">
					<TestimonialsSection />
				</div>
				<div className="snap-section">
					<AboutSection onOpenWizard={openWizard} />
				</div>
				<div className="snap-section">
					<CTABanner onOpenWizard={openWizard} />
				</div>
				<div className="snap-section">
					<FAQSection />
				</div>
				<div className="snap-section">
					<Footer />
				</div>
			</main>
			<FloatingCTA onOpenWizard={openWizard} />
			<WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
		</div>
	);
};

export default Index;
