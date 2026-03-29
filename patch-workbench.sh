#!/bin/bash
#
# Patches Antigravity's workbench JS to keep sidebar visible
# when maximizing the auxiliary bar (agent panel).
#
# What it changes:
#   1. Maximize: skips hiding the sidebar
#   2. Sidebar guard: showing sidebar no longer triggers de-maximize
#   3. Restore: skips sidebar restore (since it was never hidden)
#   4. Grow the auxiliary bar into the editor's old width
#   5. Hide "Open Agent Manager" button from titlebar
#   6. Updates checksum in product.json to suppress corruption warning
#
# Safe to re-run. Creates backups before patching.
# Re-apply after each Antigravity update.

set -euo pipefail

WORKBENCH="/Applications/Antigravity.app/Contents/Resources/app/out/vs/workbench/workbench.desktop.main.js"
PRODUCT="/Applications/Antigravity.app/Contents/Resources/app/product.json"
WORKBENCH_BAK="${WORKBENCH}.bak"
PRODUCT_BAK="${PRODUCT}.bak"

if [ ! -f "$WORKBENCH" ]; then
    echo "ERROR: Workbench file not found: $WORKBENCH"
    exit 1
fi

# Create backups if they don't exist yet
if [ ! -f "$WORKBENCH_BAK" ]; then
    cp "$WORKBENCH" "$WORKBENCH_BAK"
    echo "Backup created: $WORKBENCH_BAK"
fi
if [ ! -f "$PRODUCT_BAK" ]; then
    cp "$PRODUCT" "$PRODUCT_BAK"
    echo "Backup created: $PRODUCT_BAK"
fi

echo "Applying patches..."

python3 << 'PYEOF'
import sys, hashlib, base64, json

workbench = "/Applications/Antigravity.app/Contents/Resources/app/out/vs/workbench/workbench.desktop.main.js"
product = "/Applications/Antigravity.app/Contents/Resources/app/product.json"

# --- Patch workbench JS ---

with open(workbench, 'r') as f:
    content = f.read()

patches = 0

# PATCH 1: Grow the auxiliary bar into the editor's old width
old1 = 'const i=this.H.getViewSize(this.P).width;this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE,i),e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0),this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY,e)'
new1 = 'const i=this.H.getViewSize(this.P),n=e.editorVisible?this.H.getViewSize(this.Q).width:0;this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE,i.width),e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0),this.H.resizeView(this.P,{width:i.width+n,height:i.height}),this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY,e)'
if old1 in content:
    content = content.replace(old1, new1, 1)
    patches += 1
    print(f"  PATCH 1 applied: grow auxiliary bar into editor width")
else:
    print(f"  PATCH 1 skipped: already patched or version changed")

# PATCH 2: Remove sidebar hide from maximize path
old2 = 'e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0)'
new2 = 'e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0)'
if old2 in content:
    content = content.replace(old2, new2, 1)
    patches += 1
    print(f"  PATCH 2 applied: skip hiding sidebar during maximize")
else:
    print(f"  PATCH 2 skipped: already patched or version changed")

# PATCH 3: Remove de-maximize guard from sidebar show/hide
old3 = 'ac(t){if(!(!t&&this.setAuxiliaryBarMaximized(!1)&&this.isVisible("workbench.parts.sidebar"))){if('
new3 = 'ac(t){if(!0){if('
if old3 in content:
    content = content.replace(old3, new3, 1)
    patches += 1
    print(f"  PATCH 3 applied: sidebar toggle no longer triggers de-maximize")
else:
    print(f"  PATCH 3 skipped: already patched or version changed")

# PATCH 4: Skip sidebar restore on un-maximize
old4 = 'this.$b(!e?.editorVisible),this.dc(!e?.panelVisible),this.ac(!e?.sideBarVisible)'
new4 = 'this.$b(!e?.editorVisible),this.dc(!e?.panelVisible)'
if old4 in content:
    content = content.replace(old4, new4, 1)
    patches += 1
    print(f"  PATCH 4 applied: skip sidebar restore on un-maximize")
else:
    print(f"  PATCH 4 skipped: already patched or version changed")

# PATCH 5: Hide "Open Agent Manager" button
old5 = 'se(this.ub,this.nb),this.kb'
new5 = 'this.kb'
if old5 in content:
    content = content.replace(old5, new5, 1)
    patches += 1
    print(f"  PATCH 5 applied: hide Open Agent Manager button")
else:
    print(f"  PATCH 5 skipped: already patched or version changed")

if patches > 0:
    with open(workbench, 'w') as f:
        f.write(content)
    print(f"\n  Workbench: {patches}/5 patches applied.")
else:
    print(f"\n  Workbench: no patches needed.")

# --- Update checksum in product.json ---

with open(workbench, 'rb') as f:
    digest = hashlib.sha256(f.read()).digest()
new_checksum = base64.b64encode(digest).decode().rstrip('=')

with open(product, 'r') as f:
    prod = json.load(f)

checksum_key = 'vs/workbench/workbench.desktop.main.js'
old_checksum = prod.get('checksums', {}).get(checksum_key)

if old_checksum != new_checksum:
    prod.setdefault('checksums', {})[checksum_key] = new_checksum
    with open(product, 'w') as f:
        json.dump(prod, f, indent='\t')
    print(f"  Checksum updated: {old_checksum} -> {new_checksum}")
else:
    print(f"  Checksum already up to date.")

print("\nDone! Restart Antigravity to take effect.")
PYEOF
