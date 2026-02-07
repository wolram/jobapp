# Repository Guidelines

## Project Structure & Module Organization
- `Shared (App)/` contains cross-platform app UI and resources (Swift, HTML/CSS/JS, assets).
- `Shared (Extension)/` contains the Safari Web Extension code and assets (`Resources/`, `manifest.json`, popup UI, background/content scripts).
- `iOS (App)/` and `macOS (App)/` hold platform-specific app entry points, storyboards, and `Info.plist` files.
- `iOS (Extension)/` and `macOS (Extension)/` contain platform-specific extension packaging metadata.
- `jobapp.xcodeproj/` is the Xcode project and schemes.

## Build, Test, and Development Commands
- Open the project in Xcode for local development:
  - `open jobapp.xcodeproj`
- Build iOS app from CLI:
  - `xcodebuild -project jobapp.xcodeproj -scheme "jobapp (iOS)" -configuration Debug build`
- Build macOS app from CLI:
  - `xcodebuild -project jobapp.xcodeproj -scheme "jobapp (macOS)" -configuration Debug build`
- There are no test targets yet; when added, run:
  - `xcodebuild -project jobapp.xcodeproj -scheme "jobapp (iOS)" test`

## Coding Style & Naming Conventions
- Swift code follows the existing Xcode default style (4-space indentation, braces on the same line). Match the surrounding file.
- JavaScript/CSS in `Shared (Extension)/Resources/` should keep consistent indentation and avoid mixed tabs/spaces.
- Naming: prefer Swift `UpperCamelCase` for types and `lowerCamelCase` for properties/functions. Keep file names aligned with their primary type where possible (e.g., `ViewController.swift`).
- No formatting or linting tools are currently configured; keep changes focused and readable.

## Testing Guidelines
- No unit/UI test targets are present. If you add tests, document the scheme and target in this file.
- Use descriptive test names (e.g., `testLoadsPopupContent`).

## Commit & Pull Request Guidelines
- The repository only has an initial commit, so no convention is established. Use concise, imperative subjects (e.g., "Add popup toggle state").
- PRs should include:
  - A summary of changes.
  - Testing notes (Xcode run/build steps, or `xcodebuild` output).
  - Screenshots or short clips for UI changes (iOS, macOS, and extension popup when relevant).

## Configuration Notes
- Bundle identifiers and platform settings live in `iOS (App)/Info.plist`, `macOS (App)/Info.plist`, and the extension targets.
- Extension metadata is defined in `Shared (Extension)/Resources/manifest.json`.
