const VOID_SVG_TAGS = new Set(['circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'use']);

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const lucideInner = (icon: [string, Record<string, unknown>][]) =>
	icon
		.map((node) => {
			const [tag, attrs] = node;
			const attrStr = Object.entries(attrs)
				.filter(([, v]) => v !== undefined)
				.map(([k, v]) => `${k}="${escapeAttr(String(v))}"`)
				.join(' ');
			if (VOID_SVG_TAGS.has(tag)) return `<${tag} ${attrStr} />`;
			return `<${tag} ${attrStr}></${tag}>`;
		})
		.join('');

export const lucideSvg = (icon: [string, Record<string, unknown>][], className: string, size: number) => {
	const inner = lucideInner(icon);
	const cls = escapeAttr(className.trim());
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${inner}</svg>`;
};
