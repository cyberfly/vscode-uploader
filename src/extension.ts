import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'vscode-uploader.uploadFiles',
        async (destinationUri: vscode.Uri) => {
            if (!destinationUri) {
                vscode.window.showErrorMessage('No destination folder selected.');
                return;
            }

            const selectedFiles = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: true,
                openLabel: 'Upload',
                title: 'Select Files to Upload'
            });

            if (!selectedFiles || selectedFiles.length === 0) {
                return;
            }

            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Uploading files',
                    cancellable: true
                },
                async (progress, token) => {
                    const errors: string[] = [];
                    const skipped: string[] = [];
                    let successCount = 0;

                    for (let i = 0; i < selectedFiles.length; i++) {
                        if (token.isCancellationRequested) {
                            vscode.window.showWarningMessage(
                                `Upload cancelled. ${successCount} file(s) uploaded, ${selectedFiles.length - i} remaining.`
                            );
                            return;
                        }

                        const sourceUri = selectedFiles[i];
                        const fileName = path.basename(sourceUri.fsPath);
                        const targetUri = vscode.Uri.joinPath(destinationUri, fileName);

                        progress.report({
                            message: `${fileName} (${i + 1}/${selectedFiles.length})`,
                            increment: (100 / selectedFiles.length)
                        });

                        try {
                            let shouldCopy = true;

                            try {
                                await vscode.workspace.fs.stat(targetUri);
                                const choice = await vscode.window.showWarningMessage(
                                    `"${fileName}" already exists. Overwrite?`,
                                    { modal: true },
                                    'Overwrite',
                                    'Skip'
                                );

                                if (choice === 'Skip' || !choice) {
                                    skipped.push(fileName);
                                    shouldCopy = false;
                                }
                            } catch {
                                // File doesn't exist, proceed with copy
                            }

                            if (shouldCopy) {
                                await vscode.workspace.fs.copy(sourceUri, targetUri, { overwrite: true });
                                successCount++;
                            }
                        } catch (err) {
                            const errorMsg = err instanceof Error ? err.message : String(err);
                            errors.push(`${fileName}: ${errorMsg}`);
                        }
                    }

                    if (errors.length > 0) {
                        vscode.window.showErrorMessage(
                            `Upload completed with errors:\n${errors.join('\n')}`
                        );
                    } else if (skipped.length > 0) {
                        vscode.window.showInformationMessage(
                            `Uploaded ${successCount} file(s), skipped ${skipped.length} file(s).`
                        );
                    } else {
                        vscode.window.showInformationMessage(
                            `Successfully uploaded ${successCount} file(s).`
                        );
                    }
                }
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
