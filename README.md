# Scanly - Streamlined Accessibility Testing Extension

A Chrome extension focused exclusively on automated accessibility testing, derived from Microsoft's Accessibility Insights for Web. This streamlined version removes all manual assessment features and retains only the Fast Pass automated testing functionality with customized output formatting for AI analysis.

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

### Issue Format
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

### File Structure

The extension uses **vanilla JavaScript** with no build process required:

- `manifest.json` - Chrome extension configuration
- `background/service-worker.js` - Scan coordination and result formatting
- `content/scanner.js` - Axe-core integration and scanning logic
- `popup/popup.html` - Extension popup interface
- `popup/popup.js` - UI logic and copy functionality
- `scanner/axe-core.min.js` - Accessibility testing engine (v4.10.3)
- `icons/` - Extension branding and icons

## License

MIT License - See LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub Issues page.
