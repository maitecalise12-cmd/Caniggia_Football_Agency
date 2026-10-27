await new Promise(r => setTimeout(r, 800));
if (!document.getElementById('tst')) {
  const st = document.createElement('style'); st.id = 'tst';
  st.textContent = '*{animation:none!important;transition:none!important} html{scroll-behavior:auto!important}';
  document.head.appendChild(st);
}
scrollTo(0, 0); await new Promise(r => setTimeout(r, 200));
const hdr = document.getElementById('header').offsetHeight;
const t = document.querySelector('.hero__title').getBoundingClientRect();
const b = document.querySelector('.hero .btn').getBoundingClientRect();
const lines = [...document.querySelectorAll('.hero__title > *')].map(e => { const r = document.createRange(); r.selectNodeContents(e); const x = r.getBoundingClientRect(); return [e.textContent.trim(), Math.round(x.right)]; });
return { size: innerWidth + 'x' + innerHeight, titleTopBelowHeader: Math.round(t.top - hdr), btnBottomGap: Math.round(innerHeight - b.bottom), widest: Math.max(...lines.map(l => l[1])), vw: innerWidth, bigFont: getComputedStyle(document.querySelector('.hero__big')).fontSize };
