import { describe, it, expect } from 'vitest';
import { frequencyToNote, NOTE_NAMES, GUITAR_STANDARD_TUNING } from './music-theory';

describe('NOTE_NAMES', () => {
	it('has 12 notes starting with C', () => {
		expect(NOTE_NAMES).toHaveLength(12);
		expect(NOTE_NAMES[0]).toBe('C');
		expect(NOTE_NAMES[9]).toBe('A');
	});
});

describe('GUITAR_STANDARD_TUNING', () => {
	it('has 6 strings E2 A2 D3 G3 B3 E4', () => {
		expect(GUITAR_STANDARD_TUNING).toHaveLength(6);
		const names = GUITAR_STANDARD_TUNING.map((n) => `${n.name}${n.octave}`);
		expect(names).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
	});
});

describe('frequencyToNote', () => {
	it('identifies A4 = 440 Hz exactly', () => {
		const note = frequencyToNote(440);
		expect(note.name).toBe('A');
		expect(note.octave).toBe(4);
		expect(note.midi).toBe(69);
		expect(note.cents).toBe(0);
	});

	it('identifies middle C (C4 ≈ 261.63 Hz)', () => {
		const note = frequencyToNote(261.63);
		expect(note.name).toBe('C');
		expect(note.octave).toBe(4);
		expect(note.midi).toBe(60);
		expect(Math.abs(note.cents)).toBeLessThanOrEqual(1);
	});

	it('identifies E2 (low E string ≈ 82.41 Hz)', () => {
		const note = frequencyToNote(82.41);
		expect(note.name).toBe('E');
		expect(note.octave).toBe(2);
		expect(note.midi).toBe(40);
		expect(Math.abs(note.cents)).toBeLessThanOrEqual(1);
	});

	it('reports positive cents when sharp', () => {
		// Slightly above A4
		const note = frequencyToNote(445);
		expect(note.name).toBe('A');
		expect(note.cents).toBeGreaterThan(0);
	});

	it('reports negative cents when flat', () => {
		// Slightly below A4
		const note = frequencyToNote(435);
		expect(note.name).toBe('A');
		expect(note.cents).toBeLessThan(0);
	});

	it('handles A432 pitch center', () => {
		const note = frequencyToNote(432, 432);
		expect(note.name).toBe('A');
		expect(note.octave).toBe(4);
		expect(note.cents).toBe(0);
	});

	it('preserves original frequency in output', () => {
		const note = frequencyToNote(123.456);
		expect(note.frequency).toBe(123.456);
	});

	it('identifies all guitar open strings within ±1 cent', () => {
		const expected: [number, string, number][] = [
			[82.41, 'E', 2],
			[110.0, 'A', 2],
			[146.83, 'D', 3],
			[196.0, 'G', 3],
			[246.94, 'B', 3],
			[329.63, 'E', 4]
		];
		for (const [freq, name, octave] of expected) {
			const note = frequencyToNote(freq);
			expect(note.name).toBe(name);
			expect(note.octave).toBe(octave);
			expect(Math.abs(note.cents)).toBeLessThanOrEqual(1);
		}
	});
});
