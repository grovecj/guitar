import { describe, it, expect } from 'vitest';
import {
	centsToAngle,
	centsToColorZone,
	centsToDirection,
	polarToCartesian,
	generateTickMarks,
	describeArc,
	ANGLE_MAX,
	ANGLE_MIN,
	GREEN_THRESHOLD,
	YELLOW_THRESHOLD
} from './tuner-geometry';

describe('centsToAngle', () => {
	it('maps 0 cents to 0 degrees', () => {
		expect(centsToAngle(0)).toBe(0);
	});

	it('maps -50 cents to -135 degrees', () => {
		expect(centsToAngle(-50)).toBe(ANGLE_MIN);
	});

	it('maps +50 cents to +135 degrees', () => {
		expect(centsToAngle(50)).toBe(ANGLE_MAX);
	});

	it('clamps values beyond -50', () => {
		expect(centsToAngle(-100)).toBe(ANGLE_MIN);
	});

	it('clamps values beyond +50', () => {
		expect(centsToAngle(100)).toBe(ANGLE_MAX);
	});

	it('is linear — 25 cents maps to half the max angle', () => {
		expect(centsToAngle(25)).toBe(ANGLE_MAX / 2);
		expect(centsToAngle(-25)).toBe(ANGLE_MIN / 2);
	});
});

describe('centsToColorZone', () => {
	it('returns green at 0 cents', () => {
		expect(centsToColorZone(0)).toBe('green');
	});

	it('returns green at boundary (±5 cents)', () => {
		expect(centsToColorZone(GREEN_THRESHOLD)).toBe('green');
		expect(centsToColorZone(-GREEN_THRESHOLD)).toBe('green');
	});

	it('returns yellow just outside green zone', () => {
		expect(centsToColorZone(GREEN_THRESHOLD + 1)).toBe('yellow');
		expect(centsToColorZone(-(GREEN_THRESHOLD + 1))).toBe('yellow');
	});

	it('returns yellow at yellow boundary (±15 cents)', () => {
		expect(centsToColorZone(YELLOW_THRESHOLD)).toBe('yellow');
		expect(centsToColorZone(-YELLOW_THRESHOLD)).toBe('yellow');
	});

	it('returns red outside yellow zone', () => {
		expect(centsToColorZone(YELLOW_THRESHOLD + 1)).toBe('red');
		expect(centsToColorZone(-(YELLOW_THRESHOLD + 1))).toBe('red');
	});

	it('returns red at extremes', () => {
		expect(centsToColorZone(50)).toBe('red');
		expect(centsToColorZone(-50)).toBe('red');
	});
});

describe('centsToDirection', () => {
	it('returns in-tune at 0 cents', () => {
		expect(centsToDirection(0)).toBe('in-tune');
	});

	it('returns in-tune within green threshold', () => {
		expect(centsToDirection(GREEN_THRESHOLD)).toBe('in-tune');
		expect(centsToDirection(-GREEN_THRESHOLD)).toBe('in-tune');
	});

	it('returns flat for negative cents beyond threshold', () => {
		expect(centsToDirection(-10)).toBe('flat');
		expect(centsToDirection(-50)).toBe('flat');
	});

	it('returns sharp for positive cents beyond threshold', () => {
		expect(centsToDirection(10)).toBe('sharp');
		expect(centsToDirection(50)).toBe('sharp');
	});
});

describe('polarToCartesian', () => {
	it('0° (straight up) returns point directly above center', () => {
		const { x, y } = polarToCartesian(150, 170, 100, 0);
		expect(x).toBeCloseTo(150, 5);
		expect(y).toBeCloseTo(70, 5);
	});

	it('90° (right) returns point to the right of center', () => {
		const { x, y } = polarToCartesian(150, 170, 100, 90);
		expect(x).toBeCloseTo(250, 5);
		expect(y).toBeCloseTo(170, 5);
	});

	it('-90° (left) returns point to the left of center', () => {
		const { x, y } = polarToCartesian(150, 170, 100, -90);
		expect(x).toBeCloseTo(50, 5);
		expect(y).toBeCloseTo(170, 5);
	});
});

describe('generateTickMarks', () => {
	const ticks = generateTickMarks();

	it('generates 21 ticks (every 5 cents from -50 to +50)', () => {
		expect(ticks).toHaveLength(21);
	});

	it('has 5 major ticks at -50, -25, 0, +25, +50', () => {
		const majorTicks = ticks.filter((t) => t.major);
		expect(majorTicks).toHaveLength(5);
		expect(majorTicks.map((t) => t.cents)).toEqual([-50, -25, 0, 25, 50]);
	});

	it('tick coordinates are valid numbers', () => {
		for (const tick of ticks) {
			expect(tick.x1).toBeTypeOf('number');
			expect(tick.y1).toBeTypeOf('number');
			expect(tick.x2).toBeTypeOf('number');
			expect(tick.y2).toBeTypeOf('number');
			expect(Number.isFinite(tick.x1)).toBe(true);
			expect(Number.isFinite(tick.y1)).toBe(true);
		}
	});
});

describe('describeArc', () => {
	it('returns a valid SVG path string', () => {
		const d = describeArc(150, 170, 130, -45, 45);
		expect(d).toMatch(/^M [\d.]+ [\d.]+ A 130 130 0 [01] [01] [\d.]+ [\d.]+$/);
	});

	it('starts and ends at different points for non-zero arcs', () => {
		const d = describeArc(150, 170, 130, -90, 90);
		const parts = d.split(' ');
		const startX = parseFloat(parts[1]);
		const endX = parseFloat(parts[parts.length - 2]);
		expect(startX).not.toBeCloseTo(endX, 0);
	});
});
