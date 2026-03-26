const vscode = require('vscode');

let statusBarItem;

function activate(context) {
    const command = vscode.commands.registerCommand('agentFocusMode.toggle', async () => {
        try {
            await vscode.commands.executeCommand('workbench.action.toggleMaximizedAuxiliaryBar');
        } catch (err) {
            vscode.window.showErrorMessage(`Agent Focus Mode failed: ${err.message}`);
        }
    });

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'agentFocusMode.toggle';
    statusBarItem.text = '$(comment-discussion) Agent Focus';
    statusBarItem.tooltip = 'Toggle Maximized Agent Panel';
    statusBarItem.show();

    context.subscriptions.push(command, statusBarItem);
}

function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

module.exports = { activate, deactivate };
