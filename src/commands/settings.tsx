import {
	loadSettings,
	saveSettings,
	type FontSize,
	type AppTheme,
	THEME_PRESETS,
	type ThemeColors,
} from '../config/store.js'
import {useState, useEffect} from 'react'
import {useAppContext} from '../app.js'
import {Text, Box, useInput} from 'ink'
import type {Key} from 'ink'

const DEFAULT_COLORS: ThemeColors = {
	primary: 'cyan',
	secondary: 'magenta',
	accent: 'green',
	dim: 'gray',
	border: 'cyan',
}

const themes: {label: string; value: AppTheme; colors: string}[] = [
	{label: 'Default', value: 'default', colors: 'cyan/magenta'},
	{label: 'Hacker', value: 'hacker', colors: 'green/lime'},
	{label: 'Ocean', value: 'ocean', colors: 'blue/cyan'},
	{label: 'Sunset', value: 'sunset', colors: 'red/yellow'},
	{label: 'Forest', value: 'forest', colors: 'green/yellow'},
	{label: 'Midnight', value: 'midnight', colors: 'magenta/blue'},
]

const fontSizes: {label: string; value: FontSize}[] = [
	{label: 'Small (12px)', value: 12},
	{label: 'Medium (14px)', value: 14},
	{label: 'Large (16px)', value: 16},
	{label: 'XL (18px)', value: 18},
]

type FocusArea = 'theme' | 'fontSize' | 'panels'

export default function Settings() {
	const {plugins, togglePlugin} = useAppContext()
	const [theme, setTheme] = useState<AppTheme>('default')
	const [fontSize, setFontSize] = useState<FontSize>(14)
	const [focusArea, setFocusArea] = useState<FocusArea>('theme')
	const [selectedIndex, setSelectedIndex] = useState(0)

	useEffect(() => {
		loadSettings().then(settings => {
			setTheme(settings.theme)
			setFontSize(settings.fontSize)
		})
	}, [])

	async function handleThemeChange(newTheme: AppTheme) {
		setTheme(newTheme)
		const settings = await loadSettings()
		await saveSettings({
			...settings,
			theme: newTheme,
			fontSize: settings.fontSize,
		})
	}

	async function handleFontSizeChange(size: FontSize) {
		setFontSize(size)
		const settings = await loadSettings()
		await saveSettings({...settings, fontSize: size, theme: settings.theme})
	}

	useInput((input: string, key: Key) => {
		if (key.escape) {
			return
		}

		const areas: FocusArea[] = ['theme', 'fontSize', 'panels']

		if (key.tab) {
			setFocusArea(prev => {
				const currentIndex = areas.indexOf(prev)
				const nextIndex = (currentIndex + 1) % areas.length
				return areas[nextIndex]
			})
			setSelectedIndex(0)
			return
		}

		if (focusArea === 'theme') {
			if (key.upArrow) {
				setSelectedIndex(prev => (prev > 0 ? prev - 1 : themes.length - 1))
			}
			if (key.downArrow) {
				setSelectedIndex(prev => (prev < themes.length - 1 ? prev + 1 : 0))
			}
			if (key.return || input === ' ') {
				handleThemeChange(themes[selectedIndex].value)
			}
		} else if (focusArea === 'fontSize') {
			if (key.upArrow) {
				setSelectedIndex(prev => (prev > 0 ? prev - 1 : fontSizes.length - 1))
			}
			if (key.downArrow) {
				setSelectedIndex(prev => (prev < fontSizes.length - 1 ? prev + 1 : 0))
			}
			if (key.return || input === ' ') {
				handleFontSizeChange(fontSizes[selectedIndex].value)
			}
		} else {
			if (key.upArrow) {
				setSelectedIndex(prev => (prev > 0 ? prev - 1 : plugins.length - 1))
			}
			if (key.downArrow) {
				setSelectedIndex(prev => (prev < plugins.length - 1 ? prev + 1 : 0))
			}
			if (key.return || input === ' ') {
				togglePlugin(plugins[selectedIndex].id)
			}
		}
	})

	const activeColors = THEME_PRESETS[theme] ?? DEFAULT_COLORS

	return (
		<Box
			flexDirection="column"
			padding={1}
		>
			<Box marginBottom={1}>
				<Text
					bold
					color={activeColors.primary}
				>
					─── Settings ───
				</Text>
			</Box>
			<Box
				flexDirection="column"
				paddingLeft={2}
			>
				{/* Theme Section */}
				<Box
					borderStyle={focusArea === 'theme' ? 'single' : undefined}
					borderColor={focusArea === 'theme' ? activeColors.primary : undefined}
					paddingX={1}
					marginBottom={1}
				>
					<Box
						flexDirection="column"
						width="100%"
					>
						<Box marginBottom={1}>
							<Text
								bold
								color={focusArea === 'theme' ? activeColors.primary : 'white'}
							>
								{focusArea === 'theme' ? '▸ ' : '  '}Theme
							</Text>
						</Box>
						<Box
							marginLeft={2}
							flexDirection="column"
						>
							{themes.map((t, index) => (
								<Box key={t.value}>
									<Text
										color={
											focusArea === 'theme' && index === selectedIndex
												? activeColors.primary
												: theme === t.value
													? activeColors.accent
													: undefined
										}
										bold={focusArea === 'theme' && index === selectedIndex}
									>
										{focusArea === 'theme' && index === selectedIndex
											? '❯ '
											: '  '}
										{theme === t.value ? '● ' : '○ '}
										{t.label}
										<Text dimColor> ({t.colors})</Text>
									</Text>
								</Box>
							))}
						</Box>
						{focusArea === 'theme' && (
							<Box marginLeft={2}>
								<Text dimColor>↑↓ Navigate • Enter/Space Select</Text>
							</Box>
						)}
					</Box>
				</Box>

				{/* Font Size Section */}
				<Box
					borderStyle={focusArea === 'fontSize' ? 'single' : undefined}
					borderColor={
						focusArea === 'fontSize' ? activeColors.primary : undefined
					}
					paddingX={1}
					marginBottom={1}
				>
					<Box
						flexDirection="column"
						width="100%"
					>
						<Box marginBottom={1}>
							<Text
								bold
								color={
									focusArea === 'fontSize' ? activeColors.primary : 'white'
								}
							>
								{focusArea === 'fontSize' ? '▸ ' : '  '}Font Size
							</Text>
						</Box>
						<Box
							marginLeft={2}
							flexDirection="column"
						>
							{fontSizes.map((fs, index) => (
								<Box key={fs.value}>
									<Text
										color={
											focusArea === 'fontSize' && index === selectedIndex
												? activeColors.primary
												: fontSize === fs.value
													? activeColors.accent
													: undefined
										}
										bold={focusArea === 'fontSize' && index === selectedIndex}
									>
										{focusArea === 'fontSize' && index === selectedIndex
											? '❯ '
											: '  '}
										{fontSize === fs.value ? '● ' : '○ '}
										{fs.label}
									</Text>
								</Box>
							))}
						</Box>
						{focusArea === 'fontSize' && (
							<Box marginLeft={2}>
								<Text dimColor>↑↓ Navigate • Enter/Space Select</Text>
							</Box>
						)}
					</Box>
				</Box>

				{/* Panels Section */}
				<Box
					borderStyle={focusArea === 'panels' ? 'single' : undefined}
					borderColor={
						focusArea === 'panels' ? activeColors.primary : undefined
					}
					paddingX={1}
					marginBottom={1}
				>
					<Box
						flexDirection="column"
						width="100%"
					>
						<Box marginBottom={1}>
							<Text
								bold
								color={focusArea === 'panels' ? activeColors.primary : 'white'}
							>
								{focusArea === 'panels' ? '▸ ' : '  '}
								Enabled Panels
							</Text>
						</Box>
						<Box
							marginLeft={2}
							flexDirection="column"
						>
							{plugins.map((plugin, index) => (
								<Box
									key={plugin.id}
									marginBottom={1}
								>
									<Text
										color={
											focusArea === 'panels' && index === selectedIndex
												? activeColors.primary
												: 'white'
										}
										bold={focusArea === 'panels' && index === selectedIndex}
									>
										{focusArea === 'panels' && index === selectedIndex
											? '❯ '
											: '  '}
										<Text color={plugin.enabled ? activeColors.accent : 'red'}>
											{plugin.enabled ? '✓' : '✗'}
										</Text>{' '}
										{plugin.name}
									</Text>
								</Box>
							))}
						</Box>
						{focusArea === 'panels' && (
							<Box marginLeft={2}>
								<Text dimColor>↑↓ Navigate • Enter/Space Toggle</Text>
							</Box>
						)}
					</Box>
				</Box>

				<Box marginTop={1}>
					<Text dimColor>Tab: Switch Section • Esc: Back</Text>
				</Box>
			</Box>
			<Box
				marginTop={1}
				borderStyle="single"
				padding={1}
				borderColor={activeColors.border}
			>
				<Text dimColor>
					Current: {theme} theme, {fontSize}px,{' '}
					{plugins.filter(p => p.enabled).length}/{plugins.length} panels
				</Text>
			</Box>
		</Box>
	)
}
