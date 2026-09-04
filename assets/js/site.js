(function () {
  var P = [];
  var S = {};

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function media(type, src, label, cls) {
    var box = el('div', cls || '');
    if (!src) {
      box.appendChild(el('div', 'ph', '<span>' + (type === 'video' ? 'Video' : 'Photo') + '</span><b>' + (label || '') + '</b>'));
      return box;
    }
    if (type === 'video') {
      var v = document.createElement('video');
      v.src = src; v.muted = true; v.loop = true; v.autoplay = true;
      v.setAttribute('playsinline', '');
      box.appendChild(v);
    } else {
      var i = document.createElement('img');
      i.src = src; i.alt = label || ''; i.loading = 'lazy';
      box.appendChild(i);
    }
    return box;
  }

  function rgba(hex, a) {
    var h = (hex || '#14110F').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function paint(p) {
    if (!p.color) return;
    var ink = p.ink || '#14110F';
    var b = document.body.style;
    b.setProperty('--case', p.color);
    b.setProperty('--caseink', ink);
    b.setProperty('--casemute', rgba(ink, 0.55));
    b.setProperty('--casefade', rgba(ink, 0.12));
  }


  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function shot(type, src, label, cls) {
    if (!src) {
      return '<div class="' + cls + '"><div class="ph"><span>' + (type === 'video' ? 'Video' : 'Photo') +
        '</span><b>' + esc(label) + '</b></div></div>';
    }
    if (type === 'video') {
      return '<div class="' + cls + '"><video src="' + esc(src) + '" muted loop autoplay playsinline></video></div>';
    }
    return '<div class="' + cls + '"><img src="' + esc(src) + '" alt="' + esc(label) + '" loading="lazy"></div>';
  }

  function pieces(p) {
    var m = p.media || [];
    return {
      hero: shot(p.heroType || 'image', p.heroSrc, p.title, 'case-img'),
      one: m[0] ? shot(m[0].type, m[0].src, p.title, 'case-img') : shot('image', '', p.title, 'case-img'),
      two: m[1] ? shot(m[1].type, m[1].src, p.title, 'case-img') : shot('image', '', p.title, 'case-img')
    };
  }

  function facts(p) {
    return '<span class="eyebrow">Client</span><p class="big-name">' + esc(p.client) + '</p>' +
      '<span class="eyebrow">Year</span><p>' + esc(p.year) + '</p>' +
      '<span class="eyebrow">Role</span><p>' + esc(p.role) + '</p>' +
      '<span class="eyebrow">Deliverables</span><p>' + esc(p.deliverables) + '</p>';
  }

  function caseMarkup(p) {
    var b = pieces(p);
    var back = '<a class="back" href="work.html">Back to work</a>';
    var layout = p.layout || 'editorial';

    if (layout === 'split') {
      return '<div class="lay lay-split">' +
        '<div class="lay-visual">' + b.hero + '</div>' +
        '<div class="lay-panel">' +
          '<div class="lay-back">' + back + '</div>' +
          '<div class="lay-top"><div><span class="eyebrow">Project</span><b class="big-name">' + esc(p.title) + '</b></div>' +
          '<div class="right"><span class="eyebrow">Client</span><b class="big-name">' + esc(p.client) + '</b></div></div>' +
          '<div class="lay-mid">' + b.one + '</div>' +
          '<div class="lay-bottom"><p class="statement">' + esc(p.intro) + '</p>' +
          '<p class="small">' + esc(p.caption || p.deliverables) + '</p></div>' +
        '</div></div>';
    }

    if (layout === 'index') {
      return '<div class="lay lay-index">' +
        '<div class="lay-head">' + back + '<h1>' + esc(p.title) + '</h1></div>' +
        '<div class="lay-band">' +
          '<div class="lay-side"><span class="eyebrow">Index</span><p>' + esc(p.year) + '</p></div>' +
          '<div class="lay-frame">' + b.hero + '</div>' +
          '<div class="lay-meta">' + facts(p) + '</div>' +
        '</div>' +
        '<div class="lay-text">' +
          '<p class="small">' + esc(p.caption || '') + '</p>' +
          '<p class="statement">' + esc(p.intro) + '</p>' +
        '</div></div>';
    }

    if (layout === 'panel') {
      return '<div class="lay lay-panel-page">' +
        '<div class="lay-visual">' + b.hero + '</div>' +
        '<div class="lay-side-panel">' +
          '<div class="lay-back">' + back + '</div>' +
          '<div class="lay-top"><div><span class="eyebrow">Client</span><b class="big-name">' + esc(p.client) + '</b></div>' +
          '<div class="right"><span class="eyebrow">Year</span><b class="big-name small-year">' + esc(p.year) + '</b></div></div>' +
          '<div class="lay-copy"><h1>' + esc(p.title) + '</h1><p class="statement">' + esc(p.intro) + '</p>' +
          '<p class="small">' + esc(p.article || p.deliverables) + '</p></div>' +
        '</div></div>';
    }

    return '<div class="lay lay-editorial">' +
      '<div class="case-head">' + back + '<h1>' + esc(p.title) + '</h1>' +
      '<p class="statement">' + esc(p.intro) + '</p></div>' +
      '<div class="case-row">' +
        '<div class="case-note"><p>' + esc(p.caption || '') + '</p>' +
        '<p class="case-facts"><b class="big-name">' + esc(p.client) + '</b><br>' + esc(p.year) + '<br>' + esc(p.role) + '</p></div>' +
        '<div class="case-shot">' + b.hero + '</div>' +
        '<div class="case-article"><span class="eyebrow">Article</span><p>' + esc(p.article || p.intro) + '</p>' +
        '<p class="case-deliver"><span class="eyebrow">Deliverables</span><br>' + esc(p.deliverables) + '</p></div>' +
      '</div></div>';
  }

  function cover(p) { return p.cover || p.heroSrc || ''; }
  function coverType(p) { return p.cover ? (p.kind === 'video' ? 'video' : 'image') : (p.heroType || 'image'); }

  /* menu op telefoon */

  function menu() {
    var buttons = document.querySelectorAll('[data-menu]');
    if (!buttons.length) return;

    function close() {
      document.body.classList.remove('menu-open');
      Array.prototype.forEach.call(buttons, function (b) { b.setAttribute('aria-expanded', 'false'); });
    }

    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () {
        var open = document.body.classList.toggle('menu-open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-nav] a'), function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* teksten uit data/site.json */

  function texts() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (n) {
      var key = n.getAttribute('data-t');
      var val = S[key];
      if (val == null || val === '') return;
      if (n.tagName === 'A' && key !== 'email') { n.href = val; return; }
      if (key === 'email') { n.href = 'mailto:' + val; n.textContent = val; return; }
      n.textContent = val;
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-list]'), function (n) {
      var rows = S[n.getAttribute('data-list')];
      if (!rows || !rows.length) return;
      n.innerHTML = '';
      rows.forEach(function (r) { n.appendChild(el('li', '', r)); });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-portrait]'), function (box) {
      var src = S[box.getAttribute('data-portrait')];
      if (!src) return;
      box.innerHTML = '';
      box.appendChild(media('image', src, 'Portrait'));
    });
  }

  /* home */

  function reel() {
    var host = document.querySelector('[data-reel]');
    var list = document.querySelector('[data-clients]');
    if (!host || !list) return;

    var items = P.filter(function (p) { return p.reel; });
    if (!items.length) items = P.slice(0, 6);
    if (!items.length) return;

    var track = el('div', 'reel-track');
    items.concat([items[0]]).forEach(function (p) {
      track.appendChild(media(coverType(p), cover(p), p.title, 'reel-frame'));
    });
    host.appendChild(track);

    var names = items.map(function (p) { var b = el('b', '', p.title); list.appendChild(b); return b; });

    function size() {
      var h = host.clientHeight || window.innerHeight;
      if (!h) return;
      var ratio = window.innerWidth >= 1100 ? 0.72 : 0.62;
      var fh = Math.round(h * ratio);
      track.style.setProperty('--step', h + 'px');
      track.style.gap = (h - fh) + 'px';
      track.style.paddingTop = Math.round((h - fh) / 2) + 'px';
      Array.prototype.forEach.call(track.children, function (f) { f.style.height = fh + 'px'; });
    }

    size();

    var t;
    function resize() { clearTimeout(t); t = setTimeout(size, 150); }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) { new ResizeObserver(resize).observe(host); }

    var i = 0, travel = 1500, wait = 3500;

    function paint() {
      track.style.setProperty('--i', i);
      var active = i % items.length;
      names.forEach(function (n, k) { n.classList.toggle('on', k === active); });
    }

    paint();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || items.length < 2) return;

    setInterval(function () {
      if (document.hidden) return;
      i += 1;
      track.classList.add('moving');
      paint();
      setTimeout(function () { track.classList.remove('moving'); }, travel * 0.55);
      if (i === items.length) {
        setTimeout(function () {
          track.classList.add('jump');
          i = 0;
          paint();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { track.classList.remove('jump'); });
          });
        }, travel);
      }
    }, wait);
  }

  /* work */

  function grid() {
    var host = document.querySelector('[data-grid]');
    if (!host) return;

    function draw(kind) {
      host.innerHTML = '';
      P.filter(function (p) { return kind === 'all' || p.kind === kind; }).forEach(function (p, n) {
        var a = el('a', 'card');
        a.href = 'project.html?p=' + p.slug;
        a.appendChild(media(coverType(p), cover(p), p.title, 'shot'));
        a.appendChild(el('div', 'meta', '<b>' + ('0' + (n + 1)).slice(-2) + ' ' + p.title + '</b><span>' + (p.kind === 'video' ? 'Video' : 'Photo') + '</span>'));
        host.appendChild(a);
      });
    }

    var buttons = document.querySelectorAll('[data-filter]');
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(buttons, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        draw(b.getAttribute('data-filter'));
      });
    });

    draw('all');
  }

  /* projectpagina */

  function project() {
    var host = document.querySelector('[data-case]');
    if (!host || !P.length) return;

    var slug = new URLSearchParams(location.search).get('p');
    var n = P.findIndex(function (p) { return p.slug === slug; });
    if (n < 0) n = 0;
    var p = P[n], next = P[(n + 1) % P.length];

    document.title = p.title + ' \u2014 Marijn-Sohail Chaouch';
    paint(p);
    document.body.classList.add('case-' + (p.layout || 'editorial'));

    host.innerHTML = caseMarkup(p);
    Array.prototype.forEach.call(host.querySelectorAll('video'), function (v) { v.muted = true; });

    var stack = document.querySelector('[data-stack]');
    if (stack) {
      stack.innerHTML = '';
      var used = (p.layout === 'split') ? 1 : 0;
      (p.media || []).slice(used).forEach(function (m) {
        var box = media(m.type, m.src, p.title, 'item' + (m.span === 'full' ? ' full' : ''));
        box.style.aspectRatio = m.span === 'full' ? '16 / 9' : '4 / 5';
        stack.appendChild(box);
      });
    }

    var link = document.querySelector('[data-next]');
    if (link) {
      link.textContent = next.title;
      link.href = 'project.html?p=' + next.slug;
    }
  }

  function load(url) {
    return fetch(url).then(function (r) { return r.json(); });
  }

  function offline() {
    var note = document.querySelector('[data-offline]');
    if (note) note.hidden = false;
  }

  document.addEventListener('DOMContentLoaded', function () {
    menu();
    Promise.all([load('data/projects.json'), load('data/site.json')])
      .then(function (out) {
        P = (out[0] && out[0].projects) || [];
        S = out[1] || {};
        texts();
        reel();
        grid();
        project();
      })
      .catch(offline);
  });
})();
