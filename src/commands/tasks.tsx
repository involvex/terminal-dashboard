import React, {useState, useEffect, useCallback, useRef} from 'react'
import {Box, Text, useInput} from 'ink'
import si from 'systeminformation'
import killPort from 'kill-port'

type SortField = 'cpu' | 'mem' | 'name'

interface ProcessInfo {
	pid: number
	name: string
	cpu: number
	mem: number
	user: string
	ports: number[]
}

async function getProcesses(): Promise<ProcessInfo[]> {
	const [processData, netData] = await Promise.all([
		si.processes(),
		si.networkConnections(),
	])

	const portToPid = new Map<number, number>()
	for (const conn of netData) {
		if (conn.pid && conn.localPort) {
			const portNum = parseInt(conn.localPort, 10)
			if (!isNaN(portNum)) {
				portToPid.set(portNum, conn.pid)
			}
		}
	}

	const pidPorts = new Map<number, number[]>()
	for (const [port, pid] of portToPid) {
		if (!pidPorts.has(pid)) {
			pidPorts.set(pid, [])
		}
		pidPorts.get(pid)!.push(port)
	}

	return processData.list.map(p => ({
		pid: p.pid,
		name: p.name,
		cpu: p.cpu,
		mem: p.mem,
		user: p.user,
		ports: pidPorts.get(p.pid) || [],
	}))
}

async function killProcessOnPort(port: number): Promise<boolean> {
	try {
		await killPort(port)
		return true
	} catch {
		return false
	}
}

export default function Tasks() {
	const [processes, setProcesses] = useState<ProcessInfo[]>([])
	const [sortBy, setSortBy] = useState<SortField>('cpu')
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [status, setStatus] = useState<'idle' | 'loading' | 'killing'>('idle')
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
	const [confirmKill, setConfirmKill] = useState(false)

	const indexRef = useRef(selectedIndex)
	const sortRef = useRef(sortBy)
	const confirmRef = useRef(confirmKill)

	indexRef.current = selectedIndex
	sortRef.current = sortBy
	confirmRef.current = confirmKill

	const fetchProcesses = useCallback(async () => {
		try {
			setStatus('loading')
			setErrorMsg(null)
			const data = await getProcesses()
			setProcesses(data)
			setStatus('idle')
		} catch (e) {
			setStatus('idle')
			setErrorMsg(e instanceof Error ? e.message : 'Failed to fetch processes')
		}
	}, [])

	useEffect(() => {
		fetchProcesses()
		const interval = setInterval(fetchProcesses, 3000)
		return () => clearInterval(interval)
	}, [fetchProcesses])

	const sortedProcesses = React.useMemo(() => {
		const sorted = [...processes]
		if (sortRef.current === 'cpu') {
			sorted.sort((a, b) => b.cpu - a.cpu)
		} else if (sortRef.current === 'mem') {
			sorted.sort((a, b) => b.mem - a.mem)
		} else {
			sorted.sort((a, b) => a.name.localeCompare(b.name))
		}
		return sorted
	}, [processes])

	const displayProcesses = sortedProcesses.slice(0, 40)

	const handleKill = useCallback(async () => {
		const process = displayProcesses[indexRef.current]
		if (!process || process.ports.length === 0) {
			setErrorMsg('No port to kill for this process')
			return
		}

		const port = process.ports[0]
		try {
			setStatus('killing')
			setErrorMsg(null)
			const success = await killProcessOnPort(port)
			if (success) {
				setSuccessMsg(`Killed process on port ${port}`)
				setTimeout(() => setSuccessMsg(null), 2000)
				await fetchProcesses()
			} else {
				setErrorMsg('Failed to kill process')
			}
		} catch (e) {
			setErrorMsg(e instanceof Error ? e.message : 'Kill failed')
		} finally {
			setStatus('idle')
			setConfirmKill(false)
		}
	}, [displayProcesses, fetchProcesses])

	useInput(
		(_input, key) => {
			if (confirmRef.current) {
				if (_input === 'y' || _input === 'Y' || key.return) {
					handleKill()
				} else if (_input === 'n' || _input === 'N' || key.escape) {
					setConfirmKill(false)
				}
				return
			}

			if (key.escape) {
				return
			}

			if (key.upArrow) {
				setSelectedIndex(prev =>
					prev > 0 ? prev - 1 : displayProcesses.length - 1,
				)
			} else if (key.downArrow) {
				setSelectedIndex(prev =>
					prev < displayProcesses.length - 1 ? prev + 1 : 0,
				)
			} else if (_input === 'c' || _input === 'C') {
				setSortBy('cpu')
				setSelectedIndex(0)
			} else if (_input === 'm' || _input === 'M') {
				setSortBy('mem')
				setSelectedIndex(0)
			} else if (_input === 'n' || _input === 'N') {
				setSortBy('name')
				setSelectedIndex(0)
			} else if (_input === 'k' || _input === 'K' || key.delete) {
				const process = displayProcesses[indexRef.current]
				if (process && process.ports.length > 0) {
					setConfirmKill(true)
				} else {
					setErrorMsg('No port to kill for this process')
				}
			} else if (_input === 'r' || _input === 'R') {
				fetchProcesses()
			}
		},
		{isActive: true},
	)

	return (
		<Box
			flexDirection="column"
			padding={1}
		>
			<Box
				justifyContent="space-between"
				marginBottom={1}
			>
				<Text bold>
					<Text color="cyan">─── Task Manager ───</Text>
					<Text dimColor> ({displayProcesses.length} processes)</Text>
				</Text>
				<Text dimColor>
					Sort: <Text color={sortBy === 'cpu' ? 'green' : 'white'}>[C]CPU</Text>{' '}
					<Text color={sortBy === 'mem' ? 'green' : 'white'}>[M]MEM</Text>{' '}
					<Text color={sortBy === 'name' ? 'green' : 'white'}>[N]NAME</Text>
				</Text>
			</Box>

			{successMsg && (
				<Box marginBottom={1}>
					<Text color="green">{successMsg}</Text>
				</Box>
			)}

			{errorMsg && (
				<Box marginBottom={1}>
					<Text color="red">{errorMsg}</Text>
				</Box>
			)}

			{confirmKill && (
				<Box
					marginBottom={1}
					flexDirection="column"
				>
					<Text
						color="yellow"
						bold
					>
						Kill process on port {displayProcesses[indexRef.current]?.ports[0]}?
					</Text>
					<Text dimColor>Press Y to confirm, N or Esc to cancel</Text>
				</Box>
			)}

			<Box flexDirection="column">
				<Box marginBottom={1}>
					<Text dimColor>
						{'PID'.padEnd(7)}
						{'Name'.padEnd(20)}
						{'CPU'.padEnd(8)}
						{'MEM'.padEnd(8)}
						{'USER'.padEnd(12)}
						{'PORTS'}
					</Text>
				</Box>

				{displayProcesses.length === 0 && (
					<Text dimColor>No processes found</Text>
				)}

				{displayProcesses.map((proc, idx) => {
					const isSelected = idx === selectedIndex
					const ports =
						proc.ports.length > 0 ? proc.ports.slice(0, 3).join(',') : '-'

					return (
						<Box key={proc.pid}>
							<Text
								color={isSelected ? 'cyan' : undefined}
								bold={isSelected}
							>
								{isSelected ? '❯ ' : '  '}
								{proc.pid.toString().padEnd(5)}{' '}
								{proc.name.substring(0, 18).padEnd(20)}
								{proc.cpu.toFixed(1).padEnd(8)}
								{proc.mem.toFixed(1).padEnd(8)}
								{proc.user.substring(0, 10).padEnd(12)}
								<Text color={proc.ports.length > 0 ? 'magenta' : undefined}>
									{ports}
								</Text>
							</Text>
						</Box>
					)
				})}
			</Box>

			<Box
				marginTop={1}
				flexDirection="column"
			>
				<Text dimColor>
					↑↓ Navigate • C/M/N Sort • K Kill • R Refresh • Esc Back
				</Text>
				<Text dimColor>
					{status === 'loading'
						? 'Loading...'
						: status === 'killing'
							? 'Killing...'
							: ''}
				</Text>
			</Box>
		</Box>
	)
}
