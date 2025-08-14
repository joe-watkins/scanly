# Scanly - Streamlined Accessibility Testing Extension

A Chrome extension focused exclusively on automated accessibility testing, derived from Microsoft's Accessibility Insights for Web. This streamlined version removes all manual assessment features and retains only the Fast Pass automated testing functionality with customized output formatting for AI analysis.

## Features

- **Fast Automated Checks**: Detects common accessibility issues using axe-core
- **Needs Review Detection**: Identifies elements requiring manual accessibility review  
- **AI-Optimized Output**: Custom JSON format and bracketed issue format for easy AI analysis
- **Minimal UI**: Simple one-click scanning with copy-to-clipboard results
- **Lightweight**: Under 2MB extension size vs ~10MB of full Accessibility Insights

## Quick Start

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `./dist` folder

### Usage

1. Click the Scanly extension icon in Chrome
2. Click "Scan This Page" 
3. View results summary
4. Copy results in JSON format or formatted report

## Output Formats

### JSON Format
```json
{
  "scan_timestamp": "2024-01-15T10:30:00Z",
  "url": "https://example.com",
  "results": {
    "automated_checks": [...],
    "needs_review": [...]
  },
  "summary": {
    "total_automated_failures": 5,
    "total_needs_review": 3,
    "scan_coverage": "complete"
  }
}
```

### Bracketed Issue Format
```
[URL]
https://example.com

[Steps To Reproduce]
1. Navigate to the page
2. Run automated accessibility scan  
3. Locate element: button.primary

[What is the issue]
Element has insufficient color contrast

[Code snippet]
<button class="primary">Click me</button>

[Why is it important]
This serious impact accessibility issue prevents users with disabilities from accessing content effectively.

[How to fix]
Increase contrast ratio to 4.5:1 minimum

[Compliant code example]
<!-- Updated button with sufficient contrast -->
<button class="primary" style="background: #0066cc; color: white;">Click me</button>

[How to test]
Automated: Use axe-core or similar tools to verify the color-contrast rule
Manual: Verify fix resolves the automated check failure

[WCAG]
1.4.3 Contrast (Minimum) (AA)
```

## Architecture

### Extension Structure
```
scanly/
├── manifest.json (simplified permissions)
├── background/
│   └── service-worker.js (scan coordination)
├── content/
│   └── scanner.js (axe-core integration)
├── popup/
│   ├── popup.html (simple UI)
│   └── popup.js (result handling)
└── scanner/
    └── axe-core.min.js (accessibility engine)
```

### Key Components

1. **Background Service Worker**: Coordinates scans and formats results
2. **Content Script Scanner**: Injects axe-core and executes accessibility checks
3. **Popup Interface**: Simple scan trigger and results display

## Development

### Build Commands

- `npm run build` - Build production version
- `npm run dev` - Build development version with source maps

### File Structure

- `background/service-worker.js` - Main scan coordination logic
- `content/scanner.js` - Content script for running axe-core scans
- `popup/` - Extension popup UI
- `build.js` - Build script that creates the `dist/` folder

## Differences from Full Accessibility Insights

### Removed Features
- All manual assessment workflows
- Guided testing procedures  
- Complex reporting infrastructure
- Assessment navigation UI
- Tab stops visualization
- Color contrast tools
- Settings configuration

### Retained Features
- Fast Pass automated checks using axe-core
- Needs review detection for ambiguous cases
- Core scanning engine
- Result highlighting

## Contributing

This project follows the same contribution guidelines as the original Accessibility Insights for Web project.

## License

MIT License - See LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub Issues page.