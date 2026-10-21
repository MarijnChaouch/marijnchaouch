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
        var go = v.play();
        if (go && go.catch) go.catch(function () {});
      } else if (!v.controls) {
        v.pause();
      }
    });
  }, { rootMargin: '200px 0px' }) : null;

  function watch(v) {
    v.inview = true;
    if (seen) seen.observe(v);
  }

  /* blokkeert de telefoon het vanzelf afspelen (bijv. energiebesparing), dan starten we bij elke aanraking
     de video's die in beeld staan: een aanraking mag dat wel */
  function kick() {
    Array.prototype.forEach.call(document.querySelectorAll('video[autoplay]'), function (v) {
      var cell = v.closest ? v.closest('.reel-cell') : null;
      var active = cell ? cell.classList.contains('on') : v.inview;
      if (active && v.paused && !v.controls) {
        var go = v.play();
        if (go && go.catch) go.catch(function () {});
      }
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
        v.setAttribute('preload', opts.lazy ? 'none' : 'auto');
        if (opts.lazy) v.setAttribute('data-src', src); else v.src = src;
        box.appendChild(v);
        if (!opts.manual) watch(v);
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
      (function check() {
        if (hasAudio(v)) { b.hidden = false; return; }
        if (++tries < 12) setTimeout(check, 500);
      })();
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
      return '<div class="' + cls + '"><video src="' + esc(src) + '"' + still + ' muted loop autoplay playsinline webkit-playsinline preload="auto"></video></div>';
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
          '<div class="lay-corners">' + back + '<span>' + no + ' \u2014 ' + kind + '</span></div>' +
          '<h1>' + esc(p.title) + '</h1>' +
          '<div class="cover-facts">' + factRows(p) + '</div>' +
          (p.intro ? '<p class="statement">' + esc(p.intro) + '</p>' : '') +
        '</div></div>';
    }

    /* kolommen: titel over twee verspringende regels, label met tekst, beeld over de volle breedte */
    if (layout === 'columns') {
      return '<div class="lay lay-columns">' +
        '<div class="lay-corners">' + back + '<span>' + no + ' \u2014 ' + kind + '</span></div>' +
        '<h1 class="stagger">' + halves(p.title) + '</h1>' +
        '<div class="col-row"><span>Project</span><p>' + esc(p.intro || p.caption || '') + '</p></div>' +
        '<div class="col-row"><span>Client</span><p>' + esc(p.client) + (p.year ? ', ' + esc(p.year) : '') + '</p></div>' +
        (p.deliverables ? '<div class="col-row"><span>Delivered</span><p>' + esc(p.deliverables) + '</p></div>' : '') +
        '<div class="col-visual">' + b.hero + '</div>' +
        '</div>';
    }

    var corners = '<div class="lay-corners">' + back + '<span>' + no + ' \u2014 ' + kind + '</span></div>';

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
        '<div class="poster-edge">Marijn Chaouch \u2014 Photography and Film</div>' +
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
    ['', 'Huidig'], ['marthens', 'Marthens'], ['nothing', 'Nothing'], ['nonverbal', 'Non-Verbal'],
    ['inara', 'Inara'], ['aino', 'Aino'], ['studioform', 'Studioform']
  ];

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; }
  }

  function homeStyles() {
    var main = document.querySelector('main.home');
    if (!main) return false;
    var q = new URLSearchParams(location.search);
    if (q.has('kies')) store('homepick-bar', '1');
    if (q.get('stijl') != null) store('homepick', q.get('stijl'));
    var pick = store('homepick') || '';
    if (store('homepick-bar')) chooser(pick);
    if (!pick || !homeBuilders[pick]) return false;

    var by = function (slug) { return P.filter(function (p) { return p.slug === slug; })[0] || P[0]; };
    var row = main.querySelector('.home-row');
    var box = el('div', 'hv hv-' + pick);
    box.innerHTML = homeBuilders[pick](by);
    row.parentNode.insertBefore(box, row);
    document.body.classList.add('hv-on', 'hv-is-' + pick);
    fit(box);
    soundButtons(box);
    if (pick === 'aino') clock(box.querySelector('[data-clock]'));
    return true;
  }

  function pic(p, cls, label) {
    return '<a class="hv-pic ' + (cls || '') + '" href="' + link(p) + '">' + shot(coverType(p), cover(p), p.title, 'hv-shot') +
      (label ? '<span class="hv-label">' + esc(label) + '</span>' : '') + '</a>';
  }

  var homeBuilders = {
    marthens: function (by) {
      return '<div class="hv-corners"><span>Photography<br>and Film</span><span>Marijn Chaouch 2026</span><span>Amsterdam,<br>NL</span></div>' +
        '<div class="hv-stage">' + pic(by('tcs-marathon-amsterdam'), 'hv-center') +
        '<h1 class="hv-big" data-fit><span>CHAOUCH</span></h1></div>' +
        '<p class="hv-caption">' + esc(S.aboutIntro || S.tagline || '') + '</p>' +
        '<div class="hv-corners hv-bottom"><span>' + esc(S.status || '') + '</span><a href="work.html">Work &rarr;</a></div>';
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
        '<div class="hv-foot"><p>' + esc(S.tagline || '') + '<br>' + esc(S.location || '') + ' \u2014 2026</p><p>Photography<br>&amp; Film</p></div>';
    },
    aino: function (by) {
      var a = by('nike-x-jd'), b = by('fila-ss24'), sv = (S.services || []).map(esc).join('<br>');
      return '<h1 class="hv-big" data-fit><span>marijnchaouch</span></h1>' +
        '<div class="hv-mono-row"><span>Photography &amp; Film<br><b data-clock></b></span><span><a href="work.html">Work</a><br><a href="about.html">About</a></span>' +
          '<span>' + esc(S.location || '') + '<br>' + esc(S.status || '') + '</span><span><a href="contact.html">Contact</a><br><a href="mailto:' + esc(S.email || '') + '">Email</a></span></div>' +
        '<div class="hv-two">' + pic(a, 'hv-case', 'Case: ' + a.title) + pic(b, 'hv-case', 'Case: ' + b.title) + '</div>' +
        '<div class="hv-bottom-row"><p class="hv-state">' + esc(S.aboutIntro || '') + ' <a href="about.html">Read more</a></p>' +
          '<div class="hv-services"><span>Services</span><span>' + sv + '</span></div></div>';
    },
    studioform: function (by) {
      return '<p class="hv-lead">' + esc(S.tagline || '') + ' ' + esc(S.aboutThree || '') + '</p>' +
        '<h1 class="hv-big" data-fit><span>Chaouch\u00ae</span></h1>' +
        '<div class="hv-three">' + pic(by('transavia')) + pic(by('fila-ss24')) + pic(by('tcs-marathon-amsterdam')) + '</div>';
    }
  };

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
      return '<a href="index.html?stijl=' + s[0] + '"' + (s[0] === pick ? ' class="on"' : '') + '>' + s[1] + '</a>';
    }).join('') + '<a class="hv-close" href="index.html" title="Balk verbergen">\u00d7</a>';
    bar.querySelector('.hv-close').addEventListener('click', function (e) { e.preventDefault(); store('homepick-bar', null); store('homepick', null); location.href = 'index.html'; });
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

    document.title = p.title + ' \u2014 Marijn Chaouch';
    /* projectkleuren staan uit: alle pagina's in de huisstijl. Weer aan: paint(p); */
    document.body.classList.add('case-' + (p.layout || 'editorial'));

    host.innerHTML = caseMarkup(p, n);
    fit(host);
    soundButtons(host);
    Array.prototype.forEach.call(host.querySelectorAll('video[autoplay]'), function (v) { v.muted = true; watch(v); });

    var stack = document.querySelector('[data-stack]');
    if (stack) {
      stack.innerHTML = '';
      var used = p.layout === 'split' || p.layout === 'gallery' ? 1 : p.layout === 'poster' ? (p.posterFrames === 2 ? 1 : 2) : 0;
      (p.media || []).filter(function (m) { return !(p.layout === 'poster' && m.src === p.posterUnder); }).slice(used).forEach(function (m) {
        /* beelden in hun eigen vorm, niets bijgesneden; de plek wisselt per beeld (zie .case .stack) */
        var box = media(m.type, m.src, p.title, 'item' + (m.span === 'full' ? ' full' : ''), m);
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
        fit();
        if (!homeStyles()) reel();
        grid();
        project();
      })
      .catch(offline);
  });
})();
