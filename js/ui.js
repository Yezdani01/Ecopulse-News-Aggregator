export function createNewsCard(article, needsTranslation) {
    const card = document.createElement('article');
    card.className = 'news-card';
    
    const description = article.description || 'No description available';
    const truncatedDesc = truncateText(description, 150);
    const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop';
    
    const articleUrl = article.link;
    
    card.innerHTML = `
        <div class="card-image-container">
            <img 
                src="${article.image_url || fallbackImage}" 
                alt="${escapeHtml(article.title)}"
                class="card-image"
                loading="lazy"
                onerror="this.src='${fallbackImage}'"
            >
        </div>
        <div class="card-content">
            <h2 class="card-title">${escapeHtml(article.title)}</h2>
            <p class="card-description">${escapeHtml(truncatedDesc)}</p>
        </div>
        <div class="card-footer">
            <span class="source">${escapeHtml(article.source_id || 'Unknown Source')}</span>
            <button class="button read-more-btn" onclick="openArticle('${articleUrl}', ${needsTranslation}, '${article.targetLanguage || ''}')">Read More</button>
        </div>
    `;
    
    return card;
}

window.openArticle = function(url, needsTranslation, targetLang) {
    if (needsTranslation && targetLang) {
        const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${encodeURIComponent(url)}`;
        window.open(translateUrl, '_blank');
    } else {
        window.open(url, '_blank');
    }
};

export function updatePageLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
}

export function setLoading(isLoading) {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = isLoading ? 'flex' : 'none';
    }
}

export function showError(message) {
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>${message}</p>
            <button class="button" onclick="window.location.reload()">Try Again</button>
        `;
        newsGrid.innerHTML = '';
        newsGrid.appendChild(errorDiv);
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}