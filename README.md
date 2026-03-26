# Agent Focus Mode for Google Antigravity

A self-patching extension that adds **Agent Focus Mode** to Google Antigravity — maximizing the agent panel while keeping the sidebar visible.

By default, Antigravity's "Maximize Secondary Side Bar" hides *everything* including the sidebar. This extension patches that behavior so the sidebar stays visible, giving you a clean **sidebar + full-width agent** layout.

## Installation

Copy this folder to your Antigravity extensions directory:

```bash
cp -r . ~/.antigravity/extensions/agent-focus-mode-0.0.1
```

Register it in `~/.antigravity/extensions/extensions.json` by adding:

```json
{
    "identifier": { "id": "local.agent-focus-mode" },
    "version": "0.1.0",
    "location": {
        "$mid": 1,
        "path": "<HOME>/.antigravity/extensions/agent-focus-mode-0.0.1",
        "scheme": "file"
    },
    "relativeLocation": "agent-focus-mode-0.0.1",
    "metadata": { "source": "local" }
}
```

Restart Antigravity. The extension auto-patches on first launch and prompts you to restart.

## Usage

- **Status bar**: Click "Agent Focus" in the bottom-right
- **Command Palette**: `Cmd+Shift+P` → "Agent Focus Mode: Toggle"

## How it works

On startup, the extension checks if the workbench needs patching. If so, it:

1. Creates backups of the original files
2. Applies 3 surgical patches to `workbench.desktop.main.js`
3. Updates the checksum in `product.json` (prevents "corrupted installation" warning)
4. Prompts you to restart

After an **Antigravity update**, the extension detects the patch is missing and re-applies it automatically on next launch.

### The 3 patches

| # | What | Why |
|---|------|-----|
| 1 | Skip hiding sidebar during auxiliary bar maximize | Sidebar stays visible in agent focus mode |
| 2 | Remove de-maximize guard from sidebar toggle | Toggling sidebar no longer undoes the maximize |
| 3 | Skip sidebar restore on un-maximize | Sidebar was never hidden, no need to restore |

## Commands

| Command | Description |
|---------|-------------|
| `Agent Focus Mode: Toggle` | Toggle maximized agent panel |
| `Agent Focus Mode: Apply Patch` | Manually re-apply the workbench patch |
| `Agent Focus Mode: Revert Patch` | Restore original workbench from backup |

## Files

| File | Purpose |
|------|---------|
| `extension.js` | Extension logic: auto-patch, toggle, status bar |
| `package.json` | Extension manifest |
| `patch-workbench.sh` | Standalone patch script (optional, for manual use) |
| `unpatch-workbench.sh` | Standalone revert script (optional, for manual use) |

## Tested on

- Antigravity 1.107.0 (macOS)
