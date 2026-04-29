export type StoreAppMeta = {
	id: string;
	name: string;
	artworkUrl512?: string;
};

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
