import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, ClipboardCheck, Rocket } from 'lucide-react';
import { useRef } from 'react';

interface ProcessSectionProps {
	onOpenWizard: () => void;
}

const STEPS = [
	{
		icon: ClipboardCheck,
		step: '01',
		title: 'Free Assessment',
		desc: "Tell us about your property and goals. We'll analyse your potential income and recommend the right plan.",
	},
	{
		icon: Camera,
		step: '02',
		title: 'We Set You Up',
		desc: 'Professional photography, listing optimisation, pricing strategy, and MTA licensing support — all handled.',
	},
	{
		icon: Rocket,
		step: '03',
		title: 'You Earn More',
		desc: 'We manage bookings, guests, cleaning, and maintenance. You receive monthly payouts and transparent reports.',
	},
];

export default function ProcessSection({ onOpenWizard }: ProcessSectionProps) {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
	const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

	return (
		<section id="process" ref={ref} className="min-h-screen flex items-center py-20 sm:py-28">
			<div className="section-container w-full">
				<motion.div style={{ y }} className="text-center mb-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<p className="micro-type text-primary mb-3">How It Works</p>
						<h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
							Three steps to <span className="gold-text">stress-free</span> income
						</h2>
					</motion.div>
				</motion.div>

				<div className="grid md:grid-cols-3 gap-8">
					{STEPS.map((s, i) => (
						<motion.div
							key={s.step}
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.15, duration: 0.5 }}
							className="glass-surface rounded-lg p-8 relative group hover:border-primary/30 transition-colors"
						>
							<span className="absolute top-6 right-6 font-serif text-5xl font-bold text-border/50 group-hover:text-primary/20 transition-colors">
								{s.step}
							</span>
							<div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6">
								<s.icon size={22} className="text-primary" />
							</div>
							<h3 className="font-serif text-xl font-semibold text-foreground mb-3">{s.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
						</motion.div>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="text-center mt-12"
				>
					<button
						onClick={onOpenWizard}
						className="px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg"
					>
						Start Your Free Assessment
					</button>
				</motion.div>
			</div>
		</section>
	);
}
