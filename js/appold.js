import { NewsAPI } from './api.js';
import { createNewsCard, setLoading, updatePageLanguage } from './ui.js';

class NewsApp {
    constructor() {
        this.api = new NewsAPI();
        this.state = {
            category: 'technology',
            country: 'in',
            language: 'en'
        };
        this.originalArticles = []; // Store original English articles
        this.displayedArticles = []; // Store currently displayed articles
        
        this.initializeUI();
        this.setupEventListeners();
        this.loadInitialNews();
    }

    initializeUI() {
        document.querySelector('.header-title').textContent = 'Echopulse';
        
        Object.entries(this.state).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) element.value = value;
        });
    }

    setupEventListeners() {
        ['category', 'country'].forEach(filter => {
            document.getElementById(filter)?.addEventListener('change', (e) => {
                this.state[filter] = e.target.value;
            });
        });

        document.getElementById('language')?.addEventListener('change', async (e) => {
            const newLanguage = e.target.value;
            this.state.language = newLanguage;
            
            if (this.originalArticles.length > 0) {
                await this.translateArticles(newLanguage);
            }
        });

        document.getElementById('search-button')?.addEventListener('click', () => {
            this.refreshNews();
        });

        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    async translateArticles(targetLang) {
        if (!this.originalArticles.length) return;

        setLoading(true);
        try {
            if (targetLang === 'en') {
                this.displayedArticles = [...this.originalArticles];
                this.updateDisplay(false);
                return;
            }

            const translatedArticles = await Promise.all(
                this.originalArticles.map(async (article) => ({
                    ...article,
                    title: await this.api.translateText(article.title, targetLang),
                    description: article.description ? 
                        await this.api.translateText(article.description, targetLang) : 
                        null,
                    targetLanguage: targetLang
                }))
            );

            this.displayedArticles = translatedArticles;
            this.updateDisplay(true);
            updatePageLanguage(targetLang);
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setLoading(false);
        }
    }

    updateDisplay(needsTranslation) {
        const container = document.getElementById('news-grid');
        container.innerHTML = '';
        this.displayedArticles.forEach(article => {
            const card = createNewsCard(article, needsTranslation);
            container.appendChild(card);
        });
    }

    async loadInitialNews() {
        try {
            setLoading(true);
            const articles = await this.api.fetchNews('ai', { ...this.state, language: 'en' });
            this.originalArticles = articles;
            this.displayedArticles = [...articles];
            
            if (this.state.language !== 'en') {
                await this.translateArticles(this.state.language);
            } else {
                this.updateDisplay(false);
            }
        } catch (error) {
            console.error('Failed to load news:', error);
        } finally {
            setLoading(false);
        }
    }

    async refreshNews() {
        try {
            const newsGrid = document.getElementById('news-grid');
            newsGrid.innerHTML = '';
            this.api.nextPage = null;
            
            setLoading(true);
            const articles = await this.api.fetchNews('ai', { ...this.state, language: 'en' });
            this.originalArticles = articles;
            this.displayedArticles = [...articles];
            
            if (this.state.language !== 'en') {
                await this.translateArticles(this.state.language);
            } else {
                this.updateDisplay(false);
            }
        } catch (error) {
            console.error('Failed to refresh news:', error);
        } finally {
            setLoading(false);
        }
    }

    async loadMoreNews() {
        if (!this.api.nextPage || this.api.isFetching) return;

        try {
            const articles = await this.api.fetchNews('ai', { ...this.state, language: 'en' }, this.api.nextPage);
            if (articles?.length) {
                this.originalArticles = [...this.originalArticles, ...articles];
                
                if (this.state.language !== 'en') {
                    const translatedNewArticles = await Promise.all(
                        articles.map(async (article) => ({
                            ...article,
                            title: await this.api.translateText(article.title, this.state.language),
                            description: article.description ? 
                                await this.api.translateText(article.description, this.state.language) : 
                                null,
                            targetLanguage: this.state.language
                        }))
                    );
                    this.displayedArticles = [...this.displayedArticles, ...translatedNewArticles];
                    this.updateDisplay(true);
                } else {
                    this.displayedArticles = [...this.displayedArticles, ...articles];
                    this.updateDisplay(false);
                }
            }
        } catch (error) {
            console.error('Failed to load more news:', error);
        }
    }

    handleScroll() {
        if (
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
            this.api.nextPage &&
            !this.api.isFetching
        ) {
            this.loadMoreNews();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NewsApp();
});