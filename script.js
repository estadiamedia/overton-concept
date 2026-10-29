(function () {
  // Private splash: soft password gate (client-side only)
  var gate = document.getElementById('gate');
  if (gate) {
    var HASH = 'a55962835682127b0a6bdd855533dbe7bf36c20565a2ef65c80bb449d905971e';
    var splash = document.getElementById('splash');
    var pw = document.getElementById('pw');
    var perr = gate.querySelector('.pw-err');
    if (!document.documentElement.classList.contains('unlocked')) setTimeout(function () { pw.focus(); }, 2000);
    function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
    function check(v) {
      if (window.crypto && crypto.subtle) return crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)).then(function (b) { return hex(b) === HASH; });
      return Promise.resolve(v === 'overton');
    }
    pw.addEventListener('input', function () { perr.textContent = ''; });
    gate.addEventListener('submit', function (e) {
      e.preventDefault();
      check(pw.value.trim().toLowerCase()).then(function (ok) {
        if (!ok) {
          perr.textContent = 'That password doesn\u2019t match. Try again.';
          splash.classList.remove('shake'); void splash.offsetWidth; splash.classList.add('shake');
          return;
        }
        try { localStorage.setItem('ov-ok', '1'); } catch (err) {}
        document.documentElement.classList.add('unlocked');
        var v = document.querySelector('.hero video'); if (v) { try { v.currentTime = 0; v.play(); } catch (err) {} }
      });
    });
  }

  // Header turns solid once you scroll past the opening frame
  var head = document.querySelector('.site-head');
  function onScroll() {
    if (!head) return;
    head.classList.toggle('solid', window.scrollY > window.innerHeight * 0.55);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.hidden;
      mobileNav.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
      head.classList.toggle('solid', open || window.scrollY > window.innerHeight * 0.55);
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a, [data-open-tour]')) {
        mobileNav.hidden = true;
        menuBtn.textContent = 'Menu';
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Private tour dialog
  var dlg = document.getElementById('tour');
  document.querySelectorAll('[data-open-tour]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      if (!dlg) return;
      var pick = b.getAttribute('data-interest');
      if (pick) {
        dlg.querySelectorAll('.chips .chip').forEach(function (c) {
          c.setAttribute('aria-pressed', String(c.dataset.value === pick));
        });
      }
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    });
  });
  if (dlg) {
    dlg.querySelector('.tour-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('.chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
      });
    });
    var form = dlg.querySelector('form');
    var err = dlg.querySelector('.err');
    form.addEventListener('input', function () { err.textContent = ''; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#t-name').value.trim();
      var email = form.querySelector('#t-email').value.trim();
      if (!name) { err.textContent = 'Add your name so we know who to expect.'; return; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Add an email address we can reply to.'; return; }
      form.hidden = true;
      dlg.querySelector('.thanks').hidden = false;
      dlg.querySelector('.thanks-name').textContent = name.split(' ')[0];
    });
    dlg.addEventListener('close', function () {
      form.hidden = false;
      form.reset();
      dlg.querySelector('.thanks').hidden = true;
    });
  }

  // Homesites plan
  var plan = document.getElementById('plan');
  if (plan) {
    var lots = plan.querySelectorAll('.lot');
    var card = document.getElementById('lot-card');
    var fTitle = card.querySelector('[data-f="title"]');
    var fView = card.querySelector('[data-f="view"]');
    var fSetting = card.querySelector('[data-f="setting"]');
    var fTour = card.querySelector('[data-open-tour]');
    var settings = {
      bluff: 'Western light across the plateau edge, wooded on three sides.',
      lake: 'Gentle slope to the shoreline, morning mist on the water.'
    };
    function select(btn) {
      lots.forEach(function (l) { l.classList.toggle('on', l === btn); l.setAttribute('aria-pressed', String(l === btn)); });
      var v = btn.dataset.view;
      fTitle.textContent = 'Homesite ' + btn.textContent.trim();
      fView.textContent = v === 'bluff' ? 'Bluff view' : 'Lake view';
      fSetting.textContent = settings[v];
      fTour.setAttribute('data-interest', v === 'bluff' ? 'Bluff view' : 'Lake view');
    }
    lots.forEach(function (l) { l.addEventListener('click', function () { select(l); }); });
    document.querySelectorAll('.filters .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.filters .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        var f = chip.dataset.filter;
        lots.forEach(function (l) { l.classList.toggle('dim', f !== 'all' && l.dataset.view !== f); });
      });
    });
    select(plan.querySelector('.lot.on') || lots[0]);
  }
})();
