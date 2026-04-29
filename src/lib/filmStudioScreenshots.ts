/**
 * FilmStudio UI screenshots from `src/images/FilmStudioAppScreenshots/`.
 * Same glob, filter, URL mapping, and numeric filename sort as legacy inline usage.
 */
export function loadFilmStudioScreenshots(): string[] {
	const filmStudioScreenshotUrls = import.meta.glob('../images/FilmStudioAppScreenshots/**/*', {
		eager: true,
		query: '?url',
		import: 'default',
	});

	return Object.entries(filmStudioScreenshotUrls)
		.filter(([path]) => /\.(png|jpe?g|webp)$/i.test(path) && !/manifest\.json$/i.test(path))
		.map(([, url]) => url)
		.filter((url) => url.length > 0)
		.sort((a, b) => {
			const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
			const baseA = a.split('?')[0].split('/').pop() ?? a;
			const baseB = b.split('?')[0].split('/').pop() ?? b;
			return collator.compare(baseA, baseB);
		});
}
