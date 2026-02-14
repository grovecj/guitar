import { describe, it, expect } from 'vitest';
import {
	frequencyToNote,
	NOTE_NAMES,
	GUITAR_STANDARD_TUNING,
	TUNING_PRESETS,
	findClosestString
} from './music-theory';

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

describe('TUNING_PRESETS', () => {
	it('has 6 presets', () => {
		expect(TUNING_PRESETS).toHaveLength(6);
	});

	it('each preset has 6 strings', () => {
		for (const preset of TUNING_PRESETS) {
			expect(preset.notes).toHaveLength(6);
		}
	});

	it('Standard preset matches GUITAR_STANDARD_TUNING', () => {
		const standard = TUNING_PRESETS.find((p) => p.id === 'standard');
		expect(standard).toBeDefined();
		expect(standard!.notes).toBe(GUITAR_STANDARD_TUNING);
	});

	it('each preset has id, name, and description', () => {
		for (const preset of TUNING_PRESETS) {
			expect(preset.id).toBeTruthy();
			expect(preset.name).toBeTruthy();
			expect(preset.description).toBeTruthy();
		}
	});
});

describe('findClosestString', () => {
	const standard = TUNING_PRESETS[0];

	it('returns exact match for in-tune string', () => {
		const detected = { name: 'E' as const, octave: 2, midi: 40, cents: 0, frequency: 82.41 };
		const result = findClosestString(detected, standard);
		expect(result).toEqual({ stringIndex: 0, centsOff: 0 });
	});

	it('returns correct centsOff when slightly sharp', () => {
		const detected = { name: 'E' as const, octave: 2, midi: 40, cents: 15, frequency: 83.0 };
		const result = findClosestString(detected, standard);
		expect(result).not.toBeNull();
		expect(result!.stringIndex).toBe(0);
		expect(result!.centsOff).toBe(15);
	});

	it('returns correct centsOff when slightly flat', () => {
		const detected = { name: 'A' as const, octave: 2, midi: 45, cents: -10, frequency: 109.0 };
		const result = findClosestString(detected, standard);
		expect(result).not.toBeNull();
		expect(result!.stringIndex).toBe(1);
		expect(result!.centsOff).toBe(-10);
	});

	it('finds nearest string when between two strings', () => {
		// Midi 41 is F2, which is 1 semitone above E2 (40) — within range
		const detected = { name: 'F' as const, octave: 2, midi: 41, cents: 0, frequency: 87.31 };
		const result = findClosestString(detected, standard);
		expect(result).not.toBeNull();
		expect(result!.stringIndex).toBe(0); // Closest to E2 (1 semitone)
	});

	it('returns null when more than 1 semitone from any target', () => {
		// C3 (midi 48) is 2 semitones below D3 (50) and 3 above A2 (45)
		const detected = { name: 'C' as const, octave: 3, midi: 48, cents: 0, frequency: 130.81 };
		const result = findClosestString(detected, standard);
		expect(result).toBeNull();
	});

	it('works with Drop D low string', () => {
		const dropD = TUNING_PRESETS.find((p) => p.id === 'drop-d')!;
		const detected = { name: 'D' as const, octave: 2, midi: 38, cents: 5, frequency: 73.6 };
		const result = findClosestString(detected, dropD);
		expect(result).not.toBeNull();
		expect(result!.stringIndex).toBe(0);
		expect(result!.centsOff).toBe(5);
	});

	it('selects correct string when multiple are close in midi', () => {
		// Open G has D2(38), G2(43), D3(50), G3(55), B3(59), D4(62)
		const openG = TUNING_PRESETS.find((p) => p.id === 'open-g')!;
		const detected = { name: 'G' as const, octave: 3, midi: 55, cents: -3, frequency: 195.5 };
		const result = findClosestString(detected, openG);
		expect(result).not.toBeNull();
		expect(result!.stringIndex).toBe(3); // G3 string
		expect(result!.centsOff).toBe(-3);
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
