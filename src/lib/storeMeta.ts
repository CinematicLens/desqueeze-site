export type StoreAppMeta = {
	id: string;
	name: string;
	artworkUrl512?: string;
};

function decodeBasicEntities(s: string) {
	return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

/**
 * Read Open Graph title/image from a public store HTML page (build-time).
 */
export async function fetchOgMetaFromPage(url: string): Promise<{ title: string | null; image: string | null } | null> {
	const ua =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': ua, Accept: 'text/html,application/xhtml+xml' },
		});
		if (!res.ok) return null;
		const html = await res.text();
		const pick = (prop: string) => {
			const m1 = html.match(new RegExp(`<meta[^>]*\\sproperty=["']${prop}["'][^>]*\\scontent=["']([^"']+)["']`, 'i'));
			if (m1?.[1]) return decodeBasicEntities(m1[1]);
			const m2 = html.match(new RegExp(`<meta[^>]*\\scontent=["']([^"']+)["'][^>]*\\sproperty=["']${prop}["']`, 'i'));
			return m2?.[1] ? decodeBasicEntities(m2[1]) : null;
		};
		return { title: pick('og:title'), image: pick('og:image') };
	} catch {
		return null;
	}
}

/** Microsoft Store product detail page → listing name + hero image. */
export async function fetchMicrosoftStoreMetaFromDetailUrl(detailUrl: string): Promise<StoreAppMeta | null> {
	const og = await fetchOgMetaFromPage(detailUrl);
	if (!og?.title && !og?.image) return null;
	const name = (og.title || '')
		.replace(/\s*-\s*Download.*$/i, '')
		.replace(/\s*\|\s*Microsoft Store\s*$/i, '')
		.trim();
	return { id: 'ms-store', name, artworkUrl512: og.image || undefined };
}

export async function fetchAppStoreMeta(appId: string): Promise<StoreAppMeta | null> {
	try {
		const res = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}`, {
			headers: { Accept: 'application/json' },
		});
		if (!res.ok) return null;
		const json = await res.json();
		const first = json?.results?.[0];
		if (!first) return null;
		return {
			id: appId,
			name: String(first.trackName ?? ''),
			artworkUrl512: typeof first.artworkUrl512 === 'string' ? first.artworkUrl512 : undefined,
		};
	} catch {
		return null;
	}
}
