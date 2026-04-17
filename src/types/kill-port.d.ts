declare module 'kill-port' {
	export default function killPort(port: number, method?: string): Promise<void>
}
