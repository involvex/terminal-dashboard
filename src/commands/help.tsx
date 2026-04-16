import pkg from '../../package.json' with {type: 'json'}
import {Text, Box} from 'ink'

export default function Help() {
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
					─── Help ───
				</Text>
			</Box>

			<Box
				flexDirection="column"
				marginBottom={2}
			>
				<Text
					bold
					color="magenta"
				>
					Usage:
				</Text>
				<Box
					marginLeft={2}
					flexDirection="column"
				>
					<Text>
						{' '}
						$ <Text color="white">{pkg.name}</Text>
					</Text>
					<Text>
						{' '}
						$ <Text color="white">{pkg.name} help</Text>
					</Text>
					<Text>
						{' '}
						$ <Text color="white">{pkg.name} --version</Text>
					</Text>
					<Text>
						{' '}
						$ <Text color="white">{pkg.name} --about</Text>
					</Text>
					<Text>
						{' '}
						$ <Text color="white">{pkg.name} --settings</Text>
					</Text>
					<Text>
						{' '}
						$ <Text color="white">{pkg.name} --demo</Text>
					</Text>
				</Box>
			</Box>

			<Box
				flexDirection="column"
				marginBottom={2}
			>
				<Text
					bold
					color="magenta"
				>
					Commands:
				</Text>
				<Box
					marginLeft={2}
					flexDirection="column"
				>
					<Text>
						<Text color="cyan">dashboard</Text>
						<Text dimColor> Launch dashboard (default)</Text>
					</Text>
					<Text>
						<Text color="cyan">help</Text>
						<Text dimColor> Show help (-h, --help)</Text>
					</Text>
					<Text>
						<Text color="cyan">version</Text>
						<Text dimColor> Show version (-v, --version)</Text>
					</Text>
					<Text>
						<Text color="cyan">about</Text>
						<Text dimColor> Show about info</Text>
					</Text>
					<Text>
						<Text color="cyan">welcome</Text>
						<Text dimColor> Show welcome screen</Text>
					</Text>
					<Text>
						<Text color="cyan">demo</Text>
						<Text dimColor> Show component demo</Text>
					</Text>
					<Text>
						<Text color="cyan">settings</Text>
						<Text dimColor> Open settings</Text>
					</Text>
					<Text>
						<Text color="cyan">git</Text>
						<Text dimColor> Open Git panel</Text>
					</Text>
				</Box>
			</Box>

			<Box
				flexDirection="column"
				marginBottom={2}
			>
				<Text
					bold
					color="magenta"
				>
					Dashboard Navigation:
				</Text>
				<Box
					marginLeft={2}
					flexDirection="column"
				>
					<Text>
						<Text color="green">Tab</Text>
						<Text dimColor> Cycle panels</Text>
					</Text>
					<Text>
						<Text color="green">↑/↓/←/→</Text>
						<Text dimColor> Navigate panels</Text>
					</Text>
					<Text>
						<Text color="green">M</Text>
						<Text dimColor> Open menu</Text>
					</Text>
					<Text>
						<Text color="green">Esc/Q</Text>
						<Text dimColor> Quit</Text>
					</Text>
				</Box>
			</Box>

			<Box
				flexDirection="column"
				marginBottom={2}
			>
				<Text
					bold
					color="magenta"
				>
					Panel Controls:
				</Text>
				<Box
					marginLeft={2}
					flexDirection="column"
				>
					<Text>
						<Text color="green">GitHub</Text>
						<Text dimColor> L=Language T=Time</Text>
					</Text>
					<Text>
						<Text color="green">NPM</Text>
						<Text dimColor> C=Category T=Time</Text>
					</Text>
				</Box>
			</Box>

			<Box
				flexDirection="column"
				marginBottom={2}
			>
				<Text
					bold
					color="magenta"
				>
					Git Panel:
				</Text>
				<Box
					marginLeft={2}
					flexDirection="column"
				>
					<Text>
						<Text color="green">↑/↓</Text>
						<Text dimColor> Navigate files/sections</Text>
					</Text>
					<Text>
						<Text color="green">Space/Enter</Text>
						<Text dimColor> Stage/Unstage file</Text>
					</Text>
					<Text>
						<Text color="green">C</Text>
						<Text dimColor> Open commit input</Text>
					</Text>
					<Text>
						<Text color="green">R</Text>
						<Text dimColor> Refresh status</Text>
					</Text>
				</Box>
			</Box>

			<Box flexDirection="column">
				<Text
					bold
					color="magenta"
				>
					Options:
				</Text>
				<Box
					marginLeft={2}
					flexDirection="column"
				>
					<Text>
						<Text color="green">-h, --help</Text>
						<Text dimColor> Show help</Text>
					</Text>
					<Text>
						<Text color="green">-v, --version</Text>
						<Text dimColor> Show version</Text>
					</Text>
					<Text>
						<Text color="green">-d, --debug</Text>
						<Text dimColor> Enable debug mode</Text>
					</Text>
					<Text>
						<Text color="green">--no-clear</Text>
						<Text dimColor> Disable clear on exit</Text>
					</Text>
				</Box>
			</Box>
		</Box>
	)
}
