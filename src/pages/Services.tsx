import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
	Calendar,
	Camera,
	DollarSign,
	FileText,
	Heart,
	Home,
	Key,
	Shield,
	Star,
	TrendingUp,
	Users,
	Wrench,
} from 'lucide-react';

const Services = () => {
	const services = [
		{
			icon: Home,
			title: 'Full Property Management',
			description:
				'Complete end-to-end management of your property, from listing to guest checkout.',
			features: [
				'Professional photography & listing creation',
				'Dynamic pricing optimization',
				'Booking management & coordination',
				'Check-in/check-out procedures',
				'24/7 guest support',
			],
			pricing: 'Starting from 20% commission',
		},
		{
			icon: Users,
			title: 'Guest Services',
			description:
				'Exceptional guest experience management to ensure 5-star reviews and repeat bookings.',
			features: [
				'Welcome packages & amenities',
				'Concierge services & recommendations',
				'Issue resolution & maintenance',
				'Local area guidance',
				'Multi-language support',
			],
			pricing: 'Included with management',
		},
		{
			icon: Shield,
			title: 'Property Protection',
			description: 'Comprehensive protection and maintenance to preserve your property value.',
			features: [
				'Regular inspections & reports',
				'Professional cleaning services',
				'Maintenance & repairs coordination',
				'Inventory management',
				'Insurance assistance',
			],
			pricing: 'Starting from €150/month',
		},
		{
			icon: DollarSign,
			title: 'Revenue Optimization',
			description: 'Maximize your rental income through strategic pricing and marketing.',
			features: [
				'Market analysis & competitive pricing',
				'Seasonal rate adjustments',
				'Multi-platform distribution',
				'Occupancy optimization',
				'Monthly financial reporting',
			],
			pricing: 'Performance-based',
		},
	];

	const additionalServices = [
		{
			icon: Camera,
			title: 'Professional Photography',
			description: 'High-quality photos and virtual tours to showcase your property.',
		},
		{
			icon: Wrench,
			title: 'Maintenance & Repairs',
			description: 'Reliable maintenance network for prompt repairs and upkeep.',
		},
		{
			icon: FileText,
			title: 'Legal Compliance',
			description: 'Assistance with licensing, permits, and regulatory compliance.',
		},
		{
			icon: TrendingUp,
			title: 'Market Analytics',
			description: 'Detailed insights on market trends and property performance.',
		},
		{
			icon: Key,
			title: 'Key Management',
			description: 'Secure key handling and smart lock installation.',
		},
		{
			icon: Heart,
			title: 'Interior Styling',
			description: 'Professional staging and decoration to maximize appeal.',
		},
	];

	const processSteps = [
		{
			step: '01',
			title: 'Property Assessment',
			description:
				"We evaluate your property's potential and create a tailored management strategy.",
		},
		{
			step: '02',
			title: 'Setup & Optimization',
			description: 'Professional photography, listing creation, and price optimization.',
		},
		{
			step: '03',
			title: 'Launch & Management',
			description: 'Go live on multiple platforms and start welcoming guests.',
		},
	];

	const testimonials = [
		{
			name: 'Property Owner',
			text: 'My rental income increased by 40% in the first 6 months. The team handles everything perfectly!',
			property: '3-bedroom apartment in Sliema',
		},
		{
			name: 'Guest',
			text: 'The service was exceptional from booking to checkout. The property was immaculate and well-equipped.',
			property: 'Luxury villa in Mellieha',
		},
	];

	return (
		<div className="min-h-screen bg-background">
			<Navbar onOpenWizard={() => {}} />

			<main>
				{/* Hero Section */}
				<section className="relative py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="max-w-4xl mx-auto text-center"
						>
							<Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
								Our Services
							</Badge>
							<h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Comprehensive Property Management Solutions
							</h1>
							<p className="text-xl text-gray-600 leading-relaxed">
								From listing optimization to guest services, we handle every aspect of property
								management so you can enjoy passive income without the hassle.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Main Services */}
				<section className="py-20">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Core Services
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Our comprehensive services are designed to maximize your property's potential and
								provide exceptional guest experiences.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-2 gap-8">
							{services.map((service, index) => (
								<motion.div
									key={service.title}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
										<CardHeader className="pb-4">
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
													<service.icon className="w-6 h-6 text-primary" />
												</div>
												<div className="flex-1">
													<CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
													<p className="text-sm text-primary font-medium mt-1">{service.pricing}</p>
												</div>
											</div>
										</CardHeader>
										<CardContent className="pt-0">
											<p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
											<ul className="space-y-2">
												{service.features.map((feature) => (
													<li
														key={feature}
														className="flex items-center gap-2 text-sm text-gray-600"
													>
														<div className="w-1.5 h-1.5 bg-primary rounded-full" />
														{feature}
													</li>
												))}
											</ul>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Process Section */}
				<section className="py-20 bg-gray-50">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Our Simple 3-Step Process
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Getting started is easy. We'll have your property listed and generating income in no
								time.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-3 gap-8">
							{processSteps.map((step, index) => (
								<motion.div
									key={step.step}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									className="text-center"
								>
									<div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
										{step.step}
									</div>
									<h3 className="font-semibold text-xl text-gray-900 mb-3">{step.title}</h3>
									<p className="text-gray-600 leading-relaxed">{step.description}</p>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Additional Services */}
				<section className="py-20">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Additional Services
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Enhance your property's appeal and streamline operations with our supplementary
								services.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{additionalServices.map((service, index) => (
								<motion.div
									key={service.title}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow text-center h-full">
										<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
											<service.icon className="w-6 h-6 text-primary" />
										</div>
										<h3 className="font-semibold text-lg text-gray-900 mb-2">{service.title}</h3>
										<p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Benefits Section */}
				<section className="py-20 bg-gray-50">
					<div className="section-container">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
								<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-6">
									Why Choose Christiano Property Management?
								</h2>
								<div className="space-y-4">
									<div className="flex items-start gap-3">
										<Star className="w-5 h-5 text-primary mt-0.5" />
										<div>
											<h4 className="font-semibold text-gray-900">Proven Track Record</h4>
											<p className="text-gray-600 text-sm">
												4.9/5 average rating with 500+ satisfied guests
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<TrendingUp className="w-5 h-5 text-primary mt-0.5" />
										<div>
											<h4 className="font-semibold text-gray-900">Increased Revenue</h4>
											<p className="text-gray-600 text-sm">
												Properties see 30-40% income increase on average
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Shield className="w-5 h-5 text-primary mt-0.5" />
										<div>
											<h4 className="font-semibold text-gray-900">Full Protection</h4>
											<p className="text-gray-600 text-sm">
												Comprehensive insurance and damage protection
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Calendar className="w-5 h-5 text-primary mt-0.5" />
										<div>
											<h4 className="font-semibold text-gray-900">Time Saving</h4>
											<p className="text-gray-600 text-sm">
												Save 15+ hours per week on property management
											</p>
										</div>
									</div>
								</div>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								className="grid grid-cols-2 gap-4"
							>
								<div className="bg-white p-6 rounded-xl shadow-sm text-center">
									<p className="text-3xl font-bold text-primary mb-1">94%</p>
									<p className="text-sm text-gray-600">Occupancy Rate</p>
								</div>
								<div className="bg-white p-6 rounded-xl shadow-sm text-center">
									<p className="text-3xl font-bold text-primary mb-1">45+</p>
									<p className="text-sm text-gray-600">Properties Managed</p>
								</div>
								<div className="bg-white p-6 rounded-xl shadow-sm text-center">
									<p className="text-3xl font-bold text-primary mb-1">24/7</p>
									<p className="text-sm text-gray-600">Guest Support</p>
								</div>
								<div className="bg-white p-6 rounded-xl shadow-sm text-center">
									<p className="text-3xl font-bold text-primary mb-1">8+</p>
									<p className="text-sm text-gray-600">Years Experience</p>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Testimonials */}
				<section className="py-20">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Success Stories
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Hear from property owners and guests who have experienced our exceptional service.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-2 gap-8">
							{testimonials.map((testimonial, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="p-6 border-0 shadow-sm">
										<CardContent className="p-0">
											<div className="flex items-center mb-4">
												{[...Array(5)].map((_, i) => (
													<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
												))}
											</div>
											<p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.text}"</p>
											<div>
												<p className="font-semibold text-gray-900">{testimonial.name}</p>
												<p className="text-sm text-gray-500">{testimonial.property}</p>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-primary text-white">
					<div className="section-container text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="max-w-3xl mx-auto"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
								Ready to Maximize Your Property's Potential?
							</h2>
							<p className="text-xl mb-8 opacity-90">
								Join dozens of satisfied property owners who trust us to manage their valuable
								assets.
							</p>
							<Button
								size="lg"
								variant="secondary"
								className="bg-white text-primary hover:bg-gray-100"
							>
								Get Your Free Assessment
							</Button>
						</motion.div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default Services;
