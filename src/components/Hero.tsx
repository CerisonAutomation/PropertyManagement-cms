import heroBg from '@/assets/hero-bg.jpg';
import { useCmsSettings } from '@/hooks/use-cms';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface HeroProps {
	onOpenWizard: () => void;
}

export default function Hero({ onOpenWizard }: HeroProps) {
	const containerRef = useRef<HTMLElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	const { scrollY } = useScroll();
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start start', 'end start'],
	});

	// Parallax transformations
	const imgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
	const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
	const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

	// Frozen parallax effect
	const frozenY = useTransform(scrollY, [0, window.innerHeight], [0, 0]);
	const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

	// Mouse parallax for subtle movement
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useEffect(() => {
		setIsLoaded(true);

		const handleMouseMove = (e: MouseEvent) => {
			const x = (e.clientX / window.innerWidth - 0.5) * 20;
			const y = (e.clientY / window.innerHeight - 0.5) * 20;
			mouseX.set(x);
			mouseY.set(y);
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, [mouseX, mouseY]);

	const { data: settings } = useCmsSettings();

	const getSetting = (key: string, defaultValue: string): string => {
		const setting = settings?.find((s) => s.key === key);
		return setting ? String(setting.value) : defaultValue;
	};

	const heroContent = {
		tagline: getSetting('hero_tagline', "Malta's Premier Property Partner"),
		headline: getSetting('hero_headline', 'Maximise your rental income,'),
		highlightedWord: getSetting('hero_highlighted', 'effortlessly.'),
		description: getSetting(
			'hero_description',
			'Full-service short-let management across Malta & Gozo. We handle everything — you earn more.'
		),
		ctaText: getSetting('hero_cta_text', 'Get Your Free Assessment'),
		secondaryCtaText: getSetting('hero_secondary_cta', 'How It Works'),
	};

	const stats = [
		{ value: getSetting('stat_revenue', '€2.4M+'), label: 'Revenue Generated' },
		{ value: getSetting('stat_properties', '45+'), label: 'Properties Managed' },
		{ value: getSetting('stat_rating', '4.97'), label: 'Average Rating' },
		{ value: getSetting('stat_occupancy', '94%'), label: 'Occupancy Rate' },
	];

	const parallaxStyle = {
		x: mouseX,
		y: mouseY,
	};

	return (
		<section
			ref={containerRef}
			className="relative min-h-screen flex items-end pb-20 sm:pb-28 overflow-hidden"
		>
			{/* Frozen Background Layer */}
			<motion.div
				className="absolute inset-0 z-0"
				style={{
					y: frozenY,
					opacity: isLoaded ? 1 : 0,
				}}
				transition={{ duration: 0.5 }}
			>
				<motion.div className="absolute inset-0" style={{ y: imgY, scale }}>
					<img
						src={heroBg}
						alt="Luxury Malta villa with infinity pool overlooking the Mediterranean"
						className="w-full h-[120%] object-cover"
						loading="eager"
					/>
				</motion.div>

				{/* Gradient Overlays - Multiple layers for depth */}
				<div
					className="absolute inset-0"
					style={{
						background:
							'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
					}}
				/>
				<div
					className="absolute inset-0"
					style={{
						background:
							'radial-gradient(ellipse at 50% 100%, hsl(var(--luxury-gold) / 0.1) 0%, transparent 60%)',
					}}
				/>
			</motion.div>

			{/* Enhanced Floating Particles with Multiple Layers */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
				{/* Layer 1: Floating orbs */}
				{[...Array(6)].map((_, i) => (
					<motion.div
						key={`orb-${i}`}
						className="absolute rounded-full"
						initial={{
							x: `${15 + i * 12}%`,
							y: `${25 + (i % 3) * 18}%`,
							scale: Math.random() * 0.8 + 0.4,
							opacity: 0,
						}}
						animate={{
							x: [`${15 + i * 12}%`, `${20 + i * 10}%`, `${15 + i * 12}%`],
							y: [`${25 + (i % 3) * 18}%`, `${20 + (i % 3) * 15}%`, `${25 + (i % 3) * 18}%`],
							scale: [
								Math.random() * 0.8 + 0.4,
								Math.random() * 1.2 + 0.6,
								Math.random() * 0.8 + 0.4,
							],
							opacity: [0, 0.6, 0],
						}}
						transition={{
							duration: 12 + i * 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'easeInOut',
							delay: i * 0.8,
						}}
						style={{
							width: `${Math.random() * 60 + 20}px`,
							height: `${Math.random() * 60 + 20}px`,
							background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(59, 130, 246, 0.3)'}, transparent)`,
							filter: 'blur(1px)',
						}}
					/>
				))}

				{/* Layer 2: Sharp geometric shapes */}
				{[...Array(4)].map((_, i) => (
					<motion.div
						key={`shape-${i}`}
						className="absolute"
						initial={{
							x: `${10 + i * 20}%`,
							y: `${30 + (i % 2) * 25}%`,
							rotate: 0,
							opacity: 0,
						}}
						animate={{
							x: [`${10 + i * 20}%`, `${15 + i * 18}%`, `${10 + i * 20}%`],
							y: [`${30 + (i % 2) * 25}%`, `${25 + (i % 2) * 20}%`, `${30 + (i % 2) * 25}%`],
							rotate: [0, 180, 360],
							opacity: [0, 0.4, 0],
						}}
						transition={{
							duration: 15 + i * 3,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
							delay: i * 1.5,
						}}
						style={{
							width: '2px',
							height: `${Math.random() * 40 + 30}px`,
							background:
								'linear-gradient(180deg, transparent, rgba(251, 191, 36, 0.8), transparent)',
							transformOrigin: 'center',
						}}
					/>
				))}

				{/* Layer 3: Subtle light rays */}
				{[...Array(3)].map((_, i) => (
					<motion.div
						key={`ray-${i}`}
						className="absolute top-0 left-1/2 w-px"
						initial={{
							height: 0,
							opacity: 0,
							scaleY: 0,
						}}
						animate={{
							height: ['0vh', '100vh', '0vh'],
							opacity: [0, 0.2, 0],
							scaleY: [0, 1, 0],
						}}
						transition={{
							duration: 20 + i * 5,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'easeInOut',
							delay: i * 7,
						}}
						style={{
							background:
								'linear-gradient(180deg, transparent, rgba(251, 191, 36, 0.1), transparent)',
							transform: 'translateX(-50%)',
							filter: 'blur(2px)',
						}}
					/>
				))}
			</div>

			{/* Content Layer */}
			<motion.div className="section-container relative z-20 w-full" style={{ y: textY, opacity }}>
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
					className="max-w-3xl"
				>
					{/* Tagline with animated underline */}
					<motion.div
						className="relative inline-block mb-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
					>
						<p className="micro-type text-primary relative">
							{heroContent.tagline}
							<motion.span
								className="absolute -bottom-1 left-0 h-0.5 bg-primary"
								initial={{ width: 0 }}
								animate={{ width: '100%' }}
								transition={{ delay: 0.8, duration: 0.5 }}
							/>
						</p>
					</motion.div>

					<motion.h1
						className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-[1.1] mb-6 drop-shadow-lg"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.4 }}
					>
						{heroContent.headline}{' '}
						<motion.span
							className="gold-text drop-shadow-md"
							initial={{ backgroundPosition: '0% 50%' }}
							animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
							transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
							style={{
								background: 'linear-gradient(90deg, #fbbf24, #fef3c7, #fbbf24)',
								backgroundSize: '200% 100%',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}
						>
							{heroContent.highlightedWord}
						</motion.span>
					</motion.h1>

					<motion.p
						className="text-lg sm:text-xl text-white/90 mb-8 max-w-lg leading-relaxed drop-shadow-md"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
					>
						{heroContent.description}
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						className="flex flex-col sm:flex-row gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
					>
						<motion.button
							whileHover={{ scale: 1.03, boxShadow: '0 20px 40px -15px rgba(251, 191, 36, 0.4)' }}
							whileTap={{ scale: 0.98 }}
							onClick={onOpenWizard}
							className="px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-gold-light transition-all shadow-lg shadow-primary/25"
						>
							{heroContent.ctaText}
						</motion.button>
						<motion.a
							href="#process"
							whileHover={{ scale: 1.03, borderColor: 'rgba(251, 191, 36, 0.5)' }}
							whileTap={{ scale: 0.98 }}
							className="px-8 py-4 text-base font-medium text-white border-2 border-white/30 rounded-xl hover:border-primary hover:text-primary transition-all text-center backdrop-blur-sm"
						>
							{heroContent.secondaryCtaText}
						</motion.a>
					</motion.div>
				</motion.div>

				{/* Stats strip with scroll progress */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7, duration: 0.6 }}
					className="mt-16 lg:mt-20"
				>
					<div className="flex flex-wrap gap-8 lg:gap-12">
						{stats.map((stat, i) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 + i * 0.1 }}
								className="text-center lg:text-left group"
							>
								<motion.p
									className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white drop-shadow-lg"
									initial={{ scale: 0.8 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
								>
									{stat.value}
								</motion.p>
								<p className="text-xs sm:text-sm text-white/70 mt-1 group-hover:text-white/90 transition-colors">
									{stat.label}
								</p>
							</motion.div>
						))}
					</div>

					{/* Scroll indicator */}
					<motion.div
						className="mt-12 flex justify-center lg:justify-start"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.2 }}
					>
						<motion.a
							href="#process"
							className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
							animate={{ y: [0, 5, 0] }}
							transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						>
							<span className="text-xs uppercase tracking-widest">Scroll</span>
							<motion.div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
								<motion.div
									className="w-1.5 h-1.5 bg-white/60 rounded-full"
									animate={{ y: [0, 12, 0] }}
									transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
								/>
							</motion.div>
						</motion.a>
					</motion.div>
				</motion.div>
			</motion.div>

			{/* Progress bar for scroll */}
			<motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/30 z-30">
				<motion.div
					className="h-full bg-primary"
					style={{ scaleX: smoothProgress, transformOrigin: '0%' }}
				/>
			</motion.div>
		</section>
	);
}
