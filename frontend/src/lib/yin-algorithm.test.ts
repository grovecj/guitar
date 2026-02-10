import { describe, it, expect } from 'vitest';
import { YinDetector } from './yin-algorithm';

const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 2048;

/** Generate a pure sine wave buffer at the given frequency. */
function sineBuffer(frequency: number, size: number, sampleRate: number): Float32Array {
	const buf = new Float32Array(size);
	for (let i = 0; i < size; i++) {
		buf[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
	}
	return buf;
}

describe('YinDetector', () => {
	it('detects A4 (440 Hz) within ±2 Hz', () => {
		const detector = new YinDetector(BUFFER_SIZE, { sampleRate: SAMPLE_RATE });
		const buffer = sineBuffer(440, BUFFER_SIZE, SAMPLE_RATE);
		const result = detector.detect(buffer);

		expect(result.frequency).not.toBeNull();
		expect(result.frequency!).toBeCloseTo(440, -1);
		expect(Math.abs(result.frequency! - 440)).toBeLessThan(2);
		expect(result.confidence).toBeGreaterThan(0.8);
	});

	it('detects E2 (82.41 Hz) — lowest guitar string', () => {
		const detector = new YinDetector(BUFFER_SIZE, {
			sampleRate: SAMPLE_RATE,
			minFrequency: 70
		});
		const buffer = sineBuffer(82.41, BUFFER_SIZE, SAMPLE_RATE);
		const result = detector.detect(buffer);

		expect(result.frequency).not.toBeNull();
		expect(Math.abs(result.frequency! - 82.41)).toBeLessThan(2);
		expect(result.confidence).toBeGreaterThan(0.8);
	});

	it('detects E4 (329.63 Hz) — highest open guitar string', () => {
		const detector = new YinDetector(BUFFER_SIZE, { sampleRate: SAMPLE_RATE });
		const buffer = sineBuffer(329.63, BUFFER_SIZE, SAMPLE_RATE);
		const result = detector.detect(buffer);

		expect(result.frequency).not.toBeNull();
		expect(Math.abs(result.frequency! - 329.63)).toBeLessThan(2);
	});

	it('returns null for silence', () => {
		const detector = new YinDetector(BUFFER_SIZE, { sampleRate: SAMPLE_RATE });
		const buffer = new Float32Array(BUFFER_SIZE); // all zeros
		const result = detector.detect(buffer);

		expect(result.frequency).toBeNull();
		expect(result.confidence).toBe(0);
	});

	it('returns null for white noise', () => {
		const detector = new YinDetector(BUFFER_SIZE, { sampleRate: SAMPLE_RATE });
		const buffer = new Float32Array(BUFFER_SIZE);
		for (let i = 0; i < BUFFER_SIZE; i++) {
			buffer[i] = Math.random() * 2 - 1;
		}
		const result = detector.detect(buffer);

		// Noise should either fail to detect or have very low confidence
		if (result.frequency !== null) {
			expect(result.confidence).toBeLessThan(0.5);
		}
	});

	it('is consistent across repeated calls with the same input', () => {
		const detector = new YinDetector(BUFFER_SIZE, { sampleRate: SAMPLE_RATE });
		const buffer = sineBuffer(196, BUFFER_SIZE, SAMPLE_RATE); // G3

		const r1 = detector.detect(buffer);
		const r2 = detector.detect(buffer);

		expect(r1.frequency).toEqual(r2.frequency);
		expect(r1.confidence).toEqual(r2.confidence);
	});

	it('detects all 6 open guitar strings', () => {
		const frequencies = [82.41, 110, 146.83, 196, 246.94, 329.63];

		for (const freq of frequencies) {
			const detector = new YinDetector(BUFFER_SIZE, {
				sampleRate: SAMPLE_RATE,
				minFrequency: 70
			});
			const buffer = sineBuffer(freq, BUFFER_SIZE, SAMPLE_RATE);
			const result = detector.detect(buffer);

			expect(result.frequency).not.toBeNull();
			expect(Math.abs(result.frequency! - freq)).toBeLessThan(3);
		}
	});
});
