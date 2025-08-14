// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Scanly - Streamlined Accessibility Testing Extension
// Background service worker for coordinating scans and formatting results

class ScanCoordinator {
    constructor() {
        this.setupMessageHandlers();
    }

    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'SCAN_PAGE') {
                // Use tabId from message, not sender.tab.id
                const tabId = message.tabId || (sender.tab && sender.tab.id);
                if (!tabId) {
                    sendResponse({ success: false, error: 'No tab ID provided' });
                    return;
                }
                this.scanPage(tabId).then(sendResponse).catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
                return true; // Will respond asynchronously
            }
        });
    }

    async scanPage(tabId) {
        try {
            console.log('Starting accessibility scan for tab:', tabId);
            
            // Inject axe-core first, then the content script
            console.log('Injecting scripts into tab:', tabId);
            const injectionResult = await chrome.scripting.executeScript({
                target: { tabId },
                files: ['scanner/axe-core.min.js', 'content/scanner.js']
            });
            console.log('Script injection result:', injectionResult);

            // Wait a moment for script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));

            // Request scan from content script
            const response = await chrome.tabs.sendMessage(tabId, { type: 'EXECUTE_SCAN' });
            
            console.log('Content script response:', response);
            
            if (!response) {
                throw new Error('No response from content script');
            }
            
            if (response.success) {
                console.log('Scan completed successfully, formatting results...');
                const formattedResults = this.formatResults(response.results, response.url);
                console.log('Formatted results:', formattedResults);
                return {
                    success: true,
                    results: formattedResults
                };
            } else {
                throw new Error(response.error || 'Content script scan failed');
            }
        } catch (error) {
            console.error('Scan error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    formatResults(scanResults, url) {
        const timestamp = new Date().toISOString();
        
        // Transform axe results into our custom format
        const automatedChecks = [];
        const needsReview = [];

        // Process automated check failures
        if (scanResults.automated && scanResults.automated.violations) {
            scanResults.automated.violations.forEach(violation => {
                console.log('=== AXE VIOLATION DATA ===');
                console.log('Full violation object:', violation);
                console.log('ID:', violation.id);
                console.log('Description:', violation.description);
                console.log('Help:', violation.help);
                console.log('HelpUrl:', violation.helpUrl);
                console.log('Impact:', violation.impact);
                console.log('Tags:', violation.tags);
                console.log('===========================');
                
                violation.nodes.forEach(node => {
                    console.log('Node data:', node);
                    automatedChecks.push({
                        rule_id: violation.id,
                        impact: violation.impact || 'unknown',
                        message: violation.description,
                        selector: node.target.join(', '),
                        snippet: node.html,
                        fix_suggestions: violation.help ? [violation.help] : []
                    });
                });
            });
        }

        // Process needs review items
        if (scanResults.needsReview && scanResults.needsReview.incomplete) {
            scanResults.needsReview.incomplete.forEach(incomplete => {
                console.log('=== AXE INCOMPLETE DATA ===');
                console.log('Full incomplete object:', incomplete);
                console.log('ID:', incomplete.id);
                console.log('Description:', incomplete.description);
                console.log('Help:', incomplete.help);
                console.log('HelpUrl:', incomplete.helpUrl);
                console.log('Impact:', incomplete.impact);
                console.log('Tags:', incomplete.tags);
                console.log('============================');
                
                incomplete.nodes.forEach(node => {
                    console.log('Incomplete node data:', node);
                    needsReview.push({
                        rule_id: incomplete.id,
                        message: incomplete.description,
                        selector: node.target.join(', '),
                        snippet: node.html,
                        review_guidance: incomplete.help || 'Manual review required'
                    });
                });
            });
        }

        return {
            scan_timestamp: timestamp,
            url: url,
            results: {
                automated_checks: automatedChecks,
                needs_review: needsReview
            },
            summary: {
                total_automated_failures: automatedChecks.length,
                total_needs_review: needsReview.length,
                scan_coverage: "complete"
            }
        };
    }

    // Generate bracketed format for individual issues
    generateBracketedFormat(issue, url) {
        const isAutomatedCheck = 'impact' in issue;
        
        return `[URL]
${url}

[Steps To Reproduce]
1. Navigate to the page
2. ${isAutomatedCheck ? 'Run automated accessibility scan' : 'Review the identified element'}
3. Locate element: ${issue.selector}

[What is the issue]
${issue.message}

[Code snippet]
${issue.snippet}

[Why is it important]
${isAutomatedCheck ? 
    `This ${issue.impact} impact accessibility issue prevents users with disabilities from accessing content effectively.` :
    'This element requires manual verification to ensure it meets accessibility standards.'
}

[How to fix]
${isAutomatedCheck ? 
    (issue.fix_suggestions && issue.fix_suggestions.length > 0 ? issue.fix_suggestions[0] : 'Review accessibility guidelines for ' + issue.rule_id) :
    issue.review_guidance
}

[Compliant code example]
${this.generateCompliantExample(issue)}

[How to test]
Automated: Use axe-core or similar tools to verify the ${issue.rule_id} rule
Manual: ${isAutomatedCheck ? 'Verify fix resolves the automated check failure' : 'Manually verify accessibility compliance'}

[WCAG]
${this.getWCAGReference(issue.rule_id)}`;
    }

    generateCompliantExample(issue) {
        // This would need to be expanded with specific examples for each rule
        return `<!-- Compliant version of the code snippet -->
<!-- Specific guidance would depend on the ${issue.rule_id} rule -->
${issue.snippet}`;
    }

    getWCAGReference(ruleId) {
        // Map common rule IDs to WCAG criteria
        const wcagMap = {
            'color-contrast': '1.4.3 Contrast (Minimum) (AA)',
            'aria-label': '4.1.2 Name, Role, Value (AA)',
            'heading-order': '1.3.1 Info and Relationships (AA)',
            'landmark-unique': '1.3.6 Identify Purpose (AAA)',
            'button-name': '4.1.2 Name, Role, Value (AA)'
        };
        
        return wcagMap[ruleId] || 'See WCAG guidelines for ' + ruleId;
    }
}

// Initialize the scan coordinator
new ScanCoordinator();