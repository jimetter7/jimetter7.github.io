// Interacciones generadas por JimWeb Builder (vanilla JS, sin dependencias)
document.addEventListener('DOMContentLoaded', function () {
  // Scroll suave para enlaces ancla internos (#seccion)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href && href.length > 1) {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});


// Carrusel Pro — JimWeb Builder
document.querySelectorAll('.jw-showcase[data-jw-showcase]').forEach(function (root) {
  var track = root.querySelector('.jw-showcase__track');
  var slides = [].slice.call(root.querySelectorAll('.jw-showcase__slide'));
  if (!track || !slides.length) return;
  var caption = root.querySelector('.jw-showcase__caption');
  var dots = [].slice.call(root.querySelectorAll('.jw-showcase__dot'));
  var prev = root.querySelector('.jw-showcase__prev');
  var next = root.querySelector('.jw-showcase__next');
  var loop = root.hasAttribute('data-loop');
  var anim = root.getAttribute('data-anim') || 'fade';
  var mode = root.getAttribute('data-mode') || 'linear';
  var intensity = (Math.max(0, Math.min(100, parseInt(root.getAttribute('data-intensity'), 10) || 50))) / 50;
  // Curvatura del abanico (independiente de la intensidad): px de subida/bajada por
  // paso de distancia. Convexa (+) = lados abajo ∩; cóncava (−) = lados arriba ∪.
  var curveDir = root.getAttribute('data-curvedir');
  var curveSign = curveDir === 'concave' ? -1 : curveDir === 'flat' ? 0 : 1;
  var arc = Math.max(0, Math.min(100, parseInt(root.getAttribute('data-curve'), 10) || 0)) * 0.55 * curveSign;
  // Giro (grados por paso) de los slides a cada lado del central (coverflow).
  function degOf(a, d) { var n = parseInt(root.getAttribute(a), 10); return isNaN(n) ? d : n; }
  var rotLeft = degOf('data-rotleft', -8), rotRight = degOf('data-rotright', 8);
  // Laterales: cuántos slides se ven a cada lado + atenuado/desenfoque progresivos
  // (0 en el central → máximo en el más lejano visible; el resto se oculta).
  var sides = Math.max(0, Math.min(8, parseInt(root.getAttribute('data-sides'), 10)));
  if (isNaN(sides)) sides = 2;
  var sideOpacity = degOf('data-sideopacity', 45) / 100;
  var sideBlur = degOf('data-sideblur', 4);
  var wobble = root.hasAttribute('data-wobble');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = 0, twTimer = null, moved = false;
  function gapPx() { return parseFloat(getComputedStyle(root).getPropertyValue('--jw-showcase-gap')) || 16; }
  function setCaption(text) {
    if (!caption) return;
    if (twTimer) { clearInterval(twTimer); twTimer = null; }
    if (anim === 'none' || reduce) { caption.textContent = text; return; }
    if (anim === 'typewriter') {
      caption.textContent = ''; var k = 0;
      twTimer = setInterval(function () { caption.textContent = text.slice(0, ++k); if (k >= text.length) { clearInterval(twTimer); twTimer = null; } }, 28);
      return;
    }
    caption.classList.remove('is-in'); void caption.offsetWidth; caption.textContent = text; caption.classList.add('is-in');
  }
  function paint() {
    slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    if (caption) setCaption(slides[i].getAttribute('data-caption') || '');
  }
  // Ajusta el alto del escenario al alto real de las tarjetas + el desplazamiento
  // del efecto (los slides van en posición absoluta en TODOS los modos).
  function fit() {
    var maxH = 0;
    slides.forEach(function (s) { var h = s.offsetHeight; if (h > maxH) maxH = h; });
    var maxOff = Math.min(sides, Math.floor(slides.length / 2));
    var disp = (mode === 'coverflow' ? Math.abs(arc) : mode === 'stack' ? 12 * intensity : 0) * maxOff;
    var minH = mode === 'linear' ? 0 : (parseInt(getComputedStyle(root).getPropertyValue('--jw-showcase-h'), 10) || 0);
    track.style.height = Math.max(minH, Math.ceil(maxH + disp * 2 + 24)) + 'px';
  }
  // Posiciona cada slide por su distancia (off) al central. Con bucle, off "envuelve"
  // → el anterior al primero es el último = BUCLE INFINITO (lineal, coverflow y baraja).
  function layout() {
    fit();
    var n = slides.length, stepX = slides[0].offsetWidth + gapPx();
    slides.forEach(function (s, k) {
      var off = k - i;
      if (loop) { if (off > n / 2) off -= n; else if (off < -n / 2) off += n; }
      var a = Math.abs(off), t, z = 100 - a;
      // Laterales: visibles hasta 'sides'; atenuado/desenfoque crecen del centro al borde.
      var visible = a <= sides;
      var fade = sides > 0 ? Math.min(1, a / sides) : (a === 0 ? 0 : 1);
      var op = visible ? (1 - fade * (1 - sideOpacity)) : 0;
      var blurPx = visible ? fade * sideBlur : 0;
      if (mode === 'coverflow') {
        var rot = (off < 0 ? rotLeft : rotRight) * a;
        t = 'translate(calc(-50% + ' + (off * 54 * intensity) + 'px), calc(-50% + ' + (a * arc) + 'px)) rotate(' + rot + 'deg) scale(' + Math.max(0.4, 1 - a * 0.1) + ')';
      } else if (mode === 'stack') {
        t = 'translate(calc(-50% + ' + (off * 16 * intensity) + 'px), calc(-50% + ' + (a * 12 * intensity) + 'px)) scale(' + Math.max(0.5, 1 - a * 0.06) + ')';
      } else {
        t = 'translate(calc(-50% + ' + (off * stepX) + 'px), -50%)';
      }
      s.style.transform = t; s.style.zIndex = z; s.style.opacity = op;
      s.style.filter = blurPx > 0.05 ? 'blur(' + blurPx.toFixed(2) + 'px)' : '';
      s.style.pointerEvents = visible ? 'auto' : 'none';
    });
  }
  function shuffle() {
    if (!wobble || reduce || !track) return;
    track.classList.remove('is-shuffle'); void track.offsetWidth; track.classList.add('is-shuffle');
    setTimeout(function () { track.classList.remove('is-shuffle'); }, 440);
  }
  function go(n, silent) {
    if (loop) n = (n % slides.length + slides.length) % slides.length;
    else n = Math.max(0, Math.min(slides.length - 1, n));
    i = n; layout(); if (!silent) shuffle(); paint();
  }
  function advance() { var n = i + 1; if (n >= slides.length) n = 0; go(n); }
  if (prev) prev.addEventListener('click', function () { go(i - 1); });
  if (next) next.addEventListener('click', function () { go(i + 1); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  // Pulsar una tarjeta lateral la trae al frente (salvo que se haya arrastrado).
  slides.forEach(function (s, k) { s.addEventListener('click', function (e) { if (moved) return; if (k !== i) { e.preventDefault(); go(k); } }); });
  root.setAttribute('tabindex', root.getAttribute('tabindex') || '0');
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
  });
  // Swipe / arrastre (ratón y táctil): SOLO sobre el área de slides (viewport), sin
  // captura de puntero → los botones/puntos/tarjetas conservan su clic normal.
  var down = null;
  var vp = root.querySelector('.jw-showcase__viewport') || root;
  vp.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    down = { x: e.clientX, y: e.clientY }; moved = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (down && Math.abs(e.clientX - down.x) > 8) moved = true;
  });
  window.addEventListener('pointerup', function (e) {
    if (!down) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y; down = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { if (dx > 0) go(i - 1); else go(i + 1); }
    setTimeout(function () { moved = false; }, 0);
  });
  window.addEventListener('pointercancel', function () { down = null; });
  window.addEventListener('resize', function () { layout(); });
  window.addEventListener('load', function () { layout(); });
  setTimeout(function () { layout(); }, 120);
  // Autoplay (pausa al interactuar / hover / foco; respeta reduce-motion).
  var interval = parseInt(root.getAttribute('data-interval'), 10) || 4000, timer = null;
  function play() { if (root.hasAttribute('data-autoplay') && !reduce) { stop(); timer = setInterval(advance, interval); } }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
  root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
  layout(); paint(); play();
});

