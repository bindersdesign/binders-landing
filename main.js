/* 바인더스 랜딩페이지 스크립트 */

/* ───────── 문의 전달 설정 ─────────
   1) Web3Forms(권장): https://web3forms.com 에서 받는 메일을 입력하면 '액세스 키'가 메일로 옵니다.
      그 키를 WEB3FORMS_KEY 에 붙여 넣으면, 방문자가 '문의 보내기'를 누르는 즉시 INQUIRY_TO 메일함으로 도착합니다.
   2) 키가 비어 있으면(지금) 메일 앱이 열리고 내용이 채워진 새 메일이 뜹니다. */
const WEB3FORMS_KEY = '20261fad-a2fe-47b0-8350-4ebe3cb3c406';
const INQUIRY_TO    = 'jeong150702@gmail.com';

/* ───────── 작업물 데이터 ───────── */
const WORKS = [
  { id:'gyeoldeung', name:'결등', desc:'조명 제조 · 회사 소개서', note:'가상 브랜드',
    pages:['표지','한눈에 보기','제품군','제조 역량','납품 실적','인증과 품질','진행 과정과 문의'] },
  { id:'hanol', name:'한올 스튜디오', desc:'촬영 스튜디오 · 회사 소개서', note:'가상 브랜드',
    pages:['표지','한올은','무엇을 찍나요','공간과 장비','작업 사례','진행 방식','촬영 문의'] },
  { id:'mondic', name:'몬딕', desc:'향기 브랜드 · 제품 카탈로그', note:'실제 브랜드',
    pages:['표지','브랜드','라인업','향 도감','제안 향','품질과 공간','입점 제안'] },
  { id:'dodam', name:'도담', desc:'반려견 간식 · 협찬 제안서', note:'가상 브랜드',
    pages:['표지','도담 이야기','대표 간식','함께하고 싶은 분','보내 드리는 것','나누는 방식','천천히 함께해요'] }
];
const img = (id, i) => `assets/work/${id}-${i + 1}.jpg`;
const $ = (s, r = document) => r.querySelector(s);

/* 표지 아래 흐르는 띠: 브랜드별 표지 + 안쪽 장 */
(() => {
  const track = $('#reelTrack');
  const order = [[0,0],[1,0],[2,0],[3,0],[0,2],[1,4],[2,3],[3,2],[0,4],[1,2],[2,5],[3,4]];
  const mk = () => order.map(([w, p]) => {
    const W = WORKS[w];
    return `<button type="button" data-open="${W.id}" data-page="${p}" aria-label="${W.name} ${W.pages[p]} 크게 보기"><img src="${img(W.id, p)}" alt="" ${p === 0 ? '' : 'loading="lazy"'} draggable="false"></button>`;
  }).join('');
  track.innerHTML = mk() + mk();
})();

/* 작업물 카드 */
(() => {
  $('#works').innerHTML = WORKS.map((W, i) => `
    <button type="button" class="work reveal" data-open="${W.id}" data-page="0">
      <span class="shot"><img src="${img(W.id, 0)}" alt="${W.name} ${W.desc} 표지" loading="lazy"><span class="pill">${W.pages.length}쪽 보기 →</span></span>
      <span class="meta"><span class="n">0${i + 1}</span><span><h3>${W.name}</h3><p>${W.desc} · ${W.note}</p></span></span>
    </button>`).join('');
})();

/* ───────── 라이트박스 ───────── */
const lb = $('#lb'), lbImg = $('#lbImg'), lbName = $('#lbName'), lbCount = $('#lbCount'), lbThumbs = $('#lbThumbs');
let cur = null, idx = 0, lastFocus = null;

function lbShow(i){
  const n = cur.pages.length;
  idx = (i + n) % n;
  lbImg.src = img(cur.id, idx);
  lbImg.alt = `${cur.name} ${idx + 1}쪽 ${cur.pages[idx]}`;
  lbName.textContent = `${cur.name} · ${cur.desc} · ${cur.pages[idx]}`;
  lbCount.textContent = `${idx + 1} / ${n}`;
  [...lbThumbs.children].forEach((b, k) => k === idx ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
  const t = lbThumbs.children[idx]; if (t) t.scrollIntoView({ inline: 'center', block: 'nearest' });
  // 다음 장 미리 불러오기
  new Image().src = img(cur.id, (idx + 1) % n);
}
function lbOpen(id, page){
  cur = WORKS.find(w => w.id === id); if (!cur) return;
  lastFocus = document.activeElement;
  lbThumbs.innerHTML = cur.pages.map((p, k) => `<button type="button" aria-label="${k + 1}쪽 ${p}"><img src="${img(cur.id, k)}" alt=""></button>`).join('');
  [...lbThumbs.children].forEach((b, k) => b.addEventListener('click', () => lbShow(k)));
  lb.hidden = false; document.body.classList.add('lb-open');
  lbShow(+page || 0);
  $('#lbClose').focus();
}
function lbClose(){
  lb.hidden = true; document.body.classList.remove('lb-open');
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-open]');
  if (b) lbOpen(b.dataset.open, b.dataset.page);
});
$('#lbClose').addEventListener('click', lbClose);
$('#lbPrev').addEventListener('click', () => lbShow(idx - 1));
$('#lbNext').addEventListener('click', () => lbShow(idx + 1));
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-fig')) lbClose(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') lbClose();
  if (e.key === 'ArrowLeft') lbShow(idx - 1);
  if (e.key === 'ArrowRight') lbShow(idx + 1);
  if (e.key === 'Tab') { // 포커스 가두기
    const f = [...lb.querySelectorAll('button')]; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
(() => {
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) lbShow(idx + (dx < 0 ? 1 : -1));
  });
})();

/* ───────── 스크롤 등장 · 헤더 · 현재 위치 ───────── */
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  els.forEach((e, i) => { e.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(e); });
})();
(() => {
  const head = $('.head'); let y0 = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    head.classList.toggle('hide', y > y0 && y > 240);
    y0 = y;
  }, { passive: true });
  const links = [...document.querySelectorAll('.nav a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(es => es.forEach(en => {
    const a = map.get(en.target.id); if (!a) return;
    if (en.isIntersecting) { links.forEach(l => l.classList.remove('on')); a.classList.add('on'); }
  }), { rootMargin: '-40% 0px -55% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  // 모바일 도크: 문의 영역에서는 숨김
  const dock = $('#dock'), contact = $('#contact');
  if (dock && 'IntersectionObserver' in window) new IntersectionObserver(es => dock.classList.toggle('off', es[0].isIntersecting), { threshold: 0, rootMargin: '0px 0px -60px 0px' }).observe(contact);
})();

/* 메일 주소 복사 */
$('#copyMail').addEventListener('click', async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText(INQUIRY_TO); b.textContent = '복사됨'; }
  catch { const r = document.createRange(); r.selectNode($('#mailLink')); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = '선택됨'; }
  setTimeout(() => b.textContent = '복사', 1800);
});

/* ───────── 문의 폼 ───────── */
const form = $('#inquiry'), statusEl = $('#formStatus'), btn = $('#submitBtn');
const setStatus = (m, k) => { statusEl.textContent = m; statusEl.className = 'form-status ' + (k || ''); };
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = v => v.replace(/\D/g, '').length >= 9 && /^[\d\s\-+().]+$/.test(v);

function collect(){
  const f = new FormData(form);
  const contact = (f.get('contact') || '').trim();
  return {
    name: (f.get('name') || '').trim(),
    contact,
    email: isEmail(contact) ? contact : '',
    docs: f.getAll('docs').join(', '),
    message: (f.get('message') || '').trim(),
    trap: f.get('website') || ''
  };
}
function validate(d){
  form.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
  const bad = [];
  if (!d.name) bad.push('f-name');
  if (!(isEmail(d.contact) || isPhone(d.contact))) bad.push('f-contact');
  if (!d.message) bad.push('f-msg');
  bad.forEach(id => document.getElementById(id).classList.add('invalid'));
  if (bad.length) { document.getElementById(bad[0]).focus(); return bad.includes('f-contact') && d.contact ? '이메일 또는 전화번호 형식을 확인해 주세요.' : '회사명·성함, 연락처, 문의 내용을 입력해 주세요.'; }
  if (!$('#f-agree').checked) return '개인정보 수집·이용에 동의해 주세요.';
  return '';
}
const bodyText = d => [`회사명 · 성함: ${d.name}`, `연락처: ${d.contact}`, `필요한 자료: ${d.docs || '-'}`, '', '[문의 내용]', d.message].join('\n');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const d = collect();
  if (d.trap) { setStatus('문의가 전달되었습니다.', 'ok'); form.reset(); return; }
  const err = validate(d);
  if (err) { setStatus(err, 'err'); return; }
  const subject = `[바인더스 문의] ${d.name}`;

  if (!WEB3FORMS_KEY) {
    location.href = `mailto:${INQUIRY_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText(d))}`;
    setStatus('메일 앱이 열립니다. 열린 메일에서 보내기를 눌러 주세요. 열리지 않으면 ' + INQUIRY_TO + ' 로 보내 주세요.', 'ok');
    return;
  }
  btn.disabled = true; setStatus('보내는 중입니다…');
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY, subject, from_name: '바인더스 홈페이지',
        name: d.name, email: d.email || undefined, contact: d.contact, docs: d.docs || '-', message: d.message, botcheck: ''
      })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.success === false) throw new Error(j.message || res.status);
    setStatus('문의가 전달되었습니다. 확인 후 메일이나 전화로 답변드리겠습니다.', 'ok');
    form.reset();
  } catch (x) {
    setStatus('전송에 실패했습니다. 잠시 후 다시 시도하시거나 ' + INQUIRY_TO + ' 로 보내 주세요.', 'err');
  } finally { btn.disabled = false; }
});
