export interface FontScale {
	padding: number
	gap: number
	truncateAt: number
	titleSize: number
}

const BASE_COLUMNS = 120
const BASE_ROWS = 30
const DEFAULT_BASE_FONT_SIZE = 14

export function useFontScale(
	columns: number,
	rows: number,
	baseFontSize?: number,
): FontScale {
	const scaleX = Math.max(0.7, Math.min(1.5, columns / BASE_COLUMNS))
	const scaleY = Math.max(0.7, Math.min(1.5, rows / BASE_ROWS))
	const baseSize = baseFontSize || DEFAULT_BASE_FONT_SIZE

	return {
		padding: Math.round(1 * scaleX),
		gap: Math.round(1 * Math.min(scaleX, scaleY)),
		truncateAt: Math.round(60 * scaleX),
		titleSize: Math.round(baseSize * scaleX),
	}
}
