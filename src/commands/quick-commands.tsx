import {
	getCommands,
	addCommand,
	updateCommand,
	deleteCommand,
} from '../config/store.js'
import {runShellCommand, type CommandExecution} from '../lib/command-runner.js'
import React, {useState, useEffect, useRef} from 'react'
import type {QuickCommand} from '../types/commands.js'
import {Box, Text, useInput, Newline} from 'ink'
import SelectInput from 'ink-select-input'
import {useAppContext} from '../app.js'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'

type ViewMode = 'list' | 'add' | 'edit' | 'running' | 'confirm-delete'

export default function QuickCommands() {
	const {setScreen} = useAppContext()
	const [commands, setCommands] = useState<QuickCommand[]>([])
	const [mode, setMode] = useState<ViewMode>('list')
	const [selectedCommand, setSelectedCommand] = useState<QuickCommand | null>(
		null,
	)
	const [execution, setExecution] = useState<CommandExecution | null>(null)
	const [formName, setFormName] = useState('')
	const [formCommand, setFormCommand] = useState('')
	const [formDescription, setFormDescription] = useState('')
	const [loading, setLoading] = useState(true)

	const scrollOffset = useRef(0)

	useEffect(() => {
		loadCommands()
	}, [])

	async function loadCommands() {
		setLoading(true)
		const cmds = await getCommands()
		setCommands(cmds)
		setLoading(false)
	}

	useInput((_input, key) => {
		if (key.escape) {
			if (execution?.isRunning) {
				execution.process.kill()
			}
			if (mode === 'running') {
				setMode('list')
				setExecution(null)
			} else if (mode !== 'list') {
				setMode('list')
			} else {
				setScreen('dashboard')
			}
		}

		if (key.return) {
			if (mode === 'add') {
				handleAddSubmit()
			} else if (mode === 'edit') {
				handleEditSubmit()
			}
		}
	})

	function handleSelect(item: {value: string}) {
		if (item.value === '__add__') {
			setFormName('')
			setFormCommand('')
			setFormDescription('')
			setMode('add')
		} else {
			const cmd = commands.find(c => c.id === item.value)
			if (cmd) {
				executeCommand(cmd)
			}
		}
	}

	function _handleManageSelect(item: {value: string}) {
		if (item.value === '__back__') {
			setMode('list')
		} else if (item.value === '__edit__' && selectedCommand) {
			setFormName(selectedCommand.name)
			setFormCommand(selectedCommand.command)
			setFormDescription(selectedCommand.description || '')
			setMode('edit')
		} else if (item.value === '__delete__') {
			setMode('confirm-delete')
		}
	}

	async function executeCommand(cmd: QuickCommand) {
		setSelectedCommand(cmd)
		setMode('running')
		scrollOffset.current = 0

		const exec = runShellCommand(cmd.command)
		setExecution(exec)

		const interval = setInterval(() => {
			if (!exec.isRunning) {
				clearInterval(interval)
			}
			setExecution({...exec})
		}, 100)
	}

	async function handleAddSubmit() {
		if (formName && formCommand) {
			await addCommand({
				name: formName,
				command: formCommand,
				description: formDescription,
			})
			await loadCommands()
			setMode('list')
		}
	}

	async function handleEditSubmit() {
		if (selectedCommand && formName && formCommand) {
			await updateCommand(selectedCommand.id, {
				name: formName,
				command: formCommand,
				description: formDescription,
			})
			await loadCommands()
			setMode('list')
			setSelectedCommand(null)
		}
	}

	async function handleConfirmDelete() {
		if (selectedCommand) {
			await deleteCommand(selectedCommand.id)
			await loadCommands()
			setMode('list')
			setSelectedCommand(null)
		}
	}

	if (loading) {
		return (
			<Box
				flexDirection="column"
				padding={2}
			>
				<Text>
					<Spinner /> Loading commands...
				</Text>
			</Box>
		)
	}

	if (mode === 'list') {
		const items = [
			...commands.map(cmd => ({
				label: `${cmd.name} ${cmd.description ? `(${cmd.description})` : ''}`,
				value: cmd.id,
			})),
			{
				label: '──────────────────────────────',
				value: '__sep__',
				disabled: true,
			},
			{label: '+ Add New Command', value: '__add__'},
		]

		return (
			<Box
				flexDirection="column"
				padding={2}
			>
				<Text
					bold
					color="cyan"
				>
					⚡ QUICK COMMANDS
				</Text>
				<Newline />
				<Text dimColor>Select a command to run immediately</Text>
				<Newline />
				<SelectInput
					items={items}
					onSelect={handleSelect}
				/>
				<Newline />
				<Text dimColor>ESC: Return to Dashboard</Text>
			</Box>
		)
	}

	if (mode === 'add') {
		return (
			<Box
				flexDirection="column"
				padding={2}
			>
				<Text
					bold
					color="cyan"
				>
					➕ ADD NEW COMMAND
				</Text>
				<Newline />

				<Box
					marginY={1}
					flexDirection="row"
				>
					<Box width={15}>
						<Text>Name: </Text>
					</Box>
					<TextInput
						value={formName}
						onChange={setFormName}
						placeholder="Enter command name"
					/>
				</Box>

				<Box
					marginY={1}
					flexDirection="row"
				>
					<Box width={15}>
						<Text>Command: </Text>
					</Box>
					<TextInput
						value={formCommand}
						onChange={setFormCommand}
						placeholder="Shell command to run"
					/>
				</Box>

				<Box
					marginY={1}
					flexDirection="row"
				>
					<Box width={15}>
						<Text>Description: </Text>
					</Box>
					<TextInput
						value={formDescription}
						onChange={setFormDescription}
						placeholder="Optional description"
					/>
				</Box>

				<Newline />
				<Text dimColor>ENTER: Save • ESC: Cancel</Text>
			</Box>
		)
	}

	if (mode === 'running' && execution && selectedCommand) {
		const maxLines = process.stdout.rows - 12
		const visibleOutput = execution.output.slice(-maxLines)

		return (
			<Box
				flexDirection="column"
				padding={2}
				height="100%"
			>
				<Text
					bold
					color="cyan"
				>
					▶ RUNNING: {selectedCommand.name}
				</Text>
				<Text dimColor>{selectedCommand.command}</Text>
				<Newline />

				<Box
					flexDirection="column"
					flexGrow={1}
					borderStyle="single"
					borderColor="gray"
					padding={1}
				>
					{visibleOutput.map((line, i) => (
						<Text key={i}>{line}</Text>
					))}

					{execution.isRunning && (
						<Text>
							<Spinner /> Executing...
						</Text>
					)}
				</Box>

				<Newline />
				{!execution.isRunning && (
					<Text color={execution.exitCode === 0 ? 'green' : 'red'}>
						{execution.exitCode === 0
							? '✅ Command completed successfully'
							: `❌ Command failed with exit code ${execution.exitCode}`}
					</Text>
				)}
				<Text dimColor>ESC: Close output</Text>
			</Box>
		)
	}

	if (mode === 'edit' && selectedCommand) {
		return (
			<Box
				flexDirection="column"
				padding={2}
			>
				<Text
					bold
					color="cyan"
				>
					✏️ EDIT COMMAND
				</Text>
				<Newline />

				<Box
					marginY={1}
					flexDirection="row"
				>
					<Box width={15}>
						<Text>Name: </Text>
					</Box>
					<TextInput
						value={formName}
						onChange={setFormName}
					/>
				</Box>

				<Box
					marginY={1}
					flexDirection="row"
				>
					<Box width={15}>
						<Text>Command: </Text>
					</Box>
					<TextInput
						value={formCommand}
						onChange={setFormCommand}
					/>
				</Box>

				<Box
					marginY={1}
					flexDirection="row"
				>
					<Box width={15}>
						<Text>Description: </Text>
					</Box>
					<TextInput
						value={formDescription}
						onChange={setFormDescription}
					/>
				</Box>

				<Newline />
				<Text dimColor>ENTER: Save • ESC: Cancel</Text>
			</Box>
		)
	}

	if (mode === 'confirm-delete' && selectedCommand) {
		return (
			<Box
				flexDirection="column"
				padding={2}
			>
				<Text
					bold
					color="red"
				>
					⚠️ CONFIRM DELETE
				</Text>
				<Newline />
				<Text>Are you sure you want to delete command:</Text>
				<Text bold>{selectedCommand.name}</Text>
				<Text dimColor>{selectedCommand.command}</Text>
				<Newline />

				<SelectInput
					items={[
						{label: '❌ Cancel', value: 'cancel'},
						{label: '✅ Confirm Delete', value: 'confirm'},
					]}
					onSelect={item =>
						item.value === 'confirm' ? handleConfirmDelete() : setMode('list')
					}
				/>
			</Box>
		)
	}

	return null
}
