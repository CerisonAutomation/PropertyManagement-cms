// Advanced Content Schema - Combining best patterns from all major CMS platforms

import type { CMSSchema } from '@/types/cms';
import { createSchema } from './schema-builder';

// Create the complete CMS schema
export const cmsSchema: CMSSchema = createSchema()
	// Pages Collection (Strapi + Directus patterns)
	.collection('pages', 'Pages')
	.singular('Page')
	.description('Dynamic website pages with rich content blocks')
	.icon('document')
	.color('#6366f1')
	.sortable(true)
	.filterable(true)
	.searchable(true)
	.defaultSort('sort_order')
	.defaultLimit(25)
	.statusField('status')
	.field('title', 'text')
	.required()
	.maxLength(255)
	.build()
	.field('slug', 'slug')
	.slug('title')
	.unique()
	.build()
	.field('content', 'blocks')
	.blocks([
		'hero',
		'textBlock',
		'imageBlock',
		'features',
		'stats',
		'cta',
		'testimonials',
		'gallery',
	])
	.build()
	.field('template', 'select')
	.select([
		{ value: 'default', label: 'Default' },
		{ value: 'landing', label: 'Landing Page' },
		{ value: 'blog', label: 'Blog Post' },
		{ value: 'portfolio', label: 'Portfolio' },
		{ value: 'contact', label: 'Contact Page' },
	])
	.default('default')
	.build()
	.field('status', 'select')
	.select([
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' },
		{ value: 'archived', label: 'Archived' },
	])
	.default('draft')
	.build()
	.field('sort_order', 'number')
	.default(0)
	.build()
	.field('seo_title', 'text')
	.maxLength(60)
	.build()
	.field('seo_description', 'textarea')
	.maxLength(160)
	.build()
	.field('meta_image', 'image')
	.build()
	.field('published_at', 'datetime')
	.build()
	.build()

	// Blog Posts Collection (Payload + Sanity patterns)
	.collection('blog_posts', 'Blog Posts')
	.singular('Blog Post')
	.description('Blog articles with rich text and media')
	.icon('article')
	.color('#10b981')
	.field('title', 'text')
	.required()
	.maxLength(255)
	.build()
	.field('slug', 'slug')
	.slug('title')
	.unique()
	.build()
	.field('content', 'richtext')
	.build()
	.field('excerpt', 'textarea')
	.maxLength(500)
	.build()
	.field('featured_image', 'image')
	.build()
	.field('author', 'relation')
	.relation('users')
	.build()
	.field('category', 'relation')
	.relation('blog_categories')
	.build()
	.field('tags', 'multiselect')
	.multiselect([
		{ value: 'PropertyManagement', label: 'Property Management' },
		{ value: 'malta', label: 'Malta' },
		{ value: 'investment', label: 'Investment' },
		{ value: 'hospitality', label: 'Hospitality' },
		{ value: 'market-trends', label: 'Market Trends' },
	])
	.build()
	.field('reading_time', 'number')
	.build()
	.field('status', 'select')
	.select([
		{ value: 'draft', label: 'draft' },
		{ value: 'published', label: 'published' },
	])
	.default('draft')
	.build()
	.field('published_at', 'datetime')
	.build()
	.field('seo_title', 'text')
	.maxLength(60)
	.build()
	.field('seo_description', 'textarea')
	.maxLength(160)
	.build()
	.build()

	// Properties Collection (Real estate specific)
	.collection('properties', 'Properties')
	.singular('Property')
	.description('Property listings with detailed information')
	.icon('home')
	.color('#f59e0b')
	.field('name', 'text')
	.required()
	.build()
	.field('slug', 'slug')
	.slug('name')
	.unique()
	.build()
	.field('description', 'richtext')
	.build()
	.field('type', 'select')
	.select([
		{ value: 'apartment', label: 'Apartment' },
		{ value: 'villa', label: 'Villa' },
		{ value: 'penthouse', label: 'Penthouse' },
		{ value: 'townhouse', label: 'Townhouse' },
		{ value: 'bungalow', label: 'Bungalow' },
	])
	.required()
	.build()
	.field('location', 'component')
	.component('location')
	.build()
	.field('features', 'multiselect')
	.multiselect([
		{ value: 'pool', label: 'Swimming Pool' },
		{ value: 'sea-view', label: 'Sea View' },
		{ value: 'garden', label: 'Garden' },
		{ value: 'parking', label: 'Parking' },
		{ value: 'aircon', label: 'Air Conditioning' },
		{ value: 'furnished', label: 'Furnished' },
		{ value: 'elevator', label: 'Elevator' },
	])
	.build()
	.field('bedrooms', 'number')
	.build()
	.field('bathrooms', 'number')
	.build()
	.field('area', 'number')
	.build()
	.field('price', 'number')
	.build()
	.field('currency', 'select')
	.select([
		{ value: 'EUR', label: 'EUR' },
		{ value: 'USD', label: 'USD' },
		{ value: 'GBP', label: 'GBP' },
	])
	.default('EUR')
	.build()
	.field('images', 'component')
	.component('gallery')
	.build()
	.field('status', 'select')
	.select([
		{ value: 'available', label: 'Available' },
		{ value: 'rented', label: 'Rented' },
		{ value: 'maintenance', label: 'Under Maintenance' },
	])
	.default('available')
	.build()
	.build()

	// Components (Payload-inspired)
	.component('location', 'Location')
	.description('Location information with coordinates')
	.icon('location')
	.field('address', 'text')
	.required()
	.build()
	.field('city', 'text')
	.required()
	.build()
	.field('country', 'text')
	.required()
	.build()
	.field('postal_code', 'text')
	.build()
	.field('coordinates', 'json')
	.build()
	.build()

	.component('gallery', 'Gallery')
	.description('Image gallery with captions')
	.icon('images')
	.field('images', 'component')
	.component('gallery_item')
	.build()
	.build()

	.component('gallery_item', 'Gallery Item')
	.description('Single gallery image with caption')
	.field('image', 'image')
	.required()
	.build()
	.field('caption', 'text')
	.build()
	.field('alt_text', 'text')
	.build()
	.build()

	// Blocks (Sanity-inspired)
	.block('hero', 'Hero Section')
	.description('Main hero section with headline and CTA')
	.icon('star')
	.field('headline', 'text')
	.required()
	.build()
	.field('subheadline', 'text')
	.build()
	.field('description', 'textarea')
	.build()
	.field('background_image', 'image')
	.build()
	.field('cta_text', 'text')
	.build()
	.field('cta_link', 'url')
	.build()
	.field('cta_style', 'select')
	.select([
		{ value: 'primary', label: 'Primary' },
		{ value: 'secondary', label: 'Secondary' },
		{ value: 'outline', label: 'Outline' },
	])
	.default('primary')
	.build()
	.build()

	.block('textBlock', 'Text Block')
	.description('Rich text content block')
	.icon('text')
	.field('title', 'text')
	.build()
	.field('content', 'richtext')
	.required()
	.build()
	.field('alignment', 'select')
	.select([
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' },
	])
	.default('left')
	.build()
	.build()

	.block('imageBlock', 'Image Block')
	.description('Image with optional caption and alignment')
	.icon('image')
	.field('image', 'image')
	.required()
	.build()
	.field('caption', 'text')
	.build()
	.field('alt_text', 'text')
	.build()
	.field('width', 'select')
	.select([
		{ value: 'full', label: 'Full Width' },
		{ value: 'large', label: 'Large' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'small', label: 'Small' },
	])
	.default('large')
	.build()
	.build()

	.block('features', 'Features Grid')
	.description('Grid of feature items with icons')
	.icon('grid')
	.field('title', 'text')
	.build()
	.field('subtitle', 'text')
	.build()
	.field('items', 'component')
	.component('feature_item')
	.build()
	.field('columns', 'select')
	.select([
		{ value: '2', label: '2 Columns' },
		{ value: '3', label: '3 Columns' },
		{ value: '4', label: '4 Columns' },
	])
	.default('3')
	.build()
	.build()

	.component('feature_item', 'Feature Item')
	.description('Single feature item')
	.field('icon', 'text')
	.build()
	.field('title', 'text')
	.required()
	.build()
	.field('description', 'textarea')
	.required()
	.build()
	.build()

	.block('stats', 'Statistics')
	.description('Statistics grid with numbers')
	.icon('bar-chart')
	.field('title', 'text')
	.build()
	.field('items', 'component')
	.component('stat_item')
	.build()
	.build()

	.component('stat_item', 'Stat Item')
	.description('Single statistic')
	.field('value', 'text')
	.required()
	.build()
	.field('label', 'text')
	.required()
	.build()
	.build()

	.block('cta', 'Call to Action')
	.description('Call to action section')
	.icon('megaphone')
	.field('title', 'text')
	.required()
	.build()
	.field('description', 'textarea')
	.build()
	.field('button_text', 'text')
	.required()
	.build()
	.field('button_link', 'url')
	.required()
	.build()
	.field('style', 'select')
	.select([
		{ value: 'primary', label: 'Primary' },
		{ value: 'secondary', label: 'Secondary' },
		{ value: 'gradient', label: 'Gradient' },
	])
	.default('primary')
	.build()
	.build()

	.block('testimonials', 'Testimonials')
	.description('Customer testimonials')
	.icon('quote')
	.field('title', 'text')
	.build()
	.field('items', 'component')
	.component('testimonial_item')
	.build()
	.build()

	.component('testimonial_item', 'Testimonial Item')
	.description('Single testimonial')
	.field('name', 'text')
	.required()
	.build()
	.field('role', 'text')
	.build()
	.field('company', 'text')
	.build()
	.field('content', 'textarea')
	.required()
	.build()
	.field('avatar', 'image')
	.build()
	.field('rating', 'number')
	.default(5)
	.build()
	.build()

	.block('gallery', 'Image Gallery')
	.description('Gallery block with multiple images')
	.icon('images')
	.field('title', 'text')
	.build()
	.field('images', 'component')
	.component('gallery_item')
	.build()
	.field('layout', 'select')
	.select([
		{ value: 'grid', label: 'Grid' },
		{ value: 'masonry', label: 'Masonry' },
		{ value: 'carousel', label: 'Carousel' },
	])
	.default('grid')
	.build()
	.build()

	// Settings Collection (Directus-inspired)
	.collection('settings', 'Settings')
	.singular('Setting')
	.description('Global site settings')
	.icon('settings')
	.field('key', 'text')
	.required()
	.unique()
	.build()
	.field('value', 'json')
	.required()
	.build()
	.field('group', 'text')
	.build()
	.build()

	// Users Collection (Enhanced)
	.collection('users', 'Users')
	.singular('User')
	.description('System users with roles and permissions')
	.icon('users')
	.field('first_name', 'text')
	.required()
	.build()
	.field('last_name', 'text')
	.required()
	.build()
	.field('email', 'email')
	.required()
	.unique()
	.build()
	.field('password', 'password')
	.required()
	.build()
	.field('role', 'select')
	.select([
		{ value: 'admin', label: 'Administrator' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'author', label: 'Author' },
		{ value: 'viewer', label: 'Viewer' },
	])
	.default('viewer')
	.build()
	.field('avatar', 'image')
	.build()
	.field('bio', 'textarea')
	.build()
	.field('status', 'select')
	.select([
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'suspended', label: 'Suspended' },
	])
	.default('active')
	.build()
	.field('last_login', 'datetime')
	.build()
	.build()

	.build();

// Export schema for use in the application
export default cmsSchema;
