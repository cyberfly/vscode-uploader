# Change Log

All notable changes to the "vscode-uploader" extension will be documented in this file.

## [0.1.0] - 2026-01-22

### Added
- **Local File Picker for Remote Environments**: When connected to remote workspaces (GitHub Codespaces, SSH, WSL, Dev Containers), the extension now opens a webview-based file picker that allows browsing your local machine's files
- Automatic environment detection using `vscode.env.remoteName`
- Webview UI with VS Code theming for remote file uploads
- File list preview with file sizes before uploading
- Real-time upload progress in webview

### Changed
- Native file picker (`showOpenDialog`) now used only for local workspaces
- Remote workspaces use HTML5 file input to access local files

### Technical Details
- Files are read as `ArrayBuffer` in the webview and transferred via `postMessage()`
- Uses `vscode.workspace.fs.writeFile()` for writing files to remote destinations
- Maintains existing overwrite/skip functionality in both modes

## [0.0.1] - 2026-01-22

### Added
- Initial release
- "Upload Files Here..." context menu command for folders in Explorer
- Multi-file selection support
- Progress notifications with cancellation support
- Overwrite/Skip prompt for existing files
- Error handling and summary messages
- Remote workspace compatibility using VS Code FileSystem API
