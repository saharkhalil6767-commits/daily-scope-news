```javascript
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // HTML elements
  const locationInput = $('location');
  const searchBtn = $('searchBtn');
  const newsGrid = $('newsGrid');
  const statusEl = $('status');
  const resultsTitle = $('resultsTitle');
  const todayDate = $('todayDate');
  const resultCount = $('resultCount');

  const postsTab = $('postsTab');
  const videosTab = $('videosTab');
  const videosSection = $('videosSection');
  const videosGrid = $('videosGrid');

  // Check required HTML elements
  const requiredElements = {
    locationInput,
    searchBtn,
    newsGrid,
    statusEl,
    resultsTitle,
    todayDate,
    resultCount,
    postsTab,
    videosTab,
    videosSection,
    videosGrid
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length) {
    console.error(
      'DailyScope: Missing HTML elements:',
      missingElements.join(', ')
    );
    return;
  }

  // Show today's date
  todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // News channel information
  const channels = [
    {
      name: 'ARY News',
      language: 'Urdu',
      description: 'Pakistan ki latest Urdu news.',
      url: 'https://www.youtube.com/@ARYNews'
    },
    {
      name: 'Geo News',
      language: 'Urdu',
      description: 'Pakistan aur duniya bhar ki khabrein.',
      url: 'https://www.youtube.com/@geonews'
    },
    {
      name: 'UrduPoint',
      language: 'Urdu',
      description: 'Urdu news, interviews aur reports.',
      url: 'https://www.youtube.com/@UrduPoint'
    },
    {
      name: 'BBC News',
      language: 'English',
      description: 'International news and reports.',
      url: 'https://www.youtube.com/@BBCNews'
    },
    {
      name: 'Al Jazeera English',
      language: 'English',
      description: 'Global news and current affairs.',
      url: 'https://www.youtube.com/@aljazeeraenglish'
    },
    {
      name: 'Sky News',
      language: 'English',
      description: 'Breaking news and world updates.',
      url: 'https://www.youtube.com/@SkyNews'
    },
    {
      name: 'DW News',
      language: 'English',
      description: 'World news and analysis.',
      url: 'https://www.youtube.com/@dwnews'
    }
  ];

  // Safely display text in HTML
  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  // Format article publication date
  function formatDate(value) {
    if (!value) return 'Date unavailable';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  // Show an empty or informational news state
  function showEmpty(title, message) {
    newsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">◎</div>
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(message)}</p>
      </div>
    `;
  }

  // Display news articles
  function renderArticles(articles) {
    if (!articles.length) {
      showEmpty(
        'No stories found',
        'Try another city or check back later.'
      );
      return;
    }

    newsGrid.innerHTML = articles.map((article) => {
      const title = article.title || 'Untitled article';
      const description = article.description ||
        'Open the publisher website to read the full story.';
      const source = article.source?.name || 'News source';
      const url = article.url || '';
      const image = article.urlToImage;

      const imageMarkup = image
        ? `
          <img
            src="${escapeHTML(image)}"
            alt=""
            loading="lazy"
            onerror="this.style.display='none'; this.parentElement.textContent='Image unavailable';"
          >
        `
        : 'No image available';

      const articleLink = url
        ? `
          <a
            class="read-link"
            href="${escapeHTML(url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read full story ↗
          </a>
        `
        : '';

      return `
        <article class="news-card">
          <div class="news-image">${imageMarkup}</div>
          <div class="news-body">
            <div class="article-meta">
              ${escapeHTML(source)} ·
              ${escapeHTML(formatDate(article.publishedAt))}
            </div>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(description)}</p>
            ${articleLink}
          </div>
        </article>
      `;
    }).join('');
  }

  // Display news channel cards only
  function renderVideoCards() {
    videosGrid.innerHTML = channels.map((channel) => `
      <article class="video-card">
        <div class="video-info">
          <h3>${escapeHTML(channel.name)}</h3>
          <p>${escapeHTML(channel.language)} News</p>
          <p>${escapeHTML(channel.description)}</p>
          <a
            class="video-link"
            href="${escapeHTML(channel.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Channel ↗
          </a>
        </div>
      </article>
    `).join('');

    videosGrid.dataset.loaded = 'true';
  }

  // Switch between News Posts and News Videos
  function showTab(tab) {
    const showPosts = tab === 'posts';

    newsGrid.hidden = !showPosts;
    videosSection.hidden = showPosts;

    postsTab.classList.toggle('active', showPosts);
    videosTab.classList.toggle('active', !showPosts);

    postsTab.setAttribute('aria-pressed', String(showPosts));
    videosTab.setAttribute('aria-pressed', String(!showPosts));

    if (!showPosts && videosGrid.dataset.loaded !== 'true') {
      renderVideoCards();
    }
  }

  // Fetch news from the existing backend
  async function loadNews() {
    const city = locationInput.value.trim();

    if (!city) {
      statusEl.textContent = 'Please enter a city or location.';
      locationInput.focus();
      return;
    }

    resultsTitle.textContent = `Today in ${city}`;
    statusEl.textContent = `Searching for news about ${city}...`;
    resultCount.textContent = 'Loading...';
    searchBtn.disabled = true;

    showEmpty(
      'Finding your daily briefing',
      'Please wait while we fetch news articles.'
    );

    try {
      const response = await fetch(
        `/api/news?city=${encodeURIComponent(city)}`
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'The server returned an invalid response. Please check the backend.'
        );
      }

      if (!response.ok || data.error) {
        throw new Error(
          data.error || `News request failed (${response.status}).`
        );
      }

      const articles = Array.isArray(data.articles)
        ? data.articles.filter(
            (article) =>
              article &&
              article.title &&
              article.title !== '[Removed]'
          )
        : [];

      renderArticles(articles);

      resultCount.textContent =
        `${articles.length} ${
          articles.length === 1 ? 'story' : 'stories'
        }`;

      statusEl.textContent = articles.length
        ? `Showing news articles for ${city}.`
        : `No articles found for ${city}. Try another location.`;

    } catch (error) {
      showEmpty(
        'Could not load news',
        error.message || 'Please check your internet connection.'
      );

      statusEl.textContent = 'News request failed.';
      resultCount.textContent = 'Unavailable';

      console.error('DailyScope news error:', error);

    } finally {
      searchBtn.disabled = false;
    }
  }

  // Button events
  searchBtn.addEventListener('click', loadNews);

  locationInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      loadNews();
    }
  });

  postsTab.addEventListener('click', () => showTab('posts'));
  videosTab.addEventListener('click', () => showTab('videos'));

  // Start with News Posts visible
  showTab('posts');

})();
```
