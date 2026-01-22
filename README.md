# File Uploader for VS Code

A simple VS Code extension that adds "Upload Files Here..." to the Explorer context menu, allowing you to easily copy files from anywhere on your system into your workspace folders.

## Features

- **Context Menu Integration**: Right-click any folder in the Explorer to upload files
- **Multi-file Selection**: Select and upload multiple files at once
- **Progress Tracking**: Real-time progress notifications during upload
- **Conflict Resolution**: Automatically prompts when files already exist (Overwrite/Skip)
- **Cancellable Operations**: Cancel uploads in progress
- **Remote Workspace Support**: Works with remote workspaces using VS Code's FileSystem API

## Usage

1. Right-click any folder in the VS Code Explorer
2. Select "Upload Files Here..." from the context menu
3. Choose one or more files from the file picker dialog
4. Monitor progress in the notification
5. If a file already exists, choose to Overwrite or Skip

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

The extension uses VS Code's FileSystem API (`vscode.workspace.fs`) for file operations, ensuring compatibility with:
- Local workspaces
- Remote SSH workspaces
- Container workspaces
- Virtual file systems

## License

See LICENSE file for details.
