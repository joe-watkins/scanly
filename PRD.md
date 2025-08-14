# Product Requirements Document: Streamlined Accessibility Testing Extension

## Executive Summary

A Chrome extension focused exclusively on automated accessibility testing, derived from Microsoft's Accessibility Insights for Web. This streamlined version removes all manual assessment features and retains only the Fast Pass automated testing functionality with customized output formatting for AI analysis.

## Product Overview

### Current State
- Forked from Microsoft Accessibility Insights for Web extension
- Contains comprehensive manual assessments, guided testing, and reporting features
- Large codebase with multiple testing modes and UI components

### Target State
- Minimal Chrome extension with only automated accessibility checks
- Two primary outputs: "Automated Checks" (failures) and "Needs Review" (manual verification required)
- Custom output format optimized for feeding results to AI systems
- Streamlined UI focusing solely on scan execution and results

## Core Features to Retain

### 1. Fast Pass Automated Checks
- **Current Implementation**: `src/assessments/automated-checks/assessment.tsx`
- **Functionality**: Automated detection of common accessibility issues using axe-core
- **Scope**: Keep all automated rule detection capabilities
- **Output**: Failed instances that require fixing

### 2. Needs Review Detection  
- **Current Implementation**: `src/ad-hoc-visualizations/needs-review/`
- **Functionality**: Identifies elements requiring manual accessibility review
- **Scope**: Keep detection logic for ambiguous accessibility cases
- **Output**: Elements that need human verification

### 3. Core Scanning Engine
- **Components to Keep**:
  - `src/scanner/` - axe-core integration and rule processing
  - `src/injected/analyzers/` - content script analysis
  - `src/background/` - service worker coordination (minimal subset)

## Features to Remove
Remove ALL unneeded files. Reduce the codebase to the most minimal size as possible. 

### 1. Manual Assessments
- All guided assessment workflows
- Step-by-step testing procedures
- Assessment progress tracking
- Manual test result recording

### 2. Reporting Infrastructure
- HTML report generation
- Export functionality
- Complex report templating
- Multi-format output options

### 3. UI Components
- Details view panels
- Assessment navigation
- Progress indicators
- Settings configuration
- Help documentation

### 4. Additional Visualizations
- Tab stops visualization
- Color contrast tools
- Landmark highlighting
- Heading structure view

## Custom Output Format

### Requirements
- Machine-readable format optimized for AI processing
- Consistent structure for both "Automated Checks" and "Needs Review"
- Include sufficient context for AI analysis
- Minimal formatting overhead

### Proposed JSON Structure
```json
{
  "scan_timestamp": "2024-01-15T10:30:00Z",
  "url": "https://example.com",
  "results": {
    "automated_checks": [
      {
        "rule_id": "color-contrast",
        "impact": "serious", 
        "message": "Element has insufficient color contrast",
        "selector": "button.primary",
        "snippet": "<button class=\"primary\">Click me</button>",
        "fix_suggestions": ["Increase contrast ratio to 4.5:1 minimum"]
      }
    ],
    "needs_review": [
      {
        "rule_id": "landmark-unique",
        "message": "Landmark may not be unique",
        "selector": "nav[aria-label='Main navigation']",
        "snippet": "<nav aria-label=\"Main navigation\">...",
        "review_guidance": "Verify navigation landmark is unique on page"
      }
    ]
  },
  "summary": {
    "total_automated_failures": 5,
    "total_needs_review": 3,
    "scan_coverage": "partial" // or "complete"
  }
}
```

## Technical Architecture

### Extension Structure
```
scanly/
├── manifest.json (simplified permissions)
├── src/
│   ├── background/
│   │   ├── service-worker.ts (minimal)
│   │   └── scan-coordinator.ts
│   ├── content/
│   │   ├── scanner.ts
│   │   └── result-formatter.ts
│   ├── popup/
│   │   ├── popup.html (simple scan trigger)
│   │   └── popup.ts
│   └── scanner/ (retain axe-core integration)
```

### Key Components

1. **Background Service Worker** 
   - Coordinate scans across frames
   - Aggregate results from content scripts
   - Apply custom formatting

2. **Content Script Scanner**
   - Inject axe-core rules
   - Execute automated checks
   - Detect needs-review cases
   - Return structured results

3. **Popup Interface**
   - Single "Scan Page" button
   - Display result summary
   - Copy formatted output to clipboard

## User Experience

### Primary Workflow
1. User clicks extension icon
2. Click "Scan Page" button
3. Extension runs automated checks
4. Results displayed in custom format
5. User copies formatted output for AI analysis

### UI Mockup
```
┌─────────────────────────┐
│ Scanly - Quick A11y     │
├─────────────────────────┤
│                         │
│    [Scan This Page]     │
│                         │
├─────────────────────────┤
│ Last Scan Results:      │
│ • 3 Failed Checks       │
│ • 2 Need Review         │
│                         │
│    [Copy Results]       │
└─────────────────────────┘
```

## Success Criteria

### Performance
- Scan completion in under 5 seconds for typical pages
- Extension bundle size under 2MB (vs current ~10MB)
- Memory usage under 50MB during active scan

### Functionality 
- 100% compatibility with current automated rule detection
- Zero false negatives compared to full Accessibility Insights
- Consistent output format across different page types

### Usability
- Single-click scan initiation
- Results immediately available for copy/paste
- No configuration required

## Implementation Plan

### Phase 1: Core Extraction (Week 1-2)
- Extract automated checks assessment logic
- Remove all manual assessment components
- Create minimal popup interface

### Phase 2: Output Formatting (Week 3)
- Implement custom JSON formatter
- Integrate needs-review detection
- Add result aggregation logic

### Phase 3: Testing & Polish (Week 4)
- Cross-browser testing
- Performance optimization  
- Bundle size reduction

## Risks & Mitigation

### Risk: Breaking axe-core Integration
- **Mitigation**: Maintain existing scanner wrapper logic
- **Testing**: Validate against known accessibility issues

### Risk: Missing Edge Cases
- **Mitigation**: Comprehensive testing against diverse page types
- **Fallback**: Retain original rule configuration

### Risk: Output Format Limitations
- **Mitigation**: Design extensible JSON schema
- **Validation**: Test with actual AI analysis workflows

## Dependencies

### External Libraries (Retain)
- axe-core (accessibility rule engine)
- Chrome Extension APIs

### Internal Dependencies (Minimize)
- Keep only scanner and result processing logic
- Remove assessment framework
- Remove UI component library dependencies

## Success Metrics

- **Adoption**: Usage by AI analysis workflows
- **Performance**: <5 second scan times
- **Accuracy**: Match detection rates of full extension
- **Size**: <50% of original extension size

## Accessibility Issue Copy/Paste Format
Get as much information from the Axe results as possible to feed the template below.

```
[URL]
{test url here}

[Steps To Reproduce]
{steps to reproduce here}

[What is the issue]
{describe the accessibility issue here}

[Code snippet]
{provide a code snippet that demonstrates the issue}

[Why is it important]
{explain the impact of the issue on users}

[How to fix]
{provide a description of the fix here}

[Compliant code example]
{provide a code snippet that demonstrates the fix}

[How to test]
Automated: {any tips for automated testing}
Manual: {any tips for manual testing}

[WCAG]
{1.4.3 Color Contrast Minimum (AA)}

```
