/** Header logo asset (`public/images/logo_for_dark_bg.png`). */
export const HEADER_LOGO_SRC = '/images/logo_for_dark_bg.png';

/** Logo for light theme header (`public/images/logo for light bg.png`). */
export const HEADER_LOGO_LIGHT_SRC = '/images/logo%20for%20light%20bg.png';

export const downloadAppsButtonClass =
	'inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-[18px] py-[10px] text-xs font-semibold text-black hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-border)]';

/** Desktop header nav: readable type + glass pill hover */
export const siteNavLinkClass =
	'rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-nav-idle)] transition-all duration-200 ease-out hover:bg-[var(--color-nav-hover-surface)] hover:text-[var(--color-text)] hover:shadow-[inset_0_0_0_1px_var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-border)]';

export const siteNavLinkActiveClass = `${siteNavLinkClass} bg-[var(--color-surface-strong)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_var(--color-border)]`;

export const siteNavMobileLinkClass =
	'rounded-lg px-3 py-2.5 text-base font-medium text-[var(--color-muted)] transition-colors duration-200 hover:bg-[var(--color-nav-hover-surface)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-border)]';

export const siteNavMobileLinkActiveClass = `${siteNavMobileLinkClass} bg-[var(--color-surface-strong)] text-[var(--color-text)] hover:text-[var(--color-text)]`;

export type SiteHeaderPage = 'home' | 'products' | 'guides' | 'try-live';

export type NavItem = { id: string; label: string; href: string };

/** Nav model for `SiteHeader`: home uses in-page hashes; inner pages use `/#…` where needed. */
export function getHeaderNav(page: SiteHeaderPage): { items: NavItem[]; activeId: string | null } {
	if (page === 'home') {
		return {
			activeId: 'home',
			items: [
				{ id: 'home', label: 'Home', href: '/' },
				{ id: 'try-live', label: 'Try Live', href: '/try-live' },
				{ id: 'products', label: 'Products', href: '/products' },
				{ id: 'guides', label: 'Guides', href: '/guides' },
				{ id: 'contact', label: 'Contact', href: '#contact' },
			],
		};
	}

	if (page === 'try-live') {
		return {
			activeId: 'try-live',
			items: [
				{ id: 'home', label: 'Home', href: '/' },
				{ id: 'try-live', label: 'Try Live', href: '/try-live' },
				{ id: 'products', label: 'Products', href: '/products' },
				{ id: 'guides', label: 'Guides', href: '/guides' },
				{ id: 'contact', label: 'Contact', href: '/#contact' },
			],
		};
	}

	if (page === 'guides') {
		return {
			activeId: 'guides',
			items: [
				{ id: 'home', label: 'Home', href: '/' },
				{ id: 'try-live', label: 'Try Live', href: '/try-live' },
				{ id: 'products', label: 'Products', href: '/products' },
				{ id: 'guides', label: 'Guides', href: '/guides' },
				{ id: 'contact', label: 'Contact', href: '/#contact' },
			],
		};
	}

	return {
		activeId: 'products',
		items: [
			{ id: 'home', label: 'Home', href: '/' },
			{ id: 'try-live', label: 'Try Live', href: '/try-live' },
			{ id: 'products', label: 'Products', href: '/products' },
			{ id: 'guides', label: 'Guides', href: '/guides' },
			{ id: 'contact', label: 'Contact', href: '/#contact' },
		],
	};
}

export function downloadAppsHref(page: SiteHeaderPage): string {
	return page === 'home' ? '#ecosystem' : '/#ecosystem';
}
