// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Scanly Popup Interface

class ScanlyPopup {
    constructor() {
        this.lastScanResults = null;
        this.initializeUI();
        this.loadLastResults();
    }

    initializeUI() {
        // Get UI elements
        this.scanButton = document.getElementById('scanButton');
        this.scanButtonText = document.getElementById('scanButtonText');
        this.statusMessage = document.getElementById('statusMessage');
        this.resultsSection = document.getElementById('resultsSection');
        this.failedCount = document.getElementById('failedCount');
        this.reviewCount = document.getElementById('reviewCount');
        this.copyJsonButton = document.getElementById('copyJsonButton');
        this.copyFormattedButton = document.getElementById('copyFormattedButton');
        this.viewDetailsButton = document.getElementById('viewDetailsButton');

        // Set up event listeners
        this.scanButton.addEventListener('click', () => this.scanCurrentPage());
        this.copyJsonButton.addEventListener('click', () => this.copyToClipboard('json'));
        this.copyFormattedButton.addEventListener('click', () => this.copyToClipboard('formatted'));
        this.viewDetailsButton.addEventListener('click', () => this.openDetailsPage());
    }

    async loadLastResults() {
        try {
            const result = await chrome.storage.local.get(['lastScanResults']);
            if (result.lastScanResults) {
                this.lastScanResults = result.lastScanResults;
                this.updateResultsDisplay();
            } else {
                // Disable view details button if no results
                this.viewDetailsButton.disabled = true;
            }
        } catch (error) {
            console.error('Failed to load last results:', error);
        }
    }

    async scanCurrentPage() {
        try {
            this.setScanning(true);
            this.showStatus('Scanning page...', 'scanning');
            // Hide results section while scanning
            this.resultsSection.classList.remove('show');

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }

            // Request scan from background script
            console.log('Popup sending message to background script');
            const response = await chrome.runtime.sendMessage({
                type: 'SCAN_PAGE',
                tabId: tab.id
            });

            console.log('Popup received response from background script:', response);

            if (!response) {
                throw new Error('No response from background script');
            }

            if (response.success) {
                console.log('Scan successful, updating UI with results:', response.results);
                this.lastScanResults = response.results;
                await this.saveResults(response.results);
                console.log('Calling updateResultsDisplay...');
                this.updateResultsDisplay();
                console.log('Showing success status...');
                this.showStatus('Scan completed successfully!', 'success');
            } else {
                throw new Error(response.error || 'Scan failed');
            }

        } catch (error) {
            console.error('Scan failed:', error);
            this.showStatus(`Scan failed: ${error.message}`, 'error');
        } finally {
            this.setScanning(false);
        }
    }

    async saveResults(results) {
        try {
            await chrome.storage.local.set({ lastScanResults: results });
        } catch (error) {
            console.error('Failed to save results:', error);
        }
    }

    updateResultsDisplay() {
        console.log('updateResultsDisplay called');
        if (!this.lastScanResults) {
            console.log('No lastScanResults available');
            return;
        }

        console.log('lastScanResults:', this.lastScanResults);
        const automatedCount = this.lastScanResults.summary.total_automated_failures;
        const reviewCount = this.lastScanResults.summary.total_needs_review;

        console.log('Setting counts - automated:', automatedCount, 'review:', reviewCount);
        console.log('failedCount element:', this.failedCount);
        console.log('reviewCount element:', this.reviewCount);
        console.log('resultsSection element:', this.resultsSection);
        
        this.failedCount.textContent = automatedCount;
        this.reviewCount.textContent = reviewCount;
        
        console.log('Showing results section');
        this.resultsSection.classList.add('show');
        
        // Enable the view details button when results are available
        this.viewDetailsButton.disabled = false;
    }

    setScanning(isScanning) {
        this.scanButton.disabled = isScanning;
        
        if (isScanning) {
            this.scanButtonText.innerHTML = '<span class="loading"></span>Scanning...';
        } else {
            this.scanButtonText.textContent = 'Scan This Page';
        }
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status ${type}`;
        this.statusMessage.classList.remove('hidden');

        // Auto-hide after 3 seconds for success/error messages
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                this.statusMessage.classList.add('hidden');
            }, 3000);
        }
    }

    async copyToClipboard(format) {
        if (!this.lastScanResults) {
            this.showStatus('No scan results to copy', 'error');
            return;
        }

        try {
            let textToCopy;
            
            if (format === 'json') {
                textToCopy = JSON.stringify(this.lastScanResults, null, 2);
            } else if (format === 'formatted') {
                textToCopy = this.generateFormattedReport();
            }

            await navigator.clipboard.writeText(textToCopy);
            
            // Update button text temporarily
            const button = format === 'json' ? this.copyJsonButton : this.copyFormattedButton;
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.backgroundColor = '#107c10';
            button.style.color = 'white';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.style.color = '';
            }, 1500);

        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.showStatus('Failed to copy to clipboard', 'error');
        }
    }

    generateFormattedReport() {
        const results = this.lastScanResults;
        let report = `# Accessibility Scan Report\\n\\n`;
        report += `**URL:** ${results.url}\\n`;
        report += `**Scan Time:** ${new Date(results.scan_timestamp).toLocaleString()}\\n\\n`;

        // Summary
        report += `## Summary\\n`;
        report += `- **Failed Checks:** ${results.summary.total_automated_failures}\\n`;
        report += `- **Need Review:** ${results.summary.total_needs_review}\\n`;
        report += `- **Coverage:** ${results.summary.scan_coverage}\\n\\n`;

        // Automated Checks Failures
        if (results.results.automated_checks.length > 0) {
            report += `## Failed Automated Checks\\n\\n`;
            results.results.automated_checks.forEach((issue, index) => {
                report += this.generateBracketedFormat(issue, results.url, 'automated');
                if (index < results.results.automated_checks.length - 1) {
                    report += `\\n\\n---\\n\\n`;
                }
            });
        }

        // Needs Review Items
        if (results.results.needs_review.length > 0) {
            if (results.results.automated_checks.length > 0) {
                report += `\\n\\n---\\n\\n`;
            }
            report += `## Items Needing Manual Review\\n\\n`;
            results.results.needs_review.forEach((issue, index) => {
                report += this.generateBracketedFormat(issue, results.url, 'review');
                if (index < results.results.needs_review.length - 1) {
                    report += `\\n\\n---\\n\\n`;
                }
            });
        }

        return report;
    }

    generateBracketedFormat(issue, url, type) {
        const isAutomated = type === 'automated';
        
        return `[URL]
${url}

[Steps To Reproduce]
1. Navigate to the page
2. ${isAutomated ? 'Run automated accessibility scan' : 'Review the identified element'}
3. Locate element: ${issue.selector}

[What is the issue]
${issue.message}

[Code snippet]
${issue.snippet}

[Why is it important]
${isAutomated ? 
    `${issue.message} This ${this.mapImpactToSeverity(issue.impact)} impact issue affects users with disabilities who rely on assistive technologies.` :
    `${issue.message} This element requires manual verification to ensure it meets accessibility standards.`
}

[How to fix]
${isAutomated ? 
    (issue.fix_suggestions && issue.fix_suggestions.length > 0 ? issue.fix_suggestions[0] : 'Review accessibility guidelines for ' + issue.rule_id) :
    issue.review_guidance
}

[Compliant code example]
<!-- Compliant version of the code snippet -->
<!-- Specific guidance would depend on the ${issue.rule_id} rule -->
${issue.snippet}

[How to test]
Automated: Use axe-core or similar tools to verify the ${issue.rule_id} rule
Manual: ${isAutomated ? 'Verify fix resolves the automated check failure' : 'Manually verify accessibility compliance'}

[WCAG]
${this.getWCAGReference(issue.rule_id)}`;
    }

    getWCAGReference(ruleId) {
        const wcagMap = {
            'color-contrast': '1.4.3 Contrast (Minimum) (AA)',
            'aria-label': '4.1.2 Name, Role, Value (AA)',
            'heading-order': '1.3.1 Info and Relationships (AA)',
            'landmark-unique': '1.3.6 Identify Purpose (AAA)',
            'button-name': '4.1.2 Name, Role, Value (AA)',
            'image-alt': '1.1.1 Non-text Content (AA)',
            'document-title': '2.4.2 Page Titled (AA)',
            'html-has-lang': '3.1.1 Language of Page (AA)',
            'label': '3.3.2 Labels or Instructions (AA)',
            'link-name': '2.4.4 Link Purpose (In Context) (AA)'
        };
        
        return wcagMap[ruleId] || 'See WCAG guidelines for ' + ruleId;
    }

    mapImpactToSeverity(axeImpact) {
        // Map Axe impact levels to our severity levels
        const impactMap = {
            'critical': 'blocker',
            'serious': 'high', 
            'moderate': 'medium',
            'minor': 'low'
        };
        
        return impactMap[axeImpact] || 'medium';
    }

    async openDetailsPage() {
        try {
            // Open the output page in a new tab
            await chrome.tabs.create({
                url: chrome.runtime.getURL('output/output.html')
            });
        } catch (error) {
            console.error('Failed to open details page:', error);
            this.showStatus('Failed to open details page', 'error');
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScanlyPopup();
});