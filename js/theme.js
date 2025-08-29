export class ThemeManager {
    constructor() {
        // Check if theme exists in localStorage, if not set it to 'light'
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply theme immediately when class is instantiated
        this.applyTheme();
        // Wait for DOM to be fully loaded before setting up toggle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
    }

    applyTheme() {
        // Apply theme to document element
        document.documentElement.setAttribute('data-theme', this.theme);
        // Store in localStorage
        localStorage.setItem('theme', this.theme);
    }

    setupToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle theme');
        toggle.setAttribute('title', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
        
        // Set initial state class
        if (this.theme === 'dark') {
            toggle.classList.add('dark');
        }

        toggle.innerHTML = `
            <div class="icons">
                <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            </div>
        `;

        // Add click event listener
        toggle.addEventListener('click', () => {
            this.toggleTheme();
            toggle.setAttribute('title', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
        });
        
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            // Create left section if it doesn't exist
            let headerLeft = headerContent.querySelector('.header-left');
            if (!headerLeft) {
                headerLeft = document.createElement('div');
                headerLeft.className = 'header-left';
                
                // Move existing title and icon to left section
                const title = headerContent.querySelector('.header-title');
                const icon = headerContent.querySelector('svg');
                if (title) headerLeft.appendChild(title);
                if (icon) headerLeft.insertBefore(icon, title);
                
                headerContent.insertBefore(headerLeft, headerContent.firstChild);
            }
            
            headerContent.appendChild(toggle);
        }
    }

    toggleTheme() {
        // Toggle theme
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        
        // Apply new theme
        this.applyTheme();
        
        // Update toggle button state
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.classList.toggle('dark');
            
            // Add animation class
            toggle.classList.add('theme-toggle-animation');
            setTimeout(() => toggle.classList.remove('theme-toggle-animation'), 300);
        }
    }
}