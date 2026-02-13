import { motion } from 'framer-motion';

interface CTABannerProps {
	onOpenWizard: () => void;
}

export default function CTABanner({ onOpenWizard }: CTABannerProps) {
	return (
		<section className="py-20 sm:py-24 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
			<div className="section-container relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="max-w-2xl mx-auto text-center"
				>
					<h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
						Ready to maximise your <span className="gold-text">rental income</span>?
					</h2>
					<p className="text-muted-foreground mb-8 max-w-lg mx-auto">
						Get a free property assessment and discover how much more your Malta property could earn
						with professional management.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<button
							onClick={onOpenWizard}
							className="px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg hover:scale-[1.02]"
						>
							Get Your Free Assessment
						</button>
						<a
							href="mailto:info@Christianopm.com"
							className="px-8 py-4 text-base font-medium text-foreground border border-border rounded hover:border-primary hover:text-primary transition-colors"
						>
							Email Us Directly
						</a>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
