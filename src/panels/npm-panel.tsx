import React, {useState, useEffect, useCallback} from 'react'
import {useFontScale} from '../hooks/useFontScale.js'
import Panel from '../components/panel.js'
import {Box, Text, useInput} from 'ink'
import fetch from 'node-fetch'

interface NpmPackage {
	name: string
	version: string
	description: string
	date: string
	author: string
}

type Category =
	| 'all'
	| 'frontend'
	| 'backend'
	| 'cli'
	| 'docs'
	| 'css'
	| 'testing'
	| 'iot'
	| 'coverage'
	| 'mobile'
	| 'frameworks'
	| 'robotics'
	| 'math'

type TimeFrame = 'today' | 'week'

const CATEGORIES: Category[] = [
	'all',
	'frontend',
	'backend',
	'cli',
	'docs',
	'css',
	'testing',
	'iot',
	'coverage',
	'mobile',
	'frameworks',
	'robotics',
	'math',
]

const TIMEFRAMES: TimeFrame[] = ['today', 'week']

const CATEGORY_LABELS: Record<Category, string> = {
	all: 'all',
	frontend: 'FE',
	backend: 'BE',
	cli: 'CLI',
	docs: 'DOC',
	css: 'CSS',
	testing: 'Test',
	iot: 'IoT',
	coverage: 'Cov',
	mobile: 'Mob',
	frameworks: 'Fmk',
	robotics: 'Rob',
	math: 'Math',
}

const CATEGORY_QUERIES: Record<Category, string> = {
	all: '',
	frontend: 'react+vue+angular+svelte+ui+component+hook',
	backend: 'server+api+express+database+backend+http+rest+graphql',
	cli: 'cli+command+bin+terminal+ink+yargs+commander',
	docs: 'docs+documentation+markdown+readme+typedoc',
	css: 'css+style+tailwind+sass+scss+theme+styled',
	testing: 'test+jest+vitest+mocha+cypress+mock',
	iot: 'iot+arduino+raspberry+sensor+embedded+firmware',
	coverage: 'coverage+nyc+istanbul+c8+coveralls',
	mobile: 'react-native+mobile+expo+capacitor+ionic',
	frameworks: 'framework+scaffold+boilerplate+starter+template',
	robotics: 'robotics+robot+ros+motor+servo+drone',
	math: 'math+algorithm+numeric+statistics+calc',
}

const FALLBACK_PACKAGES: NpmPackage[] = [
	{
		name: 'react',
		version: '19.1.0',
		description: 'React is a JavaScript library for building user interfaces.',
		date: new Date().toISOString(),
		author: 'facebook',
	},
	{
		name: 'next',
		version: '15.3.0',
		description: 'The React Framework for the Web.',
		date: new Date().toISOString(),
		author: 'vercel',
	},
	{
		name: 'typescript',
		version: '5.8.0',
		description: 'TypeScript is a language for application-scale JavaScript.',
		date: new Date().toISOString(),
		author: 'microsoft',
	},
	{
		name: 'tailwindcss',
		version: '4.1.0',
		description: 'A utility-first CSS framework for rapid UI development.',
		date: new Date().toISOString(),
		author: 'tailwindlabs',
	},
	{
		name: 'vite',
		version: '6.3.0',
		description: 'Next generation frontend tooling.',
		date: new Date().toISOString(),
		author: 'vitejs',
	},
	{
		name: 'eslint',
		version: '9.24.0',
		description: 'An AST-based pattern checker for JavaScript.',
		date: new Date().toISOString(),
		author: 'eslint',
	},
]

interface Props {
	isActive: boolean
	dimensions?: {columns: number; rows: number}
}

function parseNpmDate(dateStr: string): Date {
	try {
		return new Date(dateStr)
	} catch {
		return new Date()
	}
}

function isWithinTimeFrame(date: Date, timeframe: TimeFrame): boolean {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffHours = diffMs / (1000 * 60 * 60)

	if (timeframe === 'today') {
		return diffHours <= 24
	}
	return diffHours <= 24 * 7
}

function matchesCategory(
	name: string,
	description: string,
	category: Category,
): boolean {
	if (category === 'all') return true

	const searchText = `${name} ${description}`.toLowerCase()
	const keywords = CATEGORY_QUERIES[category]
		.split('+')
		.filter(k => k.length > 0)

	return keywords.some(keyword => searchText.includes(keyword.toLowerCase()))
}

function categorizePackage(name: string, description: string): Category {
	const specificCategories: Category[] = [
		'frontend',
		'backend',
		'cli',
		'css',
		'testing',
		'frameworks',
		'mobile',
		'docs',
		'iot',
		'coverage',
		'robotics',
		'math',
	]
	for (const cat of specificCategories) {
		if (matchesCategory(name, description, cat)) return cat
	}
	return 'cli'
}

export default function NpmReleasesPanel({isActive, dimensions}: Props) {
	const {columns = 120, rows = 30} = dimensions || {}
	const fontScale = useFontScale(columns, rows)

	const [allPackages, setAllPackages] =
		useState<NpmPackage[]>(FALLBACK_PACKAGES)
	const [loading, setLoading] = useState(true)
	const [category, setCategory] = useState<Category>('all')
	const [timeframe, setTimeframe] = useState<TimeFrame>('today')

	const fetchReleases = useCallback(async () => {
		try {
			setLoading(true)

			// Use NPM registry - get recently updated packages
			const response = await fetch(
				'https://registry.npmjs.org/-/v1/search?text=&size=50&from=0&quality=0.65&popularity=0.8&maintenance=0.5',
			)

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}

			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			const data: any = await response.json()

			const packages: NpmPackage[] = (data.objects || [])
				.map(
					(obj: {
						package: {
							name: string
							version: string
							description: string
							date: string
							author?: {name?: string} | string
						}
					}) => {
						const pkg = obj.package
						const authorName =
							typeof pkg.author === 'object' && pkg.author?.name
								? pkg.author.name
								: typeof pkg.author === 'string'
									? pkg.author
									: 'unknown'
						return {
							name: pkg.name || 'unknown',
							version: pkg.version || '0.0.0',
							description: (pkg.description || '').substring(0, 100),
							date: pkg.date || new Date().toISOString(),
							author: authorName,
						}
					},
				)
				.filter(
					(pkg: NpmPackage) =>
						pkg.name !== 'unknown' && pkg.version !== '0.0.0',
				)

			if (packages.length > 0) {
				setAllPackages(packages)
			} else {
				// If API returned empty results, use fallback
				setAllPackages(FALLBACK_PACKAGES)
			}
		} catch (_e) {
			// Use fallback data on error
			console.error('Failed to fetch NPM releases:', _e)
			setAllPackages(FALLBACK_PACKAGES)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchReleases()
		const interval = setInterval(fetchReleases, 600000)
		return () => clearInterval(interval)
	}, [fetchReleases])

	useInput(
		(_input, _key) => {
			if (!isActive) return

			if (_input === 'c' || _input === 'C') {
				setCategory(prev => {
					const idx = CATEGORIES.indexOf(prev)
					return CATEGORIES[(idx + 1) % CATEGORIES.length]
				})
			}
			if (_input === 't' || _input === 'T') {
				setTimeframe(prev => {
					const idx = TIMEFRAMES.indexOf(prev)
					return TIMEFRAMES[(idx + 1) % TIMEFRAMES.length]
				})
			}
		},
		{isActive: isActive},
	)

	const filteredPackages = allPackages.filter(pkg => {
		const date = parseNpmDate(pkg.date)
		if (!isWithinTimeFrame(date, timeframe)) return false
		return matchesCategory(pkg.name, pkg.description, category)
	})

	// Group packages by category when viewing "all"
	const groupedPackages: [Category, NpmPackage[]][] = []
	if (category === 'all') {
		const groups = new Map<Category, NpmPackage[]>()
		for (const pkg of filteredPackages) {
			const cat = categorizePackage(pkg.name, pkg.description)
			if (!groups.has(cat)) groups.set(cat, [])
			groups.get(cat)!.push(pkg)
		}
		for (const [cat, pkgs] of groups) {
			groupedPackages.push([cat, pkgs.slice(0, 2)])
		}
		// Limit to 5 groups max
		groupedPackages.length = Math.min(groupedPackages.length, 5)
	}

	const formatTimeAgo = (dateStr: string) => {
		const date = parseNpmDate(dateStr)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffHours = diffMs / (1000 * 60 * 60)

		if (diffHours < 1) {
			const mins = Math.floor(diffMs / (1000 * 60))
			return `${mins}m ago`
		}
		if (diffHours < 24) {
			return `${Math.floor(diffHours)}h ago`
		}
		return `${Math.floor(diffHours / 24)}d ago`
	}

	const renderPackage = (pkg: NpmPackage, i: number) => (
		<Box
			key={`${pkg.name}-${i}`}
			flexDirection="column"
		>
			<Box justifyContent="space-between">
				<Text>
					<Text
						color="magenta"
						bold
					>
						{pkg.name}
					</Text>
					<Text dimColor> @ </Text>
					<Text color="cyan">{pkg.version}</Text>
				</Text>
				<Text dimColor>{formatTimeAgo(pkg.date)}</Text>
			</Box>
			<Text
				dimColor
				wrap="truncate-end"
			>
				{pkg.description}
			</Text>
		</Box>
	)

	const title = `📦 NPM [${CATEGORY_LABELS[category]}] [${timeframe}]`

	return (
		<Panel
			title={title}
			isActive={isActive}
			isLoading={loading}
		>
			<Box
				flexDirection="column"
				gap={fontScale.gap}
			>
				{filteredPackages.length === 0 && !loading && (
					<Box
						flexDirection="column"
						alignItems="center"
						paddingY={1}
					>
						<Text dimColor>No packages found for this filter.</Text>
						<Text dimColor>Press C to change category</Text>
					</Box>
				)}
				{category === 'all' && groupedPackages.length > 0
					? groupedPackages.map(([cat, pkgs]) => (
							<Box
								key={cat}
								flexDirection="column"
								marginBottom={1}
							>
								<Text
									bold
									color="yellow"
								>
									── {CATEGORY_LABELS[cat]} ──
								</Text>
								{pkgs.map((pkg, i) => renderPackage(pkg, i))}
							</Box>
						))
					: category !== 'all' &&
						filteredPackages.slice(0, 6).map((pkg, i) => (
							<Box
								key={`${pkg.name}-${i}`}
								flexDirection="column"
								marginBottom={1}
							>
								<Box justifyContent="space-between">
									<Text>
										<Text
											color="magenta"
											bold
										>
											{pkg.name}
										</Text>
										<Text dimColor> @ </Text>
										<Text color="cyan">{pkg.version}</Text>
									</Text>
									<Text dimColor>{formatTimeAgo(pkg.date)}</Text>
								</Box>
								<Text
									dimColor
									wrap="truncate-end"
								>
									{pkg.description}
								</Text>
							</Box>
						))}
				{isActive && <Text dimColor> C=Category T=Time</Text>}
			</Box>
		</Panel>
	)
}
