/** Canonical production origin (no trailing slash). */
export const SITE_ORIGIN = 'https://anamorphic-desqueeze.com';

/** GA4 — override with `PUBLIC_GA_MEASUREMENT_ID` in `.env` if needed. */
export const GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID || 'G-6BFDRLKVZK';

/** Google AdSense publisher client (legacy site). */
export const ADSENSE_CLIENT = 'ca-pub-6348292037303976';

export const DEFAULT_KEYWORDS =
	'FilmStudio app, iPhone cinema camera, Anamorphic Desqueezer, CineLut Live Grade, live LUT grading, MacBook DIT, MediaUtility, anamorphic desqueeze iOS, 1.33x 2x desqueeze, cinemascope, filmmaking apps App Store';

export const HOME_DEFAULT_TITLE =
	'Anamorphic Desqueezer for iPhone — Live De-Squeeze & CinemaScope | DeSqueeze Studio';

export const HOME_DEFAULT_DESCRIPTION =
	'Anamorphic Desqueezer on iPhone: live de-squeeze, 1.33×–2× ratios, and CinemaScope export. Add FilmStudio, CineLut Live Grade, and other on-set tools when you need them.';

export const PRODUCTS_PAGE_TITLE = 'Film Suite Products — DeSqueeze Studio';

export const PRODUCTS_PAGE_DESCRIPTION =
	'Deep dives on FilmStudio, Anamorphic Desqueezer, and CineLut Live Grade — capture, de-squeeze, and live grade workflows for iPhone, iPad, and Mac.';

export function absUrl(path: string): string {
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_ORIGIN}${p}`;
}

export function defaultSoftwareLdJson(pageUrl: string, imageUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'DeSqueeze Studio — Filmmaker Apps (iOS, Mac, Web)',
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'iOS, iPadOS, macOS, Web Browser, Android, Windows',
		description:
			'Professional filmmaking tools on iOS and Mac: FilmStudio for anamorphic-oriented capture on iPhone and iPad; Anamorphic Desqueezer for precise de-squeeze ratios and export; CineLut Live Grade for live LUT grading and monitoring from camera via capture device on MacBook; MediaUtility for conversions and handoff; Document Management System for production documents. Free Web Studio for browser previews; Android and Windows builds also listed.',
		url: pageUrl,
		image: imageUrl,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		author: { '@type': 'Organization', name: 'DeSqueeze Studio' },
		inLanguage: ['en', 'ja'],
		areaServed: [
			'US',
			'GB',
			'JP',
			'KR',
			'AU',
			'CA',
			'IN',
			'MX',
			'BR',
			'EU',
			'AE',
			'SA',
			'QA',
			'BH',
			'KW',
			'OM',
			'EG',
			'JO',
			'LB',
			'TR',
			'DE',
			'FR',
			'ES',
			'IT',
			'NL',
			'PL',
			'RU',
			'SG',
			'MY',
			'TH',
			'ID',
			'PH',
		],
	};
}
