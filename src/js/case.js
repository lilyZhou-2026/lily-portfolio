import '../styles/main.css';
import '../styles/case.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 滚动浮现：可重播 ---------- */
if (!reduceMotion) {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40, filter: 'blur(6px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'restart none none reset',
        },
      },
    );
  });
}

/* ---------- OUTCOME 数字滚动 ---------- */
const counters = gsap.utils.toArray('[data-counter]');

const formatValue = (value, decimals) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

if (!reduceMotion && counters.length) {
  counters.forEach((el) => {
    const target = parseFloat(el.dataset.counter);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const state = { v: 0 };
    gsap.to(state, {
      v: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'restart none none reset',
      },
      onUpdate: () => {
        el.textContent = formatValue(state.v, decimals);
      },
    });
  });
} else {
  counters.forEach((el) => {
    const target = parseFloat(el.dataset.counter);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    el.textContent = formatValue(target, decimals);
  });
}

/* ---------- 素材浏览器 ----------
   每个案例页在自身的内联脚本里定义 window.__CASE_GALLERY__ */
const GALLERY = window.__CASE_GALLERY__;
const root = document.getElementById('explorer');

if (GALLERY && root) {
  const tabsBox = root.querySelector('.explorer__tabs');
  const stage = root.querySelector('.explorer__stage');
  const nameEl = root.querySelector('.explorer__name');
  const thumbsBox = root.querySelector('.explorer__thumbs');
  const linkBox = root.querySelector('.explorer__linkbox');
  const hintEl = root.querySelector('.explorer__hint');
  const prevBtn = root.querySelector('.explorer__nav--prev');
  const nextBtn = root.querySelector('.explorer__nav--next');
  const floatBox = root.querySelector('.explorer__float');

  const state = { type: Object.keys(GALLERY)[0], index: 0 };
  let activeVideo = null;

  const stopVideo = () => {
    if (activeVideo) {
      activeVideo.pause();
      activeVideo = null;
    }
  };

  const buildView = (item) => {
    const view = document.createElement('div');
    view.className = `explorer__view explorer__view--${item.kind}`;
    // 纯外链卡片（暂无截图素材的线上物料）
    if (item.kind === 'link') {
      view.classList.add('explorer__view--linkcard');
      const a = document.createElement('a');
      a.className = 'linkcard';
      a.href = item.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `<span class="linkcard__label">${item.linkLabel || '查看原文 ↗'}</span><span class="linkcard__title">${item.name}</span>`;
      view.appendChild(a);
      return view;
    }
    if (item.kind === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.poster = item.cover;
      video.src = item.src;
      view.appendChild(video);
      activeVideo = video;
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.name;
      img.loading = 'lazy';
      view.appendChild(img);
    }
    // 带外链的图片素材：悬浮预览图浮现按钮，点击直达原文/回放
    if (item.link && item.kind === 'image') {
      const a = document.createElement('a');
      a.className = 'explorer__overlay';
      a.href = item.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', item.linkLabel || '查看原文');
      const chip = document.createElement('span');
      chip.textContent = item.linkLabel || '查看原文 ↗';
      a.appendChild(chip);
      view.appendChild(a);
    }
    return view;
  };

  const render = () => {
    const group = GALLERY[state.type];
    const item = group.items[state.index];

    stopVideo();
    stage.querySelectorAll('.explorer__view').forEach((v) => v.remove());

    const view = buildView(item);
    stage.appendChild(view);

    nameEl.textContent = item.name;

    // 多素材时显示切换箭头
    const multi = group.items.length > 1;
    prevBtn.classList.toggle('is-hidden', !multi);
    nextBtn.classList.toggle('is-hidden', !multi);

    // 缩略图（同类型多素材时显示）
    thumbsBox.innerHTML = '';
    if (group.items.length > 1) {
      group.items.forEach((it, i) => {
        const thumb = document.createElement('button');
        thumb.className = `explorer__thumb${i === state.index ? ' is-active' : ''}`;
        thumb.type = 'button';
        thumb.setAttribute('aria-label', it.name);
        if (it.kind === 'video' && !it.cover) {
          // 无封面视频：深色占位 + 播放图标
          thumb.classList.add('explorer__thumb--fallback');
          thumb.innerHTML =
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>';
        } else {
          const img = document.createElement('img');
          img.src = it.kind === 'video' ? it.cover : it.src;
          img.alt = '';
          thumb.appendChild(img);
        }
        thumb.addEventListener('click', () => {
          state.index = i;
          render();
        });
        thumbsBox.appendChild(thumb);
      });
    }

    // 长图类外链素材：滚动到接近底部时，浮现外链悬浮按钮（如 Watch Recording）
    floatBox.classList.add('is-hidden');
    floatBox.innerHTML = '';
    if (item.kind === 'long' && item.link) {
      const a = document.createElement('a');
      a.className = 'explorer__float-btn';
      a.href = item.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = item.linkLabel || '查看原文 ↗';
      floatBox.appendChild(a);
      floatBox.classList.remove('is-hidden');
      const onScroll = () => {
        const nearEnd =
          view.scrollTop + view.clientHeight >=
          view.scrollHeight - view.clientHeight * 0.3;
        floatBox.classList.toggle('is-visible', nearEnd);
      };
      view.addEventListener('scroll', onScroll);
    }

    // 长图类外链的常显小按钮（悬浮按钮出现前的入口）

    // 提示语：长图可滚动 / 视频可播放
    hintEl.textContent =
      item.kind === 'long'
        ? '长图素材 · 可在框内上下滚动查看'
        : item.kind === 'video'
          ? '点击播放键观看视频'
          : '';

    // 切换淡入
    if (!reduceMotion) {
      gsap.fromTo(
        view,
        { autoAlpha: 0, scale: 0.985 },
        { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.out' },
      );
    } else {
      view.style.visibility = 'visible';
    }
  };

  // 上一个 / 下一个：循环切换
  const step = (delta) => {
    const len = GALLERY[state.type].items.length;
    if (len < 2) return;
    state.index = (state.index + delta + len) % len;
    render();
  };

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  // 生成类型标签
  Object.entries(GALLERY).forEach(([key, group]) => {
    const tab = document.createElement('button');
    tab.className = `explorer__tab${key === state.type ? ' is-active' : ''}`;
    tab.type = 'button';
    // 类型标签：不显示素材数量，避免暗示「仅此 N 个素材」
    tab.textContent = group.label;
    tab.addEventListener('click', () => {
      if (state.type === key) return;
      state.type = key;
      state.index = 0;
      tabsBox
        .querySelectorAll('.explorer__tab')
        .forEach((t) => t.classList.toggle('is-active', t === tab));
      render();
    });
    tabsBox.appendChild(tab);
  });

  render();
}

/* ---------- Project 4 · 胶片滚动（case-channel 专用） ---------- */
const filmEl = document.querySelector('.film');
if (filmEl && window.__FILM_ITEMS__) {
  const filmItems = window.__FILM_ITEMS__;
  const bandEl = filmEl.querySelector('.film__band');
  const enlargeBox = document.querySelector('.film-enlarge');
  const enlargeImg = enlargeBox ? enlargeBox.querySelector('img') : null;
  let dir = 1;
  let paused = false;

  filmItems.forEach((item, i) => {
    const frame = document.createElement('button');
    frame.className = 'film__frame';
    frame.type = 'button';
    frame.setAttribute('aria-label', item.name);
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    frame.appendChild(img);
    frame.addEventListener('mouseenter', () => {
      paused = true;
    });
    frame.addEventListener('mouseleave', () => {
      paused = false;
    });
    if (enlargeImg) {
      frame.addEventListener('click', () => {
        enlargeImg.src = item.src;
        enlargeImg.alt = item.name;
        enlargeBox.classList.remove('is-hidden');
      });
    }
    bandEl.appendChild(frame);
  });

  if (enlargeBox) {
    enlargeBox.addEventListener('click', () =>
      enlargeBox.classList.add('is-hidden'),
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') enlargeBox.classList.add('is-hidden');
    });
  }

  if (!reduceMotion) {
    let dirFlag = 1;
    gsap.ticker.add(() => {
      if (paused) return;
      filmEl.scrollTop += 0.5 * dir;
      const max = filmEl.scrollHeight - filmEl.clientHeight;
      if (max > 0) {
        if (filmEl.scrollTop >= max - 1) dir = -1;
        else if (filmEl.scrollTop <= 1) dir = 1;
      }
    });
  }
}

