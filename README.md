# Scanly - Streamlined Accessibility Testing Extension

A Chrome extension focused exclusively on automated accessibility testing, derived from Microsoft's Accessibility Insights for Web. This streamlined version removes all manual assessment features and retains only the Fast Pass automated testing functionality with customized output formatting for AI analysis.

## Features

- **Fast Automated Checks**: Detects common accessibility issues using axe-core
- **Needs Review Detection**: Identifies elements requiring manual accessibility review  
- **AI-Optimized Output**: Custom JSON format and bracketed issue format for easy AI analysis
- **Minimal UI**: Simple one-click scanning with copy-to-clipboard results
- **Lightweight**: Under 2MB extension size vs ~10MB of full Accessibility Insights
- **No Build Required**: Ready to use directly from source

## Quick Start

### Installation

**No build process needed!** The extension is ready to use directly:

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the Scanly folder
4. Grant permissions when prompted

### Usage

1. **Click the Scanly extension icon** in Chrome toolbar
2. **Click "Scan This Page"** button
3. **Wait for scan to complete** (typically 1-3 seconds)
4. **View results summary** showing failed checks and items needing review
5. **Copy results** using:
   - **"Copy JSON"** - Raw scan data for programmatic use
   - **"Copy Report"** - Formatted report with bracketed sections

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

### File Structure

The extension uses **vanilla JavaScript** with no build process required:

- `manifest.json` - Chrome extension configuration
- `background/service-worker.js` - Scan coordination and result formatting
- `content/scanner.js` - Axe-core integration and scanning logic
- `popup/popup.html` - Extension popup interface
- `popup/popup.js` - UI logic and copy functionality
- `scanner/axe-core.min.js` - Accessibility testing engine (v4.10.3)
- `icons/` - Extension branding and icons

### Making Changes

1. **Edit any `.js` file directly** - no compilation needed
2. **Reload the extension** in `chrome://extensions/`
3. **Test changes immediately**

No Node.js, npm, or build tools required!

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
- Fast Pass automated checks using axe-core (v4.10.3)
- Needs review detection for ambiguous cases  
- Core scanning engine with WCAG 2.0/2.1 AA rules
- Custom result formatting for AI analysis

## Performance

- **Scan Speed**: 1-3 seconds for typical web pages
- **Extension Size**: ~2MB (vs ~10MB original)
- **Memory Usage**: <50MB during active scanning
- **Compatibility**: Chrome Manifest V3

## Testing

The extension has been tested on various websites including:
- T-Mobile.com (found 11-13 violations)
- E-commerce sites
- News websites
- Corporate sites

Common issues detected:
- Color contrast violations
- Missing ARIA labels
- Heading structure problems
- Form accessibility issues
- Image alt text problems

## Contributing

1. Fork the repository
2. Make changes directly to the JavaScript files
3. Test in Chrome using "Load unpacked"
4. Submit a pull request

## License

MIT License - Derived from Microsoft's Accessibility Insights for Web.

## Support

For issues and feature requests, please use the GitHub Issues page.