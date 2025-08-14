/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Scanly Content Script - Executes accessibility scans using axe-core

class ScanlyScanner {
    constructor() {
        console.log('ScanlyScanner initialized');
        console.log('axe-core available:', !!window.axe);
        if (window.axe) {
            console.log('axe version:', window.axe.version);
        }
        this.setupMessageHandlers();
    }

    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Content script received message:', message);
            if (message.type === 'EXECUTE_SCAN') {
                console.log('Executing scan and will send response...');
                this.executeScan().then(response => {
                    console.log('Sending response back to background:', response);
                    sendResponse(response);
                }).catch(error => {
                    console.error('Error in executeScan:', error);
                    sendResponse({ success: false, error: error.message });
                });
                return true; // Will respond asynchronously
            }
        });
    }

    async executeScan() {
        try {
            console.log('executeScan called');
            console.log('window.axe available:', !!window.axe);
            
            // Check if axe is loaded
            if (!window.axe) {
                console.error('axe-core not loaded');
                throw new Error('axe-core not loaded');
            }
            
            console.log('Executing accessibility scan with axe version:', window.axe.version);
            
            // Run basic axe scan first to test
            console.log('Calling runAxeScan...');
            const results = await this.runAxeScan();
            console.log('runAxeScan completed, processing results...');

            const response = {
                success: true,
                results: {
                    automated: results,
                    needsReview: { incomplete: [] } // Simplified for now
                },
                url: window.location.href
            };
            
            console.log('Returning response:', response);
            return response;

        } catch (error) {
            console.error('Scan execution failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async runAxeScan(config = {}) {
        return new Promise((resolve, reject) => {
            console.log('Starting axe.run...');
            
            // Add a timeout to prevent hanging
            const timeout = setTimeout(() => {
                console.error('Axe scan timed out after 10 seconds');
                reject(new Error('Axe scan timed out'));
            }, 10000);
            
            console.log('Running axe with default configuration');
            
            // Run axe with default configuration (no parameters)
            window.axe.run((err, results) => {
                clearTimeout(timeout);
                console.log('Axe scan completed');
                
                if (err) {
                    console.error('Axe scan error:', err);
                    reject(err);
                } else {
                    console.log('Axe scan successful, violations:', results.violations?.length || 0);
                    resolve(results);
                }
            });
        });
    }

    getAutomatedRulesConfig() {
        // Rules for automated checks (failures that require fixing)
        return {
            // Include common automated rules
            'aria-allowed-role': { enabled: true },
            'aria-hidden-focus': { enabled: true },
            'aria-input-field-name': { enabled: true },
            'aria-label': { enabled: true },
            'aria-labelledby': { enabled: true },
            'aria-required-attr': { enabled: true },
            'aria-required-children': { enabled: true },
            'aria-required-parent': { enabled: true },
            'aria-roles': { enabled: true },
            'aria-valid-attr': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'button-name': { enabled: true },
            'color-contrast': { enabled: true },
            'document-title': { enabled: true },
            'duplicate-id-active': { enabled: true },
            'form-field-multiple-labels': { enabled: true },
            'frame-title': { enabled: true },
            'heading-order': { enabled: true },
            'html-has-lang': { enabled: true },
            'html-lang-valid': { enabled: true },
            'image-alt': { enabled: true },
            'input-button-name': { enabled: true },
            'input-image-alt': { enabled: true },
            'label': { enabled: true },
            'landmark-banner-is-top-level': { enabled: true },
            'landmark-complementary-is-top-level': { enabled: true },
            'landmark-contentinfo-is-top-level': { enabled: true },
            'landmark-main-is-top-level': { enabled: true },
            'landmark-no-duplicate-banner': { enabled: true },
            'landmark-no-duplicate-contentinfo': { enabled: true },
            'landmark-one-main': { enabled: true },
            'link-name': { enabled: true },
            'list': { enabled: true },
            'listitem': { enabled: true },
            'meta-refresh': { enabled: true },
            'meta-viewport': { enabled: true },
            'page-has-heading-one': { enabled: true },
            'region': { enabled: true },
            'skip-link': { enabled: true },
            'tabindex': { enabled: true },
            'valid-lang': { enabled: true }
        };
    }

    getNeedsReviewRulesConfig() {
        // Rules that require manual review
        return {
            'aria-input-field-name': { enabled: true },
            'color-contrast': { enabled: true },
            'duplicate-id-aria': { enabled: true },
            'th-has-data-cells': { enabled: true },
            'label-content-name-mismatch': { enabled: true },
            'p-as-heading': { enabled: true }
        };
    }
}

// Initialize scanner when script loads
new ScanlyScanner();
