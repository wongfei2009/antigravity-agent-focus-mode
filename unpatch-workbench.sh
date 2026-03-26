#!/bin/bash
#
# Reverts the Agent Focus Mode patch by restoring backups.

set -euo pipefail

WORKBENCH="/Applications/Antigravity.app/Contents/Resources/app/out/vs/workbench/workbench.desktop.main.js"
PRODUCT="/Applications/Antigravity.app/Contents/Resources/app/product.json"
WORKBENCH_BAK="${WORKBENCH}.bak"
PRODUCT_BAK="${PRODUCT}.bak"

restored=0

if [ -f "$WORKBENCH_BAK" ]; then
    cp "$WORKBENCH_BAK" "$WORKBENCH"
    echo "Restored: workbench.desktop.main.js"
    restored=$((restored + 1))
else
    echo "No workbench backup found."
fi

if [ -f "$PRODUCT_BAK" ]; then
    cp "$PRODUCT_BAK" "$PRODUCT"
    echo "Restored: product.json"
    restored=$((restored + 1))
else
    echo "No product.json backup found."
fi

if [ $restored -gt 0 ]; then
    echo "Done! Restart Antigravity to take effect."
else
    echo "Nothing to restore."
fi
