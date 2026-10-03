# Dedicated Output Channel

**Priority:** P2

Agent Manager has its own output channel. No general "Tavern Code" output channel exists.

## Remaining Work

- Create `vscode.window.createOutputChannel("Tavern Code")` during activation
- Centralized logging utility with log levels (debug, info, warn, error)
- Route all `[Tavern New]` log messages to this channel
- Dispose on deactivation
- Migrate existing `console.log("[Tavern New] ...")` calls to the logger
