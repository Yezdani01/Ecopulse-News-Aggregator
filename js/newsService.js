import { API_KEY, BASE_URL, DEFAULT_SETTINGS } from './config.js';

class NewsService {
    constructor() {
        this.nextPage = null;
        this.isFetching = false;
        this.settings = { ...DEFAULT_SETTINGS };
    }

    async fetchNews(query, pageToken = null) {
        if (this.isFetching) return;
        this.isFetching = true;

        try {
            let fetchUrl = `${BASE_URL}${query}&apikey=${API_KEY}&country=${this.settings.country}&language=${this.settings.language}&category=${this.settings.category}`;
            if (pageToken) {
                fetchUrl += `&page=${pageToken}`;
            }
            
            const res = await fetch(fetchUrl);
            const data = await res.json();

            if (data.results) {
                this.nextPage = data.nextPage || null;
                return data.results;
            }
            return [];
        } catch (error) {
            console.error("Error fetching news:", error);
            return [];
        } finally {
            this.isFetching = false;
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}

export const newsService = new NewsService();