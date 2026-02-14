<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import {
		centsToAngle,
		centsToColorZone,
		describeArc,
		generateTickMarks,
		generateColorArcs,
		GAUGE_WIDTH,
		GAUGE_HEIGHT,
		GAUGE_CX,
		GAUGE_CY,
		GAUGE_RADIUS,
		ANGLE_MIN,
		ANGLE_MAX
	} from '$lib/tuner-geometry';

	interface Props {
		cents: number;
		stability: number;
		isDetecting: boolean;
		reducedMotion: boolean;
	}

	let { cents, stability, isDetecting, reducedMotion }: Props = $props();

	// Static geometry — computed once
	const ticks = generateTickMarks();
	const colorArcs = generateColorArcs();
	const backgroundArc = describeArc(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS, ANGLE_MIN, ANGLE_MAX);

	// Animated needle angle
	const needleAngle = tweened(0, {
		duration: 150,
		easing: cubicOut
	});

	// Update needle when cents changes
	$effect(() => {
		needleAngle.set(centsToAngle(cents), {
			duration: reducedMotion ? 0 : 150
		});
	});

	// Derived state
	let zone = $derived(centsToColorZone(cents));
	let showGlow = $derived(zone === 'green' && stability > 0.7 && isDetecting);
	let gaugeOpacity = $derived(isDetecting ? 0.8 : 0.15);

	// Needle endpoint (length slightly shorter than radius)
	const NEEDLE_LENGTH = 100;
	const NEEDLE_PIVOT_RADIUS = 6;
</script>

<svg
	viewBox="0 0 {GAUGE_WIDTH} {GAUGE_HEIGHT}"
	class="w-full max-w-[400px]"
	role="meter"
	aria-valuenow={cents}
	aria-valuemin={-50}
	aria-valuemax={50}
	aria-label="Tuning gauge"
	style="opacity: {gaugeOpacity}; transition: opacity {reducedMotion ? '0ms' : '300ms'} ease;"
>
	<!-- Green glow filter -->
	<defs>
		<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="4" result="blur" />
			<feMerge>
				<feMergeNode in="blur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>

	<!-- Background arc -->
	<path d={backgroundArc} fill="none" stroke="#2a2a24" stroke-width="3" stroke-linecap="round" />

	<!-- Color zone arcs -->
	{#each colorArcs as arc, i (i)}
		<path
			d={arc.d}
			fill="none"
			stroke={arc.color}
			stroke-width="4"
			stroke-linecap="round"
			opacity="0.6"
		/>
	{/each}

	<!-- Tick marks -->
	{#each ticks as tick (tick.cents)}
		<line
			x1={tick.x1}
			y1={tick.y1}
			x2={tick.x2}
			y2={tick.y2}
			stroke={tick.major ? '#9e9a90' : '#5c5a54'}
			stroke-width={tick.major ? 2 : 1}
			stroke-linecap="round"
		/>
	{/each}

	<!-- Flat / Sharp labels -->
	<text
		x="38"
		y="178"
		fill="#9e9a90"
		font-size="10"
		font-family="var(--font-body)"
		text-anchor="middle">Flat</text
	>
	<text
		x="262"
		y="178"
		fill="#9e9a90"
		font-size="10"
		font-family="var(--font-body)"
		text-anchor="middle">Sharp</text
	>

	<!-- Needle group -->
	<g
		transform="rotate({$needleAngle}, {GAUGE_CX}, {GAUGE_CY})"
		filter={showGlow ? 'url(#glow)' : undefined}
	>
		<!-- Needle line (tapered) -->
		<line
			x1={GAUGE_CX}
			y1={GAUGE_CY}
			x2={GAUGE_CX}
			y2={GAUGE_CY - NEEDLE_LENGTH}
			stroke={isDetecting ? '#d4a053' : '#5c5a54'}
			stroke-width="2.5"
			stroke-linecap="round"
		/>
		<!-- Needle tip (thinner) -->
		<line
			x1={GAUGE_CX}
			y1={GAUGE_CY - NEEDLE_LENGTH}
			x2={GAUGE_CX}
			y2={GAUGE_CY - NEEDLE_LENGTH - 15}
			stroke={isDetecting ? '#d4a053' : '#5c5a54'}
			stroke-width="1.5"
			stroke-linecap="round"
		/>
	</g>

	<!-- Pivot circle -->
	<circle
		cx={GAUGE_CX}
		cy={GAUGE_CY}
		r={NEEDLE_PIVOT_RADIUS}
		fill={isDetecting ? '#d4a053' : '#5c5a54'}
	/>

	<!-- Green glow pulse ring -->
	{#if showGlow}
		<circle
			cx={GAUGE_CX}
			cy={GAUGE_CY}
			r={NEEDLE_PIVOT_RADIUS + 4}
			fill="none"
			stroke="#5cb870"
			stroke-width="2"
			opacity="0.5"
		>
			{#if !reducedMotion}
				<animate
					attributeName="r"
					values="{NEEDLE_PIVOT_RADIUS + 4};{NEEDLE_PIVOT_RADIUS + 10};{NEEDLE_PIVOT_RADIUS + 4}"
					dur="1.5s"
					repeatCount="indefinite"
				/>
				<animate
					attributeName="opacity"
					values="0.5;0.15;0.5"
					dur="1.5s"
					repeatCount="indefinite"
				/>
			{/if}
		</circle>
	{/if}
</svg>
