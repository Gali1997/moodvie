// ─── Cursor ───────────────────────────────────────────────────────────────────
const cursor    = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
let mouseX = 0, mouseY = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top  = e.clientY + 'px';
  const xp = (e.clientX / window.innerWidth)  * 100;
  const yp = (e.clientY / window.innerHeight) * 100;
  document.documentElement.style.setProperty('--mx', xp + '%');
  document.documentElement.style.setProperty('--my', yp + '%');
});
(function animateCursor() {
  cx += (mouseX - cx) * 0.1;
  cy += (mouseY - cy) * 0.1;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(animateCursor);
})();


// ─── Daily limit (localStorage counter) ──────────────────────────────────────
const DAILY_LIMIT = 20;

function getDailyCount() {
  const stored = JSON.parse(localStorage.getItem('moodvie_usage') || '{}');
  const today  = new Date().toDateString();
  if (stored.date !== today) return 0;
  return stored.count || 0;
}

function incrementDailyCount() {
  const today = new Date().toDateString();
  const count = getDailyCount() + 1;
  localStorage.setItem('moodvie_usage', JSON.stringify({ date: today, count }));
}

function overLimit() { return getDailyCount() >= DAILY_LIMIT; }


// ─── Auth ─────────────────────────────────────────────────────────────────────
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
let currentUser = null;

auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('user-btn').style.display  = 'flex';
    document.querySelector('.user-name').textContent   = user.displayName?.split(' ')[0] || 'You';
    renderWatchlist();
  } else {
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('user-btn').style.display  = 'none';
  }
});

document.getElementById('login-btn').addEventListener('click', () => {
  document.getElementById('login-modal').style.display = 'flex';
});
document.getElementById('login-modal-close').addEventListener('click', () => {
  document.getElementById('login-modal').style.display = 'none';
});
document.getElementById('google-signin-btn').addEventListener('click', () => {
  auth.signInWithPopup(provider).then(() => {
    document.getElementById('login-modal').style.display = 'none';
  }).catch(err => console.error(err));
});
document.getElementById('user-btn').addEventListener('click', () => {
  auth.signOut();
});


// ─── Watchlist (localStorage, keyed by user uid or "guest") ──────────────────
function getWatchlistKey() {
  return currentUser ? `moodvie_wl_${currentUser.uid}` : 'moodvie_wl_guest';
}
function getWatchlist() {
  return JSON.parse(localStorage.getItem(getWatchlistKey()) || '[]');
}
function saveWatchlist(list) {
  localStorage.setItem(getWatchlistKey(), JSON.stringify(list));
}
function addToWatchlist(entry) {
  const list = getWatchlist();
  if (list.find(m => m.title === entry.title)) return;
  list.unshift(entry);
  saveWatchlist(list);
  renderWatchlist();
}
function removeFromWatchlist(title) {
  const list = getWatchlist().filter(m => m.title !== title);
  saveWatchlist(list);
  renderWatchlist();
}

function renderWatchlist() {
  const list  = getWatchlist();
  const empty = document.getElementById('watchlist-empty');
  const items = document.getElementById('watchlist-items');
  if (list.length === 0) {
    empty.style.display = 'block';
    items.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  items.innerHTML = list.map(m => `
    <div class="wl-item">
      ${m.poster ? `<img class="wl-poster" src="${m.poster}" alt="${m.title}">` : '<div class="wl-poster-placeholder"></div>'}
      <div class="wl-item-info">
        <p class="wl-item-title">${m.title}</p>
        <p class="wl-item-year">${m.year}</p>
      </div>
      <button class="wl-remove" data-title="${m.title}">✕</button>
    </div>
  `).join('');
  items.querySelectorAll('.wl-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromWatchlist(btn.dataset.title));
  });
}

// Watchlist panel
document.getElementById('watchlist-nav').addEventListener('click', () => {
  renderWatchlist();
  document.getElementById('watchlist-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
});
document.getElementById('watchlist-close').addEventListener('click', closeWatchlist);
document.getElementById('panel-overlay').addEventListener('click', closeWatchlist);
function closeWatchlist() {
  document.getElementById('watchlist-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
}


// ─── Elements ─────────────────────────────────────────────────────────────────
const heroSection   = document.getElementById('hero');
const loadSection   = document.getElementById('loading');
const resultSection = document.getElementById('result');
const tipOverlay    = document.getElementById('tip-overlay');
const moodInput     = document.getElementById('mood-input');
const findBtn       = document.getElementById('find-btn');
const resetBtn      = document.getElementById('reset-btn');
const tipClose      = document.getElementById('tip-close');
const tipSkip       = document.getElementById('tip-skip');
const tipLink       = document.getElementById('tip-link');

tipLink.href = CONFIG.STRIPE_PAYMENT_LINK;

let currentMovie = null;


// ─── Section switcher ─────────────────────────────────────────────────────────
function show(name) {
  heroSection.style.display   = name === 'hero'    ? 'flex'  : 'none';
  loadSection.style.display   = name === 'loading' ? 'flex'  : 'none';
  resultSection.style.display = name === 'result'  ? 'flex'  : 'none';
  window.scrollTo({ top: 0 });
}


// ─── Find film ────────────────────────────────────────────────────────────────
findBtn.addEventListener('click', async () => {
  const mood = moodInput.value.trim();
  if (!mood) return;

  if (overLimit()) {
    alert(`You've reached today's limit of ${DAILY_LIMIT} films. Come back tomorrow!`);
    return;
  }

  show('loading');

  try {
    const movie    = await askAI(mood);
    const tmdbData = await fetchTMDB(movie.movie_title, movie.year);
    incrementDailyCount();
    renderResult(movie, tmdbData, mood);
  } catch (err) {
    console.error(err);
    alert('Error: ' + (err.message || 'Something went wrong — please try again.'));
    show('hero');
  }
});

moodInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); findBtn.click(); }
});


// ─── Groq AI (Llama 3.3 70B) ─────────────────────────────────────────────────
// Free, fast, works globally. Sign up at https://console.groq.com/keys
async function askAI(mood) {
  const prompt = `You are a deeply empathetic film curator. Someone describes their emotional state and you recommend the single most resonant film for that exact moment.

They are feeling: "${mood}"

Respond ONLY with valid JSON — no explanation, no markdown, no code blocks:
{
  "movie_title": "exact title",
  "year": "release year as string",
  "reason": "2-3 sentences. Be personal and specific about why this film fits their exact emotional state right now. Speak directly to them."
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.8,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Groq ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty AI response');

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Bad AI response: ' + text.slice(0, 100));
  return JSON.parse(match[0]);
}


// ─── TMDB ─────────────────────────────────────────────────────────────────────
async function fetchTMDB(title, year) {
  const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&api_key=${CONFIG.TMDB_API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const movie = searchData.results[0];
  if (!movie) return { poster:null, trailer:null, providers:[], region:null, tagline:null, runtime:null, genres:[], rating:null, director:null, cast:[] };

  const id = movie.id;

  const [detailsRes, creditsRes, videosRes, providersRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${CONFIG.TMDB_API_KEY}`),
    fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${CONFIG.TMDB_API_KEY}`),
    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${CONFIG.TMDB_API_KEY}`),
    fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${CONFIG.TMDB_API_KEY}`)
  ]);

  const details      = await detailsRes.json();
  const credits      = await creditsRes.json();
  const videosData   = await videosRes.json();
  const providersData = await providersRes.json();

  // Trailer — prefer official YouTube trailer
  const trailer = videosData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
              || videosData.results?.find(v => v.site === 'YouTube');

  // Streaming providers — MK → US → GB fallback
  let regionCode = null;
  let providers  = [];
  for (const code of ['MK', 'US', 'GB']) {
    const r = providersData.results?.[code];
    if (r && ((r.flatrate?.length) || (r.free?.length))) {
      regionCode = code;
      providers  = (r.flatrate || []).concat(r.free || []);
      break;
    }
  }

  // Director + top 3 cast
  const director = credits.crew?.find(c => c.job === 'Director')?.name || null;
  const cast     = (credits.cast || []).slice(0, 3).map(c => c.name);

  return {
    poster:  movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    providers: providers.slice(0, 6),
    region:    regionCode,
    tagline:   details.tagline || null,
    runtime:   details.runtime || null,
    genres:    (details.genres || []).map(g => g.name),
    rating:    details.vote_average || null,
    director,
    cast
  };
}


// ─── Render result ────────────────────────────────────────────────────────────
function renderResult(movie, tmdb, userMood) {
  document.getElementById('movie-title').textContent  = movie.movie_title;
  document.getElementById('movie-year').textContent   = movie.year;
  document.getElementById('movie-reason').textContent = movie.reason;

  const img = document.getElementById('movie-poster');
  if (tmdb.poster) {
    img.src = tmdb.poster;
    img.alt = movie.movie_title;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  // Tagline (real cinema poster vibe)
  const taglineEl = document.getElementById('movie-tagline');
  if (tmdb.tagline) {
    taglineEl.textContent = '\u201C' + tmdb.tagline + '\u201D';
    taglineEl.style.display = 'block';
  } else {
    taglineEl.style.display = 'none';
  }

  // Meta row: runtime · genres · ★ rating
  const metaEl = document.getElementById('movie-meta');
  const metaParts = [];
  if (tmdb.runtime) {
    const h = Math.floor(tmdb.runtime / 60);
    const m = tmdb.runtime % 60;
    metaParts.push(h ? `${h}h ${m}m` : `${m}m`);
  }
  if (tmdb.genres?.length) metaParts.push(tmdb.genres.slice(0, 2).join(' · '));
  if (tmdb.rating)         metaParts.push('\u2605 ' + tmdb.rating.toFixed(1));
  metaEl.innerHTML = metaParts.length
    ? metaParts.map(p => `<span class="meta-item">${p}</span>`).join('<i class="meta-sep"></i>')
    : '';
  metaEl.style.display = metaParts.length ? 'flex' : 'none';

  // Credits — Director + top cast
  const creditsEl = document.getElementById('movie-credits');
  const credParts = [];
  if (tmdb.director)      credParts.push(`Directed by <em>${tmdb.director}</em>`);
  if (tmdb.cast?.length)  credParts.push(`Starring <em>${tmdb.cast.join(', ')}</em>`);
  if (credParts.length) {
    creditsEl.innerHTML = credParts.join(' &middot; ');
    creditsEl.style.display = 'block';
  } else {
    creditsEl.style.display = 'none';
  }

  // Mood match — fun pseudo-randomized score 88-99 based on title hash
  const seed = (movie.movie_title.length * 7 + (parseInt(movie.year, 10) || 0) * 3) % 12;
  const matchPct = 88 + seed;
  const matchPctEl = document.getElementById('match-pct');
  const matchSubEl = document.getElementById('match-sub');
  const matchFill  = document.getElementById('match-fill');
  matchPctEl.textContent = matchPct + '%';
  // SVG circle stroke-dasharray for ring fill
  const circ = 2 * Math.PI * 25;
  matchFill.style.strokeDasharray  = circ;
  matchFill.style.strokeDashoffset = circ * (1 - matchPct / 100);
  // Sub-line based on match
  if      (matchPct >= 97) matchSubEl.textContent = 'A scary-good fit for tonight';
  else if (matchPct >= 93) matchSubEl.textContent = 'Hits the exact spot';
  else if (matchPct >= 90) matchSubEl.textContent = 'A strong match for your mood';
  else                     matchSubEl.textContent = 'A solid pick for tonight';
  document.getElementById('mood-match').style.display = 'flex';

  // Trailer
  const trailerBtn = document.getElementById('trailer-btn');
  if (tmdb.trailer) {
    trailerBtn.href = tmdb.trailer;
    trailerBtn.style.display = 'inline-flex';
  } else {
    trailerBtn.style.display = 'none';
  }

  // Streaming providers — with region label fallback
  const providersWrap  = document.getElementById('providers-wrap');
  const providersList  = document.getElementById('providers-list');
  const providersLabel = document.getElementById('providers-label');
  if (tmdb.providers && tmdb.providers.length > 0) {
    providersList.innerHTML = tmdb.providers.map(p =>
      `<img class="provider-logo" src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}">`
    ).join('');
    providersLabel.textContent = (tmdb.region && tmdb.region !== 'MK')
      ? `Where to watch \u00B7 ${tmdb.region}`
      : 'Where to watch';
    providersWrap.style.display = 'block';
  } else {
    providersWrap.style.display = 'none';
  }

  // ── Before the film · ritual suggestions ──
  const titleHash = [...movie.movie_title].reduce((a, c) => a + c.charCodeAt(0), 0);
  const RITUALS = [
    'Pour something warm',
    'Dim every light in the room',
    'Phone face down, somewhere else',
    'Find your softest blanket',
    'Close the door behind you',
    'Silence every notification',
    'Water nearby, tissues closer',
    'Wait for the sky to darken',
    'Make popcorn the slow way',
    'Open a window, just a crack',
    'No second screen tonight',
    'Curtains drawn, lamp low',
    'Pour a glass of something good',
    'Leave the dishes for tomorrow',
    'Settle in. No rush.'
  ];
  const picked = [];
  let h = titleHash || 1;
  while (picked.length < 3) {
    const r = RITUALS[h % RITUALS.length];
    if (!picked.includes(r)) picked.push(r);
    h = (h * 1103515245 + 12345) & 0x7fffffff;
  }
  const numerals = ['I', 'II', 'III'];
  document.getElementById('ritual-list').innerHTML = picked.map((r, i) =>
    `<li><span class="ritual-num">${numerals[i]}</span><span>${r}</span></li>`
  ).join('');
  document.getElementById('ritual').style.display = 'block';
  // Reset ritual animation so it replays on each new pick
  const ritualEl = document.getElementById('ritual');
  ritualEl.style.animation = 'none';
  void ritualEl.offsetWidth;
  ritualEl.style.animation = '';

  // Store for watchlist
  currentMovie = {
    title:  movie.movie_title,
    year:   movie.year,
    poster: tmdb.poster
  };

  show('result');
  initTilt();

  // Load 3D ticket
  if (window.showTicket3D) window.showTicket3D();

  setTimeout(() => { tipOverlay.style.display = 'flex'; }, 4000);
}


// ─── Add to watchlist button ──────────────────────────────────────────────────
document.getElementById('watchlist-add-btn').addEventListener('click', () => {
  if (!currentMovie) return;
  addToWatchlist(currentMovie);
  document.getElementById('watchlist-add-btn').textContent = '✓ Saved';
  document.getElementById('watchlist-add-btn').disabled = true;
});


// ─── Poster 3D tilt ───────────────────────────────────────────────────────────
function initTilt() {
  const wrap   = document.getElementById('poster-wrap');
  const poster = document.getElementById('movie-poster');
  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    poster.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.03)`;
  });
  wrap.addEventListener('mouseleave', () => {
    poster.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
  });
}




// ─── Controls ─────────────────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  moodInput.value = '';
  tipOverlay.style.display = 'none';
  currentMovie = null;
  document.getElementById('watchlist-add-btn').textContent = '+ Add to watchlist';
  document.getElementById('watchlist-add-btn').disabled = false;
  show('hero');
});
tipClose.addEventListener('click', () => { tipOverlay.style.display = 'none'; });
tipSkip.addEventListener('click',  () => { tipOverlay.style.display = 'none'; });
