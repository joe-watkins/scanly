class ScanlyOutput {
    constructor() {
        this.scanResults = null;
        this.initializeUI();
        this.loadScanResults();
    }

    initializeUI() {
        this.summarySection = document.getElementById('summarySection');
        this.totalFailed = document.getElementById('totalFailed');
        this.totalReview = document.getElementById('totalReview');
        this.scanUrl = document.getElementById('scanUrl');
        this.scanInfo = document.getElementById('scanInfo');
        this.issuesContainer = document.getElementById('issuesContainer');
    }

    async loadScanResults() {
        try {
            const result = await chrome.storage.local.get(['lastScanResults']);
            if (result.lastScanResults) {
                this.scanResults = result.lastScanResults;
                this.renderResults();
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Failed to load scan results:', error);
            this.showEmptyState();
        }
    }

    showEmptyState() {
        this.issuesContainer.innerHTML = `
            <div class="empty-state">
                <p>No scan results available. Run a scan from the extension popup to see detailed issues.</p>
            </div>
        `;
    }

    renderResults() {
        if (!this.scanResults) {
            this.showEmptyState();
            return;
        }

        const results = this.scanResults;
        
        // Update summary
        this.totalFailed.textContent = results.summary.total_automated_failures;
        this.totalReview.textContent = results.summary.total_needs_review;
        this.scanUrl.textContent = results.url;
        this.scanInfo.textContent = `Scanned on ${new Date(results.scan_timestamp).toLocaleString()}`;

        // Render issues
        this.renderIssuesSections(results);
    }

    renderIssuesSections(results) {
        let html = '';

        // Failed Automated Checks Section
        if (results.results.automated_checks && results.results.automated_checks.length > 0) {
            html += this.renderSection(
                'Failed Automated Checks',
                results.results.automated_checks,
                'error',
                'automated'
            );
        }

        // Needs Review Section
        if (results.results.needs_review && results.results.needs_review.length > 0) {
            html += this.renderSection(
                'Items Needing Manual Review',
                results.results.needs_review,
                'warning',
                'review'
            );
        }

        if (html === '') {
            this.showEmptyState();
        } else {
            this.issuesContainer.innerHTML = html;
            this.attachEventListeners();
        }
    }

    renderSection(title, issues, type, category) {
        let html = `<div class="section-header ${type}">${title} (${issues.length})</div>`;
        
        issues.forEach((issue, index) => {
            const issueId = `${category}-${index}`;
            html += this.renderAccordionItem(issue, issueId, category);
        });

        return html;
    }

    renderAccordionItem(issue, issueId, category) {
        const severity = this.mapImpactToSeverity(issue.impact);
        const ruleId = issue.rule_id || 'unknown';
        
        return `
            <div class="accordion-item">
                <button class="accordion-header" data-target="${issueId}">
                    <div class="accordion-title">${issue.message || 'Accessibility Issue'}</div>
                    <div class="accordion-meta">
                        <span class="severity-badge severity-${severity}">${severity}</span>
                        <span>${ruleId}</span>
                        <span class="accordion-icon">▶</span>
                    </div>
                </button>
                <div class="accordion-content" id="${issueId}">
                    ${this.renderIssueDetails(issue, category)}
                    <button class="copy-button" data-issue-id="${issueId}">
                        Copy Issue Details
                    </button>
                </div>
            </div>
        `;
    }

    renderIssueDetails(issue, category) {
        const isAutomated = category === 'automated';
        
        return `
            <div class="issue-detail">
                <h4>[URL]</h4>
                <p>${this.scanResults?.url || 'Not available'}</p>
            </div>

            <div class="issue-detail">
                <h4>[Steps To Reproduce]</h4>
                <p>1. Navigate to the page<br>
                2. ${isAutomated ? 'Run automated accessibility scan' : 'Review the identified element'}<br>
                3. Locate element: ${issue.selector || 'Not specified'}</p>
            </div>

            <div class="issue-detail">
                <h4>[What is the issue]</h4>
                <p>${issue.message || 'No description available'}</p>
            </div>

            ${issue.snippet ? `
            <div class="issue-detail">
                <h4>[Code snippet]</h4>
                <div class="code-snippet">${this.escapeHtml(issue.snippet)}</div>
            </div>
            ` : ''}

            <div class="issue-detail">
                <h4>[Why is it important]</h4>
                <p>${isAutomated ? 
                    `${issue.message} This ${issue.impact || 'unknown'} impact issue affects users with disabilities who rely on assistive technologies.` :
                    `${issue.message} This element requires manual verification to ensure it meets accessibility standards.`
                }</p>
            </div>

            <div class="issue-detail">
                <h4>[How to fix]</h4>
                <p>${this.getFixSuggestion(issue, isAutomated)}</p>
            </div>

            <div class="issue-detail">
                <h4>[Compliant code example]</h4>
                <p><!-- Compliant version of the code snippet --><br>
                <!-- Specific guidance would depend on the ${issue.rule_id || 'unknown'} rule --><br>
                ${issue.snippet ? this.escapeHtml(issue.snippet) : 'Code snippet not available'}</p>
            </div>

            <div class="issue-detail">
                <h4>[How to test]</h4>
                <p>Automated: Use axe-core or similar tools to verify the ${issue.rule_id || 'unknown'} rule<br>
                Manual: ${isAutomated ? 'Verify fix resolves the automated check failure' : 'Manually verify accessibility compliance'}</p>
            </div>

            <div class="issue-detail">
                <h4>[WCAG]</h4>
                <p>${this.getWCAGReference(issue.rule_id)}</p>
            </div>
        `;
    }

    getFixSuggestion(issue, isAutomated) {
        if (isAutomated && issue.fix_suggestions && issue.fix_suggestions.length > 0) {
            return issue.fix_suggestions[0];
        } else if (!isAutomated && issue.review_guidance) {
            return issue.review_guidance;
        } else {
            return `Review accessibility guidelines for ${issue.rule_id || 'this type of issue'}.`;
        }
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
        
        return wcagMap[ruleId] || `See WCAG guidelines for ${ruleId || 'this rule'}`;
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    attachEventListeners() {
        // Accordion toggle functionality
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const icon = header.querySelector('.accordion-icon');
                
                // Toggle active state
                header.classList.toggle('active');
                content.classList.toggle('show');
                icon.classList.toggle('rotated');
            });
        });

        // Copy functionality for individual issues
        const copyButtons = document.querySelectorAll('.copy-button');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const issueId = button.getAttribute('data-issue-id');
                this.copyIssueDetails(issueId, button);
            });
        });
    }

    async copyIssueDetails(issueId, button) {
        try {
            const content = document.getElementById(issueId);
            const issueData = this.extractIssueData(content, issueId);
            const formattedText = this.formatIssueForCopy(issueData);
            
            await navigator.clipboard.writeText(formattedText);
            
            // Visual feedback
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('success');
            }, 2000);

        } catch (error) {
            console.error('Failed to copy issue details:', error);
            
            // Error feedback
            const originalText = button.textContent;
            button.textContent = 'Copy Failed';
            button.style.backgroundColor = '#d13438';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
            }, 2000);
        }
    }

    extractIssueData(contentElement, issueId) {
        const details = {};
        const detailElements = contentElement.querySelectorAll('.issue-detail');
        
        detailElements.forEach(detail => {
            const title = detail.querySelector('h4')?.textContent || '';
            const content = detail.querySelector('p')?.textContent || 
                           detail.querySelector('.code-snippet')?.textContent || '';
            details[title] = content;
        });

        // Get header information
        const header = document.querySelector(`[data-target="${issueId}"]`);
        const title = header?.querySelector('.accordion-title')?.textContent || '';
        const severity = header?.querySelector('.severity-badge')?.textContent || '';
        const ruleId = header?.querySelector('.accordion-meta span:nth-child(2)')?.textContent || '';

        return {
            title,
            severity,
            ruleId,
            url: this.scanResults?.url || '',
            details
        };
    }

    formatIssueForCopy(issueData) {
        let formatted = '';

        // Add sections in bracketed format
        Object.entries(issueData.details).forEach(([title, content]) => {
            formatted += `${title}\n${content}\n\n`;
        });

        formatted += `---\nGenerated by Scanly Extension`;
        
        return formatted;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScanlyOutput();
});