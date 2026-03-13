/* ============================================================
   OAK RUN COMMAND CENTER v3 — APPLICATION LOGIC
   Tab system, charts, animations, interactivity
   ============================================================ */

(function() {
  'use strict';

  // ===== PHOTO DATA =====
  const PHOTOS = [
    { file: '0a4662f9e87db52675cb4422c9f7fffa-uncropped_scaled_within_1536_1152.webp', caption: 'Exterior Aerial' },
    { file: 'b0ab719680e6a32db4495e04440eabc6-uncropped_scaled_within_1536_1152.webp', caption: 'Entry' },
    { file: '2c2de323cd39893295bb5741420d8212-uncropped_scaled_within_1536_1152.webp', caption: 'Interior' },
    { file: '817cb5fc3db3b221b2cd057a56c04893-uncropped_scaled_within_1536_1152.webp', caption: 'Living Room' },
    { file: 'f3629d3bf9bf4340e916f4e56c74b1eb-uncropped_scaled_within_1536_1152.webp', caption: 'Dining Area' },
    { file: 'c6892066fcaf5bdc97e141805becdf5d-uncropped_scaled_within_1536_1152.webp', caption: 'Kitchen' },
    { file: 'e9467af1d468641e8cc5db7091e73657-uncropped_scaled_within_1536_1152.webp', caption: 'Family Room' },
    { file: '6f277292f15c5bd08afbe08cc9f5316a-uncropped_scaled_within_1536_1152.webp', caption: 'Primary Bedroom' },
    { file: '71645120b1c9051a375c72a458a39a27-uncropped_scaled_within_1536_1152.webp', caption: 'Primary Bath' },
    { file: '239819472c6583a76aeb7476aaaa4650-uncropped_scaled_within_1536_1152.webp', caption: 'Bedroom 2' },
    { file: '93eb6c9a3a2aab042321962416a60012-uncropped_scaled_within_1536_1152.webp', caption: 'Bedroom 3' },
    { file: '9253ba84d23a8d97c66006695d22fcfd-uncropped_scaled_within_1536_1152.webp', caption: 'Guest Bath' },
    { file: '9e98f3df0e5ce98c464d89351d798fae-uncropped_scaled_within_1536_1152.webp', caption: 'Laundry' },
    { file: '7f0b2cc897d1f70533fcee9237840bd6-uncropped_scaled_within_1536_1152.webp', caption: 'Lanai' },
    { file: '9f1408399299fd4ebd31841d22c295ea-uncropped_scaled_within_1536_1152.webp', caption: 'Backyard' },
    { file: '7cae88ba2fbab6ac331581c6d72972bb-uncropped_scaled_within_1536_1152.webp', caption: 'Side Yard' },
    { file: '634203a82e5f29b2e44eb5c8ef08993e-uncropped_scaled_within_1536_1152.webp', caption: 'Garage' },
    { file: '477698153942b53cbc6278f170636d69-uncropped_scaled_within_1536_1152.webp', caption: 'Landscaping' },
    { file: '18eb00aa1d7e9d0b79d934b002865b84-uncropped_scaled_within_1536_1152.webp', caption: 'Community' }
  ];
  const PHOTO_BASE = 'https://photos.zillowstatic.com/fp/';

  // ===== CHART.JS DEFAULTS =====
  function setChartDefaults() {
    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--color-text-muted').trim() || 'rgba(232,234,242,0.55)';
    const gridColor = 'rgba(255,255,255,0.06)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'DM Sans', 'Satoshi', system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.scale = Chart.defaults.scale || {};
    Chart.defaults.elements.point.radius = 3;
    Chart.defaults.elements.point.hoverRadius = 6;
    Chart.defaults.animation.duration = 1200;
    Chart.defaults.animation.easing = 'easeOutQuart';
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
  }

  // ===== TAB SYSTEM =====
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  let chartsInitialized = {};

  function switchTab(tabId) {
    tabBtns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === tabId));
    tabPanes.forEach(p => p.classList.toggle('is-active', p.id === 'tab-' + tabId));

    // Init charts on first visit
    if (tabId === 'analytics' && !chartsInitialized.analytics) {
      initAnalyticsCharts();
      chartsInitialized.analytics = true;
    }
    if (tabId === 'market' && !chartsInitialized.market) {
      initMarketCharts();
      chartsInitialized.market = true;
    }

    // Animate numbers
    animateCounters(document.getElementById('tab-' + tabId));

    // Init gallery
    if (tabId === 'gallery' && !chartsInitialized.gallery) {
      initGallery();
      chartsInitialized.gallery = true;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ===== THEME TOGGLE =====
  const themeToggle = document.getElementById('themeToggle');
  const iconMoon = document.getElementById('iconMoon');
  const iconSun = document.getElementById('iconSun');
  let isDark = true;

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('light-mode', !isDark);
    iconMoon.style.display = isDark ? '' : 'none';
    iconSun.style.display = isDark ? 'none' : '';

    // Rebuild charts with new colors
    Object.keys(chartInstances).forEach(key => {
      if (chartInstances[key]) {
        chartInstances[key].destroy();
        delete chartInstances[key];
      }
    });
    chartsInitialized = {};

    // Reinit visible charts
    const activeTab = document.querySelector('.tab-btn.is-active');
    if (activeTab) {
      const tabId = activeTab.dataset.tab;
      if (tabId === 'analytics') { initAnalyticsCharts(); chartsInitialized.analytics = true; }
      if (tabId === 'market') { initMarketCharts(); chartsInitialized.market = true; }
    }
  });

  // ===== ANIMATED COUNTERS =====
  function animateCounters(container) {
    const counters = container.querySelectorAll('[data-count]');
    counters.forEach(el => {
      const target = parseInt(el.dataset.count);
      const format = el.dataset.format;
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.round(target * eased);

        if (format === 'comma') {
          el.textContent = current.toLocaleString();
        } else {
          el.textContent = current;
        }

        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // ===== HEALTH RING ANIMATION =====
  function animateHealthRing() {
    const ring = document.getElementById('healthRing');
    if (!ring) return;
    const circumference = 2 * Math.PI * 68; // ~427
    const score = 62;
    const target = circumference - (circumference * score / 100);
    // Trigger animation after a brief delay
    setTimeout(() => {
      ring.style.strokeDashoffset = target;
    }, 300);
  }

  // ===== CHART INSTANCES =====
  const chartInstances = {};

  function getAccentColors() {
    const s = getComputedStyle(document.documentElement);
    return {
      green: s.getPropertyValue('--color-green').trim() || '#00e87a',
      gold: s.getPropertyValue('--color-gold').trim() || '#f5c842',
      red: s.getPropertyValue('--color-red').trim() || '#ff4757',
      blue: s.getPropertyValue('--color-blue').trim() || '#3d8ef8',
      purple: s.getPropertyValue('--color-purple').trim() || '#a855f7',
      greenDim: s.getPropertyValue('--color-green-dim').trim() || 'rgba(0,232,122,0.15)',
      blueDim: s.getPropertyValue('--color-blue-dim').trim() || 'rgba(61,142,248,0.15)',
      goldDim: s.getPropertyValue('--color-gold-dim').trim() || 'rgba(245,200,66,0.15)',
      grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      text: isDark ? 'rgba(232,234,242,0.55)' : 'rgba(26,29,43,0.6)',
    };
  }

  // ===== ANALYTICS CHARTS =====
  function initAnalyticsCharts() {
    const c = getAccentColors();

    // Generate realistic view data: spike on days 1-7, then steady 80-120
    const viewData = [];
    for (let i = 0; i < 28; i++) {
      if (i < 3) viewData.push(280 + Math.round(Math.random() * 80));
      else if (i < 7) viewData.push(180 + Math.round(Math.random() * 60));
      else viewData.push(70 + Math.round(Math.random() * 50));
    }

    const saveData = [];
    for (let i = 0; i < 28; i++) {
      if (i < 3) saveData.push(5 + Math.round(Math.random() * 4));
      else if (i < 7) saveData.push(3 + Math.round(Math.random() * 3));
      else saveData.push(1 + Math.round(Math.random() * 2));
    }

    const dayLabels = Array.from({length: 28}, (_, i) => `Day ${i + 1}`);

    // Views chart
    const ctxViews = document.getElementById('chartViews');
    if (ctxViews) {
      chartInstances.views = new Chart(ctxViews, {
        type: 'line',
        data: {
          labels: dayLabels,
          datasets: [{
            label: 'Daily Views',
            data: viewData,
            borderColor: c.blue,
            backgroundColor: c.blueDim,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: c.grid }, ticks: { maxTicksLimit: 7 } },
            y: { grid: { color: c.grid }, beginAtZero: true }
          }
        }
      });
    }

    // Saves chart
    const ctxSaves = document.getElementById('chartSaves');
    if (ctxSaves) {
      chartInstances.saves = new Chart(ctxSaves, {
        type: 'bar',
        data: {
          labels: dayLabels,
          datasets: [{
            label: 'Daily Saves',
            data: saveData,
            backgroundColor: c.gold,
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: c.grid }, ticks: { maxTicksLimit: 7 } },
            y: { grid: { color: c.grid }, beginAtZero: true }
          }
        }
      });
    }

    // Traffic sources donut
    const ctxSources = document.getElementById('chartSources');
    if (ctxSources) {
      chartInstances.sources = new Chart(ctxSources, {
        type: 'doughnut',
        data: {
          labels: ['Zillow Search', 'Zillow Map', 'Agent Referral', 'External'],
          datasets: [{
            data: [45, 28, 15, 12],
            backgroundColor: [c.blue, c.green, c.gold, c.red],
            borderWidth: 0,
            hoverOffset: 8,
          }]
        },
        options: {
          cutout: '65%',
          plugins: { legend: { display: false } },
        }
      });
    }

    // Radar chart
    const ctxRadar = document.getElementById('chartRadar');
    if (ctxRadar) {
      chartInstances.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels: ['Price/sqft', 'Condition', 'Photos', 'DOM Score', 'Price Reduction', 'Location'],
          datasets: [
            {
              label: 'Your Home',
              data: [60, 90, 75, 80, 70, 75],
              borderColor: c.green,
              backgroundColor: 'rgba(0,232,122,0.1)',
              borderWidth: 2,
              pointRadius: 3,
            },
            {
              label: 'Oak Run Avg',
              data: [80, 55, 50, 50, 40, 65],
              borderColor: c.blue,
              backgroundColor: 'rgba(61,142,248,0.08)',
              borderWidth: 2,
              pointRadius: 3,
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: { boxWidth: 12, padding: 12 }
            }
          },
          scales: {
            r: {
              grid: { color: c.grid },
              angleLines: { color: c.grid },
              pointLabels: { font: { size: 11 } },
              beginAtZero: true,
              max: 100,
              ticks: { display: false }
            }
          }
        }
      });
    }
  }

  // ===== MARKET CHARTS =====
  function initMarketCharts() {
    const c = getAccentColors();

    // Price distribution histogram
    const ctxDist = document.getElementById('chartPriceDist');
    if (ctxDist) {
      const priceLabels = ['$100-150k','$150-200k','$200-250k','$250-275k','$275-300k','$300-325k','$325-350k','$350-400k','$400k+'];
      const priceCounts = [15, 45, 85, 60, 55, 37, 18, 9, 3];
      const bgColors = priceCounts.map((_, i) => i === 5 ? c.green : c.blue);

      chartInstances.priceDist = new Chart(ctxDist, {
        type: 'bar',
        data: {
          labels: priceLabels,
          datasets: [{
            label: 'Sales Count',
            data: priceCounts,
            backgroundColor: bgColors,
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          plugins: {
            legend: { display: false },
            annotation: undefined,
          },
          scales: {
            x: {
              grid: { color: c.grid },
              ticks: { font: { size: 11 } }
            },
            y: {
              grid: { color: c.grid },
              beginAtZero: true,
              title: { display: true, text: 'Number of Sales', font: { size: 11 } }
            }
          }
        }
      });
    }

    // Price cut impact chart
    const ctxCut = document.getElementById('chartPriceCut');
    if (ctxCut) {
      chartInstances.priceCut = new Chart(ctxCut, {
        type: 'bar',
        data: {
          labels: ['Current ($309k)', 'Cut to $304,900', 'Cut to $299,900', 'Cut to $289,900'],
          datasets: [
            {
              label: 'Est. Daily Views',
              data: [109, 140, 195, 230],
              backgroundColor: c.blue,
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: 'Est. Daily Saves',
              data: [2.5, 3.5, 5.5, 7],
              backgroundColor: c.gold,
              borderRadius: 6,
              borderSkipped: false,
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: { boxWidth: 12, padding: 16 }
            }
          },
          scales: {
            x: { grid: { color: c.grid } },
            y: { grid: { color: c.grid }, beginAtZero: true }
          }
        }
      });
    }

    // Seasonality chart
    const ctxSeason = document.getElementById('chartSeason');
    if (ctxSeason) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const seasonData = [75, 90, 110, 105, 85, 60, 50, 45, 75, 80, 90, 70];
      const seasonColors = seasonData.map((v, i) => {
        if (i === 2) return c.green; // March highlighted
        if (v >= 100) return c.green;
        if (v >= 80) return c.gold;
        if (v >= 65) return c.blue;
        return c.red;
      });

      chartInstances.season = new Chart(ctxSeason, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: '% of Annual Avg',
            data: seasonData,
            backgroundColor: seasonColors,
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: c.grid } },
            y: {
              grid: { color: c.grid },
              beginAtZero: true,
              title: { display: true, text: '% of Annual Average', font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  // ===== OFFER CALCULATOR =====
  const offerGrid = document.getElementById('offerGrid');
  const offerResult = document.getElementById('offerResult');

  if (offerGrid) {
    offerGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.offer-btn');
      if (!btn) return;

      // Toggle active
      offerGrid.querySelectorAll('.offer-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const offer = parseInt(btn.dataset.offer);
      const commission = offer * 0.06;
      const closing = 8000;
      const net = offer - commission - closing;

      let rec, counter, titleColor;
      if (offer < 280000) {
        rec = 'REJECT — Too low. Below reasonable range.';
        counter = '$298,000';
        titleColor = 'text-red';
      } else if (offer < 290000) {
        rec = 'COUNTER — Below target but negotiable.';
        counter = '$297,000';
        titleColor = 'text-gold';
      } else if (offer < 295000) {
        rec = 'COUNTER — Close. Push for $295k+.';
        counter = '$295,000';
        titleColor = 'text-gold';
      } else if (offer < 300000) {
        rec = 'STRONG COUNTER — Very competitive offer.';
        counter = '$302,000';
        titleColor = 'text-blue';
      } else if (offer < 305000) {
        rec = 'ACCEPT or MINOR COUNTER — Excellent offer.';
        counter = '$305,000';
        titleColor = 'text-green';
      } else {
        rec = 'ACCEPT — At or above target. Take it.';
        counter = 'N/A — Accept as-is';
        titleColor = 'text-green';
      }

      document.getElementById('offerTitle').textContent = `Analysis: $${offer.toLocaleString()} Offer`;
      document.getElementById('offerTitle').className = `fs-lg fw-700 mb-12 ${titleColor}`;
      document.getElementById('offerAmt').textContent = `$${offer.toLocaleString()}`;
      document.getElementById('offerComm').textContent = `-$${commission.toLocaleString()}`;
      document.getElementById('offerClose').textContent = `-$${closing.toLocaleString()}`;
      document.getElementById('offerNet').textContent = `$${net.toLocaleString()}`;
      document.getElementById('offerRec').textContent = rec;
      document.getElementById('offerCounter').textContent = counter;

      offerResult.classList.add('is-visible');
    });
  }

  // ===== COPY BUTTONS =====
  document.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sourceId = btn.dataset.copy;
      const source = document.getElementById(sourceId);
      if (source) {
        navigator.clipboard.writeText(source.textContent.trim()).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });

  // Copy all hashtags
  const copyAllHash = document.getElementById('copyAllHash');
  if (copyAllHash) {
    copyAllHash.addEventListener('click', () => {
      const tags = [];
      document.querySelectorAll('.hashtag-tag').forEach(t => tags.push(t.textContent));
      navigator.clipboard.writeText(tags.join(' ')).then(() => {
        copyAllHash.textContent = 'Copied!';
        copyAllHash.classList.add('copied');
        setTimeout(() => {
          copyAllHash.textContent = 'Copy All Hashtags';
          copyAllHash.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // ===== GALLERY =====
  let currentSlide = 0;

  function initGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    grid.innerHTML = '';
    PHOTOS.forEach((photo, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'gallery-thumb' + (i === 0 ? ' is-active' : '');
      thumb.innerHTML = `<img src="${PHOTO_BASE}${photo.file}" alt="${photo.caption}" loading="lazy">`;
      thumb.addEventListener('click', () => goToSlide(i));
      grid.appendChild(thumb);
    });

    goToSlide(0);
  }

  function goToSlide(index) {
    currentSlide = index;
    const img = document.getElementById('slideImg');
    const counter = document.getElementById('slideCounter');
    const caption = document.getElementById('slideCaption');

    img.src = PHOTO_BASE + PHOTOS[index].file;
    img.alt = PHOTOS[index].caption;
    counter.textContent = `${index + 1} / ${PHOTOS.length}`;
    caption.textContent = PHOTOS[index].caption;

    // Update thumb active
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
      t.classList.toggle('is-active', i === index);
    });
  }

  document.getElementById('slidePrev')?.addEventListener('click', () => {
    goToSlide((currentSlide - 1 + PHOTOS.length) % PHOTOS.length);
  });
  document.getElementById('slideNext')?.addEventListener('click', () => {
    goToSlide((currentSlide + 1) % PHOTOS.length);
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  document.getElementById('gallerySlideshow')?.addEventListener('dblclick', () => {
    openLightbox(currentSlide);
  });

  function openLightbox(index) {
    currentSlide = index;
    lightboxImg.src = PHOTO_BASE + PHOTOS[index].file;
    lightboxCaption.textContent = PHOTOS[index].caption;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => {
    const idx = (currentSlide - 1 + PHOTOS.length) % PHOTOS.length;
    currentSlide = idx;
    lightboxImg.src = PHOTO_BASE + PHOTOS[idx].file;
    lightboxCaption.textContent = PHOTOS[idx].caption;
    goToSlide(idx);
  });
  document.getElementById('lightboxNext')?.addEventListener('click', () => {
    const idx = (currentSlide + 1) % PHOTOS.length;
    currentSlide = idx;
    lightboxImg.src = PHOTO_BASE + PHOTOS[idx].file;
    lightboxCaption.textContent = PHOTOS[idx].caption;
    goToSlide(idx);
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (lightbox?.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev')?.click();
      if (e.key === 'ArrowRight') document.getElementById('lightboxNext')?.click();
    }
    // Gallery arrows when gallery tab is active
    const galleryTab = document.getElementById('tab-gallery');
    if (galleryTab?.classList.contains('is-active') && !lightbox?.classList.contains('is-open')) {
      if (e.key === 'ArrowLeft') document.getElementById('slidePrev')?.click();
      if (e.key === 'ArrowRight') document.getElementById('slideNext')?.click();
    }
  });

  // ===== GAUGE ANIMATION =====
  function animateGauge() {
    const fill = document.querySelector('.gauge-fill');
    if (fill) {
      fill.style.width = '0%';
      setTimeout(() => {
        fill.style.width = '25%';
      }, 500);
    }
  }

  // ===== INIT ON LOAD =====
  function init() {
    setChartDefaults();
    animateHealthRing();
    animateCounters(document.getElementById('tab-command'));
    animateGauge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
