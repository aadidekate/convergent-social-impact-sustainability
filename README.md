# ShelfLife

iOS app that scans grocery receipts, tracks when food expires, suggests recipes for what's about to go bad, manages grocery lists, analyzes monthly spending and food waste, and lets circles of people share items.

Current state: front end with mock data. Backend seams are marked `// TODO(backend):` in code and with a placeholder banner in the UI.

## Setup (macOS)

Requires Xcode 16+ (iOS 17+ deployment target).

```sh
brew install xcodegen
xcodegen
open ShelfLife.xcodeproj
```

The `.xcodeproj` is generated from `project.yml` and not committed. Re-run `xcodegen` after pulling changes that add or remove files.

## Find backend placeholders

```sh
grep -rn "TODO(backend)" ShelfLife
```
