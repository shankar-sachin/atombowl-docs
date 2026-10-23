// Mobile menu, "On this page" bar and site search. No dependencies.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const main = $('main');
  const h1 = $('main h1');
  if (!main || !h1) return;

  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const h2s = [...main.querySelectorAll('h2')];
  h2s.forEach((h) => { if (!h.id) h.id = slug(h.textContent); });

  // Menu button toggles the page list on small screens.
  const menuBtn = $('#menuBtn');
  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    if (open) { document.body.classList.remove('toc-open'); closeSearch(); }
  };
  menuBtn?.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  $('.side')?.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });

  // "On this page" bar.
  if (h2s.length) {
    const bar = document.createElement('div');
    bar.className = 'toc-bar';
    bar.innerHTML = '<button type="button" class="toc-btn" aria-expanded="false">On this page <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button><span class="toc-now"></span><ul class="toc-list" hidden></ul>';
    $('.bar').after(bar);
    const list = $('.toc-list', bar);
    list.innerHTML = h2s.map((h) => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join('');
    const btn = $('.toc-btn', bar);
    const setToc = (open) => {
      list.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('toc-open', open);
      if (open) setNav(false);
    };
    btn.addEventListener('click', () => setToc(list.hidden));
    list.addEventListener('click', (e) => { if (e.target.closest('a')) setToc(false); });
    const now = $('.toc-now', bar);
    const update = () => {
      let cur = h1.textContent;
      for (const h of h2s) if (h.getBoundingClientRect().top < 150) cur = h.textContent;
      now.textContent = cur;
    };
    update();
    addEventListener('scroll', update, { passive: true });
  }

  // Search over every page's headings and text, built on first open.
  const panel = document.createElement('div');
  panel.id = 'searchPanel';
  panel.hidden = true;
  panel.innerHTML = '<div class="search-box"><input type="search" id="searchInput" placeholder="Search the docs" autocomplete="off" aria-label="Search the docs"><button type="button" class="search-close" aria-label="Close search">Esc</button></div><ul class="search-results"></ul>';
  document.body.appendChild(panel);
  const input = $('#searchInput');
  const results = $('.search-results', panel);
  let index = null;

  async function buildIndex() {
    const hrefs = [...document.querySelectorAll('.side a')].map((a) => a.getAttribute('href'));
    const pages = await Promise.all(hrefs.map(async (href) => {
      for (const u of [href, href === '/' ? '/index.html' : href + '.html']) {
        try {
          const r = await fetch(u);
          if (r.ok) return { href, doc: new DOMParser().parseFromString(await r.text(), 'text/html') };
        } catch {}
      }
      return null;
    }));
    const out = [];
    for (const p of pages.filter(Boolean)) {
      const title = p.doc.querySelector('main h1')?.textContent || p.href;
      let cur = { page: title, heading: title, url: p.href, text: '' };
      out.push(cur);
      for (const el of p.doc.querySelectorAll('main h2, main p, main li, main td, main dt, main dd')) {
        if (el.tagName === 'H2') {
          cur = { page: title, heading: el.textContent, url: `${p.href}#${el.id || slug(el.textContent)}`, text: '' };
          out.push(cur);
        } else cur.text += ' ' + el.textContent;
      }
    }
    return out;
  }

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function search() {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!index || !words.length) { results.innerHTML = ''; return; }
    const scored = index.map((e) => {
      const h = e.heading.toLowerCase(), t = e.text.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (h.includes(w)) score += 3; else if (t.includes(w)) score += 1; else return null;
      }
      return { e, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8);
    results.innerHTML = scored.length
      ? scored.map(({ e }) => `<li><a href="${e.url}"><strong>${esc(e.heading)}</strong><span>${esc(e.page)}</span></a></li>`).join('')
      : '<li class="none">No results</li>';
  }

  async function openSearch() {
    document.body.classList.add('search-open');
    document.body.classList.remove('nav-open', 'toc-open');
    panel.hidden = false;
    input.focus();
    if (!index) { index = await buildIndex(); search(); }
  }
  const closeSearch = () => { panel.hidden = true; document.body.classList.remove('search-open'); };
  $('#searchBtn')?.addEventListener('click', openSearch);
  $('.search-close', panel).addEventListener('click', closeSearch);
  input.addEventListener('input', search);
  results.addEventListener('click', (e) => { if (e.target.closest('a')) closeSearch(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); setNav(false); }
    if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !/input|textarea/i.test(document.activeElement?.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });
})();
