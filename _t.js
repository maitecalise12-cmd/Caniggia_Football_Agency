await new Promise(r => setTimeout(r, 600));
if (!document.getElementById('tst')) {
  const st = document.createElement('style'); st.id = 'tst';
  st.textContent = '*{animation:none!important;transition:none!important} html{scroll-behavior:auto!important}' +
    '.svc-strip.t{flex-grow:3.4} .svc-strip.t:last-child{flex-grow:var(--lg,4)} @media (max-width:1300px){.svc-strip.t:last-child{flex-grow:6}} @media (max-width:1000px){.svc-strip.t:last-child{flex-grow:7.5}} .svc-strip.t::after{opacity:1}' +
    '.svc-strip.t .svc-strip__label{column-gap:1.8rem} .svc-strip.t .svc-strip__num{font-size:clamp(4.4rem,8vw,8.5rem)}' +
    '.svc-strip.t .svc-strip__detail{width:var(--detail-w);opacity:1}';
  document.head.appendChild(st);
}
document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-visible'));
const sec = document.getElementById('services');
const out = { vw: innerWidth - 15, secH: sec.offsetHeight, strips: [] };
const strips = [...document.querySelectorAll('.svc-strip')];
for (const s of strips) {
  s.classList.add('t'); await new Promise(r => setTimeout(r, 80));
  const L = s.querySelector('.svc-strip__label').getBoundingClientRect();
  const D = s.querySelector('.svc-strip__detail').getBoundingClientRect();
  const sr = sec.getBoundingClientRect();
  // borde derecho de la franja a la altura de la parte de arriba del detalle (la franja está inclinada)
  const S = s.getBoundingClientRect();
  out.strips.push({ topInSec: Math.round(L.top - sr.top), labelRight: Math.round(L.right), detailTopInSec: Math.round(D.top - sr.top), stripW: Math.round(S.width) });
  s.classList.remove('t');
}
return out;
