import SelectInput, {type SelectItem} from '../components/select-input.js'
import {useAppContext} from '../app.js'
import {Text, Box, useInput} from 'ink'
import {useState} from 'react'

type Theme = 'cyan' | 'magenta' | 'green' | 'yellow' | 'blue'

const themes: {label: string; value: Theme}[] = [
	{label: 'Cyan', value: 'cyan'},
	{label: 'Magenta', value: 'magenta'},
	{label: 'Green', value: 'green'},
	{label: 'Yellow', value: 'yellow'},
	{label: 'Blue', value: 'blue'},
]

export default function Settings() {
	const {plugins, togglePlugin} = useAppContext()
	const [theme, setTheme] = useState<Theme>('cyan')
	const [animations, _setAnimations] = useState(true)
	const [selectedIndex, setSelectedIndex] = useState(0)

	const themeItems: SelectItem<Theme>[] = themes.map(t => ({
		...t,
		value: t.value,
	}))

	useInput((input: string, key: any) => {
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1))
		}
		if (key.downArrow) {
			setSelectedIndex(prev => Math.min(plugins.length - 1, prev + 1))
		}
		if (key.return || input === ' ') {
			togglePlugin(plugins[selectedIndex].id)
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
				<Box marginBottom={1}>
					<Text color="white">Theme:</Text>
				</Box>
				<Box
					marginLeft={2}
					marginBottom={2}
				>
					<SelectInput
						items={themeItems}
						onSelect={(item: SelectItem<Theme>) => setTheme(item.value)}
						initialIndex={themes.findIndex(t => t.value === theme)}
					/>
				</Box>
				<Box marginBottom={1}>
					<Text color="white">
						Animations:{' '}
						<Text color={animations ? 'green' : 'red'}>
							{animations ? '✓ Enabled' : '✗ Disabled'}
						</Text>
					</Text>
				</Box>
				<Box
					marginLeft={2}
					marginBottom={2}
				>
					<Text dimColor>Toggle with Space</Text>
				</Box>

				<Box marginBottom={1}>
					<Text
						bold
						color="white"
					>
						Enabled Panels:
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
							<Text color={selectedIndex === index ? 'cyan' : 'white'}>
								{selectedIndex === index ? '> ' : '  '}
								<Text color={plugin.enabled ? 'green' : 'red'}>
									{plugin.enabled ? '✓' : '✗'}
								</Text>{' '}
								{plugin.name}
							</Text>
						</Box>
					))}
				</Box>
				<Box marginLeft={2}>
					<Text dimColor>↑↓ Navigate • Enter/Space Toggle</Text>
				</Box>
			</Box>
			<Box
				marginTop={2}
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
