<script lang="ts">
	/**
	 * Inline Mexican flag. Windows browsers don't render the 🇲🇽 regional-indicator
	 * emoji, so this SVG is used anywhere the flag needs to appear reliably.
	 */
	let { size = 16, rounded = true }: { size?: number; rounded?: boolean } = $props();
</script>

<svg
	width={size}
	height={size * 0.64}
	viewBox="0 0 21 13"
	class={rounded ? 'rounded-[2px]' : ''}
	style="display:inline-block;vertical-align:-0.15em;flex-shrink:0"
	aria-hidden="true"
>
	<rect width="7" height="13" fill="#006847" />
	<rect x="7" width="7" height="13" fill="#ffffff" />
	<rect x="14" width="7" height="13" fill="#ce1126" />
	<circle cx="10.5" cy="6.5" r="2.1" fill="#9b6b2f" opacity="0.9" />
	<circle cx="10.5" cy="6.5" r="1.2" fill="#006847" opacity="0.75" />
</svg>
