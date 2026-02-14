// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** SVG viewBox dimensions */
export const GAUGE_WIDTH = 300;
export const GAUGE_HEIGHT = 200;

/** Gauge arc center and radius */
export const GAUGE_CX = 150;
export const GAUGE_CY = 170;
export const GAUGE_RADIUS = 130;

/** Angle range: -135° (far left / -50 cents) to +135° (far right / +50 cents) */
export const ANGLE_MIN = -135;
export const ANGLE_MAX = 135;

/** Cents range */
export const CENTS_MIN = -50;
export const CENTS_MAX = 50;

/** Color zone thresholds (absolute cents) */
export const GREEN_THRESHOLD = 5;
export const YELLOW_THRESHOLD = 15;

/** Calibration range */
export const CALIBRATION_MIN = 420;
export const CALIBRATION_MAX = 460;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ColorZone = 'green' | 'yellow' | 'red';
export type Direction = 'flat' | 'sharp' | 'in-tune';

export interface TickMark {
	cents: number;
	angle: number;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	major: boolean;
}

export interface ArcSegment {
	d: string;
	color: string;
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/** Map cents offset (-50..+50) to gauge angle (-135..+135 degrees). Clamps to range. */
export function centsToAngle(cents: number): number {
	const clamped = Math.max(CENTS_MIN, Math.min(CENTS_MAX, cents));
	return (clamped / CENTS_MAX) * ANGLE_MAX;
}

/** Determine color zone from cents offset. */
export function centsToColorZone(cents: number): ColorZone {
	const abs = Math.abs(cents);
	if (abs <= GREEN_THRESHOLD) return 'green';
	if (abs <= YELLOW_THRESHOLD) return 'yellow';
	return 'red';
}

/** Determine tuning direction from cents offset. */
export function centsToDirection(cents: number): Direction {
	if (Math.abs(cents) <= GREEN_THRESHOLD) return 'in-tune';
	return cents < 0 ? 'flat' : 'sharp';
}

/** Convert polar coordinates (angle in degrees) to cartesian. 0° = up (12 o'clock). */
export function polarToCartesian(
	cx: number,
	cy: number,
	radius: number,
	angleDeg: number
): { x: number; y: number } {
	// Convert so that 0° points straight up, positive = clockwise
	const rad = ((angleDeg - 90) * Math.PI) / 180;
	return {
		x: cx + radius * Math.cos(rad),
		y: cy + radius * Math.sin(rad)
	};
}

/** Generate an SVG arc path `d` string between two angles (degrees). */
export function describeArc(
	cx: number,
	cy: number,
	radius: number,
	startAngle: number,
	endAngle: number
): string {
	const start = polarToCartesian(cx, cy, radius, startAngle);
	const end = polarToCartesian(cx, cy, radius, endAngle);
	const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
	const sweep = endAngle > startAngle ? 1 : 0;
	return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

/** Generate tick marks at every 5 cents, major ticks at -50, -25, 0, +25, +50. */
export function generateTickMarks(): TickMark[] {
	const majorCents = new Set([-50, -25, 0, 25, 50]);
	const ticks: TickMark[] = [];
	const innerRadius = GAUGE_RADIUS - 8;
	const innerRadiusMajor = GAUGE_RADIUS - 14;

	for (let cents = CENTS_MIN; cents <= CENTS_MAX; cents += 5) {
		const angle = centsToAngle(cents);
		const major = majorCents.has(cents);
		const outer = polarToCartesian(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS, angle);
		const inner = polarToCartesian(
			GAUGE_CX,
			GAUGE_CY,
			major ? innerRadiusMajor : innerRadius,
			angle
		);

		ticks.push({
			cents,
			angle,
			x1: inner.x,
			y1: inner.y,
			x2: outer.x,
			y2: outer.y,
			major
		});
	}

	return ticks;
}

/** Generate the 5 color arc segments: red–yellow–green–yellow–red. */
export function generateColorArcs(): ArcSegment[] {
	const arcRadius = GAUGE_RADIUS + 6;
	const green = '#5cb870';
	const yellow = '#d4a053';
	const red = '#c75450';

	// Boundary angles (cents → angle)
	const greenStart = centsToAngle(-GREEN_THRESHOLD);
	const greenEnd = centsToAngle(GREEN_THRESHOLD);
	const yellowLeftStart = centsToAngle(-YELLOW_THRESHOLD);
	const yellowRightEnd = centsToAngle(YELLOW_THRESHOLD);

	return [
		{ d: describeArc(GAUGE_CX, GAUGE_CY, arcRadius, ANGLE_MIN, yellowLeftStart), color: red },
		{ d: describeArc(GAUGE_CX, GAUGE_CY, arcRadius, yellowLeftStart, greenStart), color: yellow },
		{ d: describeArc(GAUGE_CX, GAUGE_CY, arcRadius, greenStart, greenEnd), color: green },
		{ d: describeArc(GAUGE_CX, GAUGE_CY, arcRadius, greenEnd, yellowRightEnd), color: yellow },
		{ d: describeArc(GAUGE_CX, GAUGE_CY, arcRadius, yellowRightEnd, ANGLE_MAX), color: red }
	];
}
