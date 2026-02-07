# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**jobapp** is a cross-platform Safari Web Extension with companion iOS and macOS apps, built with Xcode and Swift. The extension uses Manifest V3 and the app provides a WebKit-based UI that displays extension status and settings.

## Build Commands

```bash
# Open in Xcode
open jobapp.xcodeproj

# Build iOS app
xcodebuild -project jobapp.xcodeproj -scheme "jobapp (iOS)" -configuration Debug build

# Build macOS app
xcodebuild -project jobapp.xcodeproj -scheme "jobapp (macOS)" -configuration Debug build
```

No test targets exist yet. No linters or formatters are configured.

## Architecture

The project has four Xcode targets: `jobapp (iOS)`, `jobapp (macOS)`, `jobapp Extension (iOS)`, `jobapp Extension (macOS)`. Extensions embed into their respective app targets.

### Shared (App)/
Cross-platform companion app code. `ViewController.swift` creates a WKWebView that loads `Main.html` and uses `#if os(iOS)` / `#elseif os(macOS)` for platform differences. On macOS, it checks extension state via `SFSafariExtensionManager` and can open Safari preferences. JavaScript communicates back to Swift via `webkit.messageHandlers.controller`.

### Shared (Extension)/
The Safari Web Extension. `SafariWebExtensionHandler.swift` handles native messaging from the extension's JavaScript via `browser.runtime.sendNativeMessage()`. `Resources/` contains the Manifest V3 `manifest.json`, popup UI, background script, and content script (currently matching `example.com/*`).

### iOS (App)/, macOS (App)/
Platform-specific entry points (`AppDelegate.swift`, `SceneDelegate.swift` on iOS), storyboards, and `Info.plist` files.

### iOS (Extension)/, macOS (Extension)/
Platform-specific extension packaging with `Info.plist` registering `com.apple.Safari.web-extension`.

## Coding Style

- Swift: 4-space indentation, braces on same line, `UpperCamelCase` for types, `lowerCamelCase` for properties/functions.
- JavaScript/CSS: consistent indentation, no mixed tabs/spaces.
- No formatting tools configured; match surrounding file style.

## Commit Style

Concise, imperative subjects (e.g., "Add popup toggle state"). PRs should include a summary, testing notes, and screenshots for UI changes.
