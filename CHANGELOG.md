# Change Log

All notable changes to the "EZ File Upload" extension will be documented in this file.

## [0.2.2] - 2026-01-25

### Added
- **Upload Location Confirmation**: Users now see a confirmation dialog before file selection
  - Shows the target upload path in an input box
  - Press Enter to confirm and proceed with file selection
  - Edit the path to change the upload destination
  - Press Esc to cancel the operation
  - Validates that the path exists and is a directory
- Prevents accidental uploads to wrong locations

### Technical Details
- Uses `vscode.window.showInputBox()` with path validation
- Input box appears before file picker in both local and remote environments
- Path validation checks for directory existence and type

## [0.2.1] - 2026-01-23

### Added
- **Command Palette Support**: Upload command now works from Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
- **Smart Destination Detection**: When invoked from Command Palette, automatically determines upload destination:
  - If a file is open in the active editor → uploads to that file's parent directory
  - If no file is open → uploads to workspace root folder
- Command available in Command Palette when a workspace is open (`workspaceFolderCount > 0`)

### Technical Details
- Added `resolveDestinationUri()` helper function for destination resolution logic
- Command handler parameter changed to optional `destinationUri?: vscode.Uri`
- Added `commandPalette` menu contribution with workspace folder condition

## [0.2.0] - 2026-01-22

### Changed
- Renamed extension from "File Uploader" to "EZ File Upload"
- Updated package name from "vscode-uploader" to "ez-file-upload"
- Updated command identifier from "vscode-uploader.uploadFiles" to "ez-file-upload.uploadFiles"
- Changed publisher from "integrasolid" to "fathurdev"

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
