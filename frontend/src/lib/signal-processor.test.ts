import { describe, it, expect } from 'vitest';
import { SignalProcessor } from './signal-processor';

/** Create a buffer with a constant amplitude (simulates a tone). */
function toneBuffer(amplitude: number, size: number = 256): Float32Array {
	const buf = new Float32Array(size);
	for (let i = 0; i < size; i++) {
		buf[i] = amplitude * Math.sin((2 * Math.PI * 440 * i) / 44100);
	}
	return buf;
}

/** Silent buffer (all zeros). */
function silentBuffer(size: number = 256): Float32Array {
	return new Float32Array(size);
}

describe('SignalProcessor', () => {
	describe('rms', () => {
		it('returns 0 for silence', () => {
			const sp = new SignalProcessor();
			expect(sp.rms(silentBuffer())).toBe(0);
		});

		it('returns correct RMS for a known signal', () => {
			const buf = new Float32Array([1, -1, 1, -1]);
			const sp = new SignalProcessor();
			expect(sp.rms(buf)).toBeCloseTo(1, 5);
		});
	});

	describe('silence gating', () => {
		it('returns not-detecting for a silent buffer', () => {
			const sp = new SignalProcessor();
			const result = sp.process(440, 0.9, silentBuffer());
			expect(result.isDetecting).toBe(false);
			expect(result.frequency).toBeNull();
		});

		it('clears history on silence', () => {
			const sp = new SignalProcessor();
			const loud = toneBuffer(0.5);

			// Build up history
			for (let i = 0; i < 5; i++) {
				sp.process(440, 0.9, loud);
			}

			// Silence should reset
			sp.process(440, 0.9, silentBuffer());

			// Next real detection should have no stability (history cleared)
			const result = sp.process(440, 0.9, loud);
			expect(result.stability).toBe(0);
		});
	});

	describe('confidence filtering', () => {
		it('rejects low-confidence detections', () => {
			const sp = new SignalProcessor();
			const result = sp.process(440, 0.3, toneBuffer(0.5));
			expect(result.isDetecting).toBe(false);
		});

		it('accepts high-confidence detections', () => {
			const sp = new SignalProcessor();
			const result = sp.process(440, 0.9, toneBuffer(0.5));
			expect(result.isDetecting).toBe(true);
			expect(result.frequency).not.toBeNull();
		});
	});

	describe('frequency clamping', () => {
		it('rejects frequencies below guitar range (< 82 Hz)', () => {
			const sp = new SignalProcessor();
			const result = sp.process(50, 0.9, toneBuffer(0.5));
			expect(result.isDetecting).toBe(false);
			expect(result.frequency).toBeNull();
		});

		it('rejects frequencies above guitar range (> 660 Hz)', () => {
			const sp = new SignalProcessor();
			const result = sp.process(800, 0.9, toneBuffer(0.5));
			expect(result.isDetecting).toBe(false);
		});

		it('accepts frequencies within guitar range', () => {
			const sp = new SignalProcessor();
			const result = sp.process(440, 0.9, toneBuffer(0.5));
			expect(result.isDetecting).toBe(true);
		});
	});

	describe('median filtering', () => {
		it('smooths out a single outlier', () => {
			const sp = new SignalProcessor();
			const loud = toneBuffer(0.5);

			// Feed consistent 440 Hz detections
			for (let i = 0; i < 5; i++) {
				sp.process(440, 0.9, loud);
			}

			// One outlier
			sp.process(442, 0.9, loud);

			// Feed more 440s
			for (let i = 0; i < 5; i++) {
				sp.process(440, 0.9, loud);
			}

			const result = sp.process(440, 0.9, loud);
			// Median should be very close to 440
			expect(result.frequency).not.toBeNull();
			expect(Math.abs(result.frequency! - 440)).toBeLessThan(1);
		});
	});

	describe('stability', () => {
		it('returns 0 stability with fewer than 3 samples', () => {
			const sp = new SignalProcessor();
			const loud = toneBuffer(0.5);

			const r1 = sp.process(440, 0.9, loud);
			expect(r1.stability).toBe(0);

			const r2 = sp.process(440, 0.9, loud);
			expect(r2.stability).toBe(0);
		});

		it('returns high stability for consistent detections', () => {
			const sp = new SignalProcessor();
			const loud = toneBuffer(0.5);

			let result;
			for (let i = 0; i < 10; i++) {
				result = sp.process(440, 0.9, loud);
			}

			expect(result!.stability).toBeGreaterThan(0.9);
		});

		it('returns lower stability for varying detections', () => {
			const sp = new SignalProcessor();
			const loud = toneBuffer(0.5);

			let result;
			for (let i = 0; i < 10; i++) {
				// Alternate between 400 and 480 Hz — large variance
				const freq = i % 2 === 0 ? 400 : 480;
				result = sp.process(freq, 0.9, loud);
			}

			expect(result!.stability).toBeLessThan(0.5);
		});
	});

	describe('reset', () => {
		it('clears history so stability restarts at 0', () => {
			const sp = new SignalProcessor();
			const loud = toneBuffer(0.5);

			for (let i = 0; i < 10; i++) {
				sp.process(440, 0.9, loud);
			}

			sp.reset();

			const result = sp.process(440, 0.9, loud);
			expect(result.stability).toBe(0);
		});
	});

	describe('null frequency handling', () => {
		it('returns not-detecting for null raw frequency', () => {
			const sp = new SignalProcessor();
			const result = sp.process(null, 0, toneBuffer(0.5));
			expect(result.isDetecting).toBe(false);
			expect(result.frequency).toBeNull();
		});
	});
});
