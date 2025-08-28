# AgentEventsPanel

Displays server-sent events for a given agent. Events are consumed from
`/api/agents/events?agent=<id>` and appended in real time.

## Features

- Connection status indicator: `Connected`, `Reconnecting…` or `Error`.
- Non-blocking error toasts for parsing or connection issues (auto-dismiss after 5s).
- `MAX_ITEMS` cap (default 500) to prevent DOM/memory bloat with FIFO eviction.
- Optional auto-scroll that keeps the view pinned to the latest event.
- Batched DOM updates (~20 Hz) via `requestAnimationFrame` for smooth rendering.

## Performance tips

- Keep `MAX_ITEMS` low for heavy traffic streams.
- Disable auto-scroll if you need to inspect older events while new ones arrive.

