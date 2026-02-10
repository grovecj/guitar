export const NOTE_NAMES = [
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B'
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export interface NoteInfo {
	name: NoteName;
	octave: number;
	midi: number;
	cents: number;
	frequency: number;
}

/** Standard tuning from low to high: E2 A2 D3 G3 B3 E4 */
export const GUITAR_STANDARD_TUNING: readonly NoteInfo[] = [
	{ name: 'E', octave: 2, midi: 40, cents: 0, frequency: 82.41 },
	{ name: 'A', octave: 2, midi: 45, cents: 0, frequency: 110.0 },
	{ name: 'D', octave: 3, midi: 50, cents: 0, frequency: 146.83 },
	{ name: 'G', octave: 3, midi: 55, cents: 0, frequency: 196.0 },
	{ name: 'B', octave: 3, midi: 59, cents: 0, frequency: 246.94 },
	{ name: 'E', octave: 4, midi: 64, cents: 0, frequency: 329.63 }
];

/**
 * Convert a frequency in Hz to the nearest musical note.
 * @param freq - frequency in Hz
 * @param pitchCenter - reference frequency for A4 (default 440)
 */
export function frequencyToNote(freq: number, pitchCenter: number = 440): NoteInfo {
	// MIDI note number (A4 = 69)
	const midiExact = 12 * Math.log2(freq / pitchCenter) + 69;
	const midi = Math.round(midiExact);
	const cents = Math.round((midiExact - midi) * 100);
	const noteIndex = ((midi % 12) + 12) % 12;
	const octave = Math.floor(midi / 12) - 1;
	const name = NOTE_NAMES[noteIndex];
	const frequency = freq;

	return { name, octave, midi, cents, frequency };
}
