export interface QuickCommand {
	id: string
	name: string
	command: string
	description?: string
	createdAt: number
	updatedAt: number
}

export interface CommandsConfig {
	version: number
	commands: QuickCommand[]
}
