import type {ChildProcess} from 'node:child_process'
import {spawn} from 'node:child_process'

export interface CommandExecution {
	process: ChildProcess
	output: string[]
	exitCode: number | null
	isRunning: boolean
}

export function runShellCommand(command: string): CommandExecution {
	const output: string[] = []
	const isWindows = process.platform === 'win32'

	const child = spawn(command, {
		shell: isWindows ? 'cmd.exe' : true,
		stdio: ['pipe', 'pipe', 'pipe'],
		cwd: process.cwd(),
		env: process.env,
	})

	const execution: CommandExecution = {
		process: child,
		output,
		exitCode: null,
		isRunning: true,
	}

	child.stdout.on('data', data => {
		const lines = data.toString().split('\n')
		lines.forEach((line: string) => {
			if (line.trim()) {
				output.push(line)
			}
		})
	})

	child.stderr.on('data', data => {
		const lines = data.toString().split('\n')
		lines.forEach((line: string) => {
			if (line.trim()) {
				output.push(line)
			}
		})
	})

	child.on('close', code => {
		execution.exitCode = code
		execution.isRunning = false
	})

	child.on('error', () => {
		execution.isRunning = false
	})

	return execution
}
