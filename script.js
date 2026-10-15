

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

  const postsTab = $('postsTab');
  const videosTab = $('videosTab');
  const videosSection = $('videosSection');
  const videosGrid = $('videosGrid');

  todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  searchBtn.addEventListener('click', loadNews);

  locationInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') loadNews();
  });

  postsTab.addEventListener('click', () => showTab('posts'));
  videosTab.addEventListener('click', () => showTab('videos'));

  function showTab(tab) {
    const showPosts = tab === 'posts';

    newsGrid.hidden = !showPosts;
    videosSection.hidden = showPosts;

    postsTab.classList.toggle('active', showPosts);
    videosTab.classList.toggle('active', !showPosts);

    postsTab.setAttribute('aria-pressed', String(showPosts));
    videosTab.setAttribute('aria-pressed', String(!showPosts));

    if (!showPosts && !videosGrid.dataset.loaded) {
      renderVideoCards(locationInput.value.trim() || 'world');
    }
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function showEmpty(title, message) {
    newsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">◎</div>
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(message)}</p>
      </div>`;
  }

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

  function renderArticles(articles) {
    if (!articles.length) {
      showEmpty(
        'No stories found today',
        'Try another city name or check back later.'
      );
      return;
    }

    newsGrid.innerHTML = articles.map((article) => {
      const title = article.title || 'Untitled article';
      const description = article.description ||
        'Open the story to read more details from the publisher.';
      const source = article.source?.name || 'News source';
      const url = article.url || '';
      const image = article.urlToImage;

      const imageMarkup = image
        ? `<img src="${escapeHTML(image)}" alt="" loading="lazy"
             onerror="this.parentElement.textContent='Image unavailable'">`
        : 'No image available';

      return `
        <article class="news-card">
          <div class="news-image">${imageMarkup}</div>
          <div class="news-body">
            <div class="article-meta">
              ${escapeHTML(source)} · ${escapeHTML(formatDate(article.publishedAt))}
            </div>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(description)}</p>
            ${url ? `
              <a class="read-link"
                 href="${escapeHTML(url)}"
                 target="_blank"
                 rel="noopener noreferrer">
                Read full story ↗
              </a>` : ''}
          </div>
        </article>`;
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

    showEmpty(
      'Finding your daily briefing',
      'Please wait while we fetch the latest articles.'
    );

    try {
      const response = await fetch(
        `/api/news?city=${encodeURIComponent(city)}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed (${response.status}).`);
      }

      const articles = (data.articles || []).filter(
        (article) => article.title && article.title !== '[Removed]'
      );

      renderArticles(articles);

      resultCount.textContent =
        `${articles.length} ${articles.length === 1 ? 'story' : 'stories'}`;

      statusEl.textContent = articles.length
        ? `Showing articles mentioning “${city}”.`
        : `No articles were found for “${city}”. Try another city or spelling.`;

    } catch (error) {
      showEmpty(
        'Could not load news',
        error.message || 'Check the backend setup and API key.'
      );

      statusEl.textContent = 'News request failed.';
      resultCount.textContent = 'Unavailable';

    } finally {
      searchBtn.disabled = false;
    }
  }

  function renderVideoCards(topic) {
    
  function renderVideoCards(topic) {
    const safeTopic = topic.trim() || 'world';

    const publishers = [
      {
        name: 'BBC News',
        description: 'Video reports and latest news coverage.',
        url: 'https://www.youtube.com/@BBCNews'
      },
      {
        name: 'Al Jazeera English',
        description: 'International reports, interviews and explainers.',
        url: 'https://www.youtube.com/@aljazeeraenglish'
      },
      {
        name: 'Sky News',
        description: 'Breaking news and video reports.',
        url: 'https://www.youtube.com/@SkyNews'
      },
      {
        name: 'DW News',
        description: 'International news and in-depth reports.',
        url: 'https://www.youtube.com/@dwnews'
      },
      {
        name: 'Associated Press',
        description: 'News footage and reports from around the world.',
        url: 'https://www.youtube.com/@AssociatedPress'
      },
      {
        name: 'ARY News',
        description: 'Pakistan ki latest Urdu news aur video reports.',
        url: 'https://www.youtube.com/@ARYNews'
      },
      {
        name: 'Geo News',
        description: 'Pakistan aur duniya bhar ki Urdu news coverage.',
        url: 'https://www.youtube.com/@geonews'
      },
      {
        name: 'UrduPoint',
        description: 'Urdu news, interviews aur video reports.',
        url: 'https://www.youtube.com/@UrduPoint'
      }
    ];

    videosGrid.innerHTML = publishers.map((publisher) => {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(publisher.name + ' ' + safeTopic + ' news')}`;

      return `
        <article class="video-card">
          <a class="video-thumbnail"
             href="${searchUrl}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Search ${publisher.name} videos">
            <span class="play-icon" aria-hidden="true">▶</span>
          </a>
          <div class="video-info">
            <h3>${publisher.name}</h3>
            <p>${publisher.description}</p>
            <a class="video-link"
               href="${searchUrl}"
               target="_blank"
               rel="noopener noreferrer">
              Find ${safeTopic} videos ↗
            </a>
            <p>
              <a class="video-link"
                 href="${publisher.url}"
                 target="_blank"
                 rel="noopener noreferrer">
                Visit official channel
              </a>
            </p>
          </div>
        </article>
      `;
    }).join('');

    videosGrid.dataset.loaded = 'true';
  }
```js
  function renderVideoCards(topic) {
    const channels = [
      {
        name: 'ARY News',
        language: 'Urdu',
        description: 'Pakistan ki latest Urdu news',
        url: 'https://www.youtube.com/@ARYNews'
      },
      {
        name: 'Geo News',
        language: 'Urdu',
        description: 'Pakistan aur duniya bhar ki khabrein',
        url: 'https://www.youtube.com/@geonews'
      },
      {
        name: 'UrduPoint',
        language: 'Urdu',
        description: 'Urdu news aur interviews',
        url: 'https://www.youtube.com/@UrduPoint'
      },
      {
        name: 'BBC News',
        language: 'English',
        description: 'International news coverage',
        url: 'https://www.youtube.com/@BBCNews'
      },
      {
        name: 'Al Jazeera English',
        language: 'English',
        description: 'Global news and reports',
        url: 'https://www.youtube.com/@aljazeeraenglish'
      },
      {
        name: 'Sky News',
        language: 'English',
        description: 'Breaking news and updates',
        url: 'https://www.youtube.com/@SkyNews'
      },
      {
        name: 'DW News',
        language: 'English',
        description: 'World news and analysis',
        url: 'https://www.youtube.com/@dwnews'
      }
    ];

    videosGrid.innerHTML = channels.map(channel => `
      <article class="video-card">
        <div class="video-info">
          <h3>${escapeHTML(channel.name)}</h3>
          <p>${escapeHTML(channel.language)} News</p>
          <p>${escapeHTML(channel.description)}</p>
          <a class="video-link"
             href="${channel.url}"
             target="_blank"
             rel="noopener noreferrer">
            Visit Channel ↗
          </a>
        </div>
      </article>
    `).join('');

    videosGrid.dataset.loaded = 'true';
  }
```
  
  }
})();
