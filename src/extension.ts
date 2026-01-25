import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Check if VS Code is connected to a remote environment
 */
function isRemoteEnvironment(): boolean {
    return vscode.env.remoteName !== undefined;
}

/**
 * Generate HTML for the local file picker webview
 */
function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Files</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        h2 {
            margin-bottom: 20px;
            color: var(--vscode-foreground);
        }
        .file-input-container {
            margin-bottom: 20px;
        }
        .browse-btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 14px;
            border-radius: 2px;
        }
        .browse-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .file-list {
            margin: 20px 0;
            padding: 10px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            min-height: 100px;
            max-height: 300px;
            overflow-y: auto;
        }
        .file-item {
            padding: 5px 10px;
            margin: 5px 0;
            background-color: var(--vscode-list-hoverBackground);
            border-radius: 2px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .file-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .file-size {
            color: var(--vscode-descriptionForeground);
            margin-left: 10px;
            font-size: 12px;
        }
        .upload-btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 30px;
            cursor: pointer;
            font-size: 14px;
            border-radius: 2px;
            margin-top: 10px;
        }
        .upload-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .upload-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .empty-message {
            color: var(--vscode-descriptionForeground);
            text-align: center;
            padding: 20px;
        }
        .status {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
        }
        .status.uploading {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
        }
        #fileInput {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Upload Files to Remote</h2>
        <p>Select files from your local machine to upload to the remote workspace.</p>

        <div class="file-input-container">
            <input type="file" id="fileInput" multiple />
            <button class="browse-btn" onclick="document.getElementById('fileInput').click()">
                Browse Files...
            </button>
        </div>

        <div class="file-list" id="fileList">
            <div class="empty-message">No files selected</div>
        </div>

        <button class="upload-btn" id="uploadBtn" disabled onclick="uploadFiles()">
            Upload Selected Files
        </button>

        <div class="status" id="status" style="display: none;"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let selectedFiles = [];

        document.getElementById('fileInput').addEventListener('change', function(e) {
            selectedFiles = Array.from(e.target.files);
            updateFileList();
        });

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function updateFileList() {
            const fileList = document.getElementById('fileList');
            const uploadBtn = document.getElementById('uploadBtn');

            if (selectedFiles.length === 0) {
                fileList.innerHTML = '<div class="empty-message">No files selected</div>';
                uploadBtn.disabled = true;
                return;
            }

            fileList.innerHTML = selectedFiles.map((file, index) =>
                '<div class="file-item">' +
                    '<span class="file-name">' + escapeHtml(file.name) + '</span>' +
                    '<span class="file-size">' + formatFileSize(file.size) + '</span>' +
                '</div>'
            ).join('');

            uploadBtn.disabled = false;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        async function uploadFiles() {
            if (selectedFiles.length === 0) return;

            const uploadBtn = document.getElementById('uploadBtn');
            const status = document.getElementById('status');

            uploadBtn.disabled = true;
            status.style.display = 'block';
            status.className = 'status uploading';
            status.textContent = 'Reading files...';

            const filesData = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                status.textContent = 'Reading ' + file.name + ' (' + (i + 1) + '/' + selectedFiles.length + ')...';

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    filesData.push({
                        name: file.name,
                        data: Array.from(new Uint8Array(arrayBuffer))
                    });
                } catch (err) {
                    vscode.postMessage({
                        type: 'error',
                        message: 'Failed to read file: ' + file.name
                    });
                    uploadBtn.disabled = false;
                    status.style.display = 'none';
                    return;
                }
            }

            status.textContent = 'Uploading ' + filesData.length + ' file(s)...';

            vscode.postMessage({
                type: 'upload',
                files: filesData
            });
        }

        window.addEventListener('message', function(event) {
            const message = event.data;
            const status = document.getElementById('status');
            const uploadBtn = document.getElementById('uploadBtn');

            if (message.type === 'uploadComplete') {
                status.textContent = 'Upload complete!';
                status.className = 'status';
                status.style.backgroundColor = 'var(--vscode-inputValidation-infoBackground)';
                selectedFiles = [];
                document.getElementById('fileInput').value = '';
                updateFileList();
                setTimeout(function() {
                    status.style.display = 'none';
                }, 2000);
            } else if (message.type === 'uploadError') {
                status.textContent = 'Error: ' + message.message;
                status.className = 'status';
                status.style.backgroundColor = 'var(--vscode-inputValidation-errorBackground)';
                uploadBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Show a webview-based local file picker for remote environments
 */
async function showLocalFilePicker(
    context: vscode.ExtensionContext,
    destinationUri: vscode.Uri
): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
        'localFilePicker',
        'Upload Files',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
        async (message) => {
            if (message.type === 'upload') {
                const files = message.files as Array<{ name: string; data: number[] }>;
                const errors: string[] = [];
                const skipped: string[] = [];
                let successCount = 0;

                for (const file of files) {
                    const targetUri = vscode.Uri.joinPath(destinationUri, file.name);

                    try {
                        let shouldWrite = true;

                        try {
                            await vscode.workspace.fs.stat(targetUri);
                            const choice = await vscode.window.showWarningMessage(
                                `"${file.name}" already exists. Overwrite?`,
                                { modal: true },
                                'Overwrite',
                                'Skip'
                            );

                            if (choice === 'Skip' || !choice) {
                                skipped.push(file.name);
                                shouldWrite = false;
                            }
                        } catch {
                            // File doesn't exist, proceed with write
                        }

                        if (shouldWrite) {
                            const fileData = new Uint8Array(file.data);
                            await vscode.workspace.fs.writeFile(targetUri, fileData);
                            successCount++;
                        }
                    } catch (err) {
                        const errorMsg = err instanceof Error ? err.message : String(err);
                        errors.push(`${file.name}: ${errorMsg}`);
                    }
                }

                if (errors.length > 0) {
                    panel.webview.postMessage({
                        type: 'uploadError',
                        message: errors.join(', ')
                    });
                    vscode.window.showErrorMessage(
                        `Upload completed with errors:\n${errors.join('\n')}`
                    );
                } else {
                    panel.webview.postMessage({ type: 'uploadComplete' });
                    if (skipped.length > 0) {
                        vscode.window.showInformationMessage(
                            `Uploaded ${successCount} file(s), skipped ${skipped.length} file(s).`
                        );
                    } else {
                        vscode.window.showInformationMessage(
                            `Successfully uploaded ${successCount} file(s).`
                        );
                    }
                    panel.dispose();
                }
            } else if (message.type === 'error') {
                vscode.window.showErrorMessage(message.message);
            }
        },
        undefined,
        context.subscriptions
    );
}

/**
 * Upload files using the native file picker (for local environments)
 */
async function uploadFilesWithNativePicker(destinationUri: vscode.Uri): Promise<void> {
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

/**
 * Resolve destination URI for file upload
 * Priority: explicit URI > active file's parent directory > workspace root
 */
function resolveDestinationUri(destinationUri?: vscode.Uri): vscode.Uri | undefined {
    if (destinationUri) {
        return destinationUri;
    }

    // Use parent directory of active file
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.scheme === 'file') {
        return vscode.Uri.joinPath(activeEditor.document.uri, '..');
    }

    // Fall back to workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        return workspaceFolders[0].uri;
    }

    return undefined;
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'ez-file-upload.uploadFiles',
        async (destinationUri?: vscode.Uri) => {
            const resolvedUri = resolveDestinationUri(destinationUri);
            if (!resolvedUri) {
                vscode.window.showErrorMessage('No destination folder available. Please open a workspace or file first.');
                return;
            }

            // Determine if called from context menu (destinationUri is provided)
            const isContextMenu = destinationUri !== undefined;

            // Get configuration setting for context menu confirmation
            const config = vscode.workspace.getConfiguration('ez-file-upload');
            const confirmContextMenuUpload = config.get<boolean>('confirmContextMenuUpload', false);

            // Show confirmation only if:
            // - Called from command palette (not context menu), OR
            // - Called from context menu AND user enabled confirmation setting
            const shouldConfirm = !isContextMenu || confirmContextMenuUpload;

            let finalUri: vscode.Uri;

            if (shouldConfirm) {
                // Ask user to confirm or change the upload location
                const selectedPath = await vscode.window.showInputBox({
                    value: resolvedUri.fsPath,
                    prompt: "Confirm upload location (press Enter to confirm, Esc to cancel)",
                    title: 'Upload Location',
                    valueSelection: [resolvedUri.fsPath.length, resolvedUri.fsPath.length],
                    validateInput: async (value) => {
                        if (!value || value.trim() === '') {
                            return 'Path cannot be empty';
                        }
                        try {
                            const uri = vscode.Uri.file(value);
                            const stat = await vscode.workspace.fs.stat(uri);
                            if (stat.type !== vscode.FileType.Directory) {
                                return 'Path must be a directory';
                            }
                        } catch {
                            return 'Directory does not exist';
                        }
                        return null;
                    }
                });

                if (!selectedPath) {
                    return; // User cancelled
                }

                finalUri = vscode.Uri.file(selectedPath);
            } else {
                // Use resolved URI directly (context menu with confirmation disabled)
                finalUri = resolvedUri;
            }

            // Route to appropriate picker based on environment
            if (isRemoteEnvironment()) {
                await showLocalFilePicker(context, finalUri);
            } else {
                await uploadFilesWithNativePicker(finalUri);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
