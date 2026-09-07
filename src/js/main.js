import '../styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ?static 静态捕获模式：暂停无限循环动画（截图/录屏/低性能设备）
const isStaticCapture = new URLSearchParams(location.search).has('static');
if (isStaticCapture) document.documentElement.classList.add('static');

/* ---------- 导航：随滚动高亮当前区块 ---------- */
const navLinks = document.querySelectorAll('[data-nav]');
const sections = ['home', 'projects', 'about', 'contact']
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const setActive = (id) => {
  navLinks.forEach((link) =>
    link.classList.toggle('is-active', link.dataset.nav === id),
  );
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  },
  { rootMargin: '-40% 0px -55% 0px' },
);
sections.forEach((section) => sectionObserver.observe(section));

if (reduceMotion) {
  setActive('home');
}

/* ---------- 动效 ---------- */
if (!reduceMotion) {
  // 入场：第一屏自上而下依次浮现
  gsap.set('[data-intro]', { autoAlpha: 0, y: 36, filter: 'blur(8px)' });
  gsap
    .timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
    .to('.nav__inner', { autoAlpha: 1, duration: 0 }, 0)
    .to('[data-intro]', {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.9,
      stagger: 0.12,
    });

  // 滚动进入：区块标题与通用元素上浮显现
  gsap.utils
    .toArray('[data-reveal]:not(.card):not(.info)')
    .forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 44, filter: 'blur(6px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          // 每次向下滚动进入都重新播放；向上滚离后重置，回顶再滚仍会浮现
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'restart none none reset',
          },
        },
      );
    });

  // 卡片类内容：滚动入场时成批错落浮现（位移 + 模糊 + 缩放），Projects / Contact 一致
  const batchEls = gsap.utils.toArray('.card, .info');
  gsap.set(batchEls, { autoAlpha: 0, y: 90, scale: 0.96, filter: 'blur(12px)' });
  ScrollTrigger.batch(batchEls, {
    start: 'top 92%',
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.15,
        overwrite: 'auto',
      }),
    // 向上滚离视口后重置为隐藏，保证下次向下滚动重新播放
    onLeaveBack: (batch) =>
      gsap.set(batch, { autoAlpha: 0, y: 90, scale: 0.96, filter: 'blur(12px)' }),
  });

  // About Quick Facts：与左侧文字同步浮现，卡片整体先入、行级依次错落
  const facts = document.querySelector('.about__facts');
  if (facts) {
    const rows = gsap.utils.toArray('.facts__row', facts);
    const btn = facts.querySelector('.about__facts-btn');
    gsap.set(facts, { autoAlpha: 0, y: 44, filter: 'blur(6px)' });
    gsap.set(rows, { autoAlpha: 0, y: 16 });
    if (btn) gsap.set(btn, { autoAlpha: 0, y: 16 });
    gsap
      .timeline({
        scrollTrigger: {
          trigger: facts,
          start: 'top 82%',
          toggleActions: 'restart none none reset',
        },
      })
      .to(facts, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'power3.out',
      })
      .to(
        rows,
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.25',
      )
      .to(
        btn,
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.2',
      );
  }

  // 装饰形状：缓慢漂浮（静态捕获模式下跳过）
  if (!isStaticCapture) {
    gsap.utils.toArray('.shape').forEach((shape, i) => {
      gsap.to(shape, {
        y: i % 2 === 0 ? -26 : 24,
        x: i % 2 === 0 ? 14 : -12,
        rotation: i * 4,
        duration: 5 + i * 1.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });
  }
}

/* ---------- 网站说明浮层 ---------- */
const noticeModal = document.getElementById('notice-modal');
if (noticeModal) {
  const openNotice = () => {
    noticeModal.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
  };
  const closeNotice = () => {
    noticeModal.classList.add('is-hidden');
    document.body.style.overflow = '';
  };
  document.getElementById('notice-open').addEventListener('click', openNotice);
  document.getElementById('notice-close').addEventListener('click', closeNotice);
  noticeModal.addEventListener('click', (e) => {
    if (e.target === noticeModal) closeNotice();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !noticeModal.classList.contains('is-hidden')) closeNotice();
  });
}
