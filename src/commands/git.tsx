import simpleGit, {type SimpleGit, type StatusResult} from 'simple-git'
import React, {useState, useEffect, useCallback, useRef} from 'react'
import {Box, Text, useInput} from 'ink'
import TextInput from 'ink-text-input'
import {execSync} from 'child_process'
import path from 'path'

type Section = 'staged' | 'modified' | 'untracked' | 'commit' | 'actions'

function findGitRoot(startPath: string): string | null {
	let current = startPath
	let prev = ''
	while (current !== prev) {
		try {
			const result = execSync('git rev-parse --is-inside-work-tree', {
				cwd: current,
				encoding: 'utf-8',
				stdio: ['pipe', 'pipe', 'pipe'],
			})
			if (result.trim() === 'true') {
				return current
			}
		} catch {
			// Not a git repo, continue searching
		}
		prev = current
		current = path.dirname(current)
	}
	return null
}

async function stageFile(git: SimpleGit, file: string): Promise<void> {
	await git.add(file)
}

async function unstageFile(git: SimpleGit, file: string): Promise<void> {
	await git.reset(['HEAD', '--', file])
}

async function commitChanges(git: SimpleGit, message: string): Promise<void> {
	await git.commit(message)
}

async function pushRepo(git: SimpleGit): Promise<void> {
	await git.push()
}

async function pushTags(git: SimpleGit): Promise<void> {
	await git.push(['--tags'])
}

export default function Git() {
	const [repoRoot, setRepoRoot] = useState<string | null>(null)
	const [branch, setBranch] = useState<string>('')
	const [remoteBranch, setRemoteBranch] = useState<string | null>(null)
	const [stagedFiles, setStagedFiles] = useState<string[]>([])
	const [modifiedFiles, setModifiedFiles] = useState<string[]>([])
	const [untrackedFiles, setUntrackedFiles] = useState<string[]>([])
	const [commitMessage, setCommitMessage] = useState('')
	const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [isCommitting, setIsCommitting] = useState(false)
	const [isPushing, setIsPushing] = useState(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
	const [selectedSection, setSelectedSection] = useState<Section>('staged')
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [isTypingCommit, setIsTypingCommit] = useState(false)

	const gitRef = useRef<SimpleGit | null>(null)
	const indexRef = useRef(selectedIndex)
	const sectionRef = useRef(selectedSection)
	const focusRef = useRef(false)

	indexRef.current = selectedIndex
	sectionRef.current = selectedSection
	focusRef.current = isTypingCommit

	const parseStatus = useCallback((result: StatusResult) => {
		setBranch(result.current || '')
		setRemoteBranch(result.tracking)

		setStagedFiles(result.staged)

		const modified: string[] = [...result.modified]
		for (const file of result.files) {
			if (
				file.index !== '?' &&
				file.working_dir !== '?' &&
				file.working_dir !== ' '
			) {
				if (!modified.includes(file.path)) {
					modified.push(file.path)
				}
			}
		}
		setModifiedFiles(modified)

		const untracked: string[] = [
			...result.not_added,
			...result.created,
			...result.deleted,
		]
		for (const file of result.files) {
			if (file.index === '?' || file.working_dir === '?') {
				if (!untracked.includes(file.path)) {
					untracked.push(file.path)
				}
			}
		}
		setUntrackedFiles(untracked)
	}, [])

	const refreshStatus = useCallback(async () => {
		if (!gitRef.current) return
		try {
			setStatus('loading')
			setErrorMsg(null)
			const result = await gitRef.current.status()
			parseStatus(result)
			setStatus('idle')
		} catch (e) {
			setStatus('error')
			setErrorMsg(e instanceof Error ? e.message : 'Failed to get status')
		}
	}, [parseStatus])

	useEffect(() => {
		const root = findGitRoot(process.cwd())
		setRepoRoot(root)
		if (root) {
			gitRef.current = simpleGit(root)
			refreshStatus()
		}
	}, [refreshStatus])

	const getCurrentList = useCallback((): string[] => {
		switch (sectionRef.current) {
			case 'staged':
				return stagedFiles
			case 'modified':
				return modifiedFiles
			case 'untracked':
				return untrackedFiles
			default:
				return []
		}
	}, [stagedFiles, modifiedFiles, untrackedFiles])

	const getSectionTitle = (section: Section): string => {
		switch (section) {
			case 'staged':
				return `Staged (${stagedFiles.length})`
			case 'modified':
				return `Modified (${modifiedFiles.length})`
			case 'untracked':
				return `Untracked (${untrackedFiles.length})`
			case 'commit':
				return 'Commit'
			case 'actions':
				return 'Actions'
		}
	}

	const handleStageUnstage = useCallback(async () => {
		if (!gitRef.current || focusRef.current) return
		const list = getCurrentList()
		if (list.length === 0) return

		const file = list[indexRef.current]
		if (!file) return

		try {
			if (sectionRef.current === 'staged') {
				await unstageFile(gitRef.current, file)
			} else {
				await stageFile(gitRef.current, file)
			}
			await refreshStatus()
		} catch (e) {
			setErrorMsg(e instanceof Error ? e.message : 'Operation failed')
		}
	}, [getCurrentList, refreshStatus])

	const handleCommit = useCallback(async () => {
		if (!gitRef.current || stagedFiles.length === 0) return
		if (!commitMessage.trim()) {
			setErrorMsg('Please enter a commit message')
			return
		}

		try {
			setIsCommitting(true)
			setErrorMsg(null)
			await commitChanges(gitRef.current, commitMessage)
			setCommitMessage('')
			setIsTypingCommit(false)
			setSuccessMsg('Committed successfully!')
			setTimeout(() => setSuccessMsg(null), 2000)
			await refreshStatus()
		} catch (e) {
			setErrorMsg(e instanceof Error ? e.message : 'Commit failed')
		} finally {
			setIsCommitting(false)
		}
	}, [commitMessage, stagedFiles.length, refreshStatus])

	const handlePush = useCallback(async () => {
		if (!gitRef.current || focusRef.current) return
		try {
			setIsPushing(true)
			setErrorMsg(null)
			await pushRepo(gitRef.current)
			setSuccessMsg('Pushed successfully!')
			setTimeout(() => setSuccessMsg(null), 2000)
		} catch (e) {
			setErrorMsg(e instanceof Error ? e.message : 'Push failed')
		} finally {
			setIsPushing(false)
		}
	}, [])

	const handlePushTags = useCallback(async () => {
		if (!gitRef.current || focusRef.current) return
		try {
			setIsPushing(true)
			setErrorMsg(null)
			await pushTags(gitRef.current)
			setSuccessMsg('Tags pushed successfully!')
			setTimeout(() => setSuccessMsg(null), 2000)
		} catch (e) {
			setErrorMsg(e instanceof Error ? e.message : 'Push tags failed')
		} finally {
			setIsPushing(false)
		}
	}, [])

	useInput(
		(_input, key) => {
			if (isTypingCommit) {
				if (key.escape) {
					setIsTypingCommit(false)
				}
				return
			}

			if (key.escape) {
				return
			}

			if (key.upArrow) {
				const list = getCurrentList()
				const sectionList: Section[] = [
					'staged',
					'modified',
					'untracked',
					'commit',
					'actions',
				]
				const currentSectionIdx = sectionList.indexOf(sectionRef.current)

				if (sectionRef.current === 'commit') {
					setSelectedSection('untracked')
					setSelectedIndex(0)
				} else if (sectionRef.current === 'actions') {
					const untrackedLen = untrackedFiles.length
					if (untrackedLen > 0) {
						setSelectedSection('untracked')
						setSelectedIndex(Math.min(indexRef.current, untrackedLen - 1))
					} else {
						setSelectedSection('modified')
						setSelectedIndex(
							Math.min(indexRef.current, modifiedFiles.length - 1),
						)
					}
				} else {
					const currentLen = list.length
					if (currentLen === 0) {
						const prevSection = sectionList[currentSectionIdx - 1]
						if (prevSection) {
							setSelectedSection(prevSection)
							setSelectedIndex(0)
						}
					} else {
						setSelectedIndex(prev => (prev > 0 ? prev - 1 : currentLen - 1))
					}
				}
			} else if (key.downArrow) {
				if (sectionRef.current === 'staged') {
					const modifiedLen = modifiedFiles.length
					if (modifiedLen > 0) {
						setSelectedSection('modified')
						setSelectedIndex(0)
					} else {
						const untrackedLen = untrackedFiles.length
						if (untrackedLen > 0) {
							setSelectedSection('untracked')
							setSelectedIndex(0)
						} else {
							setSelectedSection('commit')
							setSelectedIndex(0)
						}
					}
				} else if (sectionRef.current === 'modified') {
					const untrackedLen = untrackedFiles.length
					if (untrackedLen > 0) {
						setSelectedSection('untracked')
						setSelectedIndex(0)
					} else {
						setSelectedSection('commit')
						setSelectedIndex(0)
					}
				} else if (sectionRef.current === 'untracked') {
					setSelectedSection('commit')
					setSelectedIndex(0)
				} else if (sectionRef.current === 'commit') {
					setSelectedSection('actions')
					setSelectedIndex(0)
				} else {
					const list = getCurrentList()
					setSelectedIndex(prev => (prev < list.length - 1 ? prev + 1 : 0))
				}
			} else if (key.return) {
				if (sectionRef.current === 'commit') {
					handleCommit()
				} else if (sectionRef.current === 'actions') {
					if (indexRef.current === 0) {
						handlePush()
					} else {
						handlePushTags()
					}
				} else {
					handleStageUnstage()
				}
			} else if (_input === ' ') {
				if (
					sectionRef.current === 'staged' ||
					sectionRef.current === 'modified' ||
					sectionRef.current === 'untracked'
				) {
					handleStageUnstage()
				}
			} else if (_input === 'r' || _input === 'R') {
				refreshStatus()
			} else if (_input === 'c' || _input === 'C') {
				setSelectedSection('commit')
				setSelectedIndex(0)
				setIsTypingCommit(true)
			}
		},
		{isActive: true},
	)

	if (!repoRoot) {
		return (
			<Box
				flexDirection="column"
				padding={1}
			>
				<Box marginBottom={1}>
					<Text
						bold
						color="red"
					>
						─── Git ───
					</Text>
				</Box>
				<Text color="red">Not a git repository</Text>
				<Text dimColor>Run from within a git repository</Text>
			</Box>
		)
	}

	const sectionList: Section[] = [
		'staged',
		'modified',
		'untracked',
		'commit',
		'actions',
	]

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
					<Text color="cyan">─── Git ───</Text>
					<Text dimColor> {branch}</Text>
					{remoteBranch && <Text dimColor> → {remoteBranch}</Text>}
				</Text>
				<Text dimColor>{repoRoot}</Text>
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

			<Box flexDirection="column">
				{sectionList.map(section => {
					let files: string[] = []
					if (section === 'staged') files = stagedFiles
					else if (section === 'modified') files = modifiedFiles
					else if (section === 'untracked') files = untrackedFiles

					const isSelected = selectedSection === section

					return (
						<Box
							key={section}
							flexDirection="column"
							marginBottom={1}
						>
							<Box>
								<Text
									bold
									color={isSelected ? 'cyan' : 'magenta'}
								>
									{isSelected ? '❯ ' : '  '}
									{getSectionTitle(section)}
								</Text>
							</Box>

							{section === 'commit' && (
								<Box marginTop={1}>
									<Box>
										<Text dimColor>Message: </Text>
									</Box>
									<TextInput
										value={commitMessage}
										onChange={setCommitMessage}
										placeholder="Enter commit message..."
										focus={isTypingCommit}
										onSubmit={() => {
											handleCommit()
										}}
									/>
								</Box>
							)}

							{section === 'actions' && (
								<Box
									flexDirection="column"
									marginTop={1}
								>
									<Box>
										<Text
											color={
												selectedIndex === 0 && isSelected ? 'green' : undefined
											}
											bold={selectedIndex === 0 && isSelected}
										>
											{selectedIndex === 0 && isSelected ? '❯ ' : '  '}[Push]
										</Text>
									</Box>
									<Box>
										<Text
											color={
												selectedIndex === 1 && isSelected ? 'green' : undefined
											}
											bold={selectedIndex === 1 && isSelected}
										>
											{selectedIndex === 1 && isSelected ? '❯ ' : '  '}[Push
											Tags]
										</Text>
									</Box>
								</Box>
							)}

							{isSelected &&
								(section === 'staged' ||
									section === 'modified' ||
									section === 'untracked') &&
								files.length === 0 && (
									<Box marginLeft={2}>
										<Text dimColor>No files</Text>
									</Box>
								)}

							{isSelected &&
								(section === 'staged' ||
									section === 'modified' ||
									section === 'untracked') &&
								files.map((file, idx) => {
									const isFileSelected = idx === selectedIndex
									const color =
										section === 'staged'
											? 'green'
											: section === 'modified'
												? 'red'
												: 'yellow'
									return (
										<Box
											key={file}
											marginLeft={2}
										>
											<Text
												color={isFileSelected ? 'cyan' : color}
												bold={isFileSelected}
											>
												{isFileSelected ? '❯ ' : '  '}
												{color === 'green'
													? '[S] '
													: color === 'red'
														? '[M] '
														: '[?] '}
												{file}
											</Text>
										</Box>
									)
								})}
						</Box>
					)
				})}
			</Box>

			<Box
				marginTop={1}
				flexDirection="column"
			>
				<Text dimColor>
					↑↓ Navigate • Enter/Space Stage/Unstage • C=Commit • R=Refresh
				</Text>
				<Text dimColor>
					{isCommitting
						? 'Committing...'
						: isPushing
							? 'Pushing...'
							: status === 'loading'
								? 'Loading...'
								: ''}
				</Text>
			</Box>
		</Box>
	)
}
