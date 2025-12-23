/**
 * Smart Code Reviewer - Frontend Application
 * AI-powered code analysis for readability, structure, and maintainability
 */

class CodeReviewer {
    constructor() {
        this.codeInput = document.getElementById('code-input');
        this.lineNumbers = document.getElementById('line-numbers');
        this.charCount = document.getElementById('char-count');
        this.reviewBtn = document.getElementById('review-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.languageSelect = document.getElementById('language-select');
        this.resultsPanel = document.getElementById('results-panel');
        this.resultsContent = document.getElementById('results-content');
        this.resultsPlaceholder = document.querySelector('.results-placeholder');
        
        this.currentFilter = 'all';
        this.reviewData = null;
        
        this.init();
    }
    
    init() {
        // Code input events
        this.codeInput.addEventListener('input', () => this.handleCodeInput());
        this.codeInput.addEventListener('scroll', () => this.syncScroll());
        this.codeInput.addEventListener('keydown', (e) => this.handleTab(e));
        
        // Button events
        this.reviewBtn.addEventListener('click', () => this.reviewCode());
        this.clearBtn.addEventListener('click', () => this.clearCode());
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterIssues(e.target.dataset.filter));
        });
        
        // Initialize line numbers
        this.updateLineNumbers();
        
        // Add SVG gradient for score ring
        this.addScoreGradient();
    }
    
    addScoreGradient() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.innerHTML = `
            <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#00d4aa" />
                    <stop offset="50%" style="stop-color:#3b82f6" />
                    <stop offset="100%" style="stop-color:#8b5cf6" />
                </linearGradient>
            </defs>
        `;
        document.body.appendChild(svg);
    }
    
    handleCodeInput() {
        this.updateLineNumbers();
        this.updateCharCount();
    }
    
    updateLineNumbers() {
        const lines = this.codeInput.value.split('\n');
        const count = Math.max(lines.length, 1);
        let html = '';
        for (let i = 1; i <= count; i++) {
            html += `<div>${i}</div>`;
        }
        this.lineNumbers.innerHTML = html;
    }
    
    updateCharCount() {
        const count = this.codeInput.value.length;
        this.charCount.textContent = count.toLocaleString();
        
        if (count > 45000) {
            this.charCount.style.color = '#ef4444';
        } else if (count > 40000) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '';
        }
    }
    
    syncScroll() {
        this.lineNumbers.scrollTop = this.codeInput.scrollTop;
    }
    
    handleTab(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.codeInput.selectionStart;
            const end = this.codeInput.selectionEnd;
            const value = this.codeInput.value;
            
            this.codeInput.value = value.substring(0, start) + '    ' + value.substring(end);
            this.codeInput.selectionStart = this.codeInput.selectionEnd = start + 4;
            this.updateLineNumbers();
        }
    }
    
    clearCode() {
        this.codeInput.value = '';
        this.updateLineNumbers();
        this.updateCharCount();
        this.showPlaceholder();
    }
    
    showPlaceholder() {
        this.resultsPlaceholder.style.display = 'flex';
        this.resultsContent.style.display = 'none';
    }
    
    showResults() {
        this.resultsPlaceholder.style.display = 'none';
        this.resultsContent.style.display = 'block';
    }
    
    async reviewCode() {
        const code = this.codeInput.value.trim();
        
        if (!code) {
            this.showNotification('Please enter some code to review', 'warning');
            return;
        }
        
        if (code.length > 50000) {
            this.showNotification('Code exceeds maximum length of 50,000 characters', 'error');
            return;
        }
        
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    language: this.languageSelect.value
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Review failed');
            }
            
            const data = await response.json();
            this.reviewData = data;
            this.displayResults(data);
            
        } catch (error) {
            console.error('Review error:', error);
            this.showNotification(error.message || 'Failed to review code', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(loading) {
        if (loading) {
            this.reviewBtn.classList.add('loading');
            this.reviewBtn.disabled = true;
        } else {
            this.reviewBtn.classList.remove('loading');
            this.reviewBtn.disabled = false;
        }
    }
    
    displayResults(data) {
        this.showResults();
        
        // Animate scores
        setTimeout(() => {
            this.animateScore('overall', data.overall_score);
            this.animateBar('readability', data.readability_score);
            this.animateBar('structure', data.structure_score);
            this.animateBar('maintainability', data.maintainability_score);
        }, 100);
        
        // Update text content
        document.getElementById('summary-text').textContent = data.summary;
        document.getElementById('detected-language').textContent = data.language_detected;
        
        // Highlights
        const highlightsList = document.getElementById('highlights-list');
        if (data.highlights && data.highlights.length > 0) {
            document.getElementById('highlights-section').style.display = 'block';
            highlightsList.innerHTML = data.highlights
                .map(h => `<li>${this.escapeHtml(h)}</li>`)
                .join('');
        } else {
            document.getElementById('highlights-section').style.display = 'none';
        }
        
        // Issues
        document.getElementById('issue-count').textContent = data.issues.length;
        this.renderIssues(data.issues);
    }
    
    animateScore(type, score) {
        const scoreEl = document.getElementById(`${type}-score`);
        const progressEl = document.getElementById(`${type}-progress`);
        
        // Animate number
        this.animateNumber(scoreEl, 0, score, 1000);
        
        // Animate ring
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (score / 100) * circumference;
        progressEl.style.strokeDashoffset = offset;
    }
    
    animateBar(type, score) {
        const barEl = document.getElementById(`${type}-bar`);
        const scoreEl = document.getElementById(`${type}-score`);
        
        barEl.style.width = `${score}%`;
        this.animateNumber(scoreEl, 0, score, 800);
    }
    
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    renderIssues(issues, filter = 'all') {
        const container = document.getElementById('issues-list');
        
        const filtered = filter === 'all' 
            ? issues 
            : issues.filter(i => i.severity === filter);
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="no-issues">
                    <p>No ${filter === 'all' ? '' : filter + ' '}issues found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map((issue, index) => `
            <div class="issue-item ${issue.severity}" style="animation-delay: ${index * 50}ms">
                <div class="issue-header">
                    <span class="issue-severity">${issue.severity}</span>
                    <span class="issue-category">${issue.category}</span>
                    ${issue.line_start ? `<span class="issue-line">Line ${issue.line_start}${issue.line_end && issue.line_end !== issue.line_start ? '-' + issue.line_end : ''}</span>` : ''}
                </div>
                <div class="issue-message">${this.escapeHtml(issue.message)}</div>
                ${issue.suggestion ? `<div class="issue-suggestion">${this.escapeHtml(issue.suggestion)}</div>` : ''}
            </div>
        `).join('');
    }
    
    filterIssues(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // Re-render issues with filter
        if (this.reviewData && this.reviewData.issues) {
            this.renderIssues(this.reviewData.issues, filter);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️'}</span>
            <span class="notification-message">${this.escapeHtml(message)}</span>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-medium);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                }
                
                .notification-error {
                    border-color: var(--critical);
                }
                
                .notification-warning {
                    border-color: var(--warning);
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideOutRight {
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CodeReviewer();
});

