export class NewsAPI {
    constructor() {
        this.nextPage = null;
        this.isFetching = false;

        // this.API_KEY = "pub_f5e3cc7d0530421f8fa9f0e068850154";
        this.API_KEY = "pub_613708a31479c0eb76bb7a9497ea3f8a10eae";
        this.BASE_URL = "https://newsdata.io/api/1/news";
    }

    async translateText(text, targetLang) {
        if (!text || targetLang === 'en') return text;
        
        try {
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
            if (!response.ok) throw new Error('Translation API failed');
            
            const data = await response.json();
            return data[0][0][0];
        } catch (error) {
            console.warn('Translation failed:', error);
            return text;
        }
    }

    async fetchNews(query, filters, pageToken = null) {
        if (this.isFetching) return null;
        
        this.isFetching = true;
        
        try {
            // Always fetch in English
            const params = new URLSearchParams({
                apikey: this.API_KEY,
                q: query || 'ai',
                country: filters.country,
                language: 'en', // Always fetch in English
                category: filters.category
            });

            if (pageToken) {
                params.append('page', pageToken);
            }

            const url = `${this.BASE_URL}?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "error") {
                throw new Error(data.message || "API returned an error");
            }

            this.nextPage = data.nextPage || null;
            
            // If the target language is not English, translate the content
            if (filters.language !== 'en' && data.results) {
                const translatedResults = await Promise.all(
                    data.results.map(async article => ({
                        ...article,
                        title: await this.translateText(article.title, filters.language),
                        description: article.description ? 
                            await this.translateText(article.description, filters.language) : 
                            null,
                        targetLanguage: filters.language
                    }))
                );
                return translatedResults;
            }

            return data.results || [];
        } catch (error) {
            throw new Error(`Failed to fetch news: ${error.message}`);
        } finally {
            this.isFetching = false;
        }
    }
}