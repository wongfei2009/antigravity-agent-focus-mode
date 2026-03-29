const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PATCHES, applyPatches, needsPatching } = require('./patches');

const WORKBENCH_REL = 'out/vs/workbench/workbench.desktop.main.js';
const PRODUCT_REL = 'product.json';
const CHECKSUM_KEY = 'vs/workbench/workbench.desktop.main.js';

let statusBarItem;

function getAppRoot() {
    const appRoot = vscode.env.appRoot;
    // appRoot points to /Applications/Antigravity.app/Contents/Resources/app
    return appRoot;
}

function computeChecksum(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest('base64');
    // Remove trailing '=' padding to match VS Code's format
    return hash.replace(/=+$/, '');
}

function patchWorkbench() {
    try {
        const appRoot = getAppRoot();
        const workbenchPath = path.join(appRoot, WORKBENCH_REL);
        const productPath = path.join(appRoot, PRODUCT_REL);
        const backupPath = workbenchPath + '.bak';
        const productBackupPath = productPath + '.bak';

        if (!fs.existsSync(workbenchPath)) {
            return { success: false, error: 'Workbench file not found' };
        }

        const content = fs.readFileSync(workbenchPath, 'utf8');

        if (!needsPatching(content)) {
            return { success: true, alreadyPatched: true };
        }

        // Create backups
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(workbenchPath, backupPath);
        }
        if (!fs.existsSync(productBackupPath)) {
            fs.copyFileSync(productPath, productBackupPath);
        }

        // Apply patches
        const result = applyPatches(content);
        fs.writeFileSync(workbenchPath, result.content, 'utf8');

        // Update checksum
        const newBuffer = fs.readFileSync(workbenchPath);
        const newChecksum = computeChecksum(newBuffer);
        const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));
        if (product.checksums) {
            product.checksums[CHECKSUM_KEY] = newChecksum;
            fs.writeFileSync(productPath, JSON.stringify(product, null, '\t'), 'utf8');
        }

        return { success: true, applied: result.applied };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function unpatchWorkbench() {
    try {
        const appRoot = getAppRoot();
        const workbenchPath = path.join(appRoot, WORKBENCH_REL);
        const productPath = path.join(appRoot, PRODUCT_REL);
        const backupPath = workbenchPath + '.bak';
        const productBackupPath = productPath + '.bak';

        let restored = 0;
        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, workbenchPath);
            restored++;
        }
        if (fs.existsSync(productBackupPath)) {
            fs.copyFileSync(productBackupPath, productPath);
            restored++;
        }

        return { success: restored > 0, restored };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function activate(context) {
    // --- Auto-patch on startup ---
    const appRoot = getAppRoot();
    const workbenchPath = path.join(appRoot, WORKBENCH_REL);

    if (fs.existsSync(workbenchPath)) {
        const content = fs.readFileSync(workbenchPath, 'utf8');
        if (needsPatching(content)) {
            const result = patchWorkbench();
            if (result.success && result.applied?.length > 0) {
                vscode.window
                    .showInformationMessage(
                        `Agent Focus Mode: patch applied (${result.applied.length}/${PATCHES.length}). Restart to take effect.`,
                        'Restart Now'
                    )
                    .then(choice => {
                        if (choice === 'Restart Now') {
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    });
            } else if (!result.success) {
                vscode.window.showWarningMessage(
                    `Agent Focus Mode: patch failed — ${result.error}`
                );
            }
        }
    }

    // --- Toggle command ---
    const toggleCmd = vscode.commands.registerCommand('agentFocusMode.toggle', async () => {
        try {
            await vscode.commands.executeCommand('workbench.action.toggleMaximizedAuxiliaryBar');
        } catch (err) {
            vscode.window.showErrorMessage(`Agent Focus Mode: ${err.message}`);
        }
    });

    // --- Manual patch command ---
    const patchCmd = vscode.commands.registerCommand('agentFocusMode.patch', () => {
        const result = patchWorkbench();
        if (result.success && result.alreadyPatched) {
            vscode.window.showInformationMessage('Agent Focus Mode: already patched.');
        } else if (result.success) {
            vscode.window
                .showInformationMessage(
                    `Agent Focus Mode: patch applied. Restart to take effect.`,
                    'Restart Now'
                )
                .then(choice => {
                    if (choice === 'Restart Now') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
        } else {
            vscode.window.showErrorMessage(`Agent Focus Mode: patch failed — ${result.error}`);
        }
    });

    // --- Unpatch command ---
    const unpatchCmd = vscode.commands.registerCommand('agentFocusMode.unpatch', () => {
        const result = unpatchWorkbench();
        if (result.success) {
            vscode.window
                .showInformationMessage(
                    'Agent Focus Mode: patch reverted. Restart to take effect.',
                    'Restart Now'
                )
                .then(choice => {
                    if (choice === 'Restart Now') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
        } else {
            vscode.window.showErrorMessage(
                `Agent Focus Mode: revert failed — ${result.error || 'no backup found'}`
            );
        }
    });

    // --- Status bar ---
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'agentFocusMode.toggle';
    statusBarItem.text = '$(comment-discussion) Agent Focus';
    statusBarItem.tooltip = 'Toggle Maximized Agent Panel';
    statusBarItem.show();

    context.subscriptions.push(toggleCmd, patchCmd, unpatchCmd, statusBarItem);
}

function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

module.exports = { activate, deactivate };
