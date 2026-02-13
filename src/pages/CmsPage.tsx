import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useCmsPage } from '@/hooks/use-cms';
import { Home } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'isomorphic-dompurify';

export default function CmsPage() {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const { data: page, isLoading, error } = useCmsPage(slug || '');

	useEffect(() => {
		if (page?.meta_title) {
			document.title = page.meta_title;
		} else if (page?.title) {
			document.title = `${page.title} | Christiano Vincenti Property Management`;
		}

		if (page?.meta_description) {
			const metaDescription = document.querySelector('meta[name="description"]');
			if (metaDescription) {
				metaDescription.setAttribute('content', page.meta_description);
			} else {
				const newMeta = document.createElement('meta');
				newMeta.setAttribute('name', 'description');
				newMeta.setAttribute('content', page.meta_description);
				document.head.appendChild(newMeta);
			}
		}
	}, [page]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</div>
		);
	}

	if (error || !page) {
		return (
			<div className="min-h-screen bg-background">
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
						<p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
						<Button onClick={() => navigate('/')}>
							<Home className="w-4 h-4 mr-2" />
							Back to Home
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (page.status !== 'published') {
		return (
			<div className="min-h-screen bg-background">
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Page Not Available</h1>
						<p className="text-muted-foreground mb-6">This page is not yet published.</p>
						<Button onClick={() => navigate('/')}>
							<Home className="w-4 h-4 mr-2" />
							Back to Home
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const renderPageContent = () => {
		const content = page.content as any;

		switch (page.template) {
			case 'landing':
				return (
					<div className="space-y-16">
						{content.hero && (
							<section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
								<div className="text-center max-w-4xl mx-auto px-6">
									<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
										{content.hero.headline}
									</h1>
									<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
										{content.hero.description}
									</p>
									{content.hero.cta && (
										<Button size="lg" className="text-lg px-8 py-4">
											{content.hero.cta.text}
										</Button>
									)}
								</div>
							</section>
						)}

						{content.features && (
							<section className="py-16">
								<div className="max-w-6xl mx-auto px-6">
									<h2 className="font-serif text-3xl font-bold text-center mb-12">
										{content.features.title}
									</h2>
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
										{content.features.items?.map((feature: any, index: number) => (
											<div key={index} className="text-center">
												<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
													<span className="text-2xl">{feature.icon}</span>
												</div>
												<h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
												<p className="text-muted-foreground">{feature.description}</p>
											</div>
										))}
									</div>
								</div>
							</section>
						)}
					</div>
				);

			case 'blog':
				return (
					<article className="max-w-4xl mx-auto px-6 py-12">
						<header className="mb-8">
							<h1 className="font-serif text-4xl font-bold text-foreground leading-tight mb-4">
								{page.title}
							</h1>
							{content.author && (
								<div className="flex items-center gap-4 text-muted-foreground">
									<span>By {content.author}</span>
									{content.publishedDate && (
										<span>• {new Date(content.publishedDate).toLocaleDateString()}</span>
									)}
								</div>
							)}
						</header>

						<div className="prose prose-lg max-w-none">
							{content.body && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.body) }} />}
						</div>
					</article>
				);

			case 'portfolio':
				return (
					<div className="max-w-7xl mx-auto px-6 py-12">
						<header className="text-center mb-12">
							<h1 className="font-serif text-4xl font-bold text-foreground leading-tight mb-4">
								{page.title}
							</h1>
							{content.subtitle && (
								<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
									{content.subtitle}
								</p>
							)}
						</header>

						{content.projects && (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{content.projects.map((project: any, index: number) => (
									<div key={index} className="group cursor-pointer">
										<div className="aspect-video bg-secondary rounded-lg mb-4 overflow-hidden">
											{project.image && (
												<img
													src={project.image}
													alt={project.title}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
												/>
											)}
										</div>
										<h3 className="text-xl font-semibold mb-2">{project.title}</h3>
										<p className="text-muted-foreground">{project.description}</p>
									</div>
								))}
							</div>
						)}
					</div>
				);

			default:
				return (
					<div className="max-w-4xl mx-auto px-6 py-12">
						<h1 className="font-serif text-4xl font-bold text-foreground leading-tight mb-8">
							{page.title}
						</h1>
						<div className="prose prose-lg max-w-none">
							{content.body && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.body) }} />}
							{content.sections?.map((section: any, index: number) => (
								<section key={index} className="mb-12">
									<h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
									<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }} />
								</section>
							))}
						</div>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<Navbar onOpenWizard={() => {}} />
			<main>{renderPageContent()}</main>
			<Footer />
		</div>
	);
}
