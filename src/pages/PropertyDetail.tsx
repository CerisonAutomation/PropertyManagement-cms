import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
	Bath,
	Bed,
	Car,
	Check,
	ChevronLeft,
	ChevronRight,
	Coffee,
	Dumbbell,
	Heart,
	Mail,
	MapPin,
	Phone,
	Pool,
	Share2,
	Shield,
	Square,
	Star,
	Tv,
	Wifi,
	Wind,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PropertyDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [currentImage, setCurrentImage] = useState(0);
	const [isFavorite, setIsFavorite] = useState(false);
	const [bookingData, setBookingData] = useState({
		name: '',
		email: '',
		phone: '',
		checkIn: '',
		checkOut: '',
		guests: '1',
		message: '',
	});

	// Sample property data (in real app, this would come from API)
	const property = {
		id: Number.parseInt(id || '1'),
		title: 'Luxury Sea View Apartment',
		type: 'apartment',
		location: 'Sliema, Malta',
		price: 2500,
		bedrooms: 3,
		bathrooms: 2,
		area: 120,
		rating: 4.9,
		reviews: 28,
		description:
			'Experience luxury living in this stunning sea view apartment located in the heart of Sliema. This beautifully furnished property offers breathtaking views of the Mediterranean Sea and is just steps away from the beach, shopping districts, and fine dining establishments.',
		images: [
			'/api/placeholder/800/600',
			'/api/placeholder/800/600',
			'/api/placeholder/800/600',
			'/api/placeholder/800/600',
			'/api/placeholder/800/600',
		],
		amenities: [
			{ icon: Wifi, name: 'High-Speed WiFi' },
			{ icon: Car, name: 'Private Parking' },
			{ icon: Wind, name: 'Air Conditioning' },
			{ icon: Tv, name: 'Smart TV' },
			{ icon: Coffee, name: 'Coffee Machine' },
			{ icon: Dumbbell, name: 'Gym Access' },
			{ icon: Pool, name: 'Swimming Pool' },
			{ icon: Shield, name: '24/7 Security' },
		],
		features: [
			'Sea view from every room',
			'Fully equipped kitchen',
			'Washer and dryer',
			'Balcony with outdoor seating',
			'Beach access within 5 minutes',
			'Near public transport',
			'Supermarket nearby',
			'Restaurants and cafes',
		],
		host: {
			name: 'Christiano',
			avatar: '/api/placeholder/60/60',
			responseTime: '1 hour',
			memberSince: '2016',
			languages: ['English', 'Maltese', 'Italian'],
			rating: 4.9,
		},
		reviews: [
			{
				id: 1,
				author: 'Katie',
				date: 'October 2024',
				rating: 5,
				text: 'Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine for my husband, everything was spot on.',
				avatar: '/api/placeholder/40/40',
			},
			{
				id: 2,
				author: 'Eric',
				date: 'October 2024',
				rating: 5,
				text: 'Christiano is a gracious, proactive host who made sure I had all the information I needed. The apartment had everything we needed.',
				avatar: '/api/placeholder/40/40',
			},
		],
		nearbyPlaces: [
			{ name: 'Sliema Beach', distance: '5 min walk', type: 'beach' },
			{ name: 'Point Shopping Mall', distance: '10 min walk', type: 'shopping' },
			{ name: 'Valletta Ferry', distance: '15 min walk', type: 'transport' },
			{ name: "St. Julian's", distance: '5 min drive', type: 'entertainment' },
		],
	};

	const handleBooking = async (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		if (!bookingData.name || !bookingData.email || !bookingData.checkIn || !bookingData.checkOut) {
			toast({
				title: 'Missing Information',
				description: 'Please fill in all required fields.',
				variant: 'destructive',
			});
			return;
		}

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: 'Booking Request Sent!',
				description: "We'll confirm availability and get back to you within 24 hours.",
			});

			// Reset form
			setBookingData({
				name: '',
				email: '',
				phone: '',
				checkIn: '',
				checkOut: '',
				guests: '1',
				message: '',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to send booking request. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const nextImage = () => {
		setCurrentImage((prev) => (prev + 1) % property.images.length);
	};

	const prevImage = () => {
		setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
	};

	return (
		<div className="min-h-screen bg-background">
			<Navbar onOpenWizard={() => {}} />

			<main className="pt-24 pb-16">
				<div className="section-container">
					{/* Back Button */}
					<Button variant="ghost" onClick={() => navigate('/properties')} className="mb-6">
						<ChevronLeft className="w-4 h-4 mr-2" />
						Back to Properties
					</Button>

					{/* Image Gallery */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-8"
					>
						<div className="relative rounded-2xl overflow-hidden shadow-xl">
							<img
								src={property.images[currentImage]}
								alt={property.title}
								className="w-full h-[500px] object-cover"
							/>

							{/* Image Navigation */}
							<Button
								variant="ghost"
								size="sm"
								onClick={prevImage}
								className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
							>
								<ChevronLeft className="w-5 h-5" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={nextImage}
								className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
							>
								<ChevronRight className="w-5 h-5" />
							</Button>

							{/* Action Buttons */}
							<div className="absolute top-4 right-4 flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsFavorite(!isFavorite)}
									className="bg-white/80 hover:bg-white"
								>
									<Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
								</Button>
								<Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
									<Share2 className="w-4 h-4" />
								</Button>
							</div>

							{/* Image Indicators */}
							<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
								{property.images.map((_, index) => (
									<div
										key={index}
										className={`w-2 h-2 rounded-full ${
											index === currentImage ? 'bg-white' : 'bg-white/50'
										}`}
									/>
								))}
							</div>
						</div>

						{/* Thumbnail Gallery */}
						<div className="grid grid-cols-5 gap-2 mt-4">
							{property.images.map((image, index) => (
								<button
									key={index}
									onClick={() => setCurrentImage(index)}
									className={`rounded-lg overflow-hidden border-2 transition-all ${
										index === currentImage ? 'border-primary' : 'border-transparent'
									}`}
								>
									<img
										src={image}
										alt={`Property view ${index + 1}`}
										className="w-full h-20 object-cover"
									/>
								</button>
							))}
						</div>
					</motion.div>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-8">
							{/* Property Header */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
							>
								<div className="flex items-start justify-between mb-4">
									<div>
										<Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
											{property.type.charAt(0).toUpperCase() + property.type.slice(1)}
										</Badge>
										<h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
											{property.title}
										</h1>
										<div className="flex items-center text-gray-600 mb-4">
											<MapPin className="w-4 h-4 mr-1" />
											{property.location}
										</div>
									</div>
									<div className="text-right">
										<p className="text-3xl font-bold text-primary">€{property.price}</p>
										<p className="text-gray-500">per month</p>
									</div>
								</div>

								{/* Property Stats */}
								<div className="flex items-center gap-6 text-gray-600 mb-6">
									<div className="flex items-center">
										<Bed className="w-5 h-5 mr-2" />
										{property.bedrooms} bedrooms
									</div>
									<div className="flex items-center">
										<Bath className="w-5 h-5 mr-2" />
										{property.bathrooms} bathrooms
									</div>
									<div className="flex items-center">
										<Square className="w-5 h-5 mr-2" />
										{property.area}m²
									</div>
									<div className="flex items-center">
										<Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
										{property.rating} ({property.reviews} reviews)
									</div>
								</div>

								<p className="text-gray-600 leading-relaxed">{property.description}</p>
							</motion.div>

							{/* Amenities */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
							>
								<h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{property.amenities.map((amenity) => (
										<div key={amenity.name} className="flex items-center gap-2">
											<amenity.icon className="w-5 h-5 text-primary" />
											<span className="text-sm text-gray-600">{amenity.name}</span>
										</div>
									))}
								</div>
							</motion.div>

							{/* Features */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">
									Property Features
								</h2>
								<div className="grid grid-cols-2 gap-3">
									{property.features.map((feature) => (
										<div key={feature} className="flex items-center gap-2">
											<Check className="w-4 h-4 text-green-500" />
											<span className="text-sm text-gray-600">{feature}</span>
										</div>
									))}
								</div>
							</motion.div>

							{/* Host Information */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
							>
								<Card className="p-6">
									<CardHeader className="px-0 pt-0">
										<CardTitle className="text-xl">Meet Your Host</CardTitle>
									</CardHeader>
									<CardContent className="px-0 pb-0">
										<div className="flex items-start gap-4">
											<img
												src={property.host.avatar}
												alt={property.host.name}
												className="w-16 h-16 rounded-full"
											/>
											<div className="flex-1">
												<h3 className="font-semibold text-lg text-gray-900 mb-1">
													{property.host.name}
												</h3>
												<div className="space-y-1 text-sm text-gray-600">
													<p>Response time: {property.host.responseTime}</p>
													<p>Member since {property.host.memberSince}</p>
													<p>Languages: {property.host.languages.join(', ')}</p>
													<div className="flex items-center">
														<Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
														<span>{property.host.rating} rating</span>
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>

							{/* Reviews */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
							>
								<h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Guest Reviews</h2>
								<div className="space-y-4">
									{property.reviews.map((review) => (
										<Card key={review.id} className="p-6">
											<CardContent className="p-0">
												<div className="flex items-start gap-4">
													<img
														src={review.avatar}
														alt={review.author}
														className="w-12 h-12 rounded-full"
													/>
													<div className="flex-1">
														<div className="flex items-center justify-between mb-2">
															<h4 className="font-semibold text-gray-900">{review.author}</h4>
															<span className="text-sm text-gray-500">{review.date}</span>
														</div>
														<div className="flex items-center mb-2">
															{[...Array(review.rating)].map((_, i) => (
																<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
															))}
														</div>
														<p className="text-gray-600">{review.text}</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</motion.div>
						</div>

						{/* Booking Sidebar */}
						<div className="lg:col-span-1">
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.6 }}
								className="sticky top-24"
							>
								<Card className="p-6 shadow-lg">
									<CardHeader className="px-0 pt-0">
										<CardTitle className="text-xl">Book This Property</CardTitle>
									</CardHeader>
									<CardContent className="px-0 pb-0">
										<form onSubmit={handleBooking} className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Full Name *
												</label>
												<Input
													required
													value={bookingData.name}
													onChange={(e) =>
														setBookingData((prev) => ({ ...prev, name: e.target.value }))
													}
													placeholder="John Doe"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Email *
												</label>
												<Input
													type="email"
													required
													value={bookingData.email}
													onChange={(e) =>
														setBookingData((prev) => ({ ...prev, email: e.target.value }))
													}
													placeholder="john@example.com"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Phone
												</label>
												<Input
													value={bookingData.phone}
													onChange={(e) =>
														setBookingData((prev) => ({ ...prev, phone: e.target.value }))
													}
													placeholder="+356 2123 4567"
												/>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Check In *
													</label>
													<Input
														type="date"
														required
														value={bookingData.checkIn}
														onChange={(e) =>
															setBookingData((prev) => ({ ...prev, checkIn: e.target.value }))
														}
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Check Out *
													</label>
													<Input
														type="date"
														required
														value={bookingData.checkOut}
														onChange={(e) =>
															setBookingData((prev) => ({ ...prev, checkOut: e.target.value }))
														}
													/>
												</div>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Number of Guests
												</label>
												<select
													value={bookingData.guests}
													onChange={(e) =>
														setBookingData((prev) => ({ ...prev, guests: e.target.value }))
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
												>
													<option value="1">1 Guest</option>
													<option value="2">2 Guests</option>
													<option value="3">3 Guests</option>
													<option value="4">4 Guests</option>
													<option value="5">5+ Guests</option>
												</select>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Message (Optional)
												</label>
												<Textarea
													value={bookingData.message}
													onChange={(e) =>
														setBookingData((prev) => ({ ...prev, message: e.target.value }))
													}
													placeholder="Any special requests or questions..."
													rows={3}
												/>
											</div>

											<Button type="submit" className="w-full bg-primary hover:bg-gold-light">
												Send Booking Request
											</Button>
										</form>

										<div className="mt-6 pt-6 border-t border-gray-200">
											<h4 className="font-semibold text-gray-900 mb-3">Quick Contact</h4>
											<div className="space-y-2">
												<Button variant="outline" className="w-full justify-start">
													<Phone className="w-4 h-4 mr-2" />
													+356 2123 4567
												</Button>
												<Button variant="outline" className="w-full justify-start">
													<Mail className="w-4 h-4 mr-2" />
													info@christianopropertymanagement.com
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Nearby Places */}
								<Card className="p-6 mt-6">
									<CardHeader className="px-0 pt-0">
										<CardTitle className="text-lg">Nearby Places</CardTitle>
									</CardHeader>
									<CardContent className="px-0 pb-0">
										<div className="space-y-3">
											{property.nearbyPlaces.map((place) => (
												<div key={place.name} className="flex items-center justify-between">
													<span className="text-sm text-gray-600">{place.name}</span>
													<Badge variant="secondary" className="text-xs">
														{place.distance}
													</Badge>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default PropertyDetail;
