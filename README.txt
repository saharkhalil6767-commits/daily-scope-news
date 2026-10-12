DAILYSCOPE NEWS BACKEND — SETUP GUIDE

IMPORTANT: Drag-and-drop manual deploys do not reliably build/deploy Netlify Functions. Upload these files to a GitHub repository, then connect that repository to Netlify.

FILES
- index.html, style.css, script.js: website frontend
- netlify/functions/news.js: server-side function; API key stays on server
- netlify.toml: Netlify build settings

STEPS
1. Create/sign in to GitHub at https://github.com/ and create a new repository.
2. Upload the CONTENTS of this folder, preserving the netlify/functions/news.js folder structure.
3. In Netlify, choose Add new project / Import an existing project, connect GitHub, and select this repository. Build command can be left blank; publish directory is . (dot).
4. In the Netlify site, open Site configuration (or Project configuration) > Environment variables. Add variable name NEWSAPI_KEY and value your current NewsAPI key. Save. Never put the key in index.html or script.js.
5. Trigger a new deploy after adding the variable.
6. Open the site and search for London.

PLAN WARNING
A backend hides the API key from the browser, but does not change NewsAPI plan terms. NewsAPI Developer plan may not allow production/public deployment. If it rejects server-side requests or production use is not allowed, use an eligible paid plan or a news provider that permits this use. Check https://newsapi.org/pricing and the provider's terms.

SECURITY
If your old key was exposed publicly, regenerate it in the NewsAPI dashboard before using it. Store only the new key in Netlify environment variables.
