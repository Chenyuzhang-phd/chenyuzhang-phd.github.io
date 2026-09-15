/* ================================================================
   main.js  —  全部交互逻辑
   功能：主题切换（本地存储）、移动端导航、滚动高亮、
         项目过滤、模态框、返回顶部、平滑滚动
   ================================================================ */

(function () {
  'use strict';

  /* ======================== 主题切换 ======================== */
  const html = document.documentElement;
  const themeToggles = document.querySelectorAll('#themeToggle, #themeToggleMobile');

  // 初始化主题（读取本地存储或系统偏好）
  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'dark');
    }
    updateThemeIcons();
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcons();
  }

  function updateThemeIcons() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    themeToggles.forEach(function (btn) {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
  }

  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });

  initTheme();


  /* ======================== 移动端导航 ======================== */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // 点击导航链接后关闭菜单
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }


  /* ======================== 导航栏滚动效果 ======================== */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    // 导航栏阴影
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 20);
    }

    // 返回顶部按钮
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 400);
    }
  }, { passive: true });


  /* ======================== 返回顶部 ======================== */
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ======================== 滚动高亮导航 ======================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach(function (sec) { observer.observe(sec); });
  }


  /* ======================== 项目过滤 ======================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // 更新按钮状态
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(function (card) {
        const category = card.getAttribute('data-category');
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          card.classList.remove('hidden');
          // 重新触发动画
          card.style.animation = 'none';
          card.offsetHeight; // 强制回流
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  /* ======================== 模态框 ======================== */
  // 全局暴露 openModal / closeModal
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ESC 键关闭模态框
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // 动态替换 QR 占位符（如果图片存在）
  function tryLoadQR(modalId, imgPath) {
    const testImg = new Image();
    testImg.onload = function () {
      const placeholder = document.querySelector('#' + modalId + ' .qr-placeholder');
      if (placeholder) {
        placeholder.innerHTML = '';
        const img = document.createElement('img');
        img.src = imgPath;
        img.alt = '二维码';
        img.style.cssText = 'width:200px;height:200px;border-radius:12px;object-fit:contain;';
        placeholder.appendChild(img);
        placeholder.style.border = 'none';
      }
    };
    testImg.src = imgPath;
  }

  // 尝试加载二维码图片（如果用户已放置）
  tryLoadQR('wechatModal', 'assets/wechat-qr.png');
  tryLoadQR('qqModal', 'assets/qq-qr.png');


  /* ======================== 平滑滚动 ======================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 64; // 导航栏高度
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });


  /* ======================== 滚动渐入动画 ======================== */
  const animElements = document.querySelectorAll('.glass, .section-header, .hero-text > *');

  if ('IntersectionObserver' in window && animElements.length) {
    const animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          animObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    animElements.forEach(function (el) {
      // 排除英雄区域的元素（它们已有自己的动画）
      if (el.closest('.hero')) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      animObserver.observe(el);
    });
  }

})();
