import {useAppContext} from '../app.js'
import {Text, Box, useInput} from 'ink'
import {useState} from 'react'
import type {Key} from 'ink'

type Theme = 'cyan' | 'magenta' | 'green' | 'yellow' | 'blue'

const themes: {label: string; value: Theme}[] = [
	{label: 'Cyan', value: 'cyan'},
	{label: 'Magenta', value: 'magenta'},
	{label: 'Green', value: 'green'},
	{label: 'Yellow', value: 'yellow'},
	{label: 'Blue', value: 'blue'},
]

type FocusArea = 'theme' | 'panels'

export default function Settings() {
	const {plugins, togglePlugin} = useAppContext()
	const [theme, setTheme] = useState<Theme>('cyan')
	const [animations, _setAnimations] = useState(true)
	const [focusArea, setFocusArea] = useState<FocusArea>('theme')
	const [selectedIndex, setSelectedIndex] = useState(0)

	useInput((input: string, key: Key) => {
		if (key.escape) {
			return // BackableScreen handles escape
		}

		// Tab switches between theme and panels sections
		if (key.tab) {
			setFocusArea(prev => (prev === 'theme' ? 'panels' : 'theme'))
			setSelectedIndex(0)
			return
		}

		if (focusArea === 'theme') {
			// Navigate themes
			if (key.upArrow) {
				setSelectedIndex(prev => (prev > 0 ? prev - 1 : themes.length - 1))
			}
			if (key.downArrow) {
				setSelectedIndex(prev => (prev < themes.length - 1 ? prev + 1 : 0))
			}
			if (key.return || input === ' ') {
				setTheme(themes[selectedIndex].value)
			}
		} else {
			// Navigate panels
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
					Current: {theme} theme, animations {animations ? 'on' : 'off'},{' '}
					{plugins.filter(p => p.enabled).length}/{plugins.length} panels active
				</Text>
			</Box>
		</Box>
	)
}
