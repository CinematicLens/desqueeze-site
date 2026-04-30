/**
 * Official store & hub URLs (anamorphic-desqueeze.com ecosystem).
 * Single source of truth — import from `../data/storeUrls` in pages/components.
 */
export const storeUrls = {
	filmStudioIos: 'https://apps.apple.com/us/app/filmstudio/id6761248370',
	/** CineSnap AI — cinematic photo editor (iPhone / iPad). */
	cineSnapIos: 'https://apps.apple.com/in/app/cinesnap-ai-photo-editor/id6764743916',
	anamorphicApple: 'https://apps.apple.com/us/app/anamorphicdesqueezer/id6757354068',
	mediaUtilityIos: 'https://apps.apple.com/us/app/mediautility/id6760351903',
	/** Same listing as iOS; Mac App Store (Apple Silicon) per Apple. */
	mediaUtilityMac: 'https://apps.apple.com/us/app/mediautility/id6760351903',
	cineLutMac: 'https://apps.apple.com/us/app/cinelutlivegrade/id6760215504?mt=12',
	dmsMac: 'https://apps.apple.com/us/app/document-management-system/id6761471161?mt=12',
	mediaUtilityHub: 'https://anamorphic-desqueeze.com/mediautility',
	androidDesqueeze: 'https://play.google.com/store/apps/details?id=com.squeezer.app&pcampaignid=web_share',
	androidProCam: 'https://play.google.com/store/apps/details?id=com.cinematiclens.desqueeze.live&pcampaignid=web_share',
	windowsPro: 'https://apps.microsoft.com/detail/9ph01d6pq8x3',
	/** DocRev Manager (Microsoft Store). */
	docRevWindows: 'https://apps.microsoft.com/detail/9MXR3WLMQ0G7?hl=en-US',
	/** CineSnap AI — cinematic photo editor (Microsoft Store). */
	cineSnapAiWindows: 'https://apps.microsoft.com/detail/9nhfh3t28l8l?hl=en-US',
	website: 'https://anamorphic-desqueeze.com',
} as const;

export type StoreUrls = typeof storeUrls;
