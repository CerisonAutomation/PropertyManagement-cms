import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const FAQS = [
	{
		q: 'Do I need an MTA licence to rent short-term in Malta?',
		a: 'Yes. All short-let properties in Malta require a Malta Tourism Authority (MTA) licence. We guide you through the entire application process as part of our service.',
	},
	{
		q: 'What areas do you cover?',
		a: "We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian's, Valletta, Mdina, and Mellieħa.",
	},
	{
		q: 'How quickly can my property go live?',
		a: 'Most properties are listed within 2–3 weeks of onboarding. This includes professional photography, listing creation, and pricing setup.',
	},
	{
		q: 'What happens with maintenance issues?',
		a: 'We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever. You approve anything above a pre-agreed threshold.',
	},
	{
		q: 'Can I block dates for personal use?',
		a: 'Absolutely. You have full control over your calendar through our owner dashboard. Block dates anytime with no penalties.',
	},
	{
		q: "What's included in the monthly reporting?",
		a: 'You receive a detailed monthly statement covering revenue, occupancy, guest reviews, expenses, and a performance summary compared to market benchmarks.',
	},
	{
		q: 'What types of properties do you manage?',
		a: 'We manage apartments, penthouses, villas, townhouses, farmhouses, maisonettes, and palazzos across Malta and Gozo — from studio apartments to large multi-bedroom properties.',
	},
	{
		q: 'How do you handle guest communication?',
		a: 'We manage all guest communication before, during, and after their stay. This includes booking inquiries, check-in instructions, concierge services, and post-stay reviews.',
	},
	{
		q: 'How do you set the rental price for my property?',
		a: 'We use dynamic pricing algorithms that adjust rates based on seasonality, local events, competitor pricing, and demand patterns to maximize your occupancy and revenue.',
	},
];

export default function FAQSection() {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
	const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

	return (
		<section
			id="faq"
			ref={ref}
			className="min-h-screen flex items-center py-20 sm:py-28 bg-card/30"
		>
			<div className="section-container max-w-3xl w-full">
				<motion.div style={{ y }}>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<p className="micro-type text-primary mb-3">FAQ</p>
						<h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
							Common <span className="gold-text">questions</span>
						</h2>
					</motion.div>
				</motion.div>

				<Accordion type="single" collapsible className="space-y-3">
					{FAQS.map((faq, i) => (
						<AccordionItem
							key={i}
							value={`faq-${i}`}
							className="glass-surface rounded-lg px-6 border border-border/50 data-[state=open]:border-primary/30"
						>
							<AccordionTrigger className="text-left font-serif text-base font-medium text-foreground hover:text-primary py-5 hover:no-underline">
								{faq.q}
							</AccordionTrigger>
							<AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
								{faq.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
