(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');
  var hero = document.querySelector('.hero');
  var dock = document.getElementById('dock');
  var mobilePhoto = document.querySelector('.shop-photo');
  var ticking = false;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function onScroll() {
    var y = window.scrollY;
    var h = window.innerHeight;
    var p = clamp(y / h, 0, 1);
    if (!reduce) hero.style.setProperty('--p', p.toFixed(4));
    nav.classList.toggle('solid', y > h * 0.6);
    if (y < h * 0.4) {
      tabLinks.forEach(function (a) { a.classList.remove('active'); });
      var tl = document.getElementById('tabs');
      if (tl.scrollLeft > 0) tl.scrollLeft = 0;
    }
    var nearQuote = quote.getBoundingClientRect().top < h * 0.8;
    dock.classList.toggle('show', y > h * 0.75 && !nearQuote);
    if (!reduce && mobilePhoto) {
      var r = mobilePhoto.getBoundingClientRect();
      var mp = clamp((h - r.top) / (h + r.height), 0, 1) * 2 - 1;
      mobilePhoto.style.setProperty('--mp', mp.toFixed(3));
    }
    shadeScroll();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* active tab */
  var tabLinks = Array.prototype.slice.call(document.querySelectorAll('#tabs a'));
  var sections = tabLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var quote = document.getElementById('quote');
  var tabIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      tabLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('active', on);
        if (on && window.innerWidth <= 1120) {
          var list = a.closest('.tabs');
          list.scrollTo({ left: a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
        }
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { if (s) tabIO.observe(s); });

  /* services: sticky photo follows the row in the middle of the screen */
  var stageImgs = document.querySelectorAll('.svc-stage img');
  var svcs = document.querySelectorAll('.svc');
  var svcIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var key = e.target.getAttribute('data-key');
      svcs.forEach(function (s) { s.classList.toggle('is-active', s === e.target); });
      stageImgs.forEach(function (img) { img.classList.toggle('on', img.getAttribute('data-key') === key); });
    });
  }, { rootMargin: '-48% 0px -48% 0px' });
  svcs.forEach(function (s) { svcIO.observe(s); });
  if (svcs[0]) svcs[0].classList.add('is-active');

  /* shade picker */
  var frame = document.querySelector('.window-frame');
  var layer = document.getElementById('tint-layer');
  var num = document.getElementById('vlt-num');
  var law = document.getElementById('vlt-law');
  var range = document.getElementById('vlt-range');
  var chips = document.querySelectorAll('.vlt-chips button');
  var touched = false;

  function setVlt(v) {
    v = Math.round(v);
    // darkness grows faster at the dark end, like real film
    var dark = Math.pow(1 - v / 100, 1.25) * 0.97;
    layer.setAttribute('opacity', dark.toFixed(3));
    num.textContent = v;
    range.value = v;
    if (v >= 28) {
      law.textContent = 'Legal on front side windows in Wyoming.';
      law.classList.remove('warn');
    } else {
      law.textContent = 'Too dark for the front doors. Wyoming needs 28% or lighter up front. Ask us about the back windows on your vehicle.';
      law.classList.add('warn');
    }
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(+c.getAttribute('data-vlt') === v)); });
  }
  function userSet(v) { touched = true; setVlt(v); }
  range.addEventListener('input', function () { userSet(+range.value); });
  chips.forEach(function (c) { c.addEventListener('click', function () { userSet(+c.getAttribute('data-vlt')); }); });

  // until someone touches it, the glass darkens from 70% to 20% as the section scrolls past
  function shadeScroll() {
    if (touched || reduce) return;
    var r = frame.getBoundingClientRect();
    var h = window.innerHeight;
    // starts when the window enters the bottom of the screen, finishes as it nears the top
    var t = clamp((h - r.top) / (h * 0.8), 0, 1);
    setVlt(70 - t * 50);
  }
  setVlt(reduce ? 28 : 70);

  /* light reveal on a few blocks only */
  if (!reduce && 'IntersectionObserver' in window) {
    var rvEls = document.querySelectorAll('.services-intro, .quotes blockquote, .rating, .shop-copy, .quote-call, .quote-form');
    var rvIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    rvEls.forEach(function (el) { el.classList.add('rv'); rvIO.observe(el); });
  }

  onScroll();
})();
