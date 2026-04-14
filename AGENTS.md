# Agents Architecture

Terminal Dashboard is built on a modular agent-based architecture that enables independent, composable data providers and UI panels.

---

## 🏗 Architecture Overview

```
┌───────────────────────────────────────────────────┐
│                     CLI Entry                     │
└───────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────┐
│                  Dashboard Root                   │
├───────────┬───────────┬───────────────────────────┤
│  Layout   │  State    │      Agent Manager        │
└───────────┴───────────┴───────────────────────────┘
            ↓                     ↓
┌─────────────────────────┐ ┌────────────────────────┐
│        Panels           │ │      Data Agents       │
│ ┌─────────────────────┐ │ │ ┌────────────────────┐ │
│ │ GitHub Trends Panel │ │ │ │ GitHub Agent       │ │
│ └─────────────────────┘ │ │ └────────────────────┘ │
│ ┌─────────────────────┐ │ │ ┌────────────────────┐ │
│ │ NPM Releases Panel  │ │ │ │ NPM Registry Agent │ │
│ └─────────────────────┘ │ │ └────────────────────┘ │
│ ┌─────────────────────┐ │ │ ┌────────────────────┐ │
│ │ System Metrics Panel│ │ │ │ System Agent       │ │
│ └─────────────────────┘ │ │ └────────────────────┘ │
└─────────────────────────┘ └────────────────────────┘
```

---

## 🤖 Agent Types

### Data Agents

Independent background workers that fetch and process data:

| Agent            | Responsibility                                     | Refresh Interval |
| ---------------- | -------------------------------------------------- | ---------------- |
| **GitHub Agent** | Trending repositories, stargazers, commit activity | 5 minutes        |
| **NPM Agent**    | Latest package releases, download metrics          | 2 minutes        |
| **System Agent** | CPU, Memory, Disk, Network statistics              | 1 second         |

### UI Panel Agents

React components that render data from data agents with interactive controls:

- Each panel maintains its own internal state
- Panels register with dashboard layout manager
- Keyboard navigation is handled at panel level
- Responsive layout adapts to terminal dimensions

---

## 🔌 Agent Interface

All agents implement this standard interface:

```typescript
interface Agent<T = any> {
	id: string
	name: string
	status: 'idle' | 'loading' | 'error' | 'ready'

	start(): Promise<void>
	stop(): void
	getData(): T
	refresh(): Promise<T>

	on(event: 'data' | 'error' | 'status', handler: Function): void
}
```

---

## 🧩 Panel System

### Panel Lifecycle

1. **Register** - Panel announces itself to dashboard
2. **Mount** - React component mounts and subscribes to agent
3. **Render** - Receives data updates and re-renders
4. **Focus** - Receives keyboard input when active
5. **Unmount** - Cleanup subscriptions and resources

### Creating Custom Panels

```tsx
import {useAgent} from './hooks/useAgent'

export function MyCustomPanel() {
	const {data, status, error} = useAgent('my-agent-id')

	return (
		<Box flexDirection="column">
			<Text bold>My Custom Panel</Text>
			{status === 'loading' && <Spinner />}
			{data && <Text>{JSON.stringify(data)}</Text>}
		</Box>
	)
}
```

---

## ⚡ State Management

- Global dashboard state using React Context
- Agents maintain independent state containers
- One-way data flow: Agent → Store → Panel
- No cross-agent direct communication
- All state updates are immutable

---

## 📡 Communication Patterns

1. **Polling** - Default for most data sources
2. **WebSockets** - For real-time data streams
3. **Event Bus** - Cross-panel communication
4. **Command Queue** - User action processing

---

## ✅ Best Practices

### For Agents

- Always implement proper cleanup in `stop()`
- Use exponential backoff for failed requests
- Cache responses appropriately
- Never block the event loop
- Emit errors instead of throwing

### For Panels

- Keep render methods fast
- Handle loading and error states
- Support keyboard navigation
- Adapt to terminal dimensions
- Cleanup subscriptions on unmount

---

## 🚀 Extension Points

1. Add new data agents
2. Create custom panels
3. Implement new layout modes
4. Add keyboard command handlers
5. Extend dashboard configuration
