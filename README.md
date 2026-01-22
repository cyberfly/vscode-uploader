# File Uploader for VS Code

A simple VS Code extension that adds "Upload Files Here..." to the Explorer context menu, allowing you to easily copy files from anywhere on your system into your workspace folders.

## Features

- **Context Menu Integration**: Right-click any folder in the Explorer to upload files
- **Multi-file Selection**: Select and upload multiple files at once
- **Smart Environment Detection**: Automatically uses the right file picker for your environment
  - **Local Workspaces**: Native OS file picker dialog
  - **Remote Workspaces**: Webview-based picker to browse your local machine's files
- **Progress Tracking**: Real-time progress notifications during upload
- **Conflict Resolution**: Automatically prompts when files already exist (Overwrite/Skip)
- **Cancellable Operations**: Cancel uploads in progress (local workspaces)
- **Remote Workspace Support**: Full support for GitHub Codespaces, SSH, WSL, and Dev Containers

## Usage

### Local Workspaces
1. Right-click any folder in the VS Code Explorer
2. Select "Upload Files Here..." from the context menu
3. Choose one or more files from the native OS file picker dialog
4. Monitor progress in the notification
5. If a file already exists, choose to Overwrite or Skip

### Remote Workspaces (Codespaces, SSH, WSL, Dev Containers)
1. Right-click any folder in the VS Code Explorer
2. Select "Upload Files Here..." from the context menu
3. A webview panel opens with "Browse Files..." button
4. Click "Browse Files..." to open your local machine's file picker
5. Select one or more files from your local computer
6. Review the file list with sizes in the webview
7. Click "Upload Selected Files"
8. If a file already exists, choose to Overwrite or Skip
9. The webview closes automatically upon successful upload

## Installation

### From VSIX
1. Download the `.vsix` file
2. In VS Code, open Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Click the "..." menu → "Install from VSIX..."
4. Select the downloaded `.vsix` file

### From Source
```bash
git clone <repository-url>
cd vscode-uploader
npm install
npm run compile
```

Press F5 to launch the Extension Development Host for testing.

## Building

```bash
# Compile TypeScript
npm run compile

# Package as VSIX
npx @vscode/vsce package
```

## Requirements

- VS Code version 1.85.0 or higher

## Development

### Architecture

The extension intelligently adapts to different VS Code environments:

**Local Workspaces:**
- Uses `vscode.window.showOpenDialog()` for native OS file picker
- Files copied using `vscode.workspace.fs.copy()`

**Remote Workspaces:**
- Detects remote environment via `vscode.env.remoteName`
- Opens a webview panel with HTML5 `<input type="file">` element
- Files read as `ArrayBuffer` in the webview's JavaScript context
- Data transferred to extension via `postMessage()`
- Files written using `vscode.workspace.fs.writeFile()`

This approach ensures that file selection always happens on the local machine, even when VS Code is connected to:
- GitHub Codespaces
- Remote SSH workspaces
- WSL (Windows Subsystem for Linux)
- Dev Containers
- Any remote environment where `vscode.env.remoteName` is defined

## License

See LICENSE file for details.
