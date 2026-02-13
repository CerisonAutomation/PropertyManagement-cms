import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Award, Heart, Shield, Users } from 'lucide-react';

const About = () => {
	const teamMembers = [
		{
			name: 'Christiano',
			role: 'Founder & CEO',
			image: '/api/placeholder/200/200',
			bio: "With over 10 years of experience in Malta's real estate market, Christiano founded the company with a vision to revolutionize property management.",
			expertise: ['Property Management', 'Guest Relations', 'Market Analysis'],
		},
		{
			name: 'Sarah',
			role: 'Operations Manager',
			image: '/api/placeholder/200/200',
			bio: 'Sarah ensures smooth operations across all properties, handling everything from maintenance to guest communications.',
			expertise: ['Operations', 'Quality Control', 'Team Leadership'],
		},
		{
			name: 'Michael',
			role: 'Senior Property Manager',
			image: '/api/placeholder/200/200',
			bio: 'Michael manages our premium portfolio, ensuring each property meets the highest standards of excellence.',
			expertise: ['Property Management', 'Guest Experience', 'Maintenance'],
		},
		{
			name: 'Elena',
			role: 'Marketing & Communications',
			image: '/api/placeholder/200/200',
			bio: 'Elena handles our marketing efforts and ensures our properties reach the right audience globally.',
			expertise: ['Digital Marketing', 'Content Creation', 'Brand Management'],
		},
	];

	const stats = [
		{ icon: Users, value: '500+', label: 'Happy Guests' },
		{ icon: Award, value: '4.9/5', label: 'Average Rating' },
		{ icon: Shield, value: '45+', label: 'Properties Managed' },
		{ icon: Heart, value: '8+', label: 'Years Experience' },
	];

	const values = [
		{
			icon: Heart,
			title: 'Guest-Centric Approach',
			description:
				'We treat every guest like family, ensuring their stay is nothing short of exceptional.',
		},
		{
			icon: Shield,
			title: 'Trust & Reliability',
			description:
				'Property owners trust us with their valuable assets, and we take that responsibility seriously.',
		},
		{
			icon: Users,
			title: 'Local Expertise',
			description:
				"Deep knowledge of Malta's property market and tourism industry gives us a competitive edge.",
		},
		{
			icon: Award,
			title: 'Excellence in Service',
			description:
				'We go above and beyond to maintain the highest standards in property management.',
		},
	];

	const testimonials = [
		{
			name: 'Katie',
			date: 'October 2024',
			rating: 5,
			text: 'Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine for my husband, everything was spot on.',
			property: 'Luxury Sea View Apartment',
		},
		{
			name: 'Eric',
			date: 'October 2024',
			rating: 5,
			text: 'Christiano is a gracious, proactive host who made sure I had all the information I needed. The apartment had everything we needed.',
			property: 'Historic Valletta Townhouse',
		},
		{
			name: 'Anna',
			date: 'September 2024',
			rating: 5,
			text: 'The host is nice and helpful! The apartment is modern, clean, cozy, and fully equipped. Perfect location, close to the beach and Valletta.',
			property: 'Cozy Beach Apartment',
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
								About Christiano Property Management
							</Badge>
							<h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Malta's Premier Property Management Partner
							</h1>
							<p className="text-xl text-gray-600 leading-relaxed">
								We transform property ownership into a seamless, profitable experience while
								delivering unforgettable stays for guests across the beautiful islands of Malta and
								Gozo.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="py-16 bg-white">
					<div className="section-container">
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
							{stats.map((stat, index) => (
								<motion.div
									key={stat.label}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									className="text-center"
								>
									<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
										<stat.icon className="w-8 h-8 text-primary" />
									</div>
									<p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
									<p className="text-gray-600">{stat.label}</p>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Story Section */}
				<section className="py-20">
					<div className="section-container">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
								<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-6">
									Our Story
								</h2>
								<div className="space-y-4 text-gray-600 leading-relaxed">
									<p>
										Founded in 2016, Christiano Property Management began with a simple mission: to
										provide property owners in Malta with a hassle-free way to maximize their rental
										income while maintaining the highest standards of guest experience.
									</p>
									<p>
										What started as managing a few family properties has grown into a comprehensive
										property management service trusted by dozens of homeowners across Malta and
										Gozo. Our deep local knowledge, combined with international hospitality
										standards, sets us apart in the competitive short-let market.
									</p>
									<p>
										Today, we manage a diverse portfolio of properties ranging from cozy studios to
										luxury villas, each receiving the same level of attention to detail and
										personalized service that has become our trademark.
									</p>
								</div>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								className="relative"
							>
								<img
									src="/api/placeholder/600/400"
									alt="Christiano Property Management Team"
									className="rounded-2xl shadow-xl w-full"
								/>
								<div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
									<p className="text-sm font-semibold text-primary">8+ Years</p>
									<p className="text-xs text-gray-600">of Excellence</p>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Values Section */}
				<section className="py-20 bg-gray-50">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Our Core Values
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								These principles guide everything we do, from how we treat guests to how we manage
								properties.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
							{values.map((value, index) => (
								<motion.div
									key={value.title}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="h-full text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
										<CardContent className="p-0">
											<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
												<value.icon className="w-8 h-8 text-primary" />
											</div>
											<h3 className="font-semibold text-lg text-gray-900 mb-3">{value.title}</h3>
											<p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Team Section */}
				<section className="py-20">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Meet Our Team
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Our dedicated team of professionals is committed to delivering exceptional service
								to both property owners and guests.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
							{teamMembers.map((member, index) => (
								<motion.div
									key={member.name}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-all">
										<CardContent className="p-0">
											<img
												src={member.image}
												alt={member.name}
												className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
											/>
											<h3 className="font-semibold text-lg text-gray-900 mb-1">{member.name}</h3>
											<p className="text-primary text-sm font-medium mb-3">{member.role}</p>
											<p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
											<div className="flex flex-wrap gap-1 justify-center">
												{member.expertise.map((skill) => (
													<Badge key={skill} variant="secondary" className="text-xs">
														{skill}
													</Badge>
												))}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section className="py-20 bg-gray-50">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								What Our Guests Say
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Don't just take our word for it - hear from guests who have experienced our
								hospitality firsthand.
							</p>
						</motion.div>
						<div className="grid md:grid-cols-3 gap-8">
							{testimonials.map((testimonial, index) => (
								<motion.div
									key={testimonial.name}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="p-6 border-0 shadow-sm">
										<CardContent className="p-0">
											<div className="flex items-center mb-4">
												{[...Array(testimonial.rating)].map((_, i) => (
													<span key={i} className="text-yellow-400">
														★
													</span>
												))}
											</div>
											<p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.text}"</p>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-semibold text-gray-900">{testimonial.name}</p>
													<p className="text-sm text-gray-500">{testimonial.date}</p>
												</div>
												<Badge variant="outline" className="text-xs">
													{testimonial.property}
												</Badge>
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
								Ready to Experience the Difference?
							</h2>
							<p className="text-xl mb-8 opacity-90">
								Whether you're a property owner looking for professional management or a guest
								seeking the perfect stay, we're here to help.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									size="lg"
									variant="secondary"
									className="bg-white text-primary hover:bg-gray-100"
								>
									List Your Property
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="border-white text-white hover:bg-white hover:text-primary"
								>
									Book a Stay
								</Button>
							</div>
						</motion.div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default About;
