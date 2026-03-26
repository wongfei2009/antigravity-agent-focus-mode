# Agent Focus Mode for Google Antigravity

A minimal extension + workbench patch that adds an **Agent Focus Mode** to Google Antigravity — maximizing the agent panel while keeping the sidebar visible.

By default, Antigravity's "Maximize Secondary Side Bar" hides *everything* including the sidebar. This patch modifies that behavior so the sidebar stays visible, giving you a clean **sidebar + full-width agent** layout.

## What's included

| File | Purpose |
|------|---------|
| `extension.js` | Registers a status bar button and command to toggle agent focus mode |
| `package.json` | Extension manifest |
| `patch-workbench.sh` | Patches `workbench.desktop.main.js` to keep sidebar visible during maximize |
| `unpatch-workbench.sh` | Reverts all patches from backup |

## Installation

### 1. Install the extension

Copy this folder to your Antigravity extensions directory:

```bash
cp -r . ~/.antigravity/extensions/agent-focus-mode-0.0.1
```

Register it in `~/.antigravity/extensions/extensions.json` by adding:

```json
{
    "identifier": { "id": "local.agent-focus-mode" },
    "version": "0.0.1",
    "location": {
        "$mid": 1,
        "path": "<HOME>/.antigravity/extensions/agent-focus-mode-0.0.1",
        "scheme": "file"
    },
    "relativeLocation": "agent-focus-mode-0.0.1",
    "metadata": { "source": "local" }
}
```

### 2. Apply the workbench patch

```bash
~/.antigravity/extensions/agent-focus-mode-0.0.1/patch-workbench.sh
```

### 3. Restart Antigravity

You should see an **"Agent Focus"** button in the bottom-right status bar.

## After Antigravity updates

Antigravity updates will overwrite the patched files. Re-apply:

```bash
~/.antigravity/extensions/agent-focus-mode-0.0.1/patch-workbench.sh
```

If the script reports all patches "skipped", the workbench source has changed and the patch strings need updating for the new version.

## Reverting

```bash
~/.antigravity/extensions/agent-focus-mode-0.0.1/unpatch-workbench.sh
```

## How it works

The patch makes 3 surgical changes to `workbench.desktop.main.js`:

1. **Maximize path**: Removes the call that hides the sidebar when maximizing the auxiliary bar
2. **Sidebar guard**: Removes the guard that triggers de-maximize when the sidebar is shown
3. **Restore path**: Skips redundant sidebar restore on un-maximize (since it was never hidden)

The checksum in `product.json` is also updated to prevent the "installation corrupted" warning.

## Tested on

- Antigravity 1.107.0 (macOS)
