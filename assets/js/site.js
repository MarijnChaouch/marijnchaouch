(function () {
  var P = [];
  var S = {};

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* stilstaand beeld naast elke video: naam-poster.jpg */
  function poster(src) { return String(src || '').replace(/\.mp4$/i, '-poster.jpg'); }

  /* video's pauzeren als ze uit beeld zijn en weer starten als ze terugkomen */
  var seen = window.IntersectionObserver ? new IntersectionObserver(function (list) {
    list.forEach(function (e) {
      var v = e.target;
      v.inview = e.isIntersecting;
      if (e.isIntersecting) {
        start(v);
      } else if (!v.controls) {
        v.pause();
      }
    });
  }, { rootMargin: '200px 0px' }) : null;

  function watch(v) {
    v.inview = true;
    if (seen) seen.observe(v);
  }

  /* video's laden pas als ze bijna in beeld komen (data-lz), zodat de telefoon eerst de zichtbare video's binnenhaalt
     en die meteen starten in plaats van na een paar seconden. De Panoramis-strook laadt alles meteen. */
  var ua = navigator.userAgent;
  var webkit = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
    (/Safari/.test(ua) && !/Chrome|Chromium|CriOS|Android|Edg/.test(ua));
  var lowPower = false;
  function start(v) {
    var go = v.play();
    if (go && go.catch) go.catch(function (err) { log('play geweigerd: ' + (err && err.name) + ' ' + (v.getAttribute('src') || '').split('/').pop()); if (err && err.name === 'NotAllowedError') asImage(v); });
  }
  /* iPhone in energiebesparing speelt geen video's vanzelf af, maar wel een mp4 als <img> (Safari ondersteunt dat).
     Dan ruilen we de video voor zo'n beeld; op een projectpagina brengt een tik de echte video (met geluid) terug. */
  function asImage(v) {
    if (!webkit || !v.parentNode || v.controls) return;
    lowPower = true;
    var src = v.currentSrc || v.getAttribute('src') || v.getAttribute('data-lz');
    if (!src) return;
    var img = document.createElement('img');
    img.className = v.className;
    if (v.getAttribute('style')) img.setAttribute('style', v.getAttribute('style'));
    img.alt = '';
    img.setAttribute('data-video-img', '');
    img._video = v;
    img.src = src;
    try { v.pause(); } catch (e) {}
    v.parentNode.replaceChild(img, v);
  }
  document.addEventListener('click', function (e) {
    var img = e.target.closest ? e.target.closest('img[data-video-img]') : null;
    if (!img || !img._video || img.closest('a')) return;
    var v = img._video;
    if (!v.getAttribute('src') && v.getAttribute('data-lz')) { v.src = v.getAttribute('data-lz'); v.removeAttribute('data-lz'); }
    img.parentNode.replaceChild(v, img);
    var go = v.play(); if (go && go.catch) go.catch(function () {});
  });
  /* testweergave voor de telefoon: ?debug toont per video wat de browser doet (alleen voor ons, verandert niets aan de site) */
  var dbg = /[?&]debug/.test(location.search) ? [] : null;
  function log(msg) { if (dbg) { dbg.push(((performance.now() / 1000).toFixed(1)) + 's ' + msg); draw(); } }
  function draw() {
    if (!dbg) return;
    var box = document.getElementById('dbg');
    if (!box) { box = document.createElement('pre'); box.id = 'dbg'; box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:55vh;overflow:auto;margin:0;padding:8px;background:rgba(0,0,0,.85);color:#7CFC9A;font:10px/1.35 ui-monospace,Menlo,monospace;z-index:99999;white-space:pre-wrap'; document.body.appendChild(box); }
    var vids = Array.prototype.slice.call(document.querySelectorAll('video, img[data-video-img]'));
    var rows = vids.map(function (v, k) {
      var r = v.getBoundingClientRect(), vis = r.bottom > 0 && r.top < innerHeight && r.width > 0;
      var name = (v.getAttribute('src') || v.getAttribute('data-lz') || '').split('/').pop();
      if (v.tagName === 'IMG') return (vis ? '*' : ' ') + k + ' IMG(fallback) ' + name + (v.complete ? ' ok' : ' laden');
      return (vis ? '*' : ' ') + k + ' ' + (v.getAttribute('src') ? (v.paused ? 'STIL' : 'SPEELT') : 'wacht') + ' rs' + v.readyState + ' ns' + v.networkState + ' t' + v.currentTime.toFixed(1) + ' ' + name;
    });
    box.textContent = navigator.userAgent.replace(/^Mozilla\/5.0 /, '') + '\nlowPower=' + lowPower + ' webkit=' + webkit + '\n' + rows.join('\n') + '\n--\n' + dbg.slice(-12).join('\n');
  }
  if (dbg) setInterval(draw, 1000);

  function loadVideo(v) {
    var src = v.getAttribute('data-lz');
    if (!src) return;
    v.removeAttribute('data-lz');
    v.setAttribute('preload', 'auto');
    if (lowPower) { v.setAttribute('src', src); asImage(v); return; }
    v.src = src;
    watch(v);
    start(v);
  }
  var near = window.IntersectionObserver ? new IntersectionObserver(function (list) {
    list.forEach(function (e) { if (e.isIntersecting) { near.unobserve(e.target); loadVideo(e.target); } });
  }, { rootMargin: '120% 0px' }) : null;
  function lazyVideos(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('video[data-lz]'), function (v) {
      if (v._lz) return;
      v._lz = true;
      if (!near || (v.closest && v.closest('.hvp-strip'))) loadVideo(v); else near.observe(v);
    });
  }
  /* ook video's die later worden toegevoegd (andere kolommen, filters) */
  if (window.MutationObserver) {
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) if (list[i].addedNodes.length) { lazyVideos(); break; }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* blokkeert de telefoon het vanzelf afspelen (bijv. energiebesparing), dan starten we bij elke aanraking
     de video's die in beeld staan: een aanraking mag dat wel */
  function kick() {
    Array.prototype.forEach.call(document.querySelectorAll('video[autoplay]'), function (v) {
      var cell = v.closest ? v.closest('.reel-cell') : null;
      var active = cell ? cell.classList.contains('on') : v.inview;
      if (active && v.paused && !v.controls && v.getAttribute('src')) start(v);
    });
  }
  document.addEventListener('touchend', kick, { passive: true });
  document.addEventListener('click', kick);

  function media(type, src, label, cls, opts) {
    opts = opts || {};
    var box = el('div', cls || '');
    if (!src) {
      box.appendChild(el('div', 'ph', '<span>' + (type === 'video' ? 'Video' : 'Photo') + '</span><b>' + (label || '') + '</b>'));
      return box;
    }
    if (type === 'video') {
      var v = document.createElement('video');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.poster = opts.poster || poster(src);
      if (opts.play === 'click') {
        v.src = src;
        v.preload = 'metadata';
        box.classList.add('with-play');
        box.appendChild(v);
        box.appendChild(el('button', 'playbtn', '<span class="sr">Play</span>'));
      } else {
        /* iPhone speelt alleen vanzelf af met muted, autoplay en playsinline; de bron staat er meteen in */
        v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true;
        v.setAttribute('muted', '');
        v.setAttribute('loop', '');
        v.setAttribute('autoplay', '');
        if (opts.lazy) { v.setAttribute('preload', 'none'); v.setAttribute('data-src', src); }
        else if (opts.manual) { v.setAttribute('preload', 'auto'); v.src = src; }
        else { v.setAttribute('preload', 'none'); v.setAttribute('data-lz', src); }
        box.appendChild(v);
      }
    } else {
      var i = document.createElement('img');
      i.src = src; i.alt = label || ''; i.loading = 'lazy';
      box.appendChild(i);
    }
    return box;
  }

  /* film: geluid aan/uit */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.film-sound') : null;
    if (!b) return;
    var v = b.parentElement.querySelector('video');
    if (!v) return;
    var on = v.muted;
    /* maar één video tegelijk met geluid */
    Array.prototype.forEach.call(document.querySelectorAll('.film-sound'), function (o) {
      var ov = o.parentElement.querySelector('video');
      if (ov && ov !== v) { ov.muted = true; o.textContent = 'Sound on'; o.setAttribute('aria-pressed', 'false'); }
    });
    v.muted = !on;
    if (on) { v.currentTime = 0; var go = v.play(); if (go && go.catch) go.catch(function () {}); }
    b.textContent = on ? 'Sound off' : 'Sound on';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  /* elke video op een projectpagina krijgt een geluidsknop, maar alleen zichtbaar als de video geluid heeft */
  function hasAudio(v) {
    return !!(v.mozHasAudio || (v.webkitAudioDecodedByteCount > 0) || (v.audioTracks && v.audioTracks.length));
  }
  function soundButtons(root) {
    Array.prototype.forEach.call(root.querySelectorAll('video'), function (v) {
      var box = v.parentElement;
      if (!box || box.querySelector('.film-sound') || v.controls) return;
      box.classList.add('has-sound');
      var b = el('button', 'film-sound', 'Sound on');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.hidden = true;
      box.appendChild(b);
      var tries = 0;
      function check() {
        if (hasAudio(v)) { b.hidden = false; return; }
        if (++tries < 12) setTimeout(check, 500);
      }
      /* video's laden pas als ze bijna in beeld komen: daarom opnieuw kijken zodra hij speelt */
      v.addEventListener('playing', function () { tries = 0; check(); });
      check();
    });
  }

  /* speelknop: geluid aan, bediening zichtbaar */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.playbtn') : null;
    if (!btn) return;
    var box = btn.parentElement;
    var v = box.querySelector('video');
    if (!v) return;
    v.muted = false;
    v.controls = true;
    v.play();
    box.classList.add('playing');
  });

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

  function shot(type, src, label, cls, opts) {
    opts = opts || {};
    if (!src) {
      return '<div class="' + cls + '"><div class="ph"><span>' + (type === 'video' ? 'Video' : 'Photo') +
        '</span><b>' + esc(label) + '</b></div></div>';
    }
    if (type === 'video') {
      var still = ' poster="' + esc(opts.poster || poster(src)) + '"';
      if (opts.play === 'click') {
        return '<div class="' + cls + ' with-play"><video src="' + esc(src) + '"' + still +
          ' preload="metadata" playsinline></video><button class="playbtn"><span class="sr">Play</span></button></div>';
      }
      return '<div class="' + cls + '"><video data-lz="' + esc(src) + '"' + still + ' muted loop autoplay playsinline webkit-playsinline preload="none"></video></div>';
    }
    return '<div class="' + cls + '"><img src="' + esc(src) + '" alt="' + esc(label) + '" loading="lazy"></div>';
  }

  function pieces(p) {
    var m = p.media || [];
    return {
      hero: shot(p.heroType || 'image', p.heroSrc, p.title, 'case-img', { play: p.heroPlay, poster: p.heroPoster }),
      one: m[0] ? shot(m[0].type, m[0].src, p.title, 'case-img', m[0]) : shot('image', '', p.title, 'case-img'),
      two: m[1] ? shot(m[1].type, m[1].src, p.title, 'case-img', m[1]) : shot('image', '', p.title, 'case-img')
    };
  }

  function facts(p) {
    return '<span class="eyebrow">Client</span><p class="big-name">' + esc(p.client) + '</p>' +
      '<span class="eyebrow">Year</span><p>' + esc(p.year) + '</p>' +
      '<span class="eyebrow">Role</span><p>' + esc(p.role) + '</p>' +
      '<span class="eyebrow">Deliverables</span><p>' + esc(p.deliverables) + '</p>';
  }

  /* titel in twee delen, voor verspringende koppen */
  function halves(t) {
    var words = String(t || '').split(' ');
    var cut = Math.max(1, Math.floor(words.length / 2));
    return '<span>' + esc(words.slice(0, cut).join(' ')) + '</span>' +
      (words.length > 1 ? ' <span>' + esc(words.slice(cut).join(' ')) + '</span>' : '');
  }

  /* gegevens als rijen: label links, waarde rechts */
  function factRows(p) {
    return [['Client', p.client], ['Agency', p.agency], ['Year', p.year], ['Role', p.role], ['Deliverables', p.deliverables]]
      .filter(function (r) { return r[1]; })
      .map(function (r) { return '<div class="fact-row"><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; })
      .join('');
  }

  /* gegevens als kolommen: klein label met de waarde eronder */
  function factCols(p) {
    return [['Client', p.client], ['Agency', p.agency], ['Year', p.year], ['Role', p.role], ['Deliverables', p.deliverables]]
      .filter(function (r) { return r[1]; })
      .map(function (r) { return '<div><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; })
      .join('');
  }

  /* titels met data-fit precies zo groot maken dat ze de hele breedte vullen */
  function fit(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-fit]'), function (h) {
      var span = h.firstElementChild;
      if (!span) return;
      h.style.fontSize = '';
      var size = parseFloat(getComputedStyle(h).fontSize);
      var w = span.getBoundingClientRect().width;
      if (w > 0) h.style.fontSize = (size * h.clientWidth / w * 0.995) + 'px';
    });
  }
  var fitTimer;
  window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fit, 120); });

  function caseMarkup(p, n) {
    var b = pieces(p);
    var back = '<a class="back" href="work.html">Back to work</a>';
    var layout = p.layout || 'editorial';
    var no = ('0' + ((n || 0) + 1)).slice(-2);
    var kind = p.kind === 'video' ? 'Video' : 'Photo';

    /* omslag: beeld van rand tot rand, daaronder de titel groot en de gegevens in kolommen */
    if (layout === 'cover') {
      return '<div class="lay lay-cover">' +
        '<div class="cover-visual">' + b.hero + '</div>' +
        '<div class="cover-text">' +
          '<div class="lay-corners">' + back + '<span>' + no + ' \u00b7 ' + kind + '</span></div>' +
          '<h1>' + esc(p.title) + '</h1>' +
          '<div class="cover-facts">' + factRows(p) + '</div>' +
          (p.intro ? '<p class="statement">' + esc(p.intro) + '</p>' : '') +
        '</div></div>';
    }

    /* kolommen: titel over twee verspringende regels, label met tekst, beeld over de volle breedte */
    if (layout === 'columns') {
      return '<div class="lay lay-columns">' +
        '<div class="lay-corners">' + back + '<span>' + no + ' \u00b7 ' + kind + '</span></div>' +
        '<h1 class="stagger">' + halves(p.title) + '</h1>' +
        '<div class="col-row"><span>Project</span><p>' + esc(p.intro || p.caption || '') + '</p></div>' +
        '<div class="col-row"><span>Client</span><p>' + esc(p.client) + (p.year ? ', ' + esc(p.year) : '') + '</p></div>' +
        (p.deliverables ? '<div class="col-row"><span>Delivered</span><p>' + esc(p.deliverables) + '</p></div>' : '') +
        '<div class="col-visual">' + b.hero + '</div>' +
        '</div>';
    }

    /* standaard: titel, intro en gegevens, daaronder de beelden naast elkaar zolang ze passen (nooit schermvullend) */
    if (layout === 'standard') {
      var factsS = [['Client', p.client], ['Agency', p.agency], ['Year', p.year], ['Role', p.role], ['Deliverables', p.deliverables]]
        .filter(function (r) { return r[1]; })
        .map(function (r) { return '<div class="row"><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('');
      var items = [{ type: p.heroType || 'image', src: p.heroSrc, ratio: p.heroRatio || 0.8, poster: p.heroPoster }]
        .concat((p.media || []).filter(function (m) { return m.src; }));
      var wide = window.matchMedia('(min-width: 720px)').matches;
      var avail = Math.min(window.innerWidth, 1800) - 2 * (window.innerWidth >= 1100 ? 28 : 20);
      var h = window.innerHeight * 0.76, used = 0, total = 0;
      if (wide) {
        items.some(function (m, k) {
          var w = (m.ratio || 0.8) * h + (k ? 10 : 0);
          if (k && (total + w > avail || k > 2)) return true;
          total += w; used = k + 1; return false;
        });
      } else used = 1;
      /* heroCount: zoveel beelden naast elkaar; de rij wordt dan lager zodat ze passen */
      var heroH = '';
      if (wide && p.heroCount) {
        used = Math.min(p.heroCount, items.length);
        var sum = items.slice(0, used).reduce(function (a, m) { return a + (m.ratio || 0.8); }, 0);
        heroH = ' style="height:' + Math.round(Math.min(h, (avail - 10 * (used - 1)) / sum)) + 'px"';
      }
      p._heroUsed = used - 1;
      var hero = items.slice(0, used).map(function (m) {
        return '<div class="pj-item" style="aspect-ratio:' + (m.ratio || 0.8) + ';--r:' + (m.ratio || 0.8) + '">' + shot(m.type, m.src, p.title, 'pj-shot', m) + '</div>';
      }).join('');
      return '<div class="lay pj">' +
        '<div class="pj-head"><h1>' + esc(p.title) + '</h1>' +
          '<div class="pj-info">' + (p.intro && p.intro !== p.title ? '<p class="statement-x">' + esc(p.intro) + '</p>' : '<span></span>') +
          '<div class="rows">' + factsS + '</div></div></div>' +
        '<div class="pj-hero"' + heroH + '>' + hero + '</div>' +
        '</div>';
    }

    var corners = '<div class="lay-corners">' + back + '<span>' + no + ' \u00b7 ' + kind + '</span></div>';

    /* midden: de film in het midden, links titel en klant, rechts de tekst als citaat, kleine regels onderaan */
    if (layout === 'center') {
      var rowsC2 = [['Client', p.client], ['Agency', p.agency], ['Year', p.year], ['Role', p.role], ['Deliverables', p.deliverables]]
        .filter(function (r) { return r[1]; })
        .map(function (r) { return '<div><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('');
      return '<div class="lay lay-center"' + (p.ratio ? ' style="--ratio:' + esc(p.ratio) + '"' : '') + '>' +
        '<div class="center-left"><h1>' + esc(p.title) + '</h1><div class="center-facts">' + rowsC2 + '</div></div>' +
        '<div class="film-frame center-frame">' + shot(p.heroType || 'video', p.heroSrc, p.title, 'film-shot', { poster: p.heroPoster }) +
                  '</div>' +
        '<div class="center-right">' + (p.intro ? '<p class="center-quote">' + esc(p.intro) + '</p>' : '') + '</div>' +
        '</div>';
    }

    /* film: de hoofdfilm groot in eigen vorm, titel en gegevens ernaast, geluid via een knop */
    if (layout === 'film') {
      var rows = [['Client', p.client], ['Agency', p.agency], ['Year', p.year], ['Role', p.role], ['Deliverables', p.deliverables]]
        .filter(function (r) { return r[1]; })
        .map(function (r) { return '<div><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('');
      return '<div class="lay lay-film"' + (p.ratio ? ' style="--ratio:' + esc(p.ratio) + '"' : '') + '>' +
        '<div class="film-text">' +
          '<h1>' + esc(p.title) + '</h1>' +
          (p.intro && p.intro !== p.title ? '<p class="film-intro">' + esc(p.intro) + '</p>' : '') +
          '<div class="film-facts">' + rows + '</div>' +
        '</div>' +
        '<div class="film-frame">' + shot(p.heroType || 'video', p.heroSrc, p.title, 'film-shot', { poster: p.heroPoster }) +
                  '</div>' +
        '</div>';
    }

    /* galerij: twee grote beelden naast elkaar van rand tot rand, kleine witte tekst erover,
       daaronder een grote alinea in hoofdletters over de hele breedte */
    if (layout === 'gallery') {
      var g = p.media || [];
      var second = g[0] ? shot(g[0].type, g[0].src, p.title, 'gallery-shot', g[0]) : '';
      return '<div class="lay lay-gallery"><div class="gallery-screen">' +
        /* ratio (bijv. "9 / 16"): beelden houden die vorm in plaats van bijgesneden te worden */
        '<div class="gallery-shots' + (p.ratio ? ' has-ratio' : '') + '"' + (p.ratio ? ' style="--ratio:' + esc(p.ratio) + '"' : '') + '>' +
          '<div class="gallery-first">' + shot(p.heroType || 'image', p.heroSrc, p.title, 'gallery-shot', { poster: p.heroPoster }) +
            '<div class="gallery-over">' + esc(p.title) + (p.client && p.client !== p.title ? '<br>' + esc(p.client) : '') + '<br>' + esc(p.year) + '</div></div>' +
          second +
        '</div>' +
        '<div class="gallery-text">' +
          (p.intro && p.intro !== p.title ? '<p class="gallery-big">' + esc(p.intro) + '</p>' : '<p class="gallery-big">' + esc(p.title) + '</p>') +
        '</div></div>' +
        '<div class="gallery-facts">' + back + factCols(p) + '</div>' +
        '</div>';
    }

    /* poster: drie foto's naast elkaar, kleine gegevens in hoofdletters, enorme titel onderaan, tekst langs de rand */
    if (layout === 'poster') {
      /* posterFrames: 2 geeft twee staande 4:5-frames; posterUnder: een beeld onder de titel */
      var m = (p.media || []).filter(function (x) { return x.src !== p.posterUnder; });
      var frames = p.posterFrames === 2 ? 2 : 3;
      var shots = [shot(p.heroType || 'image', p.heroSrc, p.title, 'poster-shot', { poster: p.heroPoster })];
      m.slice(0, frames - 1).forEach(function (x) { shots.push(shot(x.type, x.src, p.title, 'poster-shot', x)); });
      var under = p.posterUnder ? shot(/\.mp4$/i.test(p.posterUnder) ? 'video' : 'image', p.posterUnder, p.title, 'poster-under') : '';
      var info = [['Client', p.client], ['Agency', p.agency], ['Year', p.year], ['Role', p.role], ['Deliverables', p.deliverables]]
        .filter(function (r) { return r[1]; });
      /* twee frames: frames links, gegevens en intro in de rechterkolom, titel er direct onder */
      if (frames === 2) {
        return '<div class="lay lay-poster poster-duo">' +
          /* hoofdvideo groot in eigen vorm met geluidsknop, tweede beeld kleiner */
          '<div class="duo-top">' +
            '<div class="duo-main film-frame">' + shots[0].replace('poster-shot', 'poster-shot duo-hero') +
                          '</div>' +
            (shots[1] ? '<div class="duo-second">' + shots[1] + '</div>' : '') +
            '<div class="duo-side">' +

              (p.intro && p.intro !== p.title ? '<p class="duo-intro">' + esc(p.intro) + '</p>' : '') +
              '<div class="duo-facts">' + info.map(function (r) { return '<div><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('') + '</div>' +
            '</div>' +
          '</div>' +
          '<h1 data-fit><span>' + esc(p.title) + '</span></h1>' +
          (under ? '<div class="duo-under">' + under + '<p>' + esc(p.caption || p.deliverables || '') + '</p></div>' : '') +
          '</div>';
      }
      return '<div class="lay lay-poster">' +
        '<div class="poster-shots">' + shots.join('') + '</div>' +
        '<div class="poster-info">' +
          '<div class="poster-labels">' + info.map(function (r) { return r[0] + ':'; }).join('<br>') + '</div>' +
          '<div class="poster-values">' + info.map(function (r) { return esc(r[1]); }).join('<br>') + '</div>' +
          '<div class="poster-back">' + back + '</div>' +
        '</div>' +
        (p.intro && p.intro !== p.title ? '<p class="poster-intro">' + esc(p.intro) + '</p>' : '') +
        '<h1 data-fit><span>' + esc(p.title) + '</span></h1>' + under +
        '<div class="poster-foot"><span>' + esc(p.client) + '</span><span>' + esc(p.deliverables || kind) + '</span><span>' + no + '</span></div>' +
        '<div class="poster-edge">Marijn Chaouch \u00b7 Photography and Film</div>' +
        '</div>';
    }

    /* kop: de titel vult de hele breedte, gegevens in kolommen, beeld, dan label met intro */
    if (layout === 'headline') {
      return '<div class="lay lay-headline">' + corners +
        '<h1 data-fit><span>' + esc(p.title) + '</span></h1>' +
        '<div class="head-facts">' + factCols(p) + '</div>' +
        '<div class="head-visual">' + b.hero + '</div>' +
        (p.intro ? '<div class="col-row head-about"><span>About</span><p>' + esc(p.intro) + '</p></div>' : '') +
        '</div>';
    }

    /* bijschrift: groot beeld, daaronder een rustig bijschrift zoals in een fotoboek */
    if (layout === 'caption') {
      return '<div class="lay lay-caption">' + corners +
        '<div class="cap-visual">' + b.hero + '</div>' +
        '<div class="cap-text"><span class="cap-fig">Fig. ' + no + '</span>' +
          '<div class="cap-main"><h1>' + esc(p.title) + '</h1>' + (p.intro ? '<p>' + esc(p.intro) + '</p>' : '') + '</div>' +
          '<div class="cap-facts">' + factRows(p) + '</div>' +
        '</div></div>';
    }

    /* inhoud: als een inhoudsopgave, gegevens als lange regels, beelden daarna als genummerd contactvel */
    if (layout === 'contents') {
      var rowsC = [['Client', p.client], ['Agency', p.agency], ['Year', p.year], ['Role', p.role], ['Deliverables', p.deliverables]]
        .filter(function (r) { return r[1]; })
        .map(function (r) { return '<div class="cont-row"><span>' + r[0] + '</span><i></i><b>' + esc(r[1]) + '</b></div>'; })
        .join('');
      return '<div class="lay lay-contents">' + corners +
        '<h1>' + esc(p.title) + '</h1>' +
        (p.intro ? '<p class="cont-intro">' + esc(p.intro) + '</p>' : '') +
        '<div class="cont-rows">' + rowsC + '</div>' +
        '<div class="cont-visual">' + b.hero + '</div>' +
        '</div>';
    }

    /* nummer: het projectnummer is de kop, intro in grote hoofdletters, gegevens als rijen naast het beeld */
    if (layout === 'number') {
      return '<div class="lay lay-number">' +
        '<div class="lay-corners">' + back + '<span>' + kind + '</span></div>' +
        '<div class="num-head"><b class="num-big">' + no + '</b><h1>' + esc(p.title) + '</h1></div>' +
        (p.intro ? '<p class="num-caps">' + esc(p.intro) + '</p>' : '') +
        '<div class="num-body"><div class="num-facts">' + factRows(p) + '</div>' +
        '<div class="num-frame">' + b.hero + '</div></div>' +
        '</div>';
    }

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

  /* webadres van een project; spaties en hoofdletters in de slug mogen geen verkeerd project opleveren */
  function key(slug) { return String(slug == null ? '' : slug).trim().toLowerCase(); }
  function link(p) { return 'project.html?p=' + encodeURIComponent(key(p.slug)); }

  function cover(p) { return p.cover || p.heroSrc || ''; }
  function coverType(p) { return p.cover ? (p.kind === 'video' ? 'video' : 'image') : (p.heroType || 'image'); }

  /* menu op telefoon */

  function menu() {
    var buttons = document.querySelectorAll('[data-menu]');
    if (!buttons.length) return;

    /* telefoonmenu: klein merk bovenaan, e-mail en grote naam onderaan (desktop verbergt deze delen) */
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (nav) {
      nav.insertBefore(el('div', 'nav-head', 'Marijn Chaouch'), nav.firstChild);
      nav.appendChild(el('div', 'nav-foot',
        '<a data-t="email" href="mailto:shotbymarijn@gmail.com">shotbymarijn@gmail.com</a>' +
        '<b class="nav-logo">Marijn<br>Chaouch</b>'));
    });

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
      if (key === 'email') { n.href = 'mailto:' + val; if (!n.hasAttribute('data-keep')) n.textContent = val; return; }
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

  /* home: varianten frame, index, full, sheet, of mix (telefoon full, desktop sheet);
     kies met data-home op <main> of ?home= in het adres */
  function reel() {
    var host = document.querySelector('[data-reel]');
    var list = document.querySelector('[data-clients]');
    if (!host || !list) return;

    var main = document.querySelector('[data-home]');
    var mode = new URLSearchParams(location.search).get('home') || (main && main.getAttribute('data-home')) || 'frame';
    var both = false;
    if (mode === 'mix') {
      if (window.matchMedia('(max-width: 1099px)').matches) mode = 'full';
      else mode = 'sheet';
    }
    if (['frame', 'index', 'full', 'sheet'].indexOf(mode) < 0) mode = 'frame';
    document.body.classList.add('home-' + mode);

    var items = P.filter(function (p) { return p.reel; });
    if (!items.length) items = P.slice(0, 6);
    if (!items.length) return;
    var no = function (k) { return ('0' + (k + 1)).slice(-2); };

    /* contactvel: alle projecten klein in een raster */
    function buildSheet() {
      var sheet = el('div', 'reel-sheet');
      /* dambord: video en foto wisselen elkaar af, in de rij en in de kolom */
      var cols = window.matchMedia('(min-width: 720px)').matches ? 4 : 2;
      var vids = P.filter(function (p) { return coverType(p) === 'video'; });
      var pics = P.filter(function (p) { return coverType(p) !== 'video'; });
      var order = P.map(function (p, k) {
        var want = (Math.floor(k / cols) + k % cols) % 2 === 0 ? vids : pics;
        return (want.length ? want : (want === vids ? pics : vids)).shift();
      });
      order.forEach(function (p, k) {
        var a = el('a', 'sheet-item');
        a.href = link(p);
        a.appendChild(media(coverType(p), cover(p), p.title, 'sheet-shot'));
        a.appendChild(el('div', 'sheet-cap', '<span>' + no(k) + '</span><b>' + esc(p.title) + '</b>'));
        sheet.appendChild(a);
      });
      return sheet;
    }
    if (mode === 'sheet') { host.appendChild(buildSheet()); return; }

    /* desktop: onder de index komt het contactvel */
    if (both) {
      document.body.classList.add('home-also-sheet');
      var row = host.parentNode;
      row.parentNode.insertBefore(buildSheet(), row.nextSibling);
    }

    var full = mode === 'full';

    /* kader: de projecten liggen op elkaar en wisselen */
    var stage = el('div', 'reel-stage');
    var cells = items.map(function (p) {
      var cell = el('a', 'reel-cell');
      cell.href = link(p);
      var src = full && p.coverPhone ? p.coverPhone : cover(p);
      var type = full && p.coverPhone ? 'video' : coverType(p);
      cell.appendChild(media(type, src, p.title, 'reel-frame', { manual: true, lazy: full }));
      /* alleen het zichtbare beeld speelt; de andere stoppen zodra ze vanzelf willen starten */
      var v = cell.querySelector('video');
      if (v) v.addEventListener('play', function () { if (!cell.classList.contains('on')) v.pause(); });
      stage.appendChild(cell);
      return cell;
    });
    var caption = el('div', 'reel-caption');
    host.appendChild(stage);
    host.appendChild(caption);

    /* index: de projecten als grote titels onder elkaar */
    var rows = [];
    if (mode === 'index') {
      var index = el('div', 'reel-index');
      rows = items.map(function (p, k) {
        var r = el('a', 'reel-row', '<span>' + no(k) + '</span><b>' + esc(p.title) + '</b><span>' + esc(p.year) + '</span>');
        r.href = link(p);
        r.addEventListener('mouseenter', function () { i = k; show(); hold = true; });
        r.addEventListener('mouseleave', function () { hold = false; });
        index.appendChild(r);
        return r;
      });
      host.appendChild(index);
    }

    var names = items.map(function (p) {
      var b = el('b', '', esc(p.title));
      var a = el('a', 'client-link');
      a.href = link(p);
      a.appendChild(b);
      list.appendChild(a);
      return b;
    });

    var i = 0, hold = false;
    var count = no(items.length - 1);

    /* volledig scherm: alleen het huidige en het volgende beeld laden */
    function ready(k) {
      var v = cells[k] && cells[k].querySelector('video[data-src]');
      if (v && !v.getAttribute('src')) { v.src = v.getAttribute('data-src'); v.load(); }
    }

    var last = -1;
    function show() {
      if (full) { ready(i); ready((i + 1) % items.length); }
      cells.forEach(function (cell, k) {
        cell.classList.toggle('on', k === i);
        /* het vorige beeld schuift omhoog weg terwijl het nieuwe van onder binnenkomt */
        cell.classList.toggle('prev', full && k === last && k !== i);
        var v = cell.querySelector('video');
        if (!v) return;
        if (k === i) {
          v.currentTime = 0;
          var go = v.play();
          if (go && go.catch) go.catch(function () {});
        } else {
          v.pause();
        }
      });
      names.forEach(function (n, k) { n.classList.toggle('on', k === i); });
      rows.forEach(function (r, k) { r.classList.toggle('on', k === i); });
      caption.innerHTML = '<a href="' + link(items[i]) + '">' + esc(items[i].title) + '</a>' +
        '<span>' + no(i) + ' / ' + count + '</span>';
    }

    function next() { last = i; i = (i + 1) % items.length; show(); }

    show();
    if (items.length < 2) return;

    /* kader op telefoon en tablet: zelf swipen, het kader volgt waar je naartoe swipet */
    if (mode === 'frame' && window.matchMedia('(max-width: 1099px)').matches) {
      host.classList.add('swipe');
      var t;
      stage.addEventListener('scroll', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          var w = cells[0].getBoundingClientRect().width + 10;
          var k = Math.max(0, Math.min(items.length - 1, Math.round(stage.scrollLeft / w)));
          if (k !== i) { i = k; show(); }
        }, 80);
      }, { passive: true });
      return;
    }

    /* volledig scherm: tik op het beeld voor het volgende project */
    if (mode === 'full') {
      stage.addEventListener('click', function (e) { e.preventDefault(); next(); });
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setInterval(function () {
      if (document.hidden || hold) return;
      next();
    }, mode === 'full' ? 3500 : 4500);

    /* terug naar het tabblad: het actieve beeld weer laten spelen */
    document.addEventListener('visibilitychange', function () { if (!document.hidden) show(); });
  }

  /* ---------- homepage-stijlen om uit te kiezen (?kies op de homepage toont de keuzebalk) ---------- */

  var HOME_STYLES = [
    ['studioform', 'Studioform'], ['panoramis', 'Panoramis'], ['list', 'Lijst'], ['portrait', 'Portret'], ['magazine', 'Magazine'], ['gallery', 'Galerij'], ['reels', 'Reels'], ['stack', 'Stapel']
  ];

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; }
  }

  function homeStyles() {
    var main = document.querySelector('main.home');
    if (!main) return false;
    var q = new URLSearchParams(location.search);
    /* vast (22-10-2026): telefoon Lijst, desktop Panoramis; keuzebalk weg. ?stijl= werkt nog voor testen, zonder te bewaren */
    var phone = window.matchMedia('(max-width: 719px)').matches;
    var def = (phone && main.getAttribute('data-style-mobile')) || main.getAttribute('data-style') || '';
    var pick = q.get('stijl') || def;
    if (!pick || !homeBuilders[pick]) return false;

    var by = function (slug) { return P.filter(function (p) { return p.slug === slug; })[0] || P[0]; };
    var row = main.querySelector('.home-row');
    var box = el('div', 'hv hv-' + pick);
    box.innerHTML = homeBuilders[pick](by);
    row.parentNode.insertBefore(box, row);
    document.body.classList.add('hv-on', 'hv-is-' + pick);
    fit(box);
    soundButtons(box);
    if (pick === 'marthens') swap(box);
    swipeCount(box);
    if (pick === 'panoramis') {
      strip(box.querySelector('[data-strip]'));
      /* de naam staat op één lijn met de tekst links en het menu: in de kopbalk, in het midden */
      var bar = document.querySelector('.bar'), top = box.querySelector('.hvp-top');
      if (bar && top) { var h = top.querySelector('h1'); h.classList.add('hvp-name'); bar.appendChild(h); top.remove(); }
    }
    return true;
  }

  /* uitgelichte projecten: de gekozen slugs, aangevuld zodat video en foto afwisselen */
  function pickFeatured(by, slugs, n) {
    var out = slugs.map(function (sl) { return P.filter(function (p) { return p.slug === sl; })[0]; }).filter(Boolean);
    P.forEach(function (p) { if (out.length < n && out.indexOf(p) < 0) out.push(p); });
    return out.slice(0, n);
  }

  /* kaart in dezelfde opbouw als op Work: nummer en soort, beeld, titel, klant en jaar */
  function feature(p) {
    var no = ('0' + (P.indexOf(p) + 1)).slice(-2);
    return '<a class="hv-card" href="' + link(p) + '">' +
      '<span class="hv-meta"><span>' + no + '</span><span>' + (p.kind === 'video' ? 'Video' : 'Photo') + '</span></span>' +
      '<span class="hv-frame">' + shot(coverType(p), cover(p), p.title, 'hv-shot') + '</span>' +
      '<span class="hv-title">' + esc(p.title) + '</span>' +
      '<span class="hv-sub2">' + esc(p.client) + ' \u00b7 ' + esc(p.year) + '</span></a>';
  }

  function pic(p, cls, label) {
    return '<a class="hv-pic ' + (cls || '') + '" href="' + link(p) + '">' + shot(coverType(p), cover(p), p.title, 'hv-shot') +
      (label ? '<span class="hv-label">' + esc(label) + '</span>' : '') + '</a>';
  }

  /* gedeeld slot voor de homepage-varianten: zin en grote tik-rijen */
  function homeTail() {
    return '<p class="hv-long">' + esc(S.aboutIntro || '') + '</p>' +
      '<nav class="hv-more hv-rows"><a href="work.html"><span>All work</span><i>' + P.length + ' projects \u2192</i></a>' +
      '<a href="about.html"><span>About</span><i>\u2192</i></a><a href="contact.html"><span>Contact</span><i>\u2192</i></a></nav>';
  }
  function bigSrc(p) { return p.coverPhone || cover(p); }
  function bigType(p) { return p.coverPhone ? 'video' : coverType(p); }
  function no2(p) { return ('0' + (P.indexOf(p) + 1)).slice(-2); }
  function ordered() {
    /* video en foto om en om, nieuwste eerst */
    var v = P.filter(function (p) { return p.kind === 'video'; }), f = P.filter(function (p) { return p.kind !== 'video'; }), out = [];
    while (v.length || f.length) { if (v.length) out.push(v.shift()); if (f.length) out.push(f.shift()); }
    return out;
  }

  function rowsList(list) {
    return '<div class="hvx">' + list.map(function (p) {
      return '<a class="hvx-row" href="' + link(p) + '"><span class="hvx-t"><b>' + esc(p.title) + '</b><span>' + esc(p.client) + '<br>' + esc(p.year) + '</span></span>' +
        shot(coverType(p), cover(p), p.title, 'hvx-thumb') + '</a>';
    }).join('') + '</div>';
  }
  function byYear() {
    return P.slice().sort(function (a, b) { return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0) || String(a.title).localeCompare(String(b.title)); });
  }

  var homeBuilders = {
    panoramis: function () {
      /* desktop naar Panoramis: één scherm, alle projecten als rij vierkanten van rand tot rand, sleepbaar */
      var list = ordered();
      var cells = list.concat(list).map(function (p) {
        return '<a class="hvp-cell" href="' + link(p) + '" draggable="false">' + shot(coverType(p), cover(p), p.title, 'hvp-shot') +
          '<span class="hvp-cap"><b>' + esc(p.title) + '</b><span>' + esc(p.client) + ' \u00b7 ' + esc(p.year) + '</span></span></a>';
      }).join('');
      /* links boven staat de kop (mark) op één lijn met het menu; plaats en status onder de tekst, niet in de hero */
      return '<div class="hvp-top"><h1>Marijn Chaouch<sup>\u2122</sup></h1></div>' +
        '<div class="hvp-strip" data-strip><div class="hvp-track">' + cells + '</div></div>' +
        '<p class="hvp-text">' + esc(S.aboutIntro || '') + '<span class="hvp-meta">' + esc(S.location || '') + ' \u00b7 ' + esc(S.status || '') + '</span></p>';
    },
    gallery: function () {
      /* naar 'Curated (works)': grote kop in het midden, link, onderaan een rij genummerde beeldjes */
      var years = P.map(function (p) { return parseInt(p.year, 10) || 0; }).filter(Boolean);
      var span = String(Math.min.apply(null, years)).slice(2) + '\u2013' + String(Math.max.apply(null, years)).slice(2);
      var list = ordered();
      return '<div class="hvg-first"><h1 class="hvg-title">Selected<br>(Work)<br>' + span + '</h1>' +
        '<a class="hvg-open" href="work.html">Open work</a>' +
        '<div class="hvg-row" data-swipe>' + list.map(function (p, k) {
          return '<a href="' + link(p) + '"><span>' + ('0' + (k + 1)).slice(-2) + '</span>' + shot(coverType(p), cover(p), p.title, 'hvg-thumb') + '</a>';
        }).join('') + '</div></div>' + homeTail();
    },
    portrait: function () {
      return '<div class="hvo-first"><div class="hvo-photo">' + shot('image', S.portrait || '', 'Marijn Chaouch', 'hvo-shot') + '</div>' +
        '<h1 class="hvo-name" data-fit><span>Marijn Chaouch</span></h1></div>' +
        '<h2 class="hvx-head">Selected<br>work</h2>' + rowsList(byYear()) + homeTail();
    },
    magazine: function () {
      var list = ordered();
      return list.map(function (p, k) {
        var prev = list[(k - 1 + list.length) % list.length], next = list[(k + 1) % list.length];
        return '<article class="hvm">' +
          '<a class="hvm-img" href="' + link(p) + '">' + shot(bigType(p), bigSrc(p), p.title, 'hvm-shot') + '<span class="hvm-pill">' + (p.kind === 'video' ? 'Film' : 'Photography') + '</span></a>' +
          '<a class="hvm-text" href="' + link(p) + '"><span class="hvm-kicker">' + esc(p.client) + '</span><h2>' + esc(p.title) + '</h2>' +
          '<span class="hvm-cred"><span>' + esc(p.role || '') + (p.agency ? '<br>Agency: ' + esc(p.agency) : '') + '</span><span>' + esc(p.year) + '</span></span></a>' +
          '<nav class="hvm-nav"><a href="' + link(prev) + '">Previous</a><a href="work.html">All work</a><a href="' + link(next) + '">Next</a></nav>' +
          '</article>';
      }).join('') + homeTail();
    },
    feed: function () {
      return '<h1 class="hv-name" data-fit><span>Marijn Chaouch</span></h1>' +
        '<div class="hvf">' + ordered().map(function (p) {
          return '<a class="hvf-item" href="' + link(p) + '">' + shot(bigType(p), bigSrc(p), p.title, 'hvf-shot') +
            '<span class="hvf-cap"><b>' + esc(p.title) + '</b><span>' + esc(p.client) + ' \u00b7 ' + esc(p.year) + '</span></span></a>';
        }).join('') + '</div>' + homeTail();
    },
    cover: function (by) {
      var hero = by('mizuno-neo-accera');
      return '<a class="hvc-hero" href="' + link(hero) + '">' + shot(bigType(hero), bigSrc(hero), hero.title, 'hvc-shot') +
          '<span class="hvc-name">Marijn<br>Chaouch</span><span class="hvc-tag">' + esc(S.tagline || '') + '</span></a>' +
        '<div class="hvc-grid">' + ordered().map(function (p) {
          return '<a href="' + link(p) + '">' + shot(coverType(p), cover(p), p.title, 'hvc-thumb') + '<b>' + esc(p.title) + '</b><span>' + esc(p.year) + '</span></a>';
        }).join('') + '</div>' + homeTail();
    },
    reels: function () {
      var list = ordered();
      return list.map(function (p, k) {
        return '<a class="hvr-panel" href="' + link(p) + '">' + shot(bigType(p), bigSrc(p), p.title, 'hvr-shot') +
          '<span class="hvr-cap"><span>' + ('0' + (k + 1)).slice(-2) + ' / ' + ('0' + list.length).slice(-2) + '</span><b>' + esc(p.title) + '</b><span>' + esc(p.client) + ' \u00b7 ' + esc(p.year) + '</span></span></a>';
      }).join('') + '<div class="hvr-end">' + homeTail() + '</div>';
    },
    stack: function () {
      return '<h1 class="hv-name" data-fit><span>Marijn Chaouch</span></h1>' +
        '<div class="hvs">' + ordered().map(function (p) {
          return '<a class="hvs-card" href="' + link(p) + '">' + shot(coverType(p), cover(p), p.title, 'hvs-shot') +
            '<span class="hvs-cap"><span>' + no2(p) + '</span><b>' + esc(p.title) + '</b><span>' + esc(p.year) + '</span></span></a>';
        }).join('') + '</div>' + homeTail();
    },
    list: function () {
      /* naar 'Selected work': grote kop, rijen met dikke lijn, titel groot links en beeld rechts */
      /* combi (22-10-2026): 'Selected (Work) 24–26' (dit streepje mag van Marijn) midden in het eerste scherm, daaronder de rijen */
      var years = P.map(function (p) { return parseInt(p.year, 10) || 0; }).filter(Boolean);
      var span = String(Math.min.apply(null, years)).slice(2) + '\u2013' + String(Math.max.apply(null, years)).slice(2);
      return '<div class="hvl-first"><h1 class="hvg-title">Selected<br>(Work)<br>' + span + '</h1></div>' +
        '<div class="hvl">' + byYear().map(function (p) {
          /* klein beeldje: altijd een stilstaand beeld (bij video de poster), zo laadt de telefoon geen tien video's tegelijk */
          var still = coverType(p) === 'video' ? poster(cover(p)) : cover(p);
          return '<a class="hvl-row" href="' + link(p) + '">' + shot('image', still, p.title, 'hvl-thumb') +
            '<span class="hvl-t"><b>' + esc(p.title) + '</b><span>' + esc(p.client) + '</span></span><span class="hvl-y">' + esc(p.year) + '</span></a>';
        }).join('') + '</div>' + homeTail();
    },

    marthens: function () {
      /* portret wisselt door de fotoprojecten, zwart-wit; teller en projectnaam onderaan */
      var list = P.filter(function (p) { return coverType(p) !== 'video'; });
      return '<div class="hv-corners"><span>Photography<br>and Film</span><span>Marijn Chaouch 2026</span><span>Amsterdam,<br>NL</span></div>' +
        '<div class="hv-stage"><div class="hv-swap">' + list.map(function (p, k) {
          return '<a class="hv-pic hv-center' + (k ? '' : ' on') + '" href="' + link(p) + '" data-title="' + esc(p.title) + '" data-no="' + ('0' + (P.indexOf(p) + 1)).slice(-2) + '">' +
            shot('image', cover(p), p.title, 'hv-shot') + '</a>';
        }).join('') + '</div>' +
        '<h1 class="hv-big" data-fit><span>CHAOUCH</span></h1></div>' +
        '<p class="hv-caption">' + esc(S.aboutIntro || S.tagline || '') + '</p>' +
        '<div class="hv-corners hv-bottom"><span data-swap-title></span><span data-swap-no></span></div>';
    },
    nothing: function (by) {
      return '<div class="hv-grid"><div class="hv-name"><h1>marijn chaouch</h1><span>photography and film</span></div>' +
        pic(by('mizuno-neo-accera'), 'hv-main') + '</div>' +
        '<p class="hv-mono">' + esc(S.aboutIntro || '') + '</p>';
    },
    nonverbal: function (by) {
      return '<div class="hv-split">' + pic(by('personal-project'), 'hv-left') +
        '<div class="hv-right"><div class="hv-tags"><span>[Photography]</span><span>[Film]</span><span>[Amsterdam]</span></div>' +
        '<h2>Welcome to<br>Marijn Chaouch\u2019s world</h2>' +
        '<p>' + esc(S.aboutIntro || '') + '</p><p>' + esc(S.aboutThree || '') + '</p>' +
        '<a class="hv-link" href="work.html">See the work</a></div></div>' +
        '<div class="hv-word"><span class="w-a" data-fit><span>CHAOUCH</span></span><span class="w-b" data-fit aria-hidden="true"><span>CHAOUCH</span></span></div>';
    },
    inara: function (by) {
      var p = by('sjrm');
      return '<h1 class="hv-big" data-fit><span>MARIJN CHAOUCH</span></h1>' +
        '<div class="hv-mid">' + pic(p, 'hv-small') + '<span class="hv-cap">' + esc(p.title) + '</span></div>' +
        '<div class="hv-foot"><p>' + esc(S.tagline || '') + '<br>' + esc(S.location || '') + ' \u00b7 2026</p><p>Photography<br>&amp; Film</p></div>';
    },
    aino: function (by) {
      /* eerst het werk, daaronder de tekst en als afsluiter de naam over de hele breedte */
      var feat = pickFeatured(by, ['mizuno-neo-accera', 'nike-x-jd'], 2);
      return '<div class="hv-feat hv-feat-2">' + feat.map(feature).join('') + '</div>' +
        '<div class="hv-outro"><p class="statement-x">' + esc(S.aboutIntro || '') + '</p>' +
          '<div class="hv-links"><a class="u-link" href="work.html">All work (' + P.length + ')</a><a class="u-link" href="about.html">About</a><a class="u-link" href="contact.html">Contact</a></div></div>' +
        '<h1 class="hv-name" data-fit><span>Marijn Chaouch</span></h1>';
    },
    studioform: function (by) {
      /* naam groot bovenaan, drie uitgelichte projecten, daaronder de tekst over de hele breedte */
      var feat = pickFeatured(by, ['mizuno-neo-accera', 'tcs-marathon-amsterdam', 'ravi-nagarkar'], 3);
      return '<h1 class="hv-name" data-fit><span>Marijn Chaouch</span></h1>' +
        '<div class="hv-feat hv-feat-3" data-swipe>' + feat.map(feature).join('') + '</div>' +
        '<div class="hv-count" data-count><span>01</span> / ' + ('0' + feat.length).slice(-2) + '</div>' +
        '<p class="hv-long">' + esc(S.aboutIntro || '') + ' ' + esc(S.aboutThree || '') + '</p>' +
        '<nav class="hv-more"><a href="work.html"><span>All work</span><i>' + P.length + ' projects \u2192</i></a>' +
          '<a href="about.html"><span>About</span><i>\u2192</i></a><a href="contact.html"><span>Contact</span><i>\u2192</i></a></nav>';
    }
  };

  function swap(box) {
    var pics = box.querySelectorAll('.hv-swap .hv-pic'), t = box.querySelector('[data-swap-title]'), c = box.querySelector('[data-swap-no]');
    var i = 0, total = ('0' + P.length).slice(-2);
    function show() {
      Array.prototype.forEach.call(pics, function (p, k) { p.classList.toggle('on', k === i); });
      if (t && pics[i]) t.textContent = pics[i].getAttribute('data-title');
      if (c && pics[i]) c.textContent = 'P. ' + pics[i].getAttribute('data-no') + '/' + total;
    }
    show();
    if (pics.length > 1) setInterval(function () { if (!document.hidden) { i = (i + 1) % pics.length; show(); } }, 3200);
  }

  /* panoramis: rij loopt rustig door, slepen of scrollen schuift hem; oneindig door de dubbele rij */
  function strip(el2) {
    if (!el2) return;
    var track = el2.firstElementChild, x = 0, v = -0.35, drag = null, moved = 0;
    function loop() {
      if (!drag && !document.hidden) x += v;
      var h = track.scrollWidth / 2;
      if (h) { if (x <= -h) x += h; if (x > 0) x -= h; }
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      requestAnimationFrame(loop);
    }
    /* desktop: de pagina scrolt niet, scrollen overal op het scherm beweegt de strook */
    var desk = window.matchMedia('(min-width: 720px)').matches;
    (desk ? window : el2).addEventListener('wheel', function (e) { x -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY); e.preventDefault(); }, { passive: false });
    el2.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, start: x }; moved = 0; el2.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (!drag) return; moved = Math.abs(e.clientX - drag.x); x = drag.start + (e.clientX - drag.x); });
    window.addEventListener('pointerup', function () { drag = null; el2.classList.remove('drag'); });
    el2.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) v = 0;
    requestAnimationFrame(loop);
  }

  /* teller bij de swipe-rij op de telefoon */
  function swipeCount(box) {
    var row = box.querySelector('[data-swipe]'), out = box.querySelector('[data-count] span');
    if (!row || !out) return;
    var t;
    row.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var card = row.firstElementChild;
        if (!card) return;
        var k = Math.round(row.scrollLeft / (card.getBoundingClientRect().width + 10));
        out.textContent = ('0' + (Math.min(k, row.children.length - 1) + 1)).slice(-2);
      }, 60);
    }, { passive: true });
  }

  function clock(n) {
    if (!n) return;
    function tick() {
      try {
        n.textContent = new Intl.DateTimeFormat('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Amsterdam' })
          .format(new Date()).replace(',', '').toUpperCase();
      } catch (e) { n.textContent = ''; }
    }
    tick(); setInterval(tick, 1000);
  }

  /* keuzebalk: alleen zichtbaar na ?kies, onthouden in deze browser */
  function chooser(pick) {
    var bar = el('div', 'hv-chooser');
    bar.innerHTML = '<span>Home-stijl</span>' + HOME_STYLES.map(function (s) {
      return '<a href="index.html?kies&stijl=' + s[0] + '"' + (s[0] === pick ? ' class="on"' : '') + '>' + s[1] + '</a>';
    }).join('') + '<a class="hv-close" href="index.html" title="Balk verbergen">\u00d7</a>';
    bar.querySelector('.hv-close').addEventListener('click', function (e) { e.preventDefault(); store('homepick-bar', null); store('homepick', null); store('homepick-m', null); store('homepick-d', null); location.href = 'index.html'; });
    document.body.appendChild(bar);
    document.body.classList.add('has-chooser');
  }

  /* work */

  /* elk project een eigen opzet: look 1 t/m 6 wisselt per project, of kies er een met "look" in projects.json */
  function look(p) {
    var l = parseInt(p.look, 10);
    return l >= 1 && l <= 6 ? l : (P.indexOf(p) % 6) + 1;
  }

  /* kop per project: nummer en soort, groot nummer, titel in twee delen, klant en intro */
  function editorial(p, pos) {
    var no = ('0' + ((pos == null ? P.indexOf(p) : pos) + 1)).slice(-2);
    var words = String(p.title || '').split(' ');
    var cut = Math.max(1, Math.floor(words.length / 2));
    var title = '<span>' + esc(words.slice(0, cut).join(' ')) + '</span>' +
      (words.length > 1 ? ' <span>' + esc(words.slice(cut).join(' ')) + '</span>' : '');
    var intro = p.intro && p.intro !== p.title ? '<p>' + esc(p.intro) + '</p>' : '';
    return '<div class="corners"><span>' + no + '</span><span>' +
      (p.kind === 'video' ? 'Video' : 'Photo') + '</span></div>' +
      '<p class="card-num">' + no + '</p>' +
      '<p class="card-title">' + title + '</p>' +
      '<div class="card-row"><span><b>' + esc(p.client) + '</b> <i>' + esc(p.year) + '</i></span>' + intro + '</div>';
  }

  function grid() {
    var host = document.querySelector('[data-grid]');
    if (!host) return;

    /* kolommen zoals in de CSS: 3 desktop, 2 tablet, 1 telefoon */
    function columns() {
      return window.matchMedia('(min-width: 1100px)').matches ? 3 : window.matchMedia('(min-width: 720px)').matches ? 2 : 1;
    }

    /* dambord: video en foto wisselen af, in de rij en in de kolom; volgorde binnen elke soort blijft gelijk */
    function checker(list, cols) {
      var vids = list.filter(function (p) { return p.kind === 'video'; });
      var pics = list.filter(function (p) { return p.kind !== 'video'; });
      var start = vids.length >= pics.length ? 0 : 1;
      return list.map(function (x, k) {
        var wantVid = (Math.floor(k / cols) + k % cols + start) % 2 === 0;
        var a = wantVid ? vids : pics, b = wantVid ? pics : vids;
        return (a.length ? a : b).shift();
      });
    }

    var current = 'all', cols = columns();
    var view = new URLSearchParams(location.search).get('view') === 'index' ? 'index' : (store('workview') || 'grid');

    /* index bovenaan (naar Basic/One): links een vast voorbeeldbeeld, rechts klant, project, soort, jaar */
    function drawIndex(target, list) {
      target.innerHTML = '';
      var side = el('a', 'wi-side');
      var frame = el('div', 'wi-frame');
      var cap = el('div', 'wi-cap');
      side.appendChild(frame); side.appendChild(cap);
      var table = el('div', 'wi-table');
      table.appendChild(el('div', 'wi-row wi-head', '<span>Client</span><span>Project</span><span>Type</span><span>Year</span>'));
      var current = null;
      function show(p) {
        if (current === p) return;
        current = p;
        frame.innerHTML = '';
        frame.appendChild(media(coverType(p), cover(p), p.title, 'wi-shot'));
        cap.innerHTML = '<b>' + esc(p.title) + '</b><span>' + esc(p.client) + ' \u00b7 ' + esc(p.year) + '</span>';
        side.href = link(p);
      }
      list.forEach(function (p) {
        var a = el('a', 'wi-row', '<span>' + esc(p.client) + '</span><span>' + esc(p.title) + '</span><span>' + (p.kind === 'video' ? 'Video' : 'Photo') + '</span><span>' + esc(p.year) + '</span>');
        a.href = link(p);
        a.addEventListener('mouseenter', function () { show(p); });
        a.addEventListener('focus', function () { show(p); });
        table.appendChild(a);
      });
      target.appendChild(side);
      target.appendChild(table);
      if (list.length) show(list[0]);
    }
    var indexHost = document.querySelector('[data-index]');
    /* index: nieuwste jaar bovenaan, daarbinnen op alfabet (klant, dan project) */
    if (indexHost) drawIndex(indexHost, P.slice().sort(function (a, b) {
      return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0) ||
        String(a.client).localeCompare(String(b.client), 'nl', { sensitivity: 'base' }) ||
        String(a.title).localeCompare(String(b.title), 'nl', { sensitivity: 'base' });
    }));

    function draw(kind) {
      current = kind;
      host.innerHTML = '';
      var list = P.filter(function (p) { return kind === 'all' || p.kind === kind; });
      if (kind === 'all') list = checker(list, cols);
      list.forEach(function (p, n) {
        /* alle kaarten dezelfde opbouw, in een strak raster; nummer volgt de plek */
        var a = el('a', 'card');
        a.href = link(p);
        a.appendChild(el('div', 'card-ed', editorial(p, n)));
        a.appendChild(media(coverType(p), cover(p), p.title, 'shot'));
        a.appendChild(el('div', 'meta', '<b>' + ('0' + (n + 1)).slice(-2) + ' ' + esc(p.title) + '</b><span>' + (p.kind === 'video' ? 'Video' : 'Photo') + '</span>'));
        host.appendChild(a);
      });
    }

    var views = document.querySelectorAll('[data-view]');
    Array.prototype.forEach.call(views, function (b) {
      b.classList.toggle('on', b.getAttribute('data-view') === view);
      b.addEventListener('click', function () {
        view = b.getAttribute('data-view');
        store('workview', view);
        Array.prototype.forEach.call(views, function (x) { x.classList.toggle('on', x === b); });
        draw(current);
      });
    });

    var buttons = document.querySelectorAll('[data-filter]');
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(buttons, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        draw(b.getAttribute('data-filter'));
      });
    });

    draw('all');

    /* ander aantal kolommen (draaien, venster groter of kleiner): dambord opnieuw leggen */
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { var c = columns(); if (c !== cols) { cols = c; draw(current); } }, 150);
    });
  }

  /* projectpagina */

  function project() {
    var host = document.querySelector('[data-case]');
    if (!host || !P.length) return;

    var slug = key(new URLSearchParams(location.search).get('p'));
    var n = P.findIndex(function (p) { return key(p.slug) === slug; });
    /* onbekend project: terug naar het overzicht in plaats van een ander project tonen */
    if (n < 0) { location.replace('work.html'); return; }
    var p = P[n], next = P[(n + 1) % P.length];
    /* voorbeeld van een andere opzet: project.html?p=...&layout=cover */
    var preview = new URLSearchParams(location.search).get('layout');
    if (preview) p = Object.assign({}, p, { layout: preview });

    document.title = p.title + ' \u00b7 Marijn Chaouch';
    /* projectkleuren staan uit: alle pagina's in de huisstijl. Weer aan: paint(p); */
    document.body.classList.add('case-' + (p.layout || 'editorial'));

    host.innerHTML = caseMarkup(p, n);
    fit(host);
    soundButtons(host);
    Array.prototype.forEach.call(host.querySelectorAll('video[autoplay]'), function (v) { v.muted = true; watch(v); });

    var stack = document.querySelector('[data-stack]');
    if (stack) {
      stack.innerHTML = '';
      /* staat er bovenaan maar één beeld (links), dan begint de stapel rechts */
      stack.classList.toggle('flip', p.layout === 'standard' && p.heroCount === 1);
      var used = p.layout === 'standard' ? (p._heroUsed || 0) : p.layout === 'split' || p.layout === 'gallery' ? 1 : p.layout === 'poster' ? (p.posterFrames === 2 ? 1 : 2) : 0;
      (p.media || []).filter(function (m) { return m.src && !(p.layout === 'poster' && m.src === p.posterUnder); }).slice(used).forEach(function (m) {
        /* beelden in hun eigen vorm, niets bijgesneden; de plek wisselt per beeld (zie .case .stack) */
        var box = media(m.type, m.src, p.title, 'item' + ((m.span === 'full' || (m.ratio || 0) > 1.2) ? ' full' : ''), m);
        if (m.ratio) box.style.setProperty('--r', m.ratio);
        stack.appendChild(box);
      });
      soundButtons(stack);
    }

    var more = document.querySelector('[data-next]');
    if (more) {
      more.textContent = next.title;
      more.href = link(next);
    }
  }

  /* about: portret schuift langzamer mee dan de pagina */
  function parallax() {
    var n = document.querySelector('[data-parallax]');
    if (!n || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* het roze vlak blijft staan (sticky); de foto schuift half zo snel omhoog en blijft zo boven de tekst in beeld */
    var hero = n.closest('.ab4-hero');
    var start = hero ? hero.getBoundingClientRect().top + window.scrollY : 0;
    var tick = false;
    function set() { n.style.transform = 'translate3d(0,' + (-Math.max(0, window.scrollY - start) * 0.5) + 'px,0)'; tick = false; }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(set); } }, { passive: true });
    set();
  }

  /* beweging bij scrollen: tekst glijdt omhoog in beeld, beelden openen als een gordijn, grote titels komen woord voor woord uit een masker.
     Alleen als de browser het kan en de bezoeker geen 'minder beweging' heeft ingesteld; zonder JS blijft alles gewoon zichtbaar. */
  function motion() {
    if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var root = document.documentElement;
    root.classList.add('mo');
    function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

    all('.pj-head h1, .head h1, .hvg-title, .bar .hvp-name').forEach(function (h) {
      if (h.hasAttribute('data-fit') || h.getAttribute('data-mo')) return;
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
              var o = document.createElement('span'), i = document.createElement('span');
              o.className = 'mo-w'; i.textContent = w; i.style.transitionDelay = (n++ * 70) + 'ms';
              o.appendChild(i); frag.appendChild(o);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
        });
      })(h);
      h.setAttribute('data-mo', 'title');
    });
    /* beelden zelf bewegen niet (Marijn vond het openen van de beelden irritant) */
    all('.wi-row, .card .card-ed, .card .meta, .pj-info, .ab4-big, .ab4-logos h2, .ab4-logos li, .ab4-col, ' +
        '.ct2 .statement-x, .ct2 .row, .foot, .next, .hvp-text').forEach(function (n) { if (!n.getAttribute('data-mo')) n.setAttribute('data-mo', 'up'); });

    var io = new IntersectionObserver(function (list) {
      var k = 0;
      list.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target;
        io.unobserve(n);
        n.style.setProperty("--mo-d", Math.min(k++, 6) * 50 + "ms");
        requestAnimationFrame(function () { n.classList.add('mo-in'); });
        /* na afloop de animatie-instellingen weghalen, zodat hover en klikken weer gewoon werken */
        setTimeout(function () { n.classList.add('mo-done'); }, 1900 + Math.min(k, 8) * 80);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    all('[data-mo]').forEach(function (n) { io.observe(n); });
  }

  /* desktop: zacht, vloeiend scrollen (Lenis); niet op de telefoon en niet op de Panoramis-home (die scrolt niet) */
  function smooth() {
    if (!window.Lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine) and (min-width: 1100px)').matches) return;
    if (document.body.classList.contains('hv-is-panoramis')) return;
    var lenis = new window.Lenis({ lerp: 0.18, wheelMultiplier: 1 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
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
        /* "hidden": true houdt een project van de site (bijv. tot een lancering) */
        P = ((out[0] && out[0].projects) || []).filter(function (p) { return !p.hidden; });
        S = out[1] || {};
        texts();
        parallax();
        fit();
        if (!homeStyles()) reel();
        grid();
        project();
        lazyVideos();
        motion();
        smooth();
      })
      .catch(offline);
  });
})();
