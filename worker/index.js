// Moodvie API Proxy — keeps API keys server-side
// Deploy: cd worker && npx wrangler deploy
// Secrets: npx wrangler secret put GROQ_API_KEY / TMDB_API_KEY

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // CORS — only allow your domain (and localhost for dev)
    const allowed = [env.ALLOWED_ORIGIN, 'https://moodvieapp.pages.dev', 'http://localhost:3000', 'http://127.0.0.1:3000'];
    const corsOrigin = allowed.includes(origin) ? origin : '';

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // ─── POST /api/recommend — Groq AI ───
      if (url.pathname === '/api/recommend' && request.method === 'POST') {
        const body = await request.json();
        const mood = body.mood;
        if (!mood || typeof mood !== 'string' || mood.length > 1000) {
          return json({ error: 'Invalid mood' }, 400, corsHeaders);
        }

        const prompt = `You are a deeply empathetic film curator. Someone describes their emotional state and you recommend the single most resonant film for that exact moment.

They are feeling: "${mood}"

Respond ONLY with valid JSON — no explanation, no markdown, no code blocks:
{
  "movie_title": "exact title",
  "year": "release year as string",
  "reason": "2-3 sentences. Be personal and specific about why this film fits their exact emotional state right now. Speak directly to them."
}`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 512,
            temperature: 0.8,
            response_format: { type: 'json_object' }
          })
        });

        if (!groqRes.ok) {
          const err = await groqRes.text();
          return json({ error: 'AI error', detail: err.slice(0, 200) }, groqRes.status, corsHeaders);
        }

        const data = await groqRes.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) return json({ error: 'Empty AI response' }, 500, corsHeaders);

        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return json({ error: 'Bad AI response' }, 500, corsHeaders);

        return json(JSON.parse(match[0]), 200, corsHeaders);
      }

      // ─── GET /api/movie?title=X&year=Y — TMDB search + details ───
      if (url.pathname === '/api/movie' && request.method === 'GET') {
        const title = url.searchParams.get('title');
        const year = url.searchParams.get('year');
        if (!title) return json({ error: 'Missing title' }, 400, corsHeaders);

        const key = env.TMDB_API_KEY;

        // Search
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&api_key=${key}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const movie = searchData.results?.[0];

        if (!movie) {
          return json({ poster: null, trailer: null, providers: [], region: null, tagline: null, runtime: null, genres: [], rating: null, director: null, cast: [] }, 200, corsHeaders);
        }

        const id = movie.id;

        // Parallel fetch details
        const [detailsRes, creditsRes, videosRes, providersRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${key}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${key}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${key}`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${key}`)
        ]);

        const details = await detailsRes.json();
        const credits = await creditsRes.json();
        const videosData = await videosRes.json();
        const providersData = await providersRes.json();

        // Trailer
        const trailer = videosData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
                     || videosData.results?.find(v => v.site === 'YouTube');

        // Streaming providers — MK → US → GB fallback
        let regionCode = null;
        let providers = [];
        for (const code of ['MK', 'US', 'GB']) {
          const r = providersData.results?.[code];
          if (r && ((r.flatrate?.length) || (r.free?.length))) {
            regionCode = code;
            providers = (r.flatrate || []).concat(r.free || []);
            break;
          }
        }

        // Director + top cast
        const director = credits.crew?.find(c => c.job === 'Director')?.name || null;
        const cast = (credits.cast || []).slice(0, 3).map(c => c.name);

        return json({
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
          providers: providers.slice(0, 6),
          region: regionCode,
          tagline: details.tagline || null,
          runtime: details.runtime || null,
          genres: (details.genres || []).map(g => g.name),
          rating: details.vote_average || null,
          director,
          cast
        }, 200, corsHeaders);
      }

      return json({ error: 'Not found' }, 404, corsHeaders);

    } catch (err) {
      return json({ error: 'Server error', detail: err.message }, 500, corsHeaders);
    }
  }
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}
