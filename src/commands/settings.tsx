import {loadSettings, saveSettings, type FontSize} from '../config/store.js'
import {useState, useEffect} from 'react'
import {useAppContext} from '../app.js'
import {Text, Box, useInput} from 'ink'
import type {Key} from 'ink'

type Theme = 'cyan' | 'magenta' | 'green' | 'yellow' | 'blue'

const themes: {label: string; value: Theme}[] = [
	{label: 'Cyan', value: 'cyan'},
	{label: 'Magenta', value: 'magenta'},
	{label: 'Green', value: 'green'},
	{label: 'Yellow', value: 'yellow'},
	{label: 'Blue', value: 'blue'},
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
	const [theme, setTheme] = useState<Theme>('cyan')
	const [fontSize, setFontSize] = useState<FontSize>(14)
	const [animations, _setAnimations] = useState(true)
	const [focusArea, setFocusArea] = useState<FocusArea>('theme')
	const [selectedIndex, setSelectedIndex] = useState(0)

	useEffect(() => {
		loadSettings().then(settings => {
			setFontSize(settings.fontSize)
		})
	}, [])

	async function handleFontSizeChange(size: FontSize) {
		setFontSize(size)
		const settings = await loadSettings()
		await saveSettings({...settings, fontSize: size})
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
				setTheme(themes[selectedIndex].value)
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

	return (
		<Box
			flexDirection="column"
			padding={1}
		>
			<Box marginBottom={1}>
				<Text
					bold
					color="cyan"
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
					borderColor={focusArea === 'theme' ? 'cyan' : undefined}
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
								color={focusArea === 'theme' ? 'cyan' : 'white'}
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
												? 'cyan'
												: theme === t.value
													? 'green'
													: undefined
										}
										bold={focusArea === 'theme' && index === selectedIndex}
									>
										{focusArea === 'theme' && index === selectedIndex
											? '❯ '
											: '  '}
										{theme === t.value ? '● ' : '○ '}
										{t.label}
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
					borderColor={focusArea === 'fontSize' ? 'cyan' : undefined}
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
								color={focusArea === 'fontSize' ? 'cyan' : 'white'}
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
												? 'cyan'
												: fontSize === fs.value
													? 'green'
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

				{/* Animations Section */}
				<Box
					marginBottom={1}
					paddingX={1}
				>
					<Text color="white">
						Animations:{' '}
						<Text color={animations ? 'green' : 'red'}>
							{animations ? '✓ Enabled' : '✗ Disabled'}
						</Text>
					</Text>
				</Box>

				{/* Panels Section */}
				<Box
					borderStyle={focusArea === 'panels' ? 'single' : undefined}
					borderColor={focusArea === 'panels' ? 'cyan' : undefined}
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
								color={focusArea === 'panels' ? 'cyan' : 'white'}
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
												? 'cyan'
												: 'white'
										}
										bold={focusArea === 'panels' && index === selectedIndex}
									>
										{focusArea === 'panels' && index === selectedIndex
											? '❯ '
											: '  '}
										<Text color={plugin.enabled ? 'green' : 'red'}>
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
			>
				<Text dimColor>
					Current: {theme} theme, {fontSize}px font,{' '}
					{plugins.filter(p => p.enabled).length}/{plugins.length} panels
				</Text>
			</Box>
		</Box>
	)
}
