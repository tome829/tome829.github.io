'use strict';

/* Edit this object to personalize the invitation. All current values are fictional. */
const WEDDING_CONFIG = {
  groom: { name: '김효원', givenName: '효원', parents: '김병석 · 이유미', phone: '010-4207-7526' },
  bride: { name: '한미래', givenName: '미래', parents: '한현재 · 이현숙', phone: '010-4057-2805' },
  // Always include the Korean timezone (+09:00).
  date: '2027-05-22T11:00:00+09:00',
  greeting: '서로의 작은 일상에 스며들어\n가장 편안한 안식처가 된 두 사람.\n\n이제 같은 곳을 바라보며\n삶의 모든 계절을 함께하려 합니다.\n\n저희의 첫걸음에 함께하시어\n따뜻한 축복을 나누어 주세요.',
  venue: {
    name: 'AW 컨벤션', hall: '6층 테라스볼륨',
    shortName: 'AW 컨벤션 · 6층 테라스볼륨',
    address: '경기도 안산시 단원구 광덕1로171',
    mapQuery: 'AW 컨벤션',
    transport: [
      { title: '지하철', text: '· 4호선 고잔역 2번 출구 \n ※ 셔틀버스는 예식 2시간 후까지 운행합니다. \n (셔틀 버스 5분~7분 간격 수시운행 / 도보 15~20분' },
      { title: '버스', text: '· 안산 문화숲의 광장 하차 88번,\n· 동남레이크빌 하차 99-1번, 3100번\n· 대림호수공원 아파트 하차 77번, 98번, 3번' },
      { title: '자가용 · 주차', text: '· 서울방향\n 안산JC - 안산 IC - 법원검찰청 - AW컨벤션\n· 수원방향\n 수인산업도로 - 법원검찰청 - AW컨벤션\n· 인천방향\n 서안산IC - 법원검찰청 - AW컨벤션\n· 영동고속도로\n 안산IC - 법원검찰청 - AW컨벤션\n· 서해안고속도로\n 매송IC - 해안로(호수공원) - 시청방향 - AW컨벤션' },
      { title: '주차', text: '· 제1주차장  AW컨벤션 지상,지하 1층,2층\n· 제 2주차장  양지주차타워(AW컨벤션주차타워)\n· 제3주차장  AW컨벤션 정문 맞은편 공영주차장\n· 제4주차장  MK주차타워' },
    ]
  },
  // Leave paths empty to show the built-in illustration. Missing files also fall back.
  coverImage: '', // Example: './images/cover.jpg'
  gallery: [
    { src: '', alt: '나란히 걷는 우리의 첫 번째 순간', caption: '같은 방향을 바라보는 우리' },
    { src: '', alt: '햇살 가득한 날의 두 사람', caption: '평범한 하루도 특별하게' },
    { src: '', alt: '서로를 바라보며 웃는 두 사람', caption: '너의 미소가 가장 좋은 날' },
    { src: '', alt: '손을 꼭 잡은 두 사람', caption: '어떤 계절에도, 함께' },
    { src: '', alt: '정원에서 함께하는 두 사람', caption: '차곡차곡 쌓아 온 마음' },
    { src: '', alt: '노을 아래 함께 선 두 사람', caption: '우리의 모든 내일을 약속하며' }
  ],
  musicSrc: './music/wedding.mp3', // Example: './music/wedding.mp3' — never autoplayed.
  accounts: [
    { title: '신랑측 계좌번호', members: [
      { relation: '신랑', name: '김효원', bank: '예시은행', number: '000-0000-0000' },
      { relation: '아버지', name: '김병석', bank: '예시은행', number: '000-0000-0001' },
      { relation: '어머니', name: '이유미', bank: '예시은행', number: '000-0000-0002' }
    ] },
    { title: '신부측 계좌번호', members: [
      { relation: '신부', name: '한미래', bank: '예시은행', number: '000-0000-0003' },
      { relation: '아버지', name: '한현재', bank: '예시은행', number: '000-0000-0004' },
      { relation: '어머니', name: '이현숙', bank: '예시은행', number: '000-0000-0005' }
    ] }
  ]
};

const $ = (selector) => document.querySelector(selector);
const KOREA_OFFSET = 9 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
let toastTimer;

// Keep all calendar and D-Day calculations on Korea's calendar, even overseas.
function koreanDateParts(value) {
  const date = new Date(new Date(value).getTime() + KOREA_OFFSET);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(), weekday: date.getUTCDay(), hour: date.getUTCHours(), minute: date.getUTCMinutes() };
}

function weddingState(weddingDate, now = new Date()) {
  const target = new Date(weddingDate);
  const today = koreanDateParts(now);
  const wedding = koreanDateParts(target);
  const daysUntil = Math.round((Date.UTC(wedding.year, wedding.month, wedding.day) - Date.UTC(today.year, today.month, today.day)) / DAY);
  const remaining = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return { daysUntil, days: Math.floor(remaining / 86400), hours: Math.floor(remaining / 3600) % 24, minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60 };
}

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function showToast(message) {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
}

// Native dialogs provide focus trapping, Escape support, and focus restoration.
function prepareDialog(dialog) {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
  });
}

function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}

async function copyText(value, successMessage) {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(value);
    showToast(successMessage);
  } catch {
    // file:// and denied clipboard permissions: let the visitor copy manually.
    const input = $('#copy-value');
    input.value = value;
    openDialog($('#copy-dialog'));
    input.focus();
    input.select();
    input.setSelectionRange(0, value.length);
  }
}

function renderInformation() {
  document.querySelectorAll('[data-field]').forEach((node) => {
    const value = node.dataset.field.split('.').reduce((current, key) => current?.[key], WEDDING_CONFIG);
    if (value !== undefined) node.textContent = value;
  });
  $('#greeting').textContent = WEDDING_CONFIG.greeting;
  $('#greeting').style.whiteSpace = 'pre-line';
  document.title = `${WEDDING_CONFIG.groom.givenName} & ${WEDDING_CONFIG.bride.givenName} · 함께 피어나는 날`;
  $('meta[name="description"]').content = `${WEDDING_CONFIG.groom.givenName}과 ${WEDDING_CONFIG.bride.givenName}, 함께 피어나는 날에 초대합니다. 테스트용 모바일 청첩장입니다.`;
  const date = koreanDateParts(WEDDING_CONFIG.date);
  const englishWeekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const koreanWeekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const pad = (number) => String(number).padStart(2, '0');
  const period = date.hour < 12 ? '오전' : '오후';
  const hour = date.hour % 12 || 12;
  const korean = `${date.year}년 ${date.month + 1}월 ${date.day}일 ${koreanWeekdays[date.weekday]}요일 ${period} ${hour}시${date.minute ? ` ${date.minute}분` : ''}`;
  const numeric = `${date.year}. ${pad(date.month + 1)}. ${pad(date.day)}. ${englishWeekdays[date.weekday]} · ${date.hour < 12 ? 'AM' : 'PM'} ${hour}:${pad(date.minute)}`;
  document.querySelectorAll('[data-date]').forEach((node) => {
    node.textContent = node.dataset.date === 'korean' ? korean : node.dataset.date === 'year' ? date.year : numeric;
    if (node.tagName === 'TIME') node.dateTime = WEDDING_CONFIG.date;
  });
  document.querySelectorAll('[data-contact]').forEach((button) => {
    button.addEventListener('click', () => {
      const person = WEDDING_CONFIG[button.dataset.contact];
      copyText(person.phone, `${person.name} · ${person.phone} 연락처를 복사했습니다.`);
      showToast(`${person.name} · ${person.phone} 연락처를 복사했습니다.`);
    });
  });
}

function renderCalendar() {
  const { year, month, day } = koreanDateParts(WEDDING_CONFIG.date);
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const heading = $('#calendar-month');
  heading.replaceChildren(document.createTextNode(months[month] + ' '), element('span', '', String(year)));
  $('#calendar-table').setAttribute('aria-label', `${year}년 ${month + 1}월 예식 달력`);
  const body = $('#calendar-body');
  body.replaceChildren();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  for (let offset = 0; offset < cellCount; offset += 7) {
    const row = element('tr');
    for (let column = 0; column < 7; column++) {
      const number = offset + column - firstWeekday + 1;
      const cell = element('td');
      if (number >= 1 && number <= daysInMonth) {
        const label = element('span', number === day ? 'wedding-day' : '', String(number));
        if (number === day) label.setAttribute('aria-label', `${number}일, 결혼식`);
        cell.append(label);
      }
      row.append(cell);
    }
    body.append(row);
  }
}

function startCountdown() {
  const tick = () => {
    const state = weddingState(WEDDING_CONFIG.date);
    ['days', 'hours', 'minutes', 'seconds'].forEach((key) => {
      $(`#count-${key}`).textContent = String(state[key]).padStart(2, '0');
    });
    const names = `${WEDDING_CONFIG.groom.givenName} ♥ ${WEDDING_CONFIG.bride.givenName}`;
    const message = state.daysUntil > 0 ? `${names}, 결혼식까지 ${state.daysUntil}일 남았습니다.` : state.daysUntil === 0 ? `${names}, 오늘은 두 사람이 하나 되는 날입니다.` : `${names}, 부부로 함께한 지 ${Math.abs(state.daysUntil)}일이 되었습니다.`;
    // Announce only a changed day message, never every second.
    if ($('#dday-message').textContent !== message) $('#dday-message').textContent = message;
  };
  tick();
  setInterval(tick, 1000);
}

function attachImage(frame, src, alt, eager = false) {
  frame.querySelector('img')?.remove();
  frame.classList.remove('has-image');
  if (!src || !src.trim()) return;
  const image = new Image();
  image.alt = alt;
  image.loading = eager ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.addEventListener('load', () => frame.classList.add('has-image'), { once: true });
  image.addEventListener('error', () => {
    image.remove();
    frame.classList.remove('has-image');
  }, { once: true });
  image.src = src;
  frame.append(image);
}

function setupGallery() {
  attachImage($('#cover-image'), WEDDING_CONFIG.coverImage, `${WEDDING_CONFIG.groom.name}과 ${WEDDING_CONFIG.bride.name}의 웨딩 사진`, true);
  const photos = WEDDING_CONFIG.gallery;
  const dialog = $('#lightbox');
  let activeIndex = 0;
  const showPhoto = (index) => {
    if (!photos.length) return;
    activeIndex = (index + photos.length) % photos.length;
    const photo = photos[activeIndex];
    const frame = $('#lightbox-image');
    frame.setAttribute('role', 'img');
    frame.setAttribute('aria-label', photo.src ? photo.alt : `${photo.caption} · 사진 대신 꽃 일러스트`);
    attachImage(frame, photo.src, photo.alt, true);
    $('#photo-counter').textContent = `${activeIndex + 1} / ${photos.length}`;
    $('#photo-caption').textContent = photo.caption;
  };
  const grid = $('#gallery-grid');
  photos.forEach((photo, index) => {
    const button = element('button', 'gallery-item media-frame');
    button.type = 'button';
    button.setAttribute('aria-label', `${index + 1}번 사진 확대: ${photo.alt}${photo.src ? '' : ' (꽃 일러스트 플레이스홀더)'}`);
    button.setAttribute('aria-haspopup', 'dialog');
    attachImage(button, photo.src, '', index === 0);
    button.addEventListener('click', () => { showPhoto(index); openDialog(dialog); });
    grid.append(button);
  });
  if (!photos.length) grid.append(element('p', 'section-description', '소중한 순간을 곧 기록할 예정입니다.'));
  $('#lightbox-close').addEventListener('click', () => dialog.close());
  $('#photo-prev').addEventListener('click', () => showPhoto(activeIndex - 1));
  $('#photo-next').addEventListener('click', () => showPhoto(activeIndex + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
}

function setupLocation() {
  const venue = WEDDING_CONFIG.venue;
  const query = encodeURIComponent(venue.mapQuery);
  $('#naver-map').href = `https://map.naver.com/p/search/${query}`;
  $('#kakao-map').href = `https://map.kakao.com/link/search/${query}`;
  $('#copy-address').addEventListener('click', () => copyText(venue.address, '예식장 주소를 복사했습니다.'));
  venue.transport.forEach((item) => {
    const row = element('div', 'transport-item');
    row.append(element('h3', '', item.title), element('p', '', item.text));
    $('#transport-list').append(row);
  });
}

function renderAccounts() {
  WEDDING_CONFIG.accounts.forEach((group) => {
    const details = element('details', 'account-group');
    details.append(element('summary', '', group.title));
    group.members.forEach((member) => {
      const row = element('div', 'account-row');
      const info = element('div');
      info.append(element('p', '', `${member.relation} ${member.name}`), element('small', '', `${member.bank} ${member.number}`));
      const button = element('button', 'copy-button', '복사');
      button.type = 'button';
      button.setAttribute('aria-label', `${member.name} 계좌번호 복사`);
      button.addEventListener('click', () => copyText(member.number, `${member.name} 님의 계좌번호를 복사했습니다.`));
      row.append(info, button);
      details.append(row);
    });
    $('#account-groups').append(details);
  });
}

function setupMusic() {
  const audio = $('#background-music');
  const button = $('#music-toggle');
  let pending = false;
  const sync = () => {
    const playing = !audio.paused;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? '배경음악 일시정지' : '배경음악 재생');
    $('#music-label').textContent = playing ? 'BGM ON' : 'BGM OFF';
  };
  // No source assignment or play call until the visitor clicks.
  button.addEventListener('click', async () => {
    if (pending) return;
    if (!WEDDING_CONFIG.musicSrc.trim()) {
      showToast('배경음악을 준비 중입니다.');
      return;
    }
    if (!audio.paused) { audio.pause(); return; }
    pending = true;
    button.disabled = true;
    try {
      if (!audio.getAttribute('src')) audio.src = WEDDING_CONFIG.musicSrc;
      await audio.play();
    } catch {
      showToast('지금은 배경음악을 재생할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      pending = false;
      button.disabled = false;
      sync();
    }
  });
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('error', () => {
    audio.pause();
    sync();
    showToast('지금은 배경음악을 재생할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  });
}

function setupScrollAnimation() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  const sections = document.querySelectorAll('.reveal');
  sections.forEach((section) => observer.observe(section));
  document.documentElement.classList.add('motion-ready');
  // Keyboard navigation must never land inside an invisible section.
  document.addEventListener('focusin', (event) => event.target.closest('.reveal')?.classList.add('is-visible'));
  preference.addEventListener('change', (event) => {
    if (event.matches) {
      observer.disconnect();
      document.documentElement.classList.remove('motion-ready');
    }
  });
}

function initInvitation() {
  document.querySelectorAll('dialog').forEach(prepareDialog);
  $('#copy-dialog-close').addEventListener('click', () => $('#copy-dialog').close());
  $('#share-button').addEventListener('click', () => {
    if (window.location.protocol === 'file:') {
      showToast('현재는 로컬 파일입니다. 배포 후 공개 링크를 복사할 수 있어요.');
      return;
    }
    const url = new URL(window.location.href);
    url.hash = '';
    copyText(url.href, '청첩장 링크를 복사했습니다.');
  });
  renderInformation();
  renderCalendar();
  startCountdown();
  setupGallery();
  setupLocation();
  renderAccounts();
  setupMusic();
  setupScrollAnimation();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initInvitation, { once: true });
else initInvitation();
