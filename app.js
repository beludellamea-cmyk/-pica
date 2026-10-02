/* =========================================================
   CONEXIONES ÉPICAS · app.js
   Motor: rutas, desafíos iniciales, misiones, comprobaciones,
   voz, accesibilidad y guardado local.
   ========================================================= */
(function () {
  'use strict';

  var D = window.CONTENT, S = window.Scenes;
  var M = D.MISSIONS, PEOPLE = D.PEOPLE, SPACES = D.SPACES, UI = D.UI;
  var STEPS = ['explore', 'consult', 'transform', 'test', 'reflect'];
  var DISCOVERIES = ['Que preguntar abre posibilidades', 'Que hay más de una solución', 'Que una barrera afecta a muchas personas', 'Que ayudar no es decidir por otros', 'Otra cosa'];

  /* ---------- Utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function person(id) { return PEOPLE[id] || { name: id, about: '' }; }
  function attr(act, arg) { return ' data-act="' + act + '"' + (arg != null ? ' data-arg="' + esc(arg) + '"' : ''); }
  function pressed(b) { return ' aria-pressed="' + (b ? 'true' : 'false') + '"'; }
  function fmtNum(x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); }

  /* ---------- Guardado local (con alternativa en memoria) ---------- */
  var Store = {
    key: 'conexiones-epicas-v1', ok: false, mem: null,
    init: function () {
      try { localStorage.setItem('__ce', '1'); localStorage.removeItem('__ce'); this.ok = true; } catch (e) { this.ok = false; }
    },
    load: function () {
      if (!this.ok) return this.mem ? clone(this.mem) : null;
      try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch (e) { return null; }
    },
    save: function (s) {
      if (this.ok) { try { localStorage.setItem(this.key, JSON.stringify(s)); return; } catch (e) { this.ok = false; } }
      this.mem = clone(s);
    },
    clear: function () { this.mem = null; if (this.ok) { try { localStorage.removeItem(this.key); } catch (e) { /* nada */ } } }
  };

  function freshSpace() { return { intro: { stage: 'start', pieces: {}, sel: null, clues: [], code: [null, null, null], tries: 0, hint: 0, msg: '' }, missions: {}, secrets: [], closing: { ideas: [] } }; }
  function freshState() {
    return { v: 1, settings: { text: 0, contrast: false, motion: 'auto', autoread: false, group: false }, route: { name: 'entrada' }, spaces: { ninos: freshSpace(), adultos: freshSpace() } };
  }
  var state;
  function save() { Store.save(state); }

  function initTransform(m) {
    var T = m.transform;
    switch (T.type) {
      case 'toggle': return { sel: [] };
      case 'message': return { slots: {}, formats: [] };
      case 'voices': return { slots: T.start.slice() };
      case 'zones': return { place: {} };
      case 'control': var modes = {}; T.decisions.forEach(function (d) { modes[d.id] = 'decidir'; }); return { modes: modes };
      case 'domino': return { marks: {}, checked: false, classified: false, chosen: [] };
      case 'repair': var v = {}; T.tasks.forEach(function (t) { v[t.id] = clone(t.start); }); return { v: v };
    }
    return {};
  }
  function ms(id) {
    var m = M[id], sp = state.spaces[m.space];
    if (!sp.missions[id]) {
      sp.missions[id] = { stage: 'choice', maxStep: -1, choice: null, revisedChoice: null, kept: null, changing: false, discovery: null, found: [], openSpot: null, modality: {}, consulted: [], waited: [], skipped: [], interp: {}, t: initTransform(m), hint: 0, tests: 0, failed: {}, ever: {}, flags: {}, answers: {}, result: null, done: false, secret: false, msg: '', pause: false };
    }
    return sp.missions[id];
  }

  /* ---------- Voz (apagada por defecto; solo al tocar ESCUCHAR) ---------- */
  var Voice = {
    supported: typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined',
    speaking: false,
    voice: null,
    pick: function () {
      if (!this.supported) return;
      var vs = window.speechSynthesis.getVoices() || [];
      this.voice = vs.filter(function (v) { return /^es[-_]AR/i.test(v.lang); })[0] || vs.filter(function (v) { return /^es/i.test(v.lang); })[0] || null;
    },
    speak: function (text) {
      if (!text) return;
      if (!this.supported) { toast('Este navegador no tiene lectura en voz. Todo el texto está escrito en pantalla.'); return; }
      var self = this;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-AR'; u.rate = 0.95;
      if (!this.voice) this.pick();
      if (this.voice) u.voice = this.voice;
      u.onend = u.onerror = function () { self.speaking = false; updateVoiceButtons(); };
      this.speaking = true; updateVoiceButtons();
      window.speechSynthesis.speak(u);
    },
    stop: function () {
      if (this.supported) window.speechSynthesis.cancel();
      this.speaking = false; updateVoiceButtons();
    }
  };
  function updateVoiceButtons() {
    var stop = $('#btnStop');
    stop.hidden = !Voice.speaking;
    $('#btnListen').setAttribute('aria-pressed', Voice.speaking ? 'true' : 'false');
  }
  function panelText() {
    var parts = $$('#panel .say').filter(function (el) { return el.offsetParent !== null || el.getClientRects().length; }).map(function (el) { return el.textContent.trim(); });
    if (!parts.length) parts = [$('#panel').innerText];
    return parts.join('. ').replace(/\s+/g, ' ').replace(/\.\./g, '.');
  }

  /* ---------- Anuncios ---------- */
  var liveTimer;
  function announce(msg) {
    var live = $('#live');
    live.textContent = '';
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { live.textContent = msg; }, 60);
  }
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 5200);
    announce(msg);
  }

  /* ---------- Ajustes de accesibilidad ---------- */
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function applySettings() {
    var s = state.settings, html = document.documentElement;
    html.style.fontSize = [100, 115, 130, 150][s.text] + '%';
    html.classList.toggle('hc', !!s.contrast);
    var reduce = s.motion === 'reduce' || (s.motion === 'auto' && mqReduce && mqReduce.matches);
    html.classList.toggle('rm', !!reduce);
    // reflejar en el diálogo
    $$('[data-act="setText"]').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.arg) === s.text)); });
    $('#optContrast').checked = !!s.contrast;
    $('#optMotion').value = s.motion;
    $('#optAutoread').checked = !!s.autoread;
    $('#optGroup').checked = !!s.group;
    $('#voiceSupport').textContent = Voice.supported ? 'La lectura en voz está disponible en este navegador.' : 'Este navegador no ofrece lectura en voz. Todo el contenido está escrito.';
    $('#storageNote').textContent = Store.ok ? 'El progreso se guarda solo en este dispositivo. No se piden datos personales.' : 'Este navegador no permite guardar: el progreso se mantiene mientras la página esté abierta.';
  }

  /* =========================================================
     ESCENA Y PUNTOS INTERACTIVOS
     ========================================================= */
  var currentScene = null, sceneData = null;
  function setScene(name, layers, hotspots, desc, overlay) {
    var art = $('#sceneArt');
    var first = currentScene !== name;
    if (first) {
      sceneData = S.get(name);
      art.classList.add('instant');
      art.innerHTML = sceneData.svg;
      currentScene = name;
    }
    applyLayers(layers);
    if (first) { void art.offsetWidth; requestAnimationFrame(function () { art.classList.remove('instant'); }); }
    art.setAttribute('aria-label', desc || sceneData.desc);
    renderHotspots(hotspots || []);
    $('#sceneOverlay').innerHTML = overlay || '';
  }
  function applyLayers(set) {
    $$('#sceneArt [data-l]').forEach(function (g) {
      var l = g.getAttribute('data-l'), neg = l.charAt(0) === '!', name = neg ? l.slice(1) : l;
      g.classList.toggle('on', neg ? !set.has(name) : set.has(name));
    });
  }
  function renderHotspots(list) {
    var box = $('#hotspots');
    box.innerHTML = list.map(function (h, i) {
      var a = typeof h.anchor === 'string' ? sceneData.anchors[h.anchor] : h.anchor;
      if (!a) return '';
      var p = S.toPercent(a, sceneData.vb);
      var icon = h.picto ? S.picto(h.picto, 26) : '<span>' + esc(h.icon || '•') + '</span>';
      var status = h.status ? ' — ' + h.status : '';
      var side = (h.side ? h.side === 'left' : p[0] > 62) ? ' hs-left' : '';
      return '<button type="button" class="hs ' + (h.cls || '') + side + (h.big ? ' hs-big' : '') + '" style="left:' + p[0].toFixed(2) + '%;top:' + p[1].toFixed(2) + '%"' +
        attr(h.act, h.arg) + ' data-hs="' + i + '" aria-label="' + esc(h.label + status) + '">' +
        '<span class="hs-dot" aria-hidden="true">' + icon + '</span><span class="hs-label" aria-hidden="true">' + esc(h.label) + '</span></button>';
    }).join('');
    list.forEach(function (h, i) {
      if (!h.drop) return;
      var el = box.querySelector('[data-hs="' + i + '"]');
      if (!el) return;
      el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('drop-over'); });
      el.addEventListener('dragleave', function () { el.classList.remove('drop-over'); });
      el.addEventListener('drop', function (e) { e.preventDefault(); el.classList.remove('drop-over'); h.drop(e.dataTransfer.getData('text/plain')); });
    });
  }

  /* =========================================================
     RUTAS Y RENDER
     ========================================================= */
  var pendingFocus = null;
  function go(route, focusSel) {
    state.route = route;
    pendingFocus = focusSel || '#panelTitle';
    renderReason = 'route';
    Voice.stop();
    save(); render();
    window.scrollTo(0, 0);
    $('#panel').scrollTop = 0;
  }

  function render() {
    var active = document.activeElement, keep = null;
    if (active && active.dataset && active.dataset.act) keep = { act: active.dataset.act, arg: active.dataset.arg };
    var r = state.route;
    document.body.className = 'route-' + r.name + (r.space ? ' sp-' + r.space : '');
    var html = '';
    if (r.name === 'entrada') html = renderEntrada();
    else if (r.name === 'intro') html = renderIntro(r.space);
    else if (r.name === 'hub') html = renderHub(r.space);
    else if (r.name === 'mission') html = renderMission(r.id);
    else if (r.name === 'closing') html = renderClosing(r.space);
    $('#panel').innerHTML = html + storageBanner();
    // barra superior
    $('#btnMap').hidden = !(r.name === 'mission' || r.name === 'closing');
    var prog = $('#progress');
    if (r.space && r.name !== 'intro') { prog.hidden = false; prog.innerHTML = 'CONEXIONES ACTIVADAS <b>' + doneCount(r.space) + '/5</b>'; }
    else prog.hidden = true;
    wireDraggables();
    // foco
    var target = null;
    if (pendingFocus) target = $(pendingFocus);
    else if (keep) target = $('[data-act="' + keep.act + '"]' + (keep.arg != null ? '[data-arg="' + cssEsc(keep.arg) + '"]' : ''));
    pendingFocus = null;
    if (target) { try { target.focus({ preventScroll: false }); } catch (e) { target.focus(); } }
    if (state.settings.autoread && renderReason === 'route') setTimeout(function () { Voice.speak(panelText()); }, 250);
    renderReason = '';
  }
  var renderReason = '';
  function cssEsc(s) { return String(s).replace(/["\\]/g, '\\$&'); }
  function storageBanner() {
    return Store.ok ? '' : '<p class="note storage-note">Este navegador no permite guardar: el progreso se mantiene mientras esta página esté abierta.</p>';
  }
  function doneCount(space) {
    var sp = SPACES[space], st = state.spaces[space], n = 0;
    sp.missions.concat([sp.final]).forEach(function (id) { if (st.missions[id] && st.missions[id].done) n++; });
    return n;
  }
  function spaceTag(space) { return '<p class="space-tag">' + esc(SPACES[space].label) + '</p>'; }

  /* ---------- ENTRADA ---------- */
  function renderEntrada() {
    var layers = new Set();
    setScene('entrada', layers, [
      { anchor: 'ninos', label: UI.accessKids, act: 'enterSpace', arg: 'ninos', cls: 'hs-gate hs-kids', icon: '★', big: true, side: 'left' },
      { anchor: 'adultos', label: UI.accessAdults, act: 'enterSpace', arg: 'adultos', cls: 'hs-gate hs-adults', icon: '◆', big: true, side: 'right' }
    ], null,
      '<div class="hero"><h1 class="hero-title">' + esc(UI.title) + '</h1><p class="hero-sub">' + esc(UI.subtitle) + '</p></div>');
    var g = state.settings.group;
    return '<h1 id="panelTitle" tabindex="-1" class="sr-only say">' + esc(UI.title) + '</h1>' +
      '<p class="lead say">' + esc(UI.subtitle) + '</p>' +
      '<div class="access">' +
      '<button type="button" class="btn-access kids"' + attr('enterSpace', 'ninos') + '><span class="acc-ico" aria-hidden="true">' + S.picto('barrilete', 40) + '</span><span>' + esc(UI.accessKids) + '</span></button>' +
      '<button type="button" class="btn-access adults"' + attr('enterSpace', 'adultos') + '><span class="acc-ico" aria-hidden="true">' + S.picto('llave', 40) + '</span><span>' + esc(UI.accessAdults) + '</span></button>' +
      '</div>' +
      '<fieldset class="mode"><legend>¿Cómo van a jugar?</legend>' +
      '<button type="button" class="chip"' + attr('setGroup', '0') + pressed(!g) + '>Individual</button>' +
      '<button type="button" class="chip"' + attr('setGroup', '1') + pressed(g) + '>En grupo, en un mismo dispositivo</button>' +
      '<p class="note">' + (g ? 'Modo grupal: antes de confirmar cada decisión aparece una pausa breve para conversar.' : 'Podés cambiar el modo cuando quieras en OPCIONES DE ACCESIBILIDAD.') + '</p></fieldset>' +
      '<p class="note">' + esc(Store.ok ? 'Tu progreso se guarda solo en este dispositivo. No pedimos ningún dato personal.' : '') + '</p>';
  }

  /* ---------- DESAFÍO INICIAL ---------- */
  function hubLayers(space) {
    var st = state.spaces[space], sp = SPACES[space], set = new Set();
    var intro = st.intro;
    if (intro.stage === 'lit' || intro.done) { set.add('lit'); set.add('tabla'); set.add('estrella'); set.add('piedra'); }
    if (space === 'ninos' && !intro.done) {
      Object.keys(intro.pieces).forEach(function (p) {
        set.add('got-' + p);
        if (intro.pieces[p] === 'placed') set.add(p);
      });
    }
    if (intro.done) { set.add('got-tabla'); set.add('got-estrella'); set.add('got-piedra'); }
    sp.missions.forEach(function (id) { if (st.missions[id] && st.missions[id].done) set.add('done-' + sp.islands[id]); });
    if (sp.missions.every(function (id) { return st.missions[id] && st.missions[id].done; })) set.add('final-on');
    if (st.missions[sp.final] && st.missions[sp.final].done) set.add('done-C');
    for (var i = 1; i <= st.secrets.length; i++) set.add('sec-' + i);
    return set;
  }

  function renderIntro(space) {
    var sp = SPACES[space], st = state.spaces[space], it = st.intro, I = sp.intro;
    var hs = [];
    var html = spaceTag(space);
    if (it.stage === 'start') {
      html += '<h1 id="panelTitle" tabindex="-1" class="mystery say">' + esc(UI.introMystery) + '</h1>' +
        '<p class="say">El puente está incompleto, el escenario está apagado y los caminos no se conectan.</p>' +
        '<button type="button" class="btn primary big"' + attr('introStart') + '>' + esc(UI.introButton) + '</button>';
    } else if (it.stage === 'lit') {
      html += '<p class="say">' + esc(I.lit) + '</p>' +
        '<h1 id="panelTitle" tabindex="-1" class="twist say">' + esc(UI.twist) + '</h1>' +
        '<button type="button" class="btn primary big"' + attr('introDone') + '>Descubrir las misiones</button>';
      hs.push({ anchor: 'C', label: 'Faro apagado', act: 'introDone', icon: '?', cls: 'hs-new' });
    } else if (I.type === 'pieces') {
      html += '<h1 id="panelTitle" tabindex="-1" class="say">EL MUNDO SE DESCONECTÓ</h1><p class="say">' + esc(I.play) + '</p>';
      // inventario
      var inv = I.pieces.filter(function (p) { return it.pieces[p.id] === 'found'; });
      html += '<h2>Tus piezas</h2>';
      if (!inv.length) html += '<p class="note">Todavía no encontraste piezas. Buscalas en el paisaje o con la lista de abajo.</p>';
      html += '<div class="inventory">' + inv.map(function (p) {
        return '<button type="button" class="piece" draggable="true" data-drag="' + p.id + '"' + attr('selPiece', p.id) + pressed(it.sel === p.id) + '>' +
          S.picto(p.picto, 44) + '<span><b>' + esc(p.name) + '</b><small>Forma: ' + esc(p.shape) + '</small></span></button>';
      }).join('') + '</div>';
      html += '<h2>Buscar en el paisaje</h2><ul class="spots">' + I.pieces.map(function (p) {
        var st2 = it.pieces[p.id];
        return '<li><button type="button" class="spot' + (st2 ? ' found' : '') + '"' + attr('findPiece', p.id) + (st2 ? ' aria-disabled="true"' : '') + '>' +
          '<span aria-hidden="true">' + (st2 ? '✓' : '?') + '</span> ' + esc(p.where) + (st2 ? ' · encontrada' : '') + '</button></li>';
      }).join('') + '</ul>';
      html += '<h2>Lugares donde encajan</h2><ul class="slots">' + I.slots.map(function (s) {
        var placed = it.pieces[s.id] === 'placed';
        return '<li class="slot' + (placed ? ' placed' : '') + '" data-dropslot="' + s.id + '"><span><b>' + esc(s.name) + '</b><small>Forma del hueco: ' + esc(s.shape) + '</small></span>' +
          (placed ? '<span class="badge ok">✓ Colocada</span>' : '<button type="button" class="btn small"' + attr('placePiece', s.id) + '>Colocar aquí</button>') + '</li>';
      }).join('') + '</ul>';
      html += '<p class="feedback" role="status">' + esc(it.msg || (it.sel ? 'Elegiste: ' + I.pieces.filter(function (p) { return p.id === it.sel; })[0].name + '. Ahora elegí dónde colocarla.' : '')) + '</p>';
      html += hintBox(I.hints, it.hint, 'introHint');
      I.pieces.forEach(function (p) {
        if (!it.pieces[p.id]) hs.push({ anchor: p.spot, label: p.where, act: 'findPiece', arg: p.id, icon: '?', cls: 'hs-new', side: 'right' });
      });
      I.slots.forEach(function (s) {
        if (it.pieces[s.id] !== 'placed') hs.push({ anchor: s.spot, label: s.name, act: 'placePiece', arg: s.id, icon: '◌', cls: 'hs-slot', drop: function (pid) { placePiece(space, s.id, pid); } });
      });
    } else {
      html += '<h1 id="panelTitle" tabindex="-1" class="say">EL MUNDO SE DESCONECTÓ</h1><p class="say">' + esc(I.play) + '</p>';
      html += '<h2>Pistas encontradas (' + it.clues.length + ' de 3)</h2><ul class="spots">' + I.clues.map(function (c) {
        var f = it.clues.indexOf(c.id) >= 0;
        return '<li>' + (f
          ? '<div class="clue"><b>' + esc(c.name) + '</b><p class="say">' + esc(c.text) + '</p></div>'
          : '<button type="button" class="spot"' + attr('findClue', c.id) + '><span aria-hidden="true">?</span> Revisar: ' + esc(c.name) + '</button>') + '</li>';
      }).join('') + '</ul>';
      html += '<h2>Código</h2><div class="code">' + [0, 1, 2].map(function (pos) {
        return '<fieldset class="code-pos"><legend>Símbolo ' + (pos + 1) + '</legend>' + I.symbols.map(function (sy) {
          return '<button type="button" class="sym"' + attr('setCode', pos + ':' + sy.id) + pressed(it.code[pos] === sy.id) + '>' + S.picto(sy.picto, 34) + '<span>' + esc(sy.name) + '</span></button>';
        }).join('') + '</fieldset>';
      }).join('') + '</div>';
      html += '<button type="button" class="btn primary"' + attr('tryCode') + '>Probar el código</button>';
      html += '<p class="feedback" role="status">' + esc(it.msg || '') + '</p>';
      html += hintBox(I.hints, it.hint, 'introHint');
      I.clues.forEach(function (c) {
        hs.push({ anchor: c.spot, label: c.name, act: 'findClue', arg: c.id, icon: it.clues.indexOf(c.id) >= 0 ? '✓' : '?', cls: it.clues.indexOf(c.id) >= 0 ? 'hs-found' : 'hs-new', status: it.clues.indexOf(c.id) >= 0 ? 'pista encontrada' : '' });
      });
    }
    var layers = hubLayers(space);
    setScene(sp.scene, layers, hs, S.get(sp.scene).desc + (it.stage === 'lit' ? ' El mundo está iluminado, pero el faro de la plaza sigue apagado.' : ' El mundo está apagado: el puente tiene un hueco y el escenario no tiene luz.'));
    return html;
  }

  function placePiece(space, slotId, pieceId) {
    var it = state.spaces[space].intro, I = SPACES[space].intro;
    pieceId = pieceId || it.sel;
    if (!pieceId || it.pieces[pieceId] !== 'found') { it.msg = 'Primero elegí una pieza de tus piezas encontradas.'; announce(it.msg); save(); render(); return; }
    var piece = I.pieces.filter(function (p) { return p.id === pieceId; })[0], slot = I.slots.filter(function (s) { return s.id === slotId; })[0];
    if (pieceId === slotId) {
      it.pieces[pieceId] = 'placed'; it.sel = null; it.msg = slot.done;
      if (I.pieces.every(function (p) { return it.pieces[p.id] === 'placed'; })) {
        it.stage = 'lit'; it.msg = '';
        announce(I.lit + ' ' + UI.twist);
        save(); pendingFocus = '#panelTitle'; render(); return;
      }
    } else {
      it.msg = 'No encaja: el lugar «' + slot.name + '» es ' + slot.shape + ', y la pieza es ' + piece.shape + '. Probá en otro lugar.';
    }
    announce(it.msg); save(); render();
  }

  /* ---------- MAPA (hub) ---------- */
  function renderHub(space) {
    var sp = SPACES[space], st = state.spaces[space];
    var allDone = sp.missions.every(function (id) { return st.missions[id] && st.missions[id].done; });
    var hs = sp.missions.map(function (id) {
      var m = M[id], s = st.missions[id];
      var status = s && s.done ? 'conexión activada' : (s && s.stage !== 'choice' ? 'en curso' : 'por explorar');
      return { anchor: sp.islands[id], label: m.title, act: 'openMission', arg: id, picto: m.icon, cls: s && s.done ? 'hs-done' : 'hs-new', status: status, side: 'right' };
    });
    var fm = M[sp.final], fs = st.missions[sp.final];
    hs.push({ anchor: 'C', label: allDone ? fm.title : 'Faro apagado', act: 'openMission', arg: sp.final, picto: 'estrella', cls: allDone ? (fs && fs.done ? 'hs-done' : 'hs-new hs-final') : 'hs-locked', status: allDone ? (fs && fs.done ? 'conexión activada' : 'disponible') : 'bloqueado', side: 'right' });
    setScene(sp.scene, hubLayers(space), hs);
    var n = doneCount(space);
    var html = spaceTag(space) +
      '<h1 id="panelTitle" tabindex="-1" class="say">MAPA DEL MUNDO</h1>' +
      '<p class="say">' + esc(sp.hubIntro) + '</p>' +
      '<div class="meter" role="img" aria-label="Conexiones activadas: ' + n + ' de 5">' + [0, 1, 2, 3, 4].map(function (i) { return '<span class="' + (i < n ? 'on' : '') + '"></span>'; }).join('') + '</div>' +
      '<h2>Lugares para explorar</h2><ul class="places">';
    sp.missions.forEach(function (id) {
      var m = M[id], s = st.missions[id];
      var lab = s && s.done ? '✓ Conexión activada' : (s && s.stage !== 'choice' ? 'En curso' : 'Por explorar');
      html += '<li><button type="button" class="place' + (s && s.done ? ' done' : '') + '"' + attr('openMission', id) + '>' + S.picto(m.icon, 36) +
        '<span><b>' + esc(m.title) + '</b><small>' + esc(m.teaser) + '</small></span><span class="badge' + (s && s.done ? ' ok' : '') + '">' + lab + '</span></button></li>';
    });
    html += '<li><button type="button" class="place final' + (allDone ? '' : ' locked') + '"' + attr('openMission', sp.final) + (allDone ? '' : ' aria-disabled="true"') + '>' + S.picto('estrella', 36) +
      '<span><b>' + esc(allDone ? fm.title : 'MISIÓN FINAL') + '</b><small>' + esc(allDone ? fm.teaser : sp.finalLocked) + '</small></span><span class="badge' + (fs && fs.done ? ' ok' : '') + '">' + (fs && fs.done ? '✓ Activada' : (allDone ? 'Disponible' : 'Bloqueada')) + '</span></button></li></ul>';
    html += '<p class="note">Secretos descubiertos: ' + st.secrets.length + ' de 5. Aparecen como detalles nuevos en el paisaje.</p>';
    if (fs && fs.done) html += '<button type="button" class="btn"' + attr('goClosing') + '>Ver el cierre</button> ';
    html += '<div class="row"><button type="button" class="btn"' + attr('goEntrada') + '>Volver a la entrada</button>' +
      '<button type="button" class="btn"' + attr('enterSpace', space === 'ninos' ? 'adultos' : 'ninos') + '>Ir al espacio de ' + (space === 'ninos' ? 'jóvenes y adultos' : 'niños') + '</button>' +
      '<button type="button" class="btn ghost"' + attr('askReset') + '>Reiniciar progreso</button></div>';
    return html;
  }

  /* =========================================================
     MISIONES
     ========================================================= */
  function unlocked(m, s, opt) { return !opt.unlockBy || s.consulted.indexOf(opt.unlockBy) >= 0; }

  function missionLayers(id) {
    var m = M[id], s = ms(id), T = m.transform, set = new Set(), t = s.t;
    var add = function (x) { if (x) String(x).split(' ').forEach(function (y) { if (y && y !== 'none') set.add(y); }); };
    if (T.type === 'toggle') t.sel.forEach(function (o) { var opt = T.options.filter(function (x) { return x.id === o; })[0]; add(opt && opt.layer ? opt.layer : o); });
    if (T.type === 'message') t.formats.forEach(function (f) { add('fmt-' + f); });
    if (T.type === 'voices') t.slots.forEach(function (a) { add('act-' + a); });
    if (T.type === 'zones') Object.keys(t.place).forEach(function (it) { add('z-' + it + '-' + t.place[it]); });
    if (T.type === 'control') T.decisions.forEach(function (d) { add(d.layers[t.modes[d.id]]); });
    if (T.type === 'domino') {
      t.chosen.forEach(add);
      if (s.result && (s.stage === 'test' || s.stage === 'reflect' || s.done)) {
        (s.result.resolved || []).forEach(function (c) { add(T.chainLayers[c]); });
        (s.result.opps || []).forEach(function (o) { add(o.layer); });
      }
    }
    if (T.type === 'repair') {
      var v = t.v;
      if (v.subtitulos !== 'ninguno') add('subtitulos');
      if (v.alt !== 'archivo') add('alt');
      if (v.claro === 'claro') add('claro');
      if (contrastOf(T, v.contraste) >= 4.5) add('contraste');
      if (v.formatos.length) add('formatos');
    }
    if (s.stage === 'test' || s.stage === 'reflect' || s.done) add('test');
    if (s.done) add('done');
    if (s.secret) add('secret');
    return set;
  }

  function sceneChanges(id) {
    var m = M[id], s = ms(id), T = m.transform, out = [];
    if (T.type === 'toggle') s.t.sel.forEach(function (o) { var opt = T.options.filter(function (x) { return x.id === o; })[0]; if (opt) out.push(opt.label.toLowerCase()); });
    if (T.type === 'domino') s.t.chosen.forEach(function (o) { var iv = T.interventions.filter(function (x) { return x.id === o; })[0]; if (iv) out.push(iv.label.toLowerCase()); });
    if (T.type === 'zones') Object.keys(s.t.place).forEach(function (it) { var item = T.items.filter(function (x) { return x.id === it; })[0], z = T.zones.filter(function (x) { return x.id === s.t.place[it]; })[0]; out.push(item.label.toLowerCase() + ' en ' + z.label.toLowerCase()); });
    if (T.type === 'voices') out.push('la tarde tiene: ' + s.t.slots.map(function (a) { return T.activities[a].text.toLowerCase(); }).join(', '));
    return out.length ? ' Cambios a la vista: ' + out.join('; ') + '.' : '';
  }

  function renderMission(id) {
    var m = M[id], s = ms(id), sp = SPACES[m.space];
    var hs = [];
    if (s.stage === 'explore') {
      m.explore.spots.forEach(function (sp2) {
        var f = s.found.indexOf(sp2.id) >= 0;
        hs.push({ anchor: sp2.anchor, label: sp2.label, act: 'explore', arg: sp2.id, icon: f ? '✓' : '?', cls: f ? 'hs-found' : 'hs-new', status: f ? 'explorado' : 'sin explorar' });
      });
    }
    if (!s.secret && m.secret) hs.push({ anchor: m.secret.anchor, label: m.secret.label, act: 'secret', arg: id, icon: '✦', cls: 'hs-secret' });
    setScene(m.scene, missionLayers(id), hs, S.get(m.scene).desc + sceneChanges(id));

    var html = spaceTag(m.space) +
      '<h1 id="panelTitle" tabindex="-1" class="say">' + esc(m.title) + '</h1>' +
      '<p class="intro say">' + esc(m.intro) + '</p>';
    html += stepper(s);
    html += '<div class="stage-body">';
    if (s.pause) html += renderPause(id);
    else if (s.stage === 'choice') html += renderChoice(m, s);
    else if (s.stage === 'explore') html += renderExplore(m, s);
    else if (s.stage === 'consult') html += renderConsult(m, s);
    else if (s.stage === 'transform') html += renderTransform(m, s);
    else if (s.stage === 'test') html += renderTest(m, s);
    else if (s.stage === 'reflect') html += renderReflect(m, s);
    html += '</div>';
    return html;
  }

  function stepper(s) {
    var idx = STEPS.indexOf(s.stage);
    return '<nav aria-label="Etapas de la misión"><ol class="stepper">' + UI.steps.map(function (label, i) {
      var cur = i === idx, reach = i <= s.maxStep;
      var cls = cur ? 'cur' : (reach ? 'done' : '');
      var inner = '<span class="n" aria-hidden="true">' + (i + 1) + '</span><span class="t">' + esc(label) + '</span>';
      if (reach && !cur) return '<li class="' + cls + '"><button type="button"' + attr('goStep', STEPS[i]) + '>' + inner + '<span class="sr-only"> (volver a esta etapa)</span></button></li>';
      return '<li class="' + cls + '"' + (cur ? ' aria-current="step"' : '') + '><span class="stp">' + inner + '</span></li>';
    }).join('') + '</ol></nav>';
  }
  function setStage(id, stage) {
    var s = ms(id); s.stage = stage; s.pause = false;
    var i = STEPS.indexOf(stage); if (i > s.maxStep) s.maxStep = i;
    save(); pendingFocus = '#stageTitle'; renderReason = 'route'; render();
    $('#panel').scrollTop = 0;
  }
  function group() { return state.settings.group; }

  function renderChoice(m, s) {
    return '<h2 id="stageTitle" tabindex="-1" class="say">ANTES DE EMPEZAR</h2>' +
      '<p class="say">' + esc(m.choice.q) + '</p>' +
      '<p class="note">' + (group() ? 'Elijan juntos una respuesta. ' : '') + 'Tu elección queda guardada para volver a mirarla al final. No hay respuestas buenas ni malas.</p>' +
      '<div class="chips" role="group" aria-label="Opciones">' + m.choice.options.map(function (o, i) {
        return '<button type="button" class="chip"' + attr('pickChoice', i) + pressed(s.choice === i) + '>' + esc(o) + '</button>';
      }).join('') + '</div>' +
      '<button type="button" class="btn primary"' + attr('startExplore') + (s.choice == null ? ' aria-disabled="true"' : '') + '>Empezar a explorar</button>';
  }

  function renderExplore(m, s) {
    var E = m.explore, total = E.spots.length;
    var html = '<h2 id="stageTitle" tabindex="-1" class="say">EXPLORAR</h2><p class="say">' + esc(E.prompt) + '</p>' +
      '<p class="count">Descubriste ' + s.found.length + ' de ' + total + '.</p><ul class="spots">';
    E.spots.forEach(function (sp2) {
      var f = s.found.indexOf(sp2.id) >= 0;
      html += '<li>';
      html += '<button type="button" class="spot' + (f ? ' found' : '') + '"' + attr('explore', sp2.id) + pressed(s.openSpot === sp2.id) + '><span aria-hidden="true">' + (f ? '✓' : '?') + '</span> ' + esc(sp2.label) + (f ? '<span class="sr-only"> (explorado)</span>' : '') + '</button>';
      if (f) {
        html += '<div class="discovery"><p class="say">' + esc(sp2.text) + '</p>';
        if (sp2.clue) html += clueCard(sp2, s);
        html += '</div>';
      }
      html += '</li>';
    });
    html += '</ul>';
    var all = s.found.length === total;
    html += '<button type="button" class="btn primary"' + attr('toConsult') + (all ? '' : ' aria-disabled="true"') + '>Seguir: escuchar y consultar</button>';
    if (!all) html += '<p class="note">Explorá todos los lugares para seguir.</p>';
    return html;
  }
  function clueCard(sp2, s) {
    var c = sp2.clue, mod = s.modality[sp2.id] || 'leer';
    var tabs = [['leer', 'Leer'], ['escuchar', 'Escuchar'], ['ver', 'Ver imagen']];
    var html = '<div class="clue"><div class="tabs" role="group" aria-label="Formas de acceder a la pista ' + c.n + '">' + tabs.map(function (t) {
      return '<button type="button" class="chip small"' + attr('modality', sp2.id + ':' + t[0]) + pressed(mod === t[0]) + '>' + t[1] + '</button>';
    }).join('') + '</div>';
    if (mod === 'leer') html += '<p class="clue-text say">' + esc(c.text) + '</p>';
    if (mod === 'escuchar') html += '<p class="note">Se reproduce en voz al tocar “Escuchar”. Lo que dice el audio:</p><p class="clue-text">' + esc(c.text) + '</p><button type="button" class="btn small"' + attr('speakClue', sp2.id) + '>Escuchar otra vez</button>';
    if (mod === 'ver') html += '<div class="clue-img">' + S.picto(c.picto, 96) + '<p>' + esc(c.img) + '<span class="pill">Pista ' + c.n + '</span></p></div>';
    return html + '</div>';
  }

  function renderConsult(m, s) {
    var C = m.consult, T = m.transform;
    var html = '<h2 id="stageTitle" tabindex="-1" class="say">ESCUCHAR Y CONSULTAR</h2><p class="say">' + esc(C.prompt) + '</p><ul class="people">';
    C.people.forEach(function (p) {
      var P = person(p.id), asked = s.consulted.indexOf(p.id) >= 0, waiting = p.wait && asked && s.waited.indexOf(p.id) < 0;
      html += '<li class="person' + (asked ? ' asked' : '') + '"><div class="who">' + S.avatar(P) + '<div><h3>' + esc(P.name) + '</h3><p class="about">' + esc(P.about) + '</p></div></div>';
      if (!asked) {
        html += '<button type="button" class="btn"' + attr('consult', p.id) + '>Consultar a ' + esc(P.name) + '</button>';
      } else if (waiting) {
        html += '<p class="thinking say">' + esc(p.thinking) + '</p><div class="row">' +
          '<button type="button" class="btn primary small"' + attr('wait', p.id) + '>Esperar su respuesta</button>' +
          '<button type="button" class="btn small"' + attr('skipWait', p.id) + '>Seguir sin esperar</button></div>' +
          (s.skipped.indexOf(p.id) >= 0 ? '<p class="note">Seguiste sin esperar. Podés volver a esperar cuando quieras.</p>' : '');
      } else {
        if (p.mode === 'pictogramas') {
          html += '<p class="say">' + esc(p.says) + '</p><div class="pictos" role="img" aria-label="Pictogramas: ' + p.pictos.join(', ') + '">' + p.pictos.map(function (x) { return '<span class="picto-card">' + S.picto(x, 52) + '<small>' + esc(x) + '</small></span>'; }).join('') + '</div>';
          html += interpretBlock(p, s);
        } else if (p.mode === 'gestos') {
          html += '<div class="gesture">' + S.picto('mano', 44) + '<p class="say">' + esc(p.gesture) + '</p></div>';
          html += interpretBlock(p, s);
        } else {
          html += '<blockquote class="say">' + esc(p.says) + '</blockquote>';
          if (p.idea) html += '<p class="idea"><b>Su idea:</b> ' + esc(p.idea) + '</p>';
        }
        var unl = unlocksOf(m, p);
        if (unl.length) html += '<p class="unlock" role="note">Apareció una posibilidad nueva: ' + esc(unl.join(' · ')) + '</p>';
      }
      html += '</li>';
    });
    html += '</ul><div class="row"><button type="button" class="btn"' + attr('goStep', 'explore') + '>Volver a explorar</button>' +
      '<button type="button" class="btn primary"' + attr('toTransform') + '>Seguir: transformar</button></div>';
    html += '<p class="note">Podés pasar a transformar en cualquier momento. Lo que no preguntes también tiene consecuencias.</p>';
    return html;
  }
  function interpretBlock(p, s) {
    var I = p.interpret, cur = s.interp[p.id];
    return '<fieldset class="interp"><legend>' + esc(I.q) + '</legend><div class="chips">' + I.options.map(function (o) {
      return '<button type="button" class="chip"' + attr('interp', p.id + ':' + o.id) + pressed(cur === o.id) + '>' + esc(o.text) + '</button>';
    }).join('') + '</div>' + (cur ? '<p class="note">Anotaste su propuesta: ' + esc(I.options.filter(function (o) { return o.id === cur; })[0].text) + '. Podés cambiarla.</p>' : '') + '</fieldset>';
  }
  function unlocksOf(m, p) {
    var T = m.transform, out = [];
    var lists = T.options || T.interventions || [];
    lists.forEach(function (o) { if (o.unlockBy === p.id) out.push(o.label); });
    if (T.tasks) T.tasks.forEach(function (t) { (t.options || []).forEach(function (o) { if (o.unlockBy === p.id) out.push(o.text); }); });
    return out;
  }

  /* ---------- TRANSFORMAR ---------- */
  function renderTransform(m, s) {
    var T = m.transform;
    var html = '<h2 id="stageTitle" tabindex="-1" class="say">TRANSFORMAR</h2><p class="say">' + esc(T.prompt) + '</p>';
    html += ({ toggle: tToggle, message: tMessage, voices: tVoices, zones: tZones, control: tControl, domino: tDomino, repair: tRepair })[T.type](m, s);
    if (s.msg) html += '<p class="feedback" role="status">' + esc(s.msg) + '</p>';
    html += hintBox(T.hints, s.hint, 'hint');
    var canTest = T.type !== 'domino' || s.t.classified;
    html += '<div class="row"><button type="button" class="btn"' + attr('goStep', 'consult') + '>Volver a consultar</button>' +
      (canTest ? '<button type="button" class="btn primary"' + attr('test') + '>Comprobar</button>' : '') + '</div>';
    return html;
  }
  function budgetOf(T, sel, key) {
    var list = T.options || T.interventions;
    return sel.reduce(function (a, id) { var o = list.filter(function (x) { return x.id === id; })[0]; return a + (o && o.cost ? o.cost : 0); }, 0);
  }
  function budgetBar(T, used) {
    var b = T.budget;
    return '<div class="budget"><p><b>Presupuesto:</b> usaste ' + used + ' de ' + b + ' puntos.</p><div class="bar" aria-hidden="true">' +
      Array.apply(null, Array(b)).map(function (_, i) { return '<span class="' + (i < used ? 'on' : '') + '"></span>'; }).join('') + '</div></div>';
  }
  function tToggle(m, s) {
    var T = m.transform, html = '';
    if (T.budget) html += budgetBar(T, budgetOf(T, s.t.sel));
    var vis = T.options.filter(function (o) { return unlocked(m, s, o); });
    var hidden = T.options.length - vis.length;
    html += '<div class="opts" role="group" aria-label="Cambios posibles">' + vis.map(function (o) {
      var on = s.t.sel.indexOf(o.id) >= 0;
      return '<button type="button" class="opt' + (o.unlockBy ? ' fresh' : '') + '"' + attr('toggleOpt', o.id) + pressed(on) + '>' +
        '<span class="mark" aria-hidden="true">' + (on ? '✓' : '+') + '</span><span class="lbl">' + esc(o.label) +
        (o.unlockBy ? '<small>Idea surgida al consultar a ' + esc(person(o.unlockBy).name) + '</small>' : '') + '</span>' +
        (T.budget ? '<span class="cost">' + (o.cost || 0) + ' ' + ((o.cost || 0) === 1 ? 'punto' : 'puntos') + '</span>' : '') + '</button>';
    }).join('') + '</div>';
    if (hidden) html += '<p class="note">Hay ' + hidden + (hidden === 1 ? ' cambio más que aparece' : ' cambios más que aparecen') + ' cuando consultás a las personas.</p>';
    return html;
  }
  function tMessage(m, s) {
    var T = m.transform, html = '<h3>1. Armá el mensaje</h3>';
    T.slots.forEach(function (sl, i) {
      html += '<fieldset class="slotset"><legend>Pista ' + (i + 1) + ' · ' + esc(sl.label) + '</legend><div class="chips">' + sl.options.map(function (o) {
        return '<button type="button" class="chip picto-chip"' + attr('msgSlot', sl.id + ':' + o.id) + pressed(s.t.slots[sl.id] === o.id) + '>' + S.picto(o.picto, 32) + '<span>' + esc(o.text) + '</span></button>';
      }).join('') + '</div></fieldset>';
    });
    html += '<div class="preview"><p class="note">Así queda el mensaje:</p><p class="msgline say">' + esc(messageText(T, s)) + '</p></div>';
    html += '<h3>2. ¿De qué formas lo compartís?</h3><div class="opts">' + T.formats.map(function (f) {
      var on = s.t.formats.indexOf(f.id) >= 0;
      return '<button type="button" class="opt"' + attr('msgFormat', f.id) + pressed(on) + '><span class="mark" aria-hidden="true">' + (on ? '✓' : '+') + '</span>' + S.picto(f.picto, 30) + '<span class="lbl">' + esc(f.label) + '</span></button>';
    }).join('') + '</div>';
    return html;
  }
  function messageText(T, s) {
    var g = function (id) { var sl = T.slots.filter(function (x) { return x.id === id; })[0]; var o = sl.options.filter(function (x) { return x.id === s.t.slots[id]; })[0]; return o ? o.text.toLowerCase() : '…'; };
    return 'Nos vemos ' + g('donde').replace(/^en /, 'en ') + ', ' + g('cuando') + '. Traé: ' + g('que') + '.';
  }
  function voicesPool(m, s) {
    var pool = ['futbol'];
    m.consult.people.forEach(function (p) {
      if (s.consulted.indexOf(p.id) < 0) return;
      if (p.interpret) { if (s.interp[p.id] && pool.indexOf(s.interp[p.id]) < 0) pool.push(s.interp[p.id]); }
      else if (p.proposal && (!p.wait || s.waited.indexOf(p.id) >= 0) && pool.indexOf(p.proposal) < 0) pool.push(p.proposal);
    });
    return pool;
  }
  function tVoices(m, s) {
    var T = m.transform, pool = voicesPool(m, s);
    var html = '<p class="note">Propuestas recogidas: ' + pool.map(function (a) { return T.activities[a].text; }).join(' · ') + '.</p>';
    if (pool.length < 4) html += '<p class="note">Con pocas propuestas, la tarde se parece a lo que dijo una sola voz. Podés volver a consultar.</p>';
    html += '<ol class="blocks">' + T.slots.map(function (lab, i) {
      var cur = s.t.slots[i];
      var opts = pool.slice(); if (opts.indexOf(cur) < 0) opts.unshift(cur);
      return '<li><label for="blk' + i + '">' + esc(lab) + '</label><span class="blk-picto" aria-hidden="true">' + S.picto(T.activities[cur].picto, 34) + '</span>' +
        '<select id="blk' + i + '" data-change="voiceSlot" data-arg="' + i + '">' + opts.map(function (a) { return '<option value="' + a + '"' + (a === cur ? ' selected' : '') + '>' + esc(T.activities[a].text) + '</option>'; }).join('') + '</select></li>';
    }).join('') + '</ol>';
    return html;
  }
  function tZones(m, s) {
    var T = m.transform;
    var html = '<table class="zones-table"><caption>Zonas y cómo son</caption><thead><tr><th scope="col">Zona</th><th scope="col">Cómo es</th></tr></thead><tbody>' +
      T.zones.map(function (z) { return '<tr><th scope="row">' + esc(z.label) + '</th><td>' + (s.found.indexOf(z.id) >= 0 ? esc(z.trait) : 'Explorala para saber') + '</td></tr>'; }).join('') + '</tbody></table>';
    html += '<ul class="items">' + T.items.map(function (it) {
      var cur = s.t.place[it.id] || '';
      return '<li><label for="zn-' + it.id + '">' + S.picto(it.picto, 30) + '<span><b>' + esc(it.label) + '</b><small>Aporte de ' + esc(person(it.owner).name) + '</small></span></label>' +
        '<select id="zn-' + it.id + '" data-change="zone" data-arg="' + it.id + '"><option value=""' + (cur ? '' : ' selected') + '>Sin ubicar</option>' +
        T.zones.map(function (z) { var who = Object.keys(s.t.place).filter(function (k) { return s.t.place[k] === z.id && k !== it.id; })[0]; return '<option value="' + z.id + '"' + (cur === z.id ? ' selected' : '') + '>' + esc(z.label) + (who ? ' (ocupada: se intercambia)' : '') + '</option>'; }).join('') +
        '</select></li>';
    }).join('') + '</ul>';
    return html;
  }
  function tControl(m, s) {
    var T = m.transform, html = '';
    T.decisions.forEach(function (d) {
      var cur = s.t.modes[d.id];
      html += '<fieldset class="decision"><legend>' + esc(d.label) + ' <small>Afecta a ' + d.affects.map(function (p) { return person(p).name; }).join(' y ') + '</small></legend><div class="chips">' +
        T.modes.map(function (mo) {
          var need = mo.id === 'consultar' ? d.affects.filter(function (p) { return s.consulted.indexOf(p) < 0; }) : [];
          return '<button type="button" class="chip"' + attr('mode', d.id + ':' + mo.id) + pressed(cur === mo.id) + (need.length ? ' aria-disabled="true"' : '') + '>' + esc(mo.label) +
            (need.length ? '<small> (primero consultá a ' + need.map(function (p) { return person(p).name; }).join(' y ') + ')</small>' : '') + '</button>';
        }).join('') + '</div><p class="plan"><b>Plan:</b> ' + esc(d.plans[cur]) + '</p></fieldset>';
    });
    return html;
  }
  function tDomino(m, s) {
    var T = m.transform, t = s.t, html = '<div class="barrier"><b>Barrera:</b> ' + esc(T.barrier) + '</div>';
    html += '<h3>1. ¿Qué fichas hace caer esta barrera?</h3><p class="note">Marcá cada ficha. Después revisá las relaciones.</p><ul class="cons">';
    T.consequences.forEach(function (c) {
      var mk = t.marks[c.id];
      var right = t.checked ? (mk === c.real) : null;
      html += '<li class="con' + (right === true ? ' right' : right === false ? ' wrong' : '') + '"><p>' + esc(c.text) + '</p><div class="chips">' +
        '<button type="button" class="chip small"' + attr('mark', c.id + ':1') + pressed(mk === true) + '>Es consecuencia</button>' +
        '<button type="button" class="chip small"' + attr('mark', c.id + ':0') + pressed(mk === false) + '>No tiene relación</button></div>' +
        (t.checked && mk != null ? '<p class="why">' + (right ? '✓ ' : '✗ Revisalo: ') + esc(c.why) + (c.causedBy ? ' (Cae si caen: ' + c.causedBy.map(function (x) { return T.consequences.filter(function (k) { return k.id === x; })[0].text.toLowerCase(); }).join(' + ') + ')' : '') + '</p>' : '') + '</li>';
    });
    html += '</ul>';
    if (!t.classified) html += '<button type="button" class="btn"' + attr('checkMarks') + '>Revisar relaciones</button>';
    else {
      var used = budgetOf(T, t.chosen);
      html += '<h3>2. Elegí intervenciones</h3>' + budgetBar(T, used) + '<div class="opts">' +
        T.interventions.filter(function (o) { return unlocked(m, s, o); }).map(function (o) {
          var on = t.chosen.indexOf(o.id) >= 0;
          return '<button type="button" class="opt' + (o.unlockBy ? ' fresh' : '') + '"' + attr('intervene', o.id) + pressed(on) + '><span class="mark" aria-hidden="true">' + (on ? '✓' : '+') + '</span><span class="lbl">' + esc(o.label) +
            (o.unlockBy ? '<small>Surgió al consultar a ' + esc(person(o.unlockBy).name) + '</small>' : '') + (o.note ? '<small>' + esc(o.note) + '</small>' : '') + '</span><span class="cost">' + o.cost + ' ' + (o.cost === 1 ? 'punto' : 'puntos') + '</span></button>';
        }).join('') + '</div>';
      var hid = T.interventions.filter(function (o) { return !unlocked(m, s, o); }).length;
      if (hid) html += '<p class="note">Hay ' + hid + ' intervenciones más que aparecen al consultar.</p>';
    }
    return html;
  }
  function luminance(hex) {
    var c = hex.replace('#', ''), rgb = [0, 2, 4].map(function (i) { var v = parseInt(c.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  function ratio(a, b) { var l1 = luminance(a), l2 = luminance(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  function contrastOf(T, id) { var task = T.tasks.filter(function (t) { return t.kind === 'contrast'; })[0]; var o = task.options.filter(function (x) { return x.id === id; })[0]; return o ? ratio(o.fg, o.bg) : 0; }
  function tRepair(m, s) {
    var T = m.transform, v = s.t.v;
    var html = repairPreview(T, v);
    T.tasks.forEach(function (task) {
      html += '<fieldset class="task"><legend>' + esc(task.label) + '</legend>';
      if (task.kind === 'choice') {
        html += '<div class="choices">' + task.options.map(function (o) {
          return '<button type="button" class="choice"' + attr('repair', task.id + ':' + o.id) + pressed(v[task.id] === o.id) + '><span class="mark" aria-hidden="true">' + (v[task.id] === o.id ? '●' : '○') + '</span><span>' + esc(o.text) + '</span></button>';
        }).join('') + '</div>';
      } else if (task.kind === 'contrast') {
        html += '<div class="swatches">' + task.options.map(function (o) {
          var r = ratio(o.fg, o.bg), okk = r >= task.threshold;
          return '<button type="button" class="swatch"' + attr('repair', task.id + ':' + o.id) + pressed(v[task.id] === o.id) + '>' +
            '<span class="sample" aria-hidden="true" style="color:' + o.fg + ';background:' + o.bg + '">Feria del Barrio</span>' +
            '<span class="sw-txt">' + esc(o.text) + '<small>Contraste ' + fmtNum(r) + ' a 1 · ' + (okk ? '✓ suficiente' : '✗ insuficiente') + '</small></span></button>';
        }).join('') + '</div><p class="note">Para texto de tamaño normal se recomienda un contraste de al menos 4,5 a 1.</p>';
      } else if (task.kind === 'multi') {
        html += '<div class="opts">' + task.options.filter(function (o) { return unlocked(m, s, o); }).map(function (o) {
          var on = v[task.id].indexOf(o.id) >= 0;
          return '<button type="button" class="opt' + (o.unlockBy ? ' fresh' : '') + '"' + attr('repairMulti', task.id + ':' + o.id) + pressed(on) + '><span class="mark" aria-hidden="true">' + (on ? '✓' : '+') + '</span><span class="lbl">' + esc(o.text) + (o.unlockBy ? '<small>Surgió al consultar a ' + esc(person(o.unlockBy).name) + '</small>' : '') + '</span></button>';
        }).join('') + '</div>';
        var hid = task.options.filter(function (o) { return !unlocked(m, s, o); }).length;
        if (hid) html += '<p class="note">Hay ' + hid + ' formatos más que aparecen al consultar.</p>';
      }
      html += '</fieldset>';
    });
    return html;
  }
  function repairPreview(T, v) {
    var get = function (tid) { var task = T.tasks.filter(function (t) { return t.id === tid; })[0]; return task.options.filter(function (o) { return o.id === v[tid]; })[0]; };
    var col = get('contraste'), r = ratio(col.fg, col.bg);
    var sub = v.subtitulos === 'revisados' ? '[Música suave] Locutora: La Feria del Barrio es el sábado 12, de 16 a 20 h.' : v.subtitulos === 'auto' ? 'la feria del varrio es el savado 12 a las 6' : 'Sin subtítulos';
    return '<section class="post" aria-label="Vista previa de la publicación, como objeto de análisis">' +
      '<p class="note">Vista previa de la publicación (objeto de análisis)</p>' +
      '<div class="post-title" aria-hidden="true" style="color:' + col.fg + ';background:' + col.bg + '">Feria del Barrio</div>' +
      '<p class="meta">Título “Feria del Barrio” · contraste ' + fmtNum(r) + ' a 1</p>' +
      '<div class="post-media"><figure><div class="poster" aria-hidden="true">' + S.picto('plaza', 54) + '</div><figcaption>Texto alternativo: «' + esc(get('alt').text) + '»</figcaption></figure>' +
      '<figure><div class="video" aria-hidden="true"><span class="play">▶</span>' + (v.subtitulos !== 'ninguno' ? '<span class="cc">' + esc(sub) + '</span>' : '') + '</div><figcaption>Video: ' + esc(sub) + '</figcaption></figure></div>' +
      '<p class="post-text">' + esc(get('claro').text) + '</p>' +
      '<p class="meta">Otras formas: ' + (v.formatos.length ? v.formatos.map(function (f) { return T.tasks.filter(function (t) { return t.id === 'formatos'; })[0].options.filter(function (o) { return o.id === f; })[0].text; }).join(', ') : 'ninguna') + '</p></section>';
  }

  /* ---------- EVALUAR ---------- */
  function evaluate(id) {
    var m = M[id], s = ms(id), T = m.transform, t = s.t;
    var res = { ok: false, people: [], effects: [], pending: [], extra: '' };
    if (T.type === 'toggle') {
      var sel = new Set(t.sel), cats = {};
      Object.keys(T.categories || {}).forEach(function (c) { cats[c] = true; });
      res.people = T.people.map(function (p) {
        var lines = [], ok = true;
        p.needs.forEach(function (n) {
          var has = n.any.some(function (a) { return sel.has(a); });
          lines.push({ ok: has, text: has ? n.ok : n.miss });
          if (!has) { ok = false; if (n.cat) cats[n.cat] = false; }
        });
        (p.harms || []).forEach(function (h) { if (sel.has(h.id)) { ok = false; lines.push({ ok: false, text: h.text }); if (T.categories) cats.decision = false; } });
        return { id: p.id, ok: ok, lines: lines };
      });
      res.effects = T.options.filter(function (o) { return o.effect && sel.has(o.id); }).map(function (o) { return o.effect; });
      if (T.categories) res.dashboard = Object.keys(T.categories).map(function (c) { return { label: T.categories[c], ok: cats[c] }; });
      res.pending = (T.pending || []).filter(function (pn) { return pn.not ? sel.has(pn.not) : !pn.any.some(function (a) { return sel.has(a); }); }).map(function (pn) { return pn.text; });
      if (T.budget) res.plan = t.sel.map(function (oid) {
        var o = T.options.filter(function (x) { return x.id === oid; })[0];
        var serves = T.people.filter(function (p) { return p.needs.some(function (n) { return n.any.indexOf(oid) >= 0; }); }).map(function (p) { return person(p.id).name; });
        var harms = T.people.filter(function (p) { return (p.harms || []).some(function (h) { return h.id === oid; }); }).map(function (p) { return person(p.id).name; });
        return { label: o.label, cost: o.cost || 0, serves: serves, harms: harms };
      });
      t.sel.forEach(function (o) { s.ever[o] = true; });
    } else if (T.type === 'message') {
      var wrong = T.slots.filter(function (sl) { return t.slots[sl.id] !== sl.answer; });
      res.people = T.people.map(function (p) {
        var has = t.formats.indexOf(p.format) >= 0, lines = [{ ok: has, text: has ? p.ok : p.miss }];
        if (has && wrong.length) lines.push({ ok: false, text: 'Le llegó el mensaje, pero con datos equivocados: ' + wrong.map(function (w) { return w.label; }).join(', ') + '.' });
        return { id: p.id, ok: has && !wrong.length, lines: lines };
      });
      res.extra = '<div class="preview"><p class="note">Mensaje compartido:</p><p class="msgline">' + esc(messageText(T, s)) + '</p><p class="note">Formas: ' + (t.formats.length ? t.formats.map(function (f) { return T.formats.filter(function (x) { return x.id === f; })[0].label.toLowerCase(); }).join(', ') : 'ninguna todavía') + '.</p></div>';
      if (wrong.length) res.effects.push('El mensaje todavía tiene ' + wrong.length + (wrong.length === 1 ? ' parte que no coincide' : ' partes que no coinciden') + ' con las pistas.');
    } else if (T.type === 'voices') {
      var slots = t.slots;
      var misread = false;
      res.people = T.people.map(function (p) {
        var inc = slots.indexOf(p.wants) >= 0, lines = [];
        var pc = m.consult.people.filter(function (x) { return x.id === p.id; })[0];
        var wrongI = pc.interpret && s.interp[p.id] && s.interp[p.id] !== p.wants;
        if (wrongI) misread = true;
        if (inc) lines.push({ ok: true, text: p.ok });
        else if (wrongI && slots.indexOf(s.interp[p.id]) >= 0) lines.push({ ok: false, text: p.wrong });
        else lines.push({ ok: false, text: p.miss });
        return { id: p.id, ok: inc, lines: lines };
      });
      if (misread) s.flags.misread = true;
      var fut = slots.filter(function (a) { return a === 'futbol'; }).length;
      if (fut > 1) res.effects.push('Hay ' + fut + ' bloques de fútbol: la tarde se parece a lo que dijo la voz más rápida.');
    } else if (T.type === 'zones') {
      res.people = T.items.map(function (it) {
        var z = t.place[it.id], ok = z === it.fits;
        return { id: it.owner, ok: ok, lines: [{ ok: ok, text: ok ? it.ok : (z ? it.miss[z] : 'Su aporte todavía no tiene lugar.') }] };
      });
    } else if (T.type === 'control') {
      res.people = [];
      T.decisions.forEach(function (d) {
        var mode = t.modes[d.id];
        if (mode === 'decidir') s.flags.decidir = true;
        if (mode === 'decidir' && d.id === 'rol') s.flags['rol-decidir'] = true;
        d.affects.forEach(function (pid) {
          var r = d.results[pid][mode];
          if (r[0] === 1) s.flags.asiste = true;
          res.people.push({ id: pid, ok: r[0] === 3, level: r[0], lines: [{ ok: r[0] === 3, text: r[1] }] });
        });
      });
      res.extra = '<div class="preview"><p class="note">Plan final:</p><ul class="plain">' + T.decisions.map(function (d) { return '<li><b>' + esc(d.label) + '</b> ' + esc(d.plans[t.modes[d.id]]) + '</li>'; }).join('') + '</ul></div>';
    } else if (T.type === 'domino') {
      var resolved = new Set();
      t.chosen.forEach(function (iid) { T.interventions.filter(function (x) { return x.id === iid; })[0].resolves.forEach(function (c) { resolved.add(c); }); });
      var changed = true;
      while (changed) {
        changed = false;
        T.consequences.forEach(function (c) { if (c.real && c.causedBy && !resolved.has(c.id) && c.causedBy.every(function (x) { return resolved.has(x); })) { resolved.add(c.id); changed = true; } });
      }
      res.resolved = Array.from(resolved);
      res.opps = T.opportunities.filter(function (o) { return resolved.has(o.after); });
      res.people = T.people.map(function (p) { var ok = resolved.has(p.needs); return { id: p.id, ok: ok, lines: [{ ok: ok, text: ok ? p.ok : p.miss }] }; });
      t.chosen.forEach(function (iid) { s.ever[iid] = true; var iv = T.interventions.filter(function (x) { return x.id === iid; })[0]; if (iv.limits) res.effects.push(iv.limits); });
      var reals = T.consequences.filter(function (c) { return c.real; });
      res.extra = '<ol class="chain">' + reals.map(function (c) {
        var ok = resolved.has(c.id);
        return '<li class="' + (ok ? 'open' : 'stuck') + '"><span class="tag">' + (ok ? '✓ Se destrabó' : '✗ Sigue cayendo') + '</span> ' + esc(c.text) + '</li>';
      }).join('') + '</ol>' + (res.opps.length ? '<h3>Oportunidades que se abrieron</h3><ul class="plain">' + res.opps.map(function (o) { return '<li>' + esc(o.text) + '</li>'; }).join('') + '</ul>' : '<p class="note">Todavía no se abrió ninguna oportunidad nueva.</p>');
      res.allChain = reals.every(function (c) { return resolved.has(c.id); });
    } else if (T.type === 'repair') {
      var v = t.v;
      var check = function (c) {
        if (c.eq != null) return v[c.task] === c.eq;
        if (c.min != null) return contrastOf(T, v[c.task]) >= c.min;
        if (c.has != null) return v[c.task].indexOf(c.has) >= 0;
        return false;
      };
      res.people = T.people.map(function (p) {
        var lines = [], ok = true;
        p.needs.forEach(function (n) { var has = n.any.some(check); lines.push({ ok: has, text: has ? n.ok : n.miss }); if (!has) ok = false; });
        return { id: p.id, ok: ok, lines: lines };
      });
      T.tasks.forEach(function (task) {
        var vals = [].concat(v[task.id]);
        (task.options || []).forEach(function (o) { if (o.note && vals.indexOf(o.id) >= 0) res.effects.push(o.note); });
      });
    }
    res.okCount = res.people.filter(function (p) { return p.ok; }).length;
    res.ok = res.people.every(function (p) { return p.ok; }) && (T.type !== 'domino' || res.allChain);
    res.people.forEach(function (p) { if (!p.ok) s.failed[p.id] = true; });
    return res;
  }

  function renderTest(m, s) {
    var T = m.transform, r = s.result;
    if (!r) { r = s.result = evaluate(M2id(m)); }
    var total = r.people.length;
    var html = '<h2 id="stageTitle" tabindex="-1" class="say">COMPROBAR</h2>';
    html += '<p class="summary say ' + (r.ok ? 'ok' : 'no') + '">' + (r.ok ? '¡Funcionó para todas las personas!' : r.okCount + ' de ' + total + ' personas ya pueden ser parte. Falta ajustar.') + '</p>';
    if (r.dashboard) html += '<ul class="dash" aria-label="Barreras">' + r.dashboard.map(function (d) { return '<li class="' + (d.ok ? 'ok' : 'no') + '"><span aria-hidden="true">' + (d.ok ? '✓' : '✗') + '</span> ' + esc(d.label) + '<span class="sr-only">' + (d.ok ? ': resuelta' : ': pendiente') + '</span></li>'; }).join('') + '</ul>';
    html += '<ul class="results">' + r.people.map(function (p) {
      var P = person(p.id);
      var lv = p.level != null ? '<div class="levels" role="img" aria-label="Nivel: ' + T.levels[p.level] + '">' + T.levels.map(function (l, i) { return '<span class="' + (i === p.level ? 'cur' : i < p.level ? 'past' : '') + '">' + esc(l) + '</span>'; }).join('') + '</div>' : '';
      return '<li class="result ' + (p.ok ? 'ok' : 'no') + '"><div class="who">' + S.avatar(P) + '<div><h3>' + esc(P.name) + '</h3><p class="status"><span aria-hidden="true">' + (p.ok ? '✓' : '✗') + '</span> ' + esc(p.ok ? T.okWord : (p.level != null ? T.levels[p.level] : T.noWord)) + '</p></div></div>' + lv +
        '<ul class="lines">' + p.lines.map(function (l) { return '<li class="' + (l.ok ? 'ok' : 'no') + '"><span aria-hidden="true">' + (l.ok ? '✓' : '✗') + '</span> <span class="say">' + esc(l.text) + '</span></li>'; }).join('') + '</ul></li>';
    }).join('') + '</ul>';
    if (r.extra) html += r.extra;
    if (r.effects.length) html += '<h3>Otras consecuencias</h3><ul class="plain">' + r.effects.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
    if (r.plan && r.ok) {
      html += '<h3>Tu plan y a quién sirve</h3><ul class="plain plan-list">' + r.plan.map(function (p) {
        return '<li><b>' + esc(p.label) + '</b> (' + p.cost + ' ' + (p.cost === 1 ? 'punto' : 'puntos') + '): ' + (p.serves.length ? 'sirve a ' + esc(p.serves.join(', ')) : 'no resuelve una necesidad de las personas consultadas') + (p.harms.length ? '; limita a ' + esc(p.harms.join(', ')) : '') + '.</li>';
      }).join('') + '</ul>';
    }
    if (T.pending) html += '<h3>Asuntos pendientes</h3>' + (r.pending.length ? '<ul class="plain pending">' + r.pending.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '<p>No quedan asuntos pendientes en esta lista. Siempre aparecen otros: seguí preguntando.</p>');
    if (r.ok && T.prioritiesQ) {
      html += '<fieldset class="q"><legend>' + esc(T.prioritiesQ.q) + '</legend><div class="chips">' + T.prioritiesQ.options.map(function (o, i) { return '<button type="button" class="chip"' + attr('answer', 'prio:' + i) + pressed(s.answers.prio === i) + '>' + esc(o) + '</button>'; }).join('') + '</div><p class="note">Hay varias soluciones válidas: lo importante es poder explicar por qué elegiste la tuya.</p></fieldset>';
    }
    html += '<div class="row">';
    if (r.ok) html += '<button type="button" class="btn primary"' + attr('toReflect') + '>Seguir: reflexionar</button><button type="button" class="btn"' + attr('goStep', 'transform') + '>Probar otra solución</button>';
    else html += '<button type="button" class="btn primary"' + attr('goStep', 'transform') + '>Ajustar la transformación</button><button type="button" class="btn"' + attr('goStep', 'consult') + '>Volver a consultar</button>';
    html += '</div>';
    if (!r.ok) html += '<p class="note">Podés probar todas las veces que quieras. Las pistas no restan nada.</p>';
    return html;
  }
  function M2id(m) { for (var k in M) if (M[k] === m) return k; return null; }

  /* ---------- REFLEXIONAR + CAMBIÉ DE IDEA ---------- */
  function phraseOk(w, s) {
    if (!w || w.always) return true;
    if (w.consultedAny) return s.consulted.length > 0;
    if (w.everSelected) return !!s.ever[w.everSelected];
    if (w.failed) return !!s.failed[w.failed];
    if (w.failedAny) return Object.keys(s.failed).length > 0;
    if (w.flag) return !!s.flags[w.flag];
    return false;
  }
  function renderReflect(m, s) {
    var R = m.reflect;
    var html = '<h2 id="stageTitle" tabindex="-1" class="say">REFLEXIONAR</h2>';
    if (group()) html += '<p class="note">Conversen en grupo antes de elegir. No hay respuestas correctas.</p>';
    R.questions.forEach(function (q, qi) {
      html += '<fieldset class="q"><legend class="say">' + esc(q.q) + '</legend><div class="chips">' + q.options.map(function (o, i) {
        return '<button type="button" class="chip"' + attr('answer', qi + ':' + i) + pressed(s.answers[qi] === i) + '>' + esc(o) + '</button>';
      }).join('') + '</div></fieldset>';
    });
    var ph = R.phrases.filter(function (p) { return phraseOk(p.when, s); }).slice(0, 3);
    if (ph.length) html += '<div class="phrases">' + ph.map(function (p) { return '<blockquote class="phrase say">' + esc(p.text) + '</blockquote>'; }).join('') + '</div>';
    // Cambié de idea
    var orig = m.choice.options[s.choice];
    html += '<section class="change" aria-labelledby="chgTitle"><h3 id="chgTitle">CAMBIÉ DE IDEA</h3>' +
      '<p class="say">Antes de empezar elegiste: <b>«' + esc(orig) + '»</b>.</p>' +
      (s.revisedChoice != null ? '<p class="say">Ahora elegís: <b>«' + esc(m.choice.options[s.revisedChoice]) + '»</b>.</p>' : '') +
      '<p class="say">' + esc(UI.changeMind) + '</p><div class="row">' +
      '<button type="button" class="btn"' + attr('keepChoice') + pressed(s.kept === true) + '>La mantengo</button>' +
      '<button type="button" class="btn"' + attr('changeChoice') + pressed(s.changing || s.kept === false) + '>La cambio</button>' +
      '<button type="button" class="btn"' + attr('retry') + '>Volver a probar la misión</button></div>';
    if (s.changing) html += '<div class="chips" role="group" aria-label="Nueva elección">' + m.choice.options.map(function (o, i) { return '<button type="button" class="chip"' + attr('revise', i) + pressed(s.revisedChoice === i) + '>' + esc(o) + '</button>'; }).join('') + '</div>';
    html += '<fieldset class="q"><legend>¿Qué descubriste?</legend><div class="chips">' + DISCOVERIES.map(function (o, i) { return '<button type="button" class="chip"' + attr('discover', i) + pressed(s.discovery === i) + '>' + esc(o) + '</button>'; }).join('') + '</div></fieldset>' +
      '<p class="note">Cambiar de idea también es aprender. Nadie te califica.</p></section>';
    html += '<button type="button" class="btn primary big"' + attr('finish') + '>' + (s.done ? 'Volver al mapa' : 'Activar la conexión') + '</button>';
    return html;
  }

  function renderPause(id) {
    return '<section class="pause" aria-labelledby="stageTitle"><h2 id="stageTitle" tabindex="-1" class="say">PAUSA PARA CONVERSAR</h2>' +
      '<p class="say">' + esc(UI.groupPause) + '</p>' +
      '<div class="row"><button type="button" class="btn primary"' + attr('confirmTest') + '>Ya conversamos: comprobar</button>' +
      '<button type="button" class="btn"' + attr('cancelPause') + '>Seguir ajustando</button></div></section>';
  }

  function hintBox(hints, level, act) {
    var html = '<div class="hints">';
    for (var i = 0; i < level; i++) html += '<p class="hint say"><b>Pista ' + (i + 1) + ':</b> ' + esc(hints[i]) + '</p>';
    if (level < hints.length) html += '<button type="button" class="btn small ghost"' + attr(act) + '>Pedir una pista (' + (level + 1) + ' de ' + hints.length + ')</button><span class="note"> Pedir ayuda no resta nada.</span>';
    return html + '</div>';
  }

  /* ---------- CIERRE ---------- */
  function renderClosing(space) {
    var sp = SPACES[space], st = state.spaces[space];
    setScene(sp.scene, hubLayers(space), [], S.get(sp.scene).desc + ' Todo el mundo está encendido, también el faro.');
    var html = spaceTag(space) + '<h1 id="panelTitle" tabindex="-1" class="say">¡MUNDO ACTIVADO!</h1>' +
      '<p class="say">Activaste las cinco conexiones. Cada cambio sigue a la vista en el paisaje.</p>';
    html += '<h2>Tus ideas, antes y después</h2><ul class="plain ideas">' + sp.missions.concat([sp.final]).map(function (id) {
      var m = M[id], s = st.missions[id];
      if (!s || s.choice == null) return '';
      var after = s.revisedChoice != null ? 'la cambiaste por «' + m.choice.options[s.revisedChoice] + '»' : (s.kept ? 'la mantuviste' : 'no la revisaste');
      return '<li><b>' + esc(m.title) + ':</b> elegiste «' + esc(m.choice.options[s.choice]) + '» y ' + esc(after) + '.</li>';
    }).join('') + '</ul>';
    html += '<blockquote class="phrase big say">' + esc(sp.closingQuestion) + '</blockquote>';
    html += '<fieldset class="q"><legend>Elegí una o más ideas para empezar</legend><div class="chips">' + sp.closingIdeas.map(function (o, i) {
      return '<button type="button" class="chip"' + attr('closeIdea', i) + pressed(st.closing.ideas.indexOf(i) >= 0) + '>' + esc(o) + '</button>';
    }).join('') + '</div></fieldset>';
    html += '<label class="free" for="freeIdea">Si querés, escribí tu propia idea. <small>Se queda solo en pantalla: no se guarda.</small></label><textarea id="freeIdea" rows="3"></textarea>';
    html += '<div class="row"><button type="button" class="btn primary"' + attr('goHub') + '>Volver al mapa</button>' +
      '<button type="button" class="btn"' + attr('enterSpace', space === 'ninos' ? 'adultos' : 'ninos') + '>Ir al otro espacio</button>' +
      '<button type="button" class="btn"' + attr('goEntrada') + '>Volver a la entrada</button></div>';
    return html;
  }

  /* =========================================================
     ACCIONES
     ========================================================= */
  function cur() { return state.route.id; }
  function rerender() { save(); render(); }
  var A = {
    goEntrada: function () { go({ name: 'entrada' }); },
    goHub: function () { go({ name: 'hub', space: state.route.space }); },
    goClosing: function () { go({ name: 'closing', space: state.route.space }); },
    setGroup: function (v) { state.settings.group = v === '1'; applySettings(); rerender(); announce(state.settings.group ? 'Modo grupal activado.' : 'Modo individual activado.'); },
    enterSpace: function (space) {
      var it = state.spaces[space].intro;
      if (it.done) go({ name: 'hub', space: space }); else go({ name: 'intro', space: space });
    },
    introStart: function () { var sp = state.route.space; state.spaces[sp].intro.stage = 'play'; save(); pendingFocus = '#panelTitle'; renderReason = 'route'; render(); },
    introDone: function () { var sp = state.route.space; state.spaces[sp].intro.done = true; state.spaces[sp].intro.stage = 'lit'; go({ name: 'hub', space: sp }); toast('Se abrieron cuatro misiones. Elegí por dónde empezar.'); },
    introHint: function () { var it = state.spaces[state.route.space].intro; it.hint++; rerender(); },
    findPiece: function (pid) {
      var sp = state.route.space, it = state.spaces[sp].intro, I = SPACES[sp].intro;
      if (it.pieces[pid]) { it.sel = it.pieces[pid] === 'found' ? pid : it.sel; rerender(); return; }
      var p = I.pieces.filter(function (x) { return x.id === pid; })[0];
      it.pieces[pid] = 'found'; it.sel = pid; it.msg = p.foundText + ' Ya está seleccionada: elegí dónde colocarla.';
      announce(it.msg); save(); pendingFocus = '[data-act="selPiece"][data-arg="' + pid + '"]'; render();
    },
    selPiece: function (pid) { var it = state.spaces[state.route.space].intro; it.sel = it.sel === pid ? null : pid; it.msg = ''; rerender(); },
    placePiece: function (slot) { placePiece(state.route.space, slot); },
    findClue: function (cid) {
      var sp = state.route.space, it = state.spaces[sp].intro, I = SPACES[sp].intro;
      if (it.clues.indexOf(cid) < 0) it.clues.push(cid);
      var c = I.clues.filter(function (x) { return x.id === cid; })[0];
      announce(c.name + ': ' + c.text); rerender();
    },
    setCode: function (arg) { var p = arg.split(':'), it = state.spaces[state.route.space].intro; it.code[+p[0]] = p[1]; it.msg = ''; rerender(); },
    tryCode: function () {
      var sp = state.route.space, it = state.spaces[sp].intro, I = SPACES[sp].intro;
      if (it.code.some(function (c) { return !c; })) { it.msg = 'Elegí un símbolo en cada una de las tres posiciones.'; announce(it.msg); rerender(); return; }
      it.tries++;
      var right = it.code.filter(function (c, i) { return c === I.solution[i]; }).length;
      if (right === 3) { it.stage = 'lit'; it.msg = ''; announce(I.lit + ' ' + UI.twist); save(); pendingFocus = '#panelTitle'; render(); return; }
      it.msg = right + ' de 3 símbolos están en la posición correcta. ' + (it.clues.length < 3 ? 'Todavía te faltan pistas por revisar.' : 'Volvé a relacionar las pistas.');
      announce(it.msg); rerender();
    },
    openMission: function (id) {
      var m = M[id], sp = SPACES[m.space], st = state.spaces[m.space];
      if (m.final && !sp.missions.every(function (x) { return st.missions[x] && st.missions[x].done; })) { toast(sp.finalLocked); return; }
      ms(id); go({ name: 'mission', space: m.space, id: id });
    },
    goStep: function (stage) {
      var s = ms(cur());
      if (STEPS.indexOf(stage) > s.maxStep && stage !== 'transform') return;
      if (stage === 'test') s.result = evaluate(cur());
      setStage(cur(), stage);
    },
    pickChoice: function (i) { var s = ms(cur()); s.choice = +i; rerender(); },
    startExplore: function () { var s = ms(cur()); if (s.choice == null) { toast('Elegí una opción para empezar. Podés cambiarla al final.'); return; } setStage(cur(), 'explore'); },
    explore: function (sid) {
      var m = M[cur()], s = ms(cur()), spot = m.explore.spots.filter(function (x) { return x.id === sid; })[0];
      if (s.found.indexOf(sid) < 0) s.found.push(sid);
      s.openSpot = sid;
      announce(spot.label + ': ' + spot.text + (s.found.length === m.explore.spots.length ? ' Exploraste todo.' : ''));
      save(); pendingFocus = '[data-act="explore"][data-arg="' + sid + '"]'; render();
    },
    modality: function (arg) {
      var p = arg.split(':'), s = ms(cur()); s.modality[p[0]] = p[1]; rerender();
      if (p[1] === 'escuchar') A.speakClue(p[0]);
    },
    speakClue: function (sid) { var spot = M[cur()].explore.spots.filter(function (x) { return x.id === sid; })[0]; Voice.speak(spot.clue.text); },
    toConsult: function () { var m = M[cur()], s = ms(cur()); if (s.found.length < m.explore.spots.length) { toast('Todavía hay lugares sin explorar.'); return; } setStage(cur(), 'consult'); },
    consult: function (pid) {
      var m = M[cur()], s = ms(cur()), p = m.consult.people.filter(function (x) { return x.id === pid; })[0];
      if (s.consulted.indexOf(pid) < 0) s.consulted.push(pid);
      var unl = unlocksOf(m, p);
      announce(person(pid).name + (p.wait ? ' está pensando.' : ': ' + (p.mode === 'gestos' ? p.gesture : p.says)) + (unl.length ? ' Apareció una posibilidad nueva.' : ''));
      save(); render();
    },
    wait: function (pid) {
      var m = M[cur()], s = ms(cur()), p = m.consult.people.filter(function (x) { return x.id === pid; })[0];
      if (s.waited.indexOf(pid) < 0) s.waited.push(pid);
      announce(person(pid).name + ': ' + p.says); save(); render();
    },
    skipWait: function (pid) { var s = ms(cur()); if (s.skipped.indexOf(pid) < 0) s.skipped.push(pid); announce('Seguiste sin esperar a ' + person(pid).name + '.'); rerender(); },
    interp: function (arg) { var p = arg.split(':'), s = ms(cur()); s.interp[p[0]] = p[1]; rerender(); },
    toTransform: function () { setStage(cur(), 'transform'); },
    toggleOpt: function (oid) {
      var m = M[cur()], s = ms(cur()), T = m.transform, sel = s.t.sel, i = sel.indexOf(oid);
      var o = T.options.filter(function (x) { return x.id === oid; })[0];
      s.msg = '';
      if (i >= 0) sel.splice(i, 1);
      else {
        if (T.budget && budgetOf(T, sel) + (o.cost || 0) > T.budget) { s.msg = 'No alcanza el presupuesto para “' + o.label + '”. Sacá algún cambio primero.'; announce(s.msg); rerender(); return; }
        sel.push(oid);
      }
      announce((i >= 0 ? 'Quitaste: ' : 'Agregaste: ') + o.label + '.' + (T.budget ? ' Presupuesto usado: ' + budgetOf(T, sel) + ' de ' + T.budget + '.' : ''));
      rerender();
    },
    msgSlot: function (arg) { var p = arg.split(':'), s = ms(cur()); s.t.slots[p[0]] = p[1]; rerender(); },
    msgFormat: function (f) { var s = ms(cur()), a = s.t.formats, i = a.indexOf(f); if (i >= 0) a.splice(i, 1); else a.push(f); rerender(); },
    mode: function (arg) {
      var p = arg.split(':'), m = M[cur()], s = ms(cur()), d = m.transform.decisions.filter(function (x) { return x.id === p[0]; })[0];
      if (p[1] === 'consultar') {
        var need = d.affects.filter(function (x) { return s.consulted.indexOf(x) < 0; });
        if (need.length) { s.msg = 'Para que decidan, primero hay que consultar a ' + need.map(function (x) { return person(x).name; }).join(' y ') + '.'; announce(s.msg); rerender(); return; }
      }
      s.msg = ''; s.t.modes[p[0]] = p[1]; announce('Plan: ' + d.plans[p[1]]); rerender();
    },
    mark: function (arg) { var p = arg.split(':'), s = ms(cur()); s.t.marks[p[0]] = p[1] === '1'; s.t.checked = false; rerender(); },
    checkMarks: function () {
      var m = M[cur()], s = ms(cur()), T = m.transform;
      var missing = T.consequences.filter(function (c) { return s.t.marks[c.id] == null; });
      if (missing.length) { s.msg = 'Marcá todas las fichas antes de revisar.'; announce(s.msg); rerender(); return; }
      s.t.checked = true;
      var wrong = T.consequences.filter(function (c) { return s.t.marks[c.id] !== c.real; });
      if (!wrong.length) { s.t.classified = true; s.msg = 'Relaciones correctas. Ahora elegí intervenciones.'; }
      else s.msg = wrong.length + (wrong.length === 1 ? ' ficha necesita' : ' fichas necesitan') + ' otra mirada. Leé el motivo y volvé a marcar.';
      announce(s.msg); rerender();
    },
    intervene: function (iid) {
      var m = M[cur()], s = ms(cur()), T = m.transform, ch = s.t.chosen, i = ch.indexOf(iid);
      var o = T.interventions.filter(function (x) { return x.id === iid; })[0];
      s.msg = '';
      if (i >= 0) ch.splice(i, 1);
      else {
        if (budgetOf(T, ch) + o.cost > T.budget) { s.msg = 'No alcanza: ' + o.label + ' cuesta ' + o.cost + ' y ya usaste ' + budgetOf(T, ch) + ' de ' + T.budget + '.'; announce(s.msg); rerender(); return; }
        ch.push(iid);
      }
      announce((i >= 0 ? 'Quitaste: ' : 'Elegiste: ') + o.label + '.'); rerender();
    },
    repair: function (arg) { var p = arg.split(':'), s = ms(cur()); s.t.v[p[0]] = p[1]; rerender(); },
    repairMulti: function (arg) { var p = arg.split(':'), s = ms(cur()), a = s.t.v[p[0]], i = a.indexOf(p[1]); if (i >= 0) a.splice(i, 1); else a.push(p[1]); rerender(); },
    hint: function () { var s = ms(cur()); s.hint++; rerender(); },
    test: function () { var s = ms(cur()); if (group()) { s.pause = true; save(); pendingFocus = '#stageTitle'; render(); } else A.confirmTest(); },
    cancelPause: function () { var s = ms(cur()); s.pause = false; save(); pendingFocus = '#stageTitle'; render(); },
    confirmTest: function () {
      var id = cur(), s = ms(id);
      s.pause = false; s.tests++;
      s.result = evaluate(id);
      setStage(id, 'test');
      var r = s.result;
      announce(r.ok ? 'Funcionó para todas las personas.' : r.okCount + ' de ' + r.people.length + ' personas ya pueden ser parte.');
    },
    toReflect: function () { setStage(cur(), 'reflect'); },
    answer: function (arg) { var p = arg.split(':'), s = ms(cur()); s.answers[p[0]] = +p[1]; rerender(); },
    keepChoice: function () { var s = ms(cur()); s.kept = true; s.changing = false; s.revisedChoice = null; announce('Mantenés tu elección.'); rerender(); },
    changeChoice: function () { var s = ms(cur()); s.changing = true; s.kept = false; rerender(); },
    revise: function (i) { var s = ms(cur()); s.revisedChoice = +i; announce('Nueva elección: ' + M[cur()].choice.options[+i] + '.'); rerender(); },
    discover: function (i) { var s = ms(cur()); s.discovery = +i; rerender(); },
    retry: function () { var s = ms(cur()); s.result = null; setStage(cur(), 'transform'); toast('Volviste a transformar. Tus cambios siguen ahí para ajustar.'); },
    finish: function () {
      var id = cur(), m = M[id], s = ms(id), wasDone = s.done;
      s.done = true; save();
      if (m.final && !wasDone) { go({ name: 'closing', space: m.space }); toast(m.doneText); return; }
      go({ name: 'hub', space: m.space });
      if (!wasDone) toast('¡Conexión activada! ' + m.doneText);
    },
    secret: function (id) {
      var m = M[id], s = ms(id), st = state.spaces[m.space];
      s.secret = true; if (st.secrets.indexOf(id) < 0) st.secrets.push(id);
      save(); render(); toast('Secreto: ' + m.secret.text);
    },
    closeIdea: function (i) { var st = state.spaces[state.route.space], a = st.closing.ideas, k = a.indexOf(+i); if (k >= 0) a.splice(k, 1); else a.push(+i); rerender(); },
    askReset: function () { openDialog('#dlgA11y'); $('#resetConfirm').hidden = false; $('#btnResetYes').focus(); },
    setText: function (v) { state.settings.text = +v; applySettings(); save(); }
  };
  var CHANGES = {
    voiceSlot: function (arg, el) { var s = ms(cur()); s.t.slots[+arg] = el.value; rerender(); },
    zone: function (arg, el) {
      var s = ms(cur()), place = s.t.place, z = el.value, prev = place[arg];
      if (!z) { delete place[arg]; rerender(); return; }
      var other = Object.keys(place).filter(function (k) { return place[k] === z && k !== arg; })[0];
      if (other) { if (prev) place[other] = prev; else delete place[other]; }
      place[arg] = z;
      var T = M[cur()].transform;
      announce(T.items.filter(function (x) { return x.id === arg; })[0].label + ' ahora está en ' + T.zones.filter(function (x) { return x.id === z; })[0].label + (other ? '. Se intercambió con otro aporte.' : '.'));
      rerender();
    }
  };

  /* ---------- Arrastrar (opcional; siempre hay alternativa con botones) ---------- */
  function wireDraggables() {
    $$('[data-drag]').forEach(function (el) {
      el.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', el.dataset.drag); e.dataTransfer.effectAllowed = 'move'; });
    });
    $$('[data-dropslot]').forEach(function (el) {
      el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('drop-over'); });
      el.addEventListener('dragleave', function () { el.classList.remove('drop-over'); });
      el.addEventListener('drop', function (e) { e.preventDefault(); el.classList.remove('drop-over'); placePiece(state.route.space, el.dataset.dropslot, e.dataTransfer.getData('text/plain')); });
    });
  }

  /* ---------- Diálogos ---------- */
  var lastFocus = null;
  function openDialog(sel) {
    var d = $(sel); lastFocus = document.activeElement;
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
    var f = d.querySelector('h2'); if (f) f.focus();
  }
  function closeDialog(d) {
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
    $('#resetConfirm').hidden = true;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* ---------- Inicio ---------- */
  function boot() {
    Store.init();
    var loaded = Store.load();
    state = loaded && loaded.v === 1 ? loaded : freshState();
    if (!state.settings) state.settings = freshState().settings;
    // validar ruta guardada
    var r = state.route || { name: 'entrada' };
    if ((r.name === 'mission' && !M[r.id]) || (r.space && !SPACES[r.space])) state.route = { name: 'entrada' };
    applySettings();
    if (mqReduce && mqReduce.addEventListener) mqReduce.addEventListener('change', applySettings);
    if (Voice.supported) { Voice.pick(); window.speechSynthesis.onvoiceschanged = function () { Voice.pick(); }; }

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act]');
      if (!el) return;
      var act = el.dataset.act;
      if (!A[act]) return;
      e.preventDefault();
      A[act](el.dataset.arg, el);
    });
    document.addEventListener('change', function (e) {
      var el = e.target.closest('[data-change]');
      if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el.dataset.arg, el);
    });
    $('#btnHome').addEventListener('click', function () { go({ name: 'entrada' }); });
    $('#btnMap').addEventListener('click', function () { go({ name: 'hub', space: state.route.space }); });
    $('#btnListen').addEventListener('click', function () { Voice.speak(panelText()); });
    $('#btnStop').addEventListener('click', function () { Voice.stop(); $('#btnListen').focus(); });
    $('#btnHelp').addEventListener('click', function () { openDialog('#dlgHelp'); });
    $('#btnA11y').addEventListener('click', function () { openDialog('#dlgA11y'); });
    $$('dialog [data-close]').forEach(function (b) { b.addEventListener('click', function () { closeDialog(b.closest('dialog')); }); });
    $$('dialog').forEach(function (d) { d.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(d); }); });
    $('#optContrast').addEventListener('change', function (e) { state.settings.contrast = e.target.checked; applySettings(); save(); });
    $('#optMotion').addEventListener('change', function (e) { state.settings.motion = e.target.value; applySettings(); save(); });
    $('#optAutoread').addEventListener('change', function (e) { state.settings.autoread = e.target.checked; save(); announce(e.target.checked ? 'Lectura automática activada.' : 'Lectura automática desactivada.'); });
    $('#optGroup').addEventListener('change', function (e) { state.settings.group = e.target.checked; save(); render(); });
    $('#btnReset').addEventListener('click', function () { $('#resetConfirm').hidden = false; $('#btnResetYes').focus(); });
    $('#btnResetNo').addEventListener('click', function () { $('#resetConfirm').hidden = true; $('#btnReset').focus(); });
    $('#btnResetYes').addEventListener('click', function () {
      var keep = state.settings;
      Store.clear(); state = freshState(); state.settings = keep;
      closeDialog($('#dlgA11y'));
      currentScene = null;
      go({ name: 'entrada' });
      toast('Progreso reiniciado. Empezás de nuevo.');
    });
    render();
  }

  // API mínima para pruebas automáticas
  window.__CE = { state: function () { return state; }, A: A, evaluate: evaluate, ms: ms, render: render };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
