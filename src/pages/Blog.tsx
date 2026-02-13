import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Clock, Heart, MessageCircle, Search, User } from 'lucide-react';
import { useMemo, useState } from 'react';

const Blog = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [selectedTag, setSelectedTag] = useState('all');

	// Sample blog posts data
	const blogPosts = [
		{
			id: 1,
			title: 'Maximizing Your Rental Income: A Complete Guide for Malta Property Owners',
			excerpt:
				"Discover proven strategies to increase your property's rental income by up to 40% through dynamic pricing, professional staging, and strategic marketing.",
			content: 'Full article content would go here...',
			author: 'Christiano',
			authorAvatar: '/api/placeholder/40/40',
			publishDate: '2024-10-15',
			readTime: '8 min read',
			category: 'Property Management',
			tags: ['Rental Income', 'Pricing Strategy', 'Marketing'],
			image: '/api/placeholder/600/400',
			featured: true,
			views: 1234,
			likes: 89,
			comments: 12,
		},
		{
			id: 2,
			title: 'The Ultimate Guest Welcome: Creating 5-Star First Impressions',
			excerpt:
				'Learn how to create memorable welcome experiences that lead to glowing reviews and repeat bookings for your Malta property.',
			content: 'Full article content would go here...',
			author: 'Sarah',
			authorAvatar: '/api/placeholder/40/40',
			publishDate: '2024-10-10',
			readTime: '6 min read',
			category: 'Guest Experience',
			tags: ['Guest Experience', 'Reviews', 'Hospitality'],
			image: '/api/placeholder/600/400',
			featured: true,
			views: 892,
			likes: 67,
			comments: 8,
		},
		{
			id: 3,
			title: "Malta's Top 5 Neighborhoods for Short-Term Rentals in 2024",
			excerpt:
				'An in-depth analysis of the most profitable areas for short-term rentals in Malta, including occupancy rates and average nightly prices.',
			content: 'Full article content would go here...',
			author: 'Michael',
			authorAvatar: '/api/placeholder/40/40',
			publishDate: '2024-10-05',
			readTime: '10 min read',
			category: 'Market Analysis',
			tags: ['Malta', 'Neighborhoods', 'Market Trends'],
			image: '/api/placeholder/600/400',
			featured: false,
			views: 2156,
			likes: 145,
			comments: 23,
		},
		{
			id: 4,
			title: 'Essential Maintenance Checklist for Property Owners',
			excerpt:
				"Keep your property in top condition with our comprehensive maintenance checklist designed for Malta's climate and rental requirements.",
			content: 'Full article content would go here...',
			author: 'Elena',
			authorAvatar: '/api/placeholder/40/40',
			publishDate: '2024-09-28',
			readTime: '7 min read',
			category: 'Maintenance',
			tags: ['Maintenance', 'Checklist', 'Property Care'],
			image: '/api/placeholder/600/400',
			featured: false,
			views: 743,
			likes: 52,
			comments: 5,
		},
		{
			id: 5,
			title: 'Legal Requirements for Short-Term Rentals in Malta: 2024 Update',
			excerpt:
				'Stay compliant with the latest regulations for short-term rentals in Malta, including licensing, taxes, and safety requirements.',
			content: 'Full article content would go here...',
			author: 'Christiano',
			authorAvatar: '/api/placeholder/40/40',
			publishDate: '2024-09-20',
			readTime: '12 min read',
			category: 'Legal & Compliance',
			tags: ['Legal', 'Compliance', 'Licensing'],
			image: '/api/placeholder/600/400',
			featured: false,
			views: 1876,
			likes: 98,
			comments: 15,
		},
		{
			id: 6,
			title: 'Professional Photography: How to Make Your Property Stand Out',
			excerpt:
				'Tips and tricks for capturing stunning photos that attract more bookings and justify premium rates for your rental property.',
			content: 'Full article content would go here...',
			author: 'Elena',
			authorAvatar: '/api/placeholder/40/40',
			publishDate: '2024-09-15',
			readTime: '5 min read',
			category: 'Marketing',
			tags: ['Photography', 'Marketing', 'Staging'],
			image: '/api/placeholder/600/400',
			featured: false,
			views: 654,
			likes: 41,
			comments: 3,
		},
	];

	const categories = [
		'all',
		'Property Management',
		'Guest Experience',
		'Market Analysis',
		'Maintenance',
		'Legal & Compliance',
		'Marketing',
	];
	const popularTags = [
		'Rental Income',
		'Malta',
		'Guest Experience',
		'Legal',
		'Marketing',
		'Maintenance',
	];

	const filteredPosts = useMemo(() => {
		return blogPosts.filter((post) => {
			const matchesSearch =
				post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
				post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
			const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
			const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);

			return matchesSearch && matchesCategory && matchesTag;
		});
	}, [blogPosts, searchTerm, selectedCategory, selectedTag]);

	const featuredPosts = blogPosts.filter((post) => post.featured);
	const regularPosts = filteredPosts.filter((post) => !post.featured);

	const BlogCard = ({ post, featured = false }: { post: any; featured?: boolean }) => (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -5 }}
			className={`group cursor-pointer ${featured ? 'lg:col-span-2' : ''}`}
		>
			<Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
				<div className={`relative ${featured ? 'h-64' : 'h-48'}`}>
					<img
						src={post.image}
						alt={post.title}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
					<div className="absolute top-4 left-4">
						<Badge className="bg-primary text-white">{post.category}</Badge>
					</div>
					{post.featured && (
						<div className="absolute top-4 right-4">
							<Badge className="bg-yellow-500 text-white">Featured</Badge>
						</div>
					)}
				</div>
				<CardContent className="p-6">
					<div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
						<div className="flex items-center gap-1">
							<Calendar className="w-4 h-4" />
							{new Date(post.publishDate).toLocaleDateString()}
						</div>
						<div className="flex items-center gap-1">
							<Clock className="w-4 h-4" />
							{post.readTime}
						</div>
						<div className="flex items-center gap-1">
							<User className="w-4 h-4" />
							{post.author}
						</div>
					</div>

					<h3
						className={`font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}
					>
						{post.title}
					</h3>

					<p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>

					<div className="flex flex-wrap gap-2 mb-4">
						{post.tags.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4 text-sm text-gray-500">
							<div className="flex items-center gap-1">
								<Heart className="w-4 h-4" />
								{post.likes}
							</div>
							<div className="flex items-center gap-1">
								<MessageCircle className="w-4 h-4" />
								{post.comments}
							</div>
							<div className="flex items-center gap-1">
								<span>{post.views} views</span>
							</div>
						</div>
						<Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
							Read More
							<ChevronRight className="w-4 h-4 ml-1" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);

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
								Resources & Insights
							</Badge>
							<h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
								Property Management Blog
							</h1>
							<p className="text-xl text-gray-600 leading-relaxed">
								Expert tips, market insights, and best practices for maximizing your property's
								potential in Malta's competitive rental market.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Search and Filters */}
				<section className="py-8 border-b border-gray-200">
					<div className="section-container">
						<div className="grid md:grid-cols-4 gap-4">
							<div className="relative md:col-span-2">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search articles..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>

							<Select value={selectedCategory} onValueChange={setSelectedCategory}>
								<SelectTrigger>
									<SelectValue placeholder="Category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category === 'all' ? 'All Categories' : category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={selectedTag} onValueChange={setSelectedTag}>
								<SelectTrigger>
									<SelectValue placeholder="Tags" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Tags</SelectItem>
									{popularTags.map((tag) => (
										<SelectItem key={tag} value={tag}>
											{tag}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</section>

				{/* Featured Posts */}
				{featuredPosts.length > 0 && (
					<section className="py-16">
						<div className="section-container">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="mb-8"
							>
								<h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">
									Featured Articles
								</h2>
								<p className="text-gray-600">Hand-picked content to help you succeed</p>
							</motion.div>
							<div className="grid lg:grid-cols-2 gap-8">
								{featuredPosts.map((post) => (
									<BlogCard key={post.id} post={post} featured />
								))}
							</div>
						</div>
					</section>
				)}

				{/* Recent Posts */}
				<section className="py-16 bg-gray-50">
					<div className="section-container">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-8"
						>
							<h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">Recent Articles</h2>
							<p className="text-gray-600">Latest insights and tips for property owners</p>
						</motion.div>

						{regularPosts.length > 0 ? (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{regularPosts.map((post) => (
									<BlogCard key={post.id} post={post} />
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => {
										setSearchTerm('');
										setSelectedCategory('all');
										setSelectedTag('all');
									}}
								>
									Clear Filters
								</Button>
							</div>
						)}

						{/* Load More */}
						{regularPosts.length > 0 && (
							<div className="text-center mt-12">
								<Button variant="outline" size="lg">
									Load More Articles
								</Button>
							</div>
						)}
					</div>
				</section>

				{/* Newsletter Section */}
				<section className="py-20 bg-primary text-white">
					<div className="section-container text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="max-w-3xl mx-auto"
						>
							<h2 className="font-serif text-3xl font-bold mb-6">
								Stay Updated with Latest Insights
							</h2>
							<p className="text-xl mb-8 opacity-90">
								Get weekly tips, market updates, and exclusive content delivered to your inbox.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
								<Input
									type="email"
									placeholder="Enter your email"
									className="bg-white/10 border-white/20 text-white placeholder-white/70"
								/>
								<Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
									Subscribe
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

export default Blog;
