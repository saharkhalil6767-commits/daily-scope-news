
export default async (request) => {
  const apiKey = Netlify.env.get("NEWS_API_KEY");

  if (!apiKey) {
    return Response.json(
      { error: "News API key is not configured." },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const city = url.searchParams.get("city") || "London";

  const allowedCity = city.trim().slice(0, 80);

  const newsUrl = new URL(
    "https://newsapi.org/v2/everything"
  );

  newsUrl.searchParams.set("q", allowedCity);
  newsUrl.searchParams.set("language", "en");
  newsUrl.searchParams.set("sortBy", "publishedAt");
  newsUrl.searchParams.set("pageSize", "20");
  newsUrl.searchParams.set("apiKey", apiKey);

  try {
    const response = await fetch(newsUrl);
    const data = await response.json();

    return Response.json(data, {
      status: response.ok ? 200 : response.status,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch {
    return Response.json(
      { error: "Unable to fetch news." },
      { status: 502 }
    );
  }
};

export const config = {
  path: "/api/news"
};
