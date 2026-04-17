import SelectInput, {type SelectItem} from './components/select-input.js'
import {useState, createContext, useContext} from 'react'
import pkg from '../package.json' with {type: 'json'}
import {Text, Box, useInput} from 'ink'

import GithubTrendingPanel from './panels/github-trending-panel.js'
import NpmReleasesPanel from './panels/npm-panel.js'
import SystemPanel from './panels/system-panel.js'
import Settings from './commands/settings.js'
import Version from './commands/version.js'
import Tasks from './commands/tasks.js'
import About from './commands/about.js'
import Dashboard from './dashboard.js'
import Help from './commands/help.js'
import Exit from './commands/exit.js'
import Git from './commands/git.js'

type AppScreen =
	| 'menu'
	| 'help'
	| 'about'
	| 'version'
	| 'settings'
	| 'dashboard'
	| 'exit'
	| 'git'
	| 'tasks'

interface Plugin {
	id: string
	name: string
	component: React.ComponentType<{
		isActive: boolean
		dimensions?: {columns: number; rows: number}
	}>
	enabled: boolean
	keyHints?: string
}

interface AppContextType {
	plugins: Plugin[]
	togglePlugin: (id: string) => void
	currentScreen: AppScreen
	setScreen: (screen: AppScreen) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const useAppContext = () => {
	const context = useContext(AppContext)
	if (!context) throw new Error('useAppContext must be used within AppProvider')
	return context
}

interface BackableScreenProps {
	children: React.ReactNode
	onBack: () => void
}

function BackableScreen({children, onBack}: BackableScreenProps) {
	useInput((_input, key) => {
		if (key.escape) {
			onBack()
		}
	})

	return (
		<Box flexDirection="column">
			<Box
				paddingX={2}
				paddingY={1}
			>
				<Text dimColor>← Esc to return to menu</Text>
			</Box>
			{children}
		</Box>
	)
}

export default function App() {
	const [screen, setScreen] = useState<AppScreen>('dashboard')
	const [plugins, setPlugins] = useState<Plugin[]>([
		{
			id: 'system',
			name: 'System Monitor',
			component: SystemPanel,
			enabled: true,
		},
		{
			id: 'github',
			name: 'GitHub Trending',
			component: GithubTrendingPanel,
			enabled: true,
			keyHints: 'L=Language T=Time',
		},
		{
			id: 'npm',
			name: 'NPM Releases',
			component: NpmReleasesPanel,
			enabled: true,
			keyHints: 'C=Category T=Time',
		},
	])

	const togglePlugin = (id: string) => {
		setPlugins(prev =>
			prev.map(p => (p.id === id ? {...p, enabled: !p.enabled} : p)),
		)
	}

	const goMenu = () => setScreen('menu')
	const _goDashboard = () => setScreen('dashboard')
	const _goHelp = () => setScreen('help')
	const _goAbout = () => setScreen('about')
	const _goVersion = () => setScreen('version')
	const _goSettings = () => setScreen('settings')
	const _goExit = () => setScreen('exit')

	// Global hotkey handler
	useInput((input, key) => {
		if ((input === 'm' || input === 'M') && key.ctrl) {
			setScreen(prev => (prev === 'dashboard' ? 'menu' : 'dashboard'))
		}
		if ((input === 'g' || input === 'G') && key.ctrl) {
			setScreen('git')
		}
		if ((input === 'p' || input === 'P') && key.ctrl) {
			setScreen('tasks')
		}
	})

	const menuItems: SelectItem<AppScreen>[] = [
		{label: '🚀 Dashboard', value: 'dashboard'},
		{label: '→ Git', value: 'git'},
		{label: '→ Tasks', value: 'tasks'},
		{label: '→ Help', value: 'help'},
		{label: '→ Settings', value: 'settings'},
		{label: '→ About', value: 'about'},
		{label: '→ Version', value: 'version'},
		{label: '→ Exit', value: 'exit'},
	]

	if (screen === 'menu') {
		return (
			<Box
				flexDirection="column"
				borderStyle="round"
				borderColor="cyan"
				padding={1}
			>
				<Box marginBottom={1}>
					<Text
						bold
						color="cyan"
					>
						╔══════════════════════════════════╗
					</Text>
				</Box>
				<Box marginX={2}>
					<Text
						bold
						color="white"
						dimColor
					>
						{' '}
						{pkg.name}
					</Text>
				</Box>
				<Box
					marginX={2}
					marginBottom={1}
				>
					<Text dimColor> {pkg.description}</Text>
				</Box>
				<Box marginBottom={1}>
					<Text
						bold
						color="cyan"
					>
						╠══════════════════════════════════╣
					</Text>
				</Box>
				<Box marginX={2}>
					<Text
						bold
						color="magenta"
					>
						{' '}
						Select an option:
					</Text>
				</Box>
				<SelectInput
					items={menuItems}
					onSelect={(item: SelectItem<AppScreen>) => {
						setScreen(item.value)
					}}
				/>
				<Box marginTop={1}>
					<Text
						bold
						color="cyan"
					>
						╚══════════════════════════════════╝
					</Text>
				</Box>
				<Box
					marginTop={1}
					paddingX={2}
				>
					<Text dimColor>↑↓ Navigate • Enter Select • Esc Back</Text>
				</Box>
			</Box>
		)
	}

	if (screen === 'help') {
		return (
			<BackableScreen onBack={goMenu}>
				<Help />
			</BackableScreen>
		)
	}

	if (screen === 'about') {
		return (
			<BackableScreen onBack={goMenu}>
				<About />
			</BackableScreen>
		)
	}

	if (screen === 'version') {
		return (
			<BackableScreen onBack={goMenu}>
				<Version />
			</BackableScreen>
		)
	}

	if (screen === 'git') {
		return (
			<BackableScreen onBack={goMenu}>
				<Git />
			</BackableScreen>
		)
	}

	if (screen === 'tasks') {
		return (
			<BackableScreen onBack={goMenu}>
				<Tasks />
			</BackableScreen>
		)
	}

	if (screen === 'dashboard') {
		return (
			<AppContext.Provider
				value={{plugins, togglePlugin, currentScreen: screen, setScreen}}
			>
				<Dashboard />
			</AppContext.Provider>
		)
	}

	if (screen === 'settings') {
		return (
			<BackableScreen onBack={goMenu}>
				<AppContext.Provider
					value={{plugins, togglePlugin, currentScreen: screen, setScreen}}
				>
					<Settings />
				</AppContext.Provider>
			</BackableScreen>
		)
	}

	if (screen === 'exit') {
		return <Exit />
	}

	return null
}
