import type {QuickCommand, CommandsConfig} from '../types/commands.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const CONFIG_DIR = path.join(os.homedir(), '.term-dash')
const COMMANDS_FILE = path.join(CONFIG_DIR, 'commands.json')
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json')

export type FontSize = 12 | 14 | 16 | 18

export interface AppSettings {
	version: number
	fontSize: FontSize
}

const DEFAULT_CONFIG: CommandsConfig = {
	version: 1,
	commands: [
		{
			id: 'git-status',
			name: 'Git Status',
			command: 'git status',
			description: 'Show working tree status',
			createdAt: Date.now(),
			updatedAt: Date.now(),
		},
		{
			id: 'npm-cache-clean',
			name: 'Clean NPM Cache',
			command: 'npm cache rm -g --force',
			description: 'Clear global NPM cache',
			createdAt: Date.now(),
			updatedAt: Date.now(),
		},
	],
}

const DEFAULT_SETTINGS: AppSettings = {
	version: 1,
	fontSize: 14,
}

async function ensureConfigDir(): Promise<void> {
	try {
		await fs.access(CONFIG_DIR)
	} catch {
		await fs.mkdir(CONFIG_DIR, {recursive: true})
	}
}

export async function loadCommandsConfig(): Promise<CommandsConfig> {
	await ensureConfigDir()

	try {
		const data = await fs.readFile(COMMANDS_FILE, 'utf8')
		return JSON.parse(data)
	} catch {
		await saveCommandsConfig(DEFAULT_CONFIG)
		return DEFAULT_CONFIG
	}
}

export async function loadSettings(): Promise<AppSettings> {
	await ensureConfigDir()

	try {
		const data = await fs.readFile(SETTINGS_FILE, 'utf8')
		return JSON.parse(data)
	} catch {
		await saveSettings(DEFAULT_SETTINGS)
		return DEFAULT_SETTINGS
	}
}

export async function saveSettings(settings: AppSettings): Promise<void> {
	await ensureConfigDir()
	await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
}

export async function saveCommandsConfig(
	config: CommandsConfig,
): Promise<void> {
	await ensureConfigDir()
	await fs.writeFile(COMMANDS_FILE, JSON.stringify(config, null, 2), 'utf8')
}

export async function getCommands(): Promise<QuickCommand[]> {
	const config = await loadCommandsConfig()
	return config.commands
}

export async function addCommand(
	command: Omit<QuickCommand, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<QuickCommand> {
	const config = await loadCommandsConfig()

	const newCommand: QuickCommand = {
		...command,
		id: `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	}

	config.commands.push(newCommand)
	await saveCommandsConfig(config)

	return newCommand
}

export async function updateCommand(
	id: string,
	updates: Partial<QuickCommand>,
): Promise<QuickCommand | null> {
	const config = await loadCommandsConfig()
	const index = config.commands.findIndex(c => c.id === id)

	if (index === -1) return null

	config.commands[index] = {
		...config.commands[index],
		...updates,
		updatedAt: Date.now(),
	}

	await saveCommandsConfig(config)
	return config.commands[index]
}

export async function deleteCommand(id: string): Promise<boolean> {
	const config = await loadCommandsConfig()
	const initialLength = config.commands.length

	config.commands = config.commands.filter(c => c.id !== id)

	if (config.commands.length === initialLength) return false

	await saveCommandsConfig(config)
	return true
}
