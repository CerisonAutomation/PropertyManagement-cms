import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Check, Shield, Sparkles, Star } from 'lucide-react';
import { useRef } from 'react';

interface PricingSectionProps {
	onOpenWizard: () => void;
}

const PLANS = [
	{
		name: 'Essentials',
		price: '15%',
		subtitle: 'of booking revenue',
		desc: 'Perfect for owners who want professional listing management with hands-on involvement.',
		icon: Shield,
		features: [
			'Professional photography',
			'Multi-platform listing',
			'Dynamic pricing',
			'Guest communication',
			'Monthly reporting',
			'MTA licence guidance',
		],
		highlighted: false,
	},
	{
		name: 'Complete',
		price: '20%',
		subtitle: 'of booking revenue',
		desc: "Full hands-off management. We handle everything so you don't have to lift a finger.",
		icon: Star,
		features: [
			'Everything in Essentials',
			'Cleaning coordination',
			'Maintenance at cost',
			'Linen & amenities',
			'Welcome amenities included',
			'Guest property manual',
			'Direct booking website',
			'Owner dashboard access',
			'Priority 24hr support',
			'Quarterly strategy review',
		],
		highlighted: true,
	},
];

const ADDONS = [
	{ service: 'Professional Photoshoot', price: 'On quotation' },
	{ service: 'Annual Deep Clean', price: 'On quotation' },
	{ service: 'MTA Licensing', price: '€150 + authority fees' },
	{ service: 'Procurement & Setup Works', price: '€25/hr + VAT' },
	{ service: 'Mail & Bills Handling', price: '€10/month' },
	{ service: 'Interior Design', price: 'On quotation' },
];

export default function PricingSection({ onOpenWizard }: PricingSectionProps) {
	const containerRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
	const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
	const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);
	const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

	return (
		<section
			id="pricing"
			ref={containerRef}
			className="relative min-h-screen flex items-center py-20 sm:py-28 overflow-hidden"
		>
			{/* Enhanced animated background with multiple layers */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Layer 1: Primary gradient */}
				<motion.div
					className="absolute inset-0 opacity-40"
					style={{
						background: `radial-gradient(ellipse at 50% 0%, hsl(var(--luxury-gold) / 0.2) 0%, transparent 70%)`,
						y: useTransform(scrollYProgress, [0, 1], [0, -150]),
					}}
				/>

				{/* Layer 2: Floating geometric shapes */}
				{[...Array(8)].map((_, i) => (
					<motion.div
						key={`shape-${i}`}
						className="absolute"
						initial={{
							x: `${10 + i * 12}%`,
							y: `${20 + (i % 4) * 18}%`,
							rotate: Math.random() * 360,
							scale: 0,
							opacity: 0,
						}}
						animate={{
							x: [`${10 + i * 12}%`, `${15 + i * 10}%`, `${10 + i * 12}%`],
							y: [`${20 + (i % 4) * 18}%`, `${15 + (i % 4) * 15}%`, `${20 + (i % 4) * 18}%`],
							rotate: [null, 360],
							scale: [0, 1, 0.8],
							opacity: [0, 0.6, 0.3],
						}}
						transition={{
							duration: 15 + i * 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'easeInOut',
							delay: i * 0.8,
						}}
						style={{
							width: `${Math.random() * 40 + 20}px`,
							height: `${Math.random() * 40 + 20}px`,
							background: `linear-gradient(135deg, ${i % 2 === 0 ? 'rgba(251, 191, 36, 0.4)' : 'rgba(59, 130, 246, 0.4)'}, transparent)`,
							borderRadius: i % 2 === 0 ? '50%' : '0%',
							filter: 'blur(1px)',
						}}
					/>
				))}

				{/* Layer 3: Subtle light rays */}
				<motion.div
					className="absolute inset-0 opacity-20"
					style={{
						background: `conic-gradient(from 0deg at 50% 50%, transparent, rgba(251, 191, 36, 0.1), transparent, rgba(59, 130, 246, 0.1), transparent)`,
						rotate: useTransform(scrollYProgress, [0, 1], [0, 360]),
					}}
				/>
			</div>

			<div className="section-container w-full relative z-10">
				<motion.div style={{ y, opacity, scale }}>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-100px' }}
						transition={{ duration: 0.6, ease: 'easeOut' }}
						className="text-center mb-16"
					>
						<motion.div
							initial={{ scale: 0 }}
							whileInView={{ scale: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
							className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
						>
							<Sparkles size={14} />
							<span>Transparent Pricing</span>
						</motion.div>

						<h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground">
							Simple, <span className="gold-text">transparent</span> pricing
						</h2>
						<p className="text-muted-foreground mt-4 max-w-md mx-auto text-lg">
							No setup fees. No hidden costs. You only pay when you earn.
						</p>
					</motion.div>
				</motion.div>

				{/* Enhanced pricing cards with sophisticated animations */}
				<div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
					{PLANS.map((plan, i) => (
						<motion.div
							key={plan.name}
							initial={{ opacity: 0, x: i === 0 ? -50 : 50, scale: 0.9 }}
							whileInView={{ opacity: 1, x: 0, scale: 1 }}
							viewport={{ once: true, margin: '-50px' }}
							transition={{ delay: i * 0.2, duration: 0.5, type: 'spring' }}
							whileHover={{
								y: -12,
								scale: 1.02,
								rotateX: 2,
								transition: { duration: 0.3, ease: 'easeOut' },
							}}
							className={`relative glass-surface rounded-2xl p-8 lg:p-10 overflow-hidden group ${
								plan.highlighted
									? 'border-primary/50 shadow-[0_0_80px_-20px_hsl(var(--luxury-gold)_/_0.4)] lg:scale-105 lg:z-10'
									: 'border-border/50'
							}`}
						>
							{/* Enhanced background decoration */}
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold-light/5" />
								<motion.div
									className="absolute top-0 right-0 w-32 h-32"
									animate={{
										rotate: [0, 10, -10, 0],
										scale: [1, 1.1, 1],
									}}
									transition={{
										duration: 8,
										repeat: Number.POSITIVE_INFINITY,
										ease: 'easeInOut',
									}}
									style={{
										background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent)',
										filter: 'blur(20px)',
									}}
								/>
							</div>

							{plan.highlighted && (
								<motion.span
									initial={{ scale: 0, opacity: 0, rotate: -180 }}
									whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
									whileHover={{ scale: 1.1, rotate: 5 }}
									viewport={{ once: true }}
									transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
									className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-primary via-gold-light to-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/30 backdrop-blur-sm border border-white/20"
								>
									<motion.div
										animate={{ rotate: [0, 360] }}
										transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
										className="inline-flex items-center gap-1"
									>
										<span>✨</span>
										<span>Most Popular</span>
									</motion.div>
								</motion.span>
							)}

							<div className="relative z-10">
								<div className="flex items-center gap-3 mb-4">
									<motion.div
										className={`p-2.5 rounded-xl transition-all duration-300 ${
											plan.highlighted
												? 'bg-gradient-to-br from-primary to-gold-light shadow-lg shadow-primary/30'
												: 'bg-secondary group-hover:bg-primary/20'
										}`}
										whileHover={{ scale: 1.1, rotate: 5 }}
										transition={{ type: 'spring', stiffness: 200 }}
									>
										<plan.icon
											size={24}
											className={
												plan.highlighted
													? 'text-primary-foreground'
													: 'text-muted-foreground group-hover:text-primary'
											}
										/>
									</motion.div>
									<h3 className="font-serif text-2xl lg:text-3xl font-semibold text-foreground">
										{plan.name}
									</h3>
								</div>

								<div className="flex items-baseline gap-2 mb-2">
									<motion.span
										className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-gold-light to-primary bg-clip-text text-transparent"
										initial={{ scale: 0.8 }}
										whileInView={{ scale: 1 }}
										whileHover={{ scale: 1.05 }}
										viewport={{ once: true }}
										transition={{ type: 'spring', stiffness: 150 }}
									>
										{plan.price}
									</motion.span>
									<span className="text-muted-foreground">{plan.subtitle}</span>
								</div>
								<p className="text-muted-foreground mb-8 text-base leading-relaxed">{plan.desc}</p>

								<ul className="space-y-3 mb-8">
									{plan.features.map((f, idx) => (
										<motion.li
											key={f}
											className="flex items-center gap-3 text-foreground"
											initial={{ opacity: 0, x: -20 }}
											whileInView={{ opacity: 1, x: 0 }}
											viewport={{ once: true }}
											transition={{ delay: idx * 0.05 }}
											whileHover={{ x: 5 }}
										>
											<motion.div
												initial={{ scale: 0, rotate: -180 }}
												whileInView={{ scale: 1, rotate: 0 }}
												whileHover={{ scale: 1.2, rotate: 10 }}
												viewport={{ once: true }}
												transition={{
													delay: idx * 0.05 + 0.2,
													type: 'spring',
													stiffness: 200,
												}}
												className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
													plan.highlighted
														? 'bg-gradient-to-br from-primary to-gold-light shadow-md'
														: 'bg-secondary group-hover:bg-primary'
												}`}
											>
												<Check
													size={12}
													className={
														plan.highlighted
															? 'text-primary-foreground'
															: 'text-muted-foreground group-hover:text-primary-foreground'
													}
												/>
											</motion.div>
											{f}
										</motion.li>
									))}
								</ul>

								<motion.button
									whileHover={{
										scale: 1.03,
										boxShadow: plan.highlighted
											? '0 25px 50px -15px rgba(251, 191, 36, 0.5)'
											: '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
									}}
									whileTap={{ scale: 0.98 }}
									onClick={onOpenWizard}
									className={`w-full py-4 text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
										plan.highlighted
											? 'bg-gradient-to-r from-primary via-gold-light to-primary text-primary-foreground shadow-lg shadow-primary/25'
											: 'border-2 border-border text-foreground hover:border-primary hover:text-primary bg-background'
									}`}
								>
									{/* Button shine effect */}
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

									<span className="relative z-10 flex items-center gap-2">
										<motion.span
											animate={plan.highlighted ? { x: [0, 3, 0] } : {}}
											transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
										>
											Get Started
										</motion.span>
										<ArrowRight
											size={18}
											className="group-hover:translate-x-1 transition-transform"
										/>
									</span>
								</motion.button>
							</div>
						</motion.div>
					))}
				</div>

				{/* Add-on services with enhanced styling */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
					className="mt-20 max-w-4xl mx-auto"
				>
					<div className="text-center mb-8">
						<h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
							Available on both plans
						</h3>
						<p className="text-muted-foreground">
							Charged separately • Custom quotations available
						</p>
					</div>

					<div className="glass-surface rounded-2xl overflow-hidden border border-border/30">
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
							{ADDONS.map((a, idx) => (
								<motion.div
									key={a.service}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: idx * 0.1 }}
									className="p-5 hover:bg-secondary/20 transition-colors"
								>
									<p className="text-foreground font-medium text-sm mb-1">{a.service}</p>
									<p className="text-primary font-bold">{a.price}</p>
								</motion.div>
							))}
						</div>
					</div>

					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="text-xs text-muted-foreground text-center mt-6 leading-relaxed"
					>
						Net Room Revenue is calculated on gross rental income, excluding platform commissions,
						VAT, cleaning fees, damage deposits, and optional extras. All agreements governed by
						Malta law.
					</motion.p>
				</motion.div>

				{/* Progress indicator */}
				<motion.div
					className="fixed bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-secondary rounded-full overflow-hidden z-50 lg:hidden"
					style={{ opacity: scrollYProgress }}
				>
					<motion.div className="h-full bg-primary" style={{ width: smoothProgress }} />
				</motion.div>
			</div>
		</section>
	);
}
