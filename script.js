(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const locationInput = $('location');
  const searchBtn = $('searchBtn');
  const newsGrid = $('newsGrid');
  const statusEl = $('status');
  const resultsTitle = $('resultsTitle');
  const todayDate = $('todayDate');
  const resultCount = $('resultCount');

  todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  searchBtn.addEventListener('click', loadNews);
  locationInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') loadNews();
  });

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }
  function showEmpty(title, message) {
    newsGrid.innerHTML = `<div class="empty-state"><div class="empty-icon" aria-hidden="true">◎</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(message)}</p></div>`;
  }
  function formatDate(value) {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
  function renderArticles(articles) {
    if (!articles.length) {
      showEmpty('No stories found today', 'Try another city name or check back later.');
      return;
    }
    newsGrid.innerHTML = articles.map((article) => {
      const title = article.title || 'Untitled article';
      const description = article.description || 'Open the story to read more details from the publisher.';
      const source = article.source?.name || 'News source';
      const url = article.url || '';
      const image = article.urlToImage;
      const imageMarkup = image
        ? `<img src="${escapeHTML(image)}" alt="" loading="lazy" onerror="this.parentElement.textContent='Image unavailable'">`
        : 'No image available';
      return `<article class="news-card"><div class="news-image">${imageMarkup}</div><div class="news-body"><div class="article-meta">${escapeHTML(source)} · ${escapeHTML(formatDate(article.publishedAt))}</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p>${url ? `<a class="read-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Read full story ↗</a>` : ''}</div></article>`;
    }).join('');
  }
  async function loadNews() {
    const city = locationInput.value.trim();
    if (!city) {
      statusEl.textContent = 'Please enter a city or location.';
      locationInput.focus();
      return;
    }
    resultsTitle.textContent = `Today in ${city}`;
    statusEl.textContent = `Searching for today’s news about ${city}…`;
    resultCount.textContent = 'Loading…';
    searchBtn.disabled = true;
    showEmpty('Finding your daily briefing', 'Please wait while we fetch the latest articles.');
    try {
      const response = await fetch(`/.netlify/functions/news?city=${encodeURIComponent(city)}`);
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || `Request failed (${response.status}).`);
      const articles = (data.articles || []).filter(a => a.title && a.title !== '[Removed]');
      renderArticles(articles);
      resultCount.textContent = `${articles.length} ${articles.length === 1 ? 'story' : 'stories'}`;
      statusEl.textContent = articles.length
        ? `Showing articles published today that mention “${city}”.`
        : `No articles published today were found for “${city}”. Try another city or spelling.`;
    } catch (error) {
      showEmpty('Could not load news', error.message || 'Check the backend setup and API key.');
      statusEl.textContent = 'News request failed.';
      resultCount.textContent = 'Unavailable';
    } finally {
      searchBtn.disabled = false;
    }
  }
})();
