/** Header logo asset (`public/images/logo_for_dark_bg.png`). */
export const HEADER_LOGO_SRC = '/images/logo_for_dark_bg.png';

export const downloadAppsButtonClass =
	'inline-flex items-center justify-center rounded-full bg-[#FF7A1A] px-[18px] py-[10px] text-xs font-semibold text-white hover:bg-[#ff8f3d] focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/50';

/** Desktop header nav: readable type + glass pill hover */
export const siteNavLinkClass =
	'rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:bg-white/[0.09] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]/45';

export const siteNavLinkActiveClass = `${siteNavLinkClass} bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]`;

export const siteNavMobileLinkClass =
	'rounded-lg px-3 py-2.5 text-base font-medium text-white/85 transition-colors duration-200 hover:bg-white/[0.08] hover:text-[#FF7A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]/45';

export const siteNavMobileLinkActiveClass = `${siteNavMobileLinkClass} bg-white/[0.08] text-white hover:text-white`;

export type SiteHeaderPage = 'home' | 'products' | 'guides';

export type NavItem = { id: string; label: string; href: string };

/** Nav model for `SiteHeader`: home uses in-page hashes; inner pages use `/#…` where needed. */
export function getHeaderNav(page: SiteHeaderPage): { items: NavItem[]; activeId: string | null } {
	if (page === 'home') {
		return {
			activeId: 'home',
			items: [
				{ id: 'home', label: 'Home', href: '/' },
				{ id: 'suite', label: 'Film Suite', href: '#suite' },
				{ id: 'products', label: 'Products', href: '/products' },
				{ id: 'guides', label: 'Guides', href: '/guides' },
				{ id: 'features', label: 'Features', href: '#features' },
				{ id: 'before-after', label: 'See It Live', href: '#before-after' },
				{ id: 'faq', label: 'FAQ', href: '#faq' },
				{ id: 'contact', label: 'Contact', href: '#contact' },
			],
		};
	}

	if (page === 'guides') {
		return {
			activeId: 'guides',
			items: [
				{ id: 'home', label: 'Home', href: '/' },
				{ id: 'suite', label: 'Film Suite', href: '/#suite' },
				{ id: 'products', label: 'Products', href: '/products' },
				{ id: 'guides', label: 'Guides', href: '/guides' },
				{ id: 'features', label: 'Features', href: '/#features' },
				{ id: 'before-after', label: 'See It Live', href: '/#before-after' },
				{ id: 'faq', label: 'FAQ', href: '/#faq' },
				{ id: 'contact', label: 'Contact', href: '/#contact' },
			],
		};
	}

	return {
		activeId: 'products',
		items: [
			{ id: 'home', label: 'Home', href: '/' },
			{ id: 'suite', label: 'Film Suite', href: '/#suite' },
			{ id: 'products', label: 'Products', href: '/products' },
			{ id: 'guides', label: 'Guides', href: '/guides' },
			{ id: 'features', label: 'Features', href: '/#features' },
			{ id: 'before-after', label: 'See It Live', href: '/#before-after' },
			{ id: 'faq', label: 'FAQ', href: '/#faq' },
			{ id: 'contact', label: 'Contact', href: '/#contact' },
		],
	};
}

export function downloadAppsHref(page: SiteHeaderPage): string {
	return page === 'home' ? '#suite' : '/#suite';
}
