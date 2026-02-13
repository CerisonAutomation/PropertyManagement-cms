import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';
import { Logo } from './Logo';

export default function Footer() {
	return (
		<footer className="py-16 border-t border-border">
			<div className="section-container">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
					{/* Brand */}
					<div>
						<Logo size="sm" />
						<p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-xs">
							Full-service short-let property management across Malta & Gozo.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
							Quick Links
						</h4>
						<div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
							<a href="#process" className="hover:text-foreground transition-colors">
								How It Works
							</a>
							<a href="#portfolio" className="hover:text-foreground transition-colors">
								Portfolio
							</a>
							<a href="#pricing" className="hover:text-foreground transition-colors">
								Pricing
							</a>
							<a href="#faq" className="hover:text-foreground transition-colors">
								FAQ
							</a>
							<a href="#" className="hover:text-foreground transition-colors">
								Privacy Policy
							</a>
							<a href="#" className="hover:text-foreground transition-colors">
								Terms & Conditions
							</a>
						</div>
					</div>

					{/* Contact & Social */}
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
							Contact
						</h4>
						<div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
							<a
								href="mailto:info@Christianopm.com"
								className="flex items-center gap-2 hover:text-foreground transition-colors"
							>
								<Mail size={14} className="text-primary" /> info@Christianopm.com
							</a>
							<div className="flex items-start gap-2">
								<MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
								<span>The Fives A7, Triq Charles Sciberras, St Julian's, Malta</span>
							</div>
						</div>
						<div className="flex items-center gap-3 mt-4">
							<a
								href="https://facebook.com/Christianopropertymanagement"
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
								aria-label="Facebook"
							>
								<Facebook size={16} />
							</a>
							<a
								href="https://instagram.com/Christianopropertymanagement"
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
								aria-label="Instagram"
							>
								<Instagram size={16} />
							</a>
						</div>
					</div>
				</div>

				<div className="pt-8 border-t border-border/50 text-center">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} Christiano Property Management. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
