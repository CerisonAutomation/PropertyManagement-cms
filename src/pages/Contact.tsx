import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Calendar, Clock, Home, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { useState } from 'react';

const Contact = () => {
	const { toast } = useToast();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: '',
		propertyType: '',
		budget: '',
		timeline: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: 'Message sent successfully!',
				description: "We'll get back to you within 24 hours.",
			});

			// Reset form
			setFormData({
				name: '',
				email: '',
				phone: '',
				subject: '',
				message: '',
				propertyType: '',
				budget: '',
				timeline: '',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to send message. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const contactInfo = [
		{
			icon: Phone,
			title: 'Phone',
			details: ['+356 2123 4567', '+356 9987 6543'],
			description: 'Available 24/7 for emergencies',
		},
		{
			icon: Mail,
			title: 'Email',
			details: [
				'info@christianopropertymanagement.com',
				'bookings@christianopropertymanagement.com',
			],
			description: 'We respond within 24 hours',
		},
		{
			icon: MapPin,
			title: 'Office Location',
			details: ['123 Sliema Road', 'Sliema, SLM 1234', 'Malta'],
			description: 'Open Monday - Friday, 9am - 6pm',
		},
		{
			icon: Clock,
			title: 'Office Hours',
			details: [
				'Monday - Friday: 9:00 AM - 6:00 PM',
				'Saturday: 10:00 AM - 2:00 PM',
				'Sunday: Closed',
			],
			description: '24/7 emergency support available',
		},
	];

	const faqs = [
		{
			question: 'How quickly can you start managing my property?',
			answer:
				'We can typically onboard a new property within 7-10 days, depending on the preparation needed.',
		},
		{
			question: 'What areas of Malta do you cover?',
			answer:
				"We cover all of Malta and Gozo, with special focus on Sliema, St. Julian's, Valletta, and Mellieha.",
		},
		{
			question: 'How do you handle property maintenance?',
			answer:
				'We have a network of trusted contractors and handle all maintenance requests promptly, with owner approval for costs over €200.',
		},
		{
			question: "What's your commission structure?",
			answer:
				'Our standard commission is 20% of rental revenue, with tiered rates available for multiple properties.',
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
								Get in Touch
							</Badge>
							<h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Let's Start a Conversation
							</h1>
							<p className="text-xl text-gray-600 leading-relaxed">
								Whether you're a property owner looking for professional management or a guest
								seeking the perfect stay, we're here to help you every step of the way.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Contact Info Cards */}
				<section className="py-16">
					<div className="section-container">
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
							{contactInfo.map((info, index) => (
								<motion.div
									key={info.title}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="text-center p-6 border-0 shadow-sm hover:shadow-md transition-shadow h-full">
										<CardContent className="p-0">
											<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
												<info.icon className="w-6 h-6 text-primary" />
											</div>
											<h3 className="font-semibold text-lg text-gray-900 mb-3">{info.title}</h3>
											<div className="space-y-1 mb-3">
												{info.details.map((detail) => (
													<p key={detail} className="text-sm text-gray-600">
														{detail}
													</p>
												))}
											</div>
											<p className="text-xs text-gray-500">{info.description}</p>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Contact Form & Info */}
				<section className="py-20 bg-gray-50">
					<div className="section-container">
						<div className="grid lg:grid-cols-2 gap-12">
							{/* Contact Form */}
							<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
								<Card className="p-8 border-0 shadow-lg">
									<CardHeader className="px-0 pt-0">
										<CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
										<p className="text-gray-600">
											Fill out the form below and we'll get back to you soon.
										</p>
									</CardHeader>
									<CardContent className="px-0 pb-0">
										<form onSubmit={handleSubmit} className="space-y-6">
											<div className="grid md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Full Name *
													</label>
													<Input
														required
														value={formData.name}
														onChange={(e) => handleInputChange('name', e.target.value)}
														placeholder="John Doe"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Email Address *
													</label>
													<Input
														type="email"
														required
														value={formData.email}
														onChange={(e) => handleInputChange('email', e.target.value)}
														placeholder="john@example.com"
													/>
												</div>
											</div>

											<div className="grid md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Phone Number
													</label>
													<Input
														value={formData.phone}
														onChange={(e) => handleInputChange('phone', e.target.value)}
														placeholder="+356 2123 4567"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Subject *
													</label>
													<Select
														value={formData.subject}
														onValueChange={(value) => handleInputChange('subject', value)}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select a subject" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="property-management">
																Property Management
															</SelectItem>
															<SelectItem value="booking">Booking Inquiry</SelectItem>
															<SelectItem value="maintenance">Maintenance Request</SelectItem>
															<SelectItem value="partnership">Partnership</SelectItem>
															<SelectItem value="other">Other</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>

											{formData.subject === 'property-management' && (
												<div className="grid md:grid-cols-2 gap-4">
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-2">
															Property Type
														</label>
														<Select
															value={formData.propertyType}
															onValueChange={(value) => handleInputChange('propertyType', value)}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select property type" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="apartment">Apartment</SelectItem>
																<SelectItem value="villa">Villa</SelectItem>
																<SelectItem value="townhouse">Townhouse</SelectItem>
																<SelectItem value="studio">Studio</SelectItem>
																<SelectItem value="penthouse">Penthouse</SelectItem>
															</SelectContent>
														</Select>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-2">
															Timeline
														</label>
														<Select
															value={formData.timeline}
															onValueChange={(value) => handleInputChange('timeline', value)}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select timeline" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="asap">As soon as possible</SelectItem>
																<SelectItem value="1-month">Within 1 month</SelectItem>
																<SelectItem value="3-months">Within 3 months</SelectItem>
																<SelectItem value="6-months">Within 6 months</SelectItem>
																<SelectItem value="just-exploring">Just exploring</SelectItem>
															</SelectContent>
														</Select>
													</div>
												</div>
											)}

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Message *
												</label>
												<Textarea
													required
													rows={5}
													value={formData.message}
													onChange={(e) => handleInputChange('message', e.target.value)}
													placeholder="Tell us more about your inquiry..."
												/>
											</div>

											<Button
												type="submit"
												disabled={isSubmitting}
												className="w-full bg-primary hover:bg-gold-light"
											>
												{isSubmitting ? (
													<div className="flex items-center gap-2">
														<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
														Sending...
													</div>
												) : (
													<div className="flex items-center gap-2">
														<Send className="w-4 h-4" />
														Send Message
													</div>
												)}
											</Button>
										</form>
									</CardContent>
								</Card>
							</motion.div>

							{/* Quick Actions & FAQ */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								className="space-y-8"
							>
								{/* Quick Actions */}
								<div>
									<h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">
										Quick Actions
									</h3>
									<div className="grid gap-4">
										<Button variant="outline" className="h-auto p-4 justify-start">
											<Home className="w-5 h-5 mr-3 text-primary" />
											<div className="text-left">
												<p className="font-semibold">List Your Property</p>
												<p className="text-sm text-gray-600">Get a free property assessment</p>
											</div>
										</Button>
										<Button variant="outline" className="h-auto p-4 justify-start">
											<Calendar className="w-5 h-5 mr-3 text-primary" />
											<div className="text-left">
												<p className="font-semibold">Book a Stay</p>
												<p className="text-sm text-gray-600">Browse available properties</p>
											</div>
										</Button>
										<Button variant="outline" className="h-auto p-4 justify-start">
											<MessageSquare className="w-5 h-5 mr-3 text-primary" />
											<div className="text-left">
												<p className="font-semibold">Schedule a Call</p>
												<p className="text-sm text-gray-600">Book a consultation with us</p>
											</div>
										</Button>
									</div>
								</div>

								{/* FAQ */}
								<div>
									<h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">
										Frequently Asked Questions
									</h3>
									<div className="space-y-4">
										{faqs.map((faq, index) => (
											<Card key={index} className="p-4 border-0 shadow-sm">
												<CardContent className="p-0">
													<h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
													<p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Map Section */}
				<section className="py-20">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center mb-12"
						>
							<h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Visit Our Office
							</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								Stop by our Sliema office to discuss your property management needs in person.
							</p>
						</motion.div>
						<div className="rounded-2xl overflow-hidden shadow-xl">
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.1234567890!2d14.5123456789!3d35.9123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDU0JzQ0LjQiTiAxNMKwMzAnNDQuNCJF!5e0!3m2!1sen!2smt!4v1234567890"
								width="100%"
								height="400"
								style={{ border: 0 }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								className="w-full"
							/>
						</div>
					</div>
				</section>

				{/* Emergency Contact */}
				<section className="py-16 bg-red-50 border-y border-red-100">
					<div className="section-container">
						<div className="text-center">
							<Badge className="mb-4 bg-red-100 text-red-700 border-red-200">
								Emergency Support
							</Badge>
							<h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
								24/7 Emergency Hotline
							</h2>
							<p className="text-gray-600 mb-6">
								For urgent maintenance issues or guest emergencies, we're available 24/7.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
									<Phone className="w-5 h-5 mr-2" />
									+356 9987 6543
								</Button>
								<Button size="lg" variant="outline">
									<Mail className="w-5 h-5 mr-2" />
									emergency@christianopropertymanagement.com
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default Contact;
