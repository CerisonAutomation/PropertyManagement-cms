import portfolio1 from '@/assets/portfolio-1.jpg';
import portfolio2 from '@/assets/portfolio-2.jpg';
import portfolio3 from '@/assets/portfolio-3.jpg';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Extended properties for carousel
const ALL_PROPERTIES = [
	{
		id: 1,
		img: portfolio1,
		title: 'Seaview Penthouse',
		location: 'Sliema',
		beds: '3 Bed',
		baths: '2 Bath',
		rating: '4.97',
		price: '€250/night',
		featured: true,
	},
	{
		id: 2,
		img: portfolio2,
		title: 'Harbour Terrace',
		location: 'Valletta',
		beds: '2 Bed',
		baths: '1 Bath',
		rating: '4.95',
		price: '€180/night',
		featured: false,
	},
	{
		id: 3,
		img: portfolio3,
		title: 'Heritage Suite',
		location: 'Mdina',
		beds: '1 Bed',
		baths: '1 Bath',
		rating: '4.98',
		price: '€150/night',
		featured: true,
	},
	{
		id: 4,
		img: portfolio1,
		title: 'Marina Villa',
		location: 'Portomaso',
		beds: '4 Bed',
		baths: '3 Bath',
		rating: '4.92',
		price: '€400/night',
		featured: false,
	},
	{
		id: 5,
		img: portfolio2,
		title: 'Coastal Apartment',
		location: "St Julian's",
		beds: '2 Bed',
		baths: '2 Bath',
		rating: '4.89',
		price: '€200/night',
		featured: true,
	},
	{
		id: 6,
		img: portfolio3,
		title: 'Garden Retreat',
		location: 'Gozo',
		beds: '3 Bed',
		baths: '2 Bath',
		rating: '4.96',
		price: '€220/night',
		featured: false,
	},
	{
		id: 7,
		img: portfolio1,
		title: 'City Loft',
		location: 'Birkirkara',
		beds: '1 Bed',
		baths: '1 Bath',
		rating: '4.85',
		price: '€120/night',
		featured: false,
	},
	{
		id: 8,
		img: portfolio2,
		title: 'Beach House',
		location: 'Mellieha',
		beds: '3 Bed',
		baths: '2 Bath',
		rating: '4.94',
		price: '€280/night',
		featured: true,
	},
];

export default function PortfolioSection() {
	const containerRef = useRef<HTMLElement>(null);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);
	const [expandedId, setExpandedId] = useState<number | null>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
	const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
	const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

	const totalSlides = Math.ceil(ALL_PROPERTIES.length / 4);

	// Auto-play carousel
	useEffect(() => {
		if (!isAutoPlaying || expandedId) return;

		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % totalSlides);
		}, 5000);

		return () => clearInterval(interval);
	}, [isAutoPlaying, totalSlides, expandedId]);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % totalSlides);
		setIsAutoPlaying(false);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
		setIsAutoPlaying(false);
	};

	const getVisibleProperties = () => {
		const start = currentSlide * 4;
		return ALL_PROPERTIES.slice(start, start + 4);
	};

	return (
		<section
			id="portfolio"
			ref={containerRef}
			className="relative min-h-screen flex items-center py-20 sm:py-28 overflow-hidden"
		>
			{/* Background decoration */}
			<div className="absolute inset-0 pointer-events-none">
				<motion.div
					className="absolute -right-20 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
				/>
				<motion.div
					className="absolute -left-20 bottom-1/4 w-80 h-80 bg-gold-dark/5 rounded-full blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
				/>
			</div>

			<div className="section-container w-full relative z-10">
				<motion.div style={{ y, opacity }}>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-100px' }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12"
					>
						<p className="micro-type text-primary mb-3">Portfolio</p>
						<h2 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground">
							Properties we <span className="gold-text">manage</span>
						</h2>
						<p className="text-muted-foreground mt-4 max-w-lg mx-auto">
							Hand-picked luxury properties across Malta & Gozo, each earning exceptional returns
							for their owners.
						</p>
					</motion.div>
				</motion.div>

				{/* Carousel Container */}
				<div
					className="relative"
					onMouseEnter={() => setIsAutoPlaying(false)}
					onMouseLeave={() => setIsAutoPlaying(true)}
				>
					{/* 4x4 Grid Carousel */}
					<div className="overflow-hidden">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentSlide}
								initial={{ opacity: 0, x: 100 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -100 }}
								transition={{ duration: 0.4, ease: 'easeInOut' }}
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
							>
								{getVisibleProperties().map((property, idx) => (
									<motion.div
										key={property.id}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.1 }}
										whileHover={{ y: -8 }}
										onClick={() => setExpandedId(expandedId === property.id ? null : property.id)}
										className={`relative glass-surface rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 ${
											expandedId === property.id ? 'sm:col-span-2 lg:col-span-2 row-span-2' : ''
										}`}
									>
										{/* Enhanced Image with sophisticated hover effects */}
										<div className="relative overflow-hidden aspect-[4/3]">
											<motion.img
												src={property.img}
												alt={property.title}
												className="w-full h-full object-cover"
												loading="lazy"
												whileHover={{
													scale: 1.15,
													rotate: [0, 1, -1, 0],
													transition: { duration: 0.6, ease: 'easeInOut' },
												}}
												transition={{ duration: 0.5 }}
											/>

											{/* Enhanced gradient overlays */}
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 group-hover:from-black/90" />
											<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-gold-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

											{/* Featured badge with animation */}
											{property.featured && (
												<motion.span
													initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
													animate={{ opacity: 1, scale: 1, rotate: 0 }}
													whileHover={{ scale: 1.1, rotate: 5 }}
													transition={{ type: 'spring', stiffness: 200 }}
													className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-primary to-gold-light text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/30 backdrop-blur-sm"
												>
													<motion.div
														animate={{ rotate: [0, 360] }}
														transition={{
															duration: 8,
															repeat: Number.POSITIVE_INFINITY,
															ease: 'linear',
														}}
														className="inline-block"
													>
														✨ Featured
													</motion.div>
												</motion.span>
											)}

											{/* Enhanced expand button */}
											<motion.button
												initial={{ opacity: 0, scale: 0.8 }}
												whileHover={{
													scale: 1.1,
													backgroundColor: 'rgba(251, 191, 36, 0.9)',
												}}
												whileTap={{ scale: 0.95 }}
												className="absolute top-3 right-3 p-2.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary/90 transition-all duration-300 shadow-lg"
											>
												<motion.div
													animate={{ rotate: [0, 5, -5, 0] }}
													transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
												>
													<Maximize2 size={16} />
												</motion.div>
											</motion.button>

											{/* Sophisticated quick view overlay */}
											<motion.div
												initial={{ opacity: 0 }}
												whileHover={{ opacity: 1 }}
												className="absolute inset-0 bg-gradient-to-br from-primary/30 via-gold-light/20 to-primary/40 flex items-center justify-center backdrop-blur-sm"
											>
												<motion.div
													initial={{ scale: 0.8, opacity: 0 }}
													whileHover={{ scale: 1, opacity: 1 }}
													transition={{ type: 'spring', stiffness: 150 }}
													className="px-6 py-3 bg-primary/90 backdrop-blur-md text-primary-foreground text-sm font-bold rounded-full shadow-2xl border border-white/20"
												>
													<span className="flex items-center gap-2">
														<motion.div
															animate={{ x: [0, 5, 0] }}
															transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
														>
															👁
														</motion.div>
														View Details
													</span>
												</motion.div>
											</motion.div>
										</div>

										{/* Content */}
										<div className="p-4">
											<div className="flex items-start justify-between mb-2">
												<h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
													{property.title}
												</h3>
												<div className="flex items-center gap-1 text-primary">
													<Star size={14} fill="currentColor" />
													<span className="text-sm font-medium">{property.rating}</span>
												</div>
											</div>

											<p className="text-muted-foreground text-sm mb-3">
												{property.location} · {property.beds} · {property.baths}
											</p>

											<div className="flex items-center justify-between">
												<span className="text-primary font-bold">{property.price}</span>
												<motion.a
													href="http://malta.staydirectly.com/"
													target="_blank"
													rel="noopener noreferrer"
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className="p-2 bg-secondary rounded-full hover:bg-primary/20 transition-colors"
													onClick={(e) => e.stopPropagation()}
												>
													<ExternalLink size={14} className="text-foreground" />
												</motion.a>
											</div>
										</div>
									</motion.div>
								))}
							</motion.div>
						</AnimatePresence>
					</div>

					{/* Navigation arrows */}
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={prevSlide}
						className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
					>
						<ChevronLeft size={24} />
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={nextSlide}
						className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
					>
						<ChevronRight size={24} />
					</motion.button>

					{/* Dots indicator */}
					<div className="flex justify-center gap-2 mt-8">
						{[...Array(totalSlides)].map((_, i) => (
							<motion.button
								key={i}
								onClick={() => {
									setCurrentSlide(i);
									setIsAutoPlaying(false);
								}}
								className="relative"
								whileHover={{ scale: 1.2 }}
							>
								<motion.div
									className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-primary' : 'bg-secondary'}`}
									animate={i === currentSlide ? { scale: [1, 1.3, 1] } : {}}
									transition={{ duration: 0.5 }}
								/>
								{i === currentSlide && (
									<motion.div
										className="absolute -inset-1 border-2 border-primary rounded-full"
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0 }}
									/>
								)}
							</motion.button>
						))}
					</div>
				</div>

				{/* View all button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3 }}
					className="text-center mt-12"
				>
					<motion.a
						href="http://malta.staydirectly.com/"
						target="_blank"
						rel="noopener noreferrer"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-gold-light transition-all shadow-lg shadow-primary/25"
					>
						View All Properties
						<ExternalLink size={16} />
					</motion.a>
				</motion.div>

				{/* Scroll progress */}
				<motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
					<motion.div
						className="h-full bg-primary"
						style={{ scaleX: smoothProgress, transformOrigin: '0%' }}
					/>
				</motion.div>
			</div>
		</section>
	);
}
