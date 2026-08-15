/* ═══════════════════════════════════════════════════════════
   REROUTE — Main JavaScript
   Interactive animations, globe, charts, scroll effects
   ═══════════════════════════════════════════════════════════ */

// ─── Globe / Particle Map Animation ───
class GlobeAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.routes = [];
    this.animationFrame = null;
    this.time = 0;
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;
  }

  init() {
    // Create background star-like particles
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    // Define shipping route paths (simplified coordinates on screen)
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Hormuz route (red, pulsing danger)
    this.routes.push({
      points: this.generateCurve(
        { x: w * 0.55, y: h * 0.35 },
        { x: w * 0.58, y: h * 0.42 },
        { x: w * 0.62, y: h * 0.5 },
        20
      ),
      color: '#ef4444',
      glowColor: 'rgba(239, 68, 68, 0.3)',
      blocked: true,
      particleColor: '#ef4444',
      width: 2,
    });

    // East-West Pipeline route (teal)
    this.routes.push({
      points: this.generateCurve(
        { x: w * 0.5, y: h * 0.38 },
        { x: w * 0.42, y: h * 0.4 },
        { x: w * 0.35, y: h * 0.45 },
        25
      ),
      color: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.2)',
      blocked: false,
      particleColor: '#22d3ee',
      width: 1.5,
    });

    // Cape of Good Hope route (blue, long curve)
    this.routes.push({
      points: this.generateMultiCurve([
        { x: w * 0.55, y: h * 0.4 },
        { x: w * 0.48, y: h * 0.55 },
        { x: w * 0.38, y: h * 0.7 },
        { x: w * 0.3, y: h * 0.75 },
        { x: w * 0.25, y: h * 0.65 },
        { x: w * 0.28, y: h * 0.5 },
      ], 40),
      color: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.15)',
      blocked: false,
      particleColor: '#60a5fa',
      width: 1.5,
    });

    // Supply route to India (amber)
    this.routes.push({
      points: this.generateCurve(
        { x: w * 0.58, y: h * 0.42 },
        { x: w * 0.65, y: h * 0.48 },
        { x: w * 0.7, y: h * 0.45 },
        20
      ),
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.2)',
      blocked: false,
      particleColor: '#fbbf24',
      width: 1.5,
    });

    // Route particles
    this.routes.forEach((route) => {
      route.travelingParticles = [];
      for (let i = 0; i < 3; i++) {
        route.travelingParticles.push({
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
        });
      }
    });

    this.animate();
  }

  generateCurve(start, control, end, segments) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
      const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
      points.push({ x, y });
    }
    return points;
  }

  generateMultiCurve(waypoints, totalSegments) {
    const points = [];
    const segPerSection = Math.floor(totalSegments / (waypoints.length - 1));
    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      const mid = {
        x: (start.x + end.x) / 2 + (Math.random() - 0.5) * 40,
        y: (start.y + end.y) / 2 + (Math.random() - 0.5) * 40,
      };
      for (let j = 0; j <= segPerSection; j++) {
        const t = j / segPerSection;
        const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * mid.x + t * t * end.x;
        const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * mid.y + t * t * end.y;
        points.push({ x, y });
      }
    }
    return points;
  }

  animate() {
    this.time += 0.01;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background particles (stars)
    this.particles.forEach((p) => {
      const pulse = Math.sin(this.time * p.pulseSpeed * 100) * 0.3 + 0.7;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(139, 149, 176, ${p.opacity * pulse})`;
      this.ctx.fill();
    });

    // Draw the Hormuz chokepoint marker
    const w = this.canvas.width;
    const h = this.canvas.height;
    const hormuzX = w * 0.57;
    const hormuzY = h * 0.4;

    // Pulsing danger circle
    const pulseSize = Math.sin(this.time * 3) * 15 + 35;
    this.ctx.beginPath();
    this.ctx.arc(hormuzX, hormuzY, pulseSize, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(239, 68, 68, ${0.05 + Math.sin(this.time * 3) * 0.03})`;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(hormuzX, hormuzY, 20, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // X mark for blocked
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(hormuzX - 6, hormuzY - 6);
    this.ctx.lineTo(hormuzX + 6, hormuzY + 6);
    this.ctx.moveTo(hormuzX + 6, hormuzY - 6);
    this.ctx.lineTo(hormuzX - 6, hormuzY + 6);
    this.ctx.stroke();

    // Draw routes
    this.routes.forEach((route) => {
      // Glow
      this.ctx.strokeStyle = route.glowColor;
      this.ctx.lineWidth = route.width + 4;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      route.points.forEach((p, i) => {
        if (i === 0) this.ctx.moveTo(p.x, p.y);
        else this.ctx.lineTo(p.x, p.y);
      });
      this.ctx.stroke();

      // Line
      if (route.blocked) {
        this.ctx.setLineDash([6, 6]);
        this.ctx.lineDashOffset = -this.time * 50;
      } else {
        this.ctx.setLineDash([]);
      }
      this.ctx.strokeStyle = route.color;
      this.ctx.lineWidth = route.width;
      this.ctx.beginPath();
      route.points.forEach((p, i) => {
        if (i === 0) this.ctx.moveTo(p.x, p.y);
        else this.ctx.lineTo(p.x, p.y);
      });
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Traveling particles along routes
      if (!route.blocked) {
        route.travelingParticles.forEach((tp) => {
          tp.progress += tp.speed;
          if (tp.progress > 1) tp.progress = 0;

          const idx = Math.floor(tp.progress * (route.points.length - 1));
          const point = route.points[idx];
          if (point) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = route.particleColor;
            this.ctx.fill();

            // Trail glow
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = route.glowColor;
            this.ctx.fill();
          }
        });
      }

      // Start and end nodes
      const start = route.points[0];
      const end = route.points[route.points.length - 1];
      [start, end].forEach((node) => {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = route.color;
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 7, 0, Math.PI * 2);
        this.ctx.strokeStyle = route.color;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      });
    });

    // Label for Hormuz
    this.ctx.font = '600 11px Inter, sans-serif';
    this.ctx.fillStyle = '#ef4444';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('STRAIT OF HORMUZ', hormuzX, hormuzY - 30);
    this.ctx.font = '500 9px "JetBrains Mono", monospace';
    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    this.ctx.fillText('BLOCKED', hormuzX, hormuzY - 18);

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// ─── Exposure Map Mini Canvas ───
class ExposureMapCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.resize();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
  }

  animate() {
    this.time += 0.01;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Draw simplified world map outline (dots)
    const mapPoints = [
      // Middle East region (highlighted)
      { x: 0.52, y: 0.35, size: 3, color: '#ef4444', label: 'Persian Gulf' },
      { x: 0.48, y: 0.4, size: 2, color: '#f59e0b', label: 'Red Sea' },
      { x: 0.55, y: 0.42, size: 2, color: '#ef4444', label: 'Hormuz' },
      // India
      { x: 0.65, y: 0.45, size: 3, color: '#06b6d4', label: 'India' },
      // SE Asia
      { x: 0.75, y: 0.45, size: 2, color: '#06b6d4', label: 'SE Asia' },
      // Europe
      { x: 0.42, y: 0.25, size: 2, color: '#3b82f6', label: 'Europe' },
      // Africa
      { x: 0.42, y: 0.6, size: 2, color: '#8b5cf6', label: 'Africa' },
      { x: 0.35, y: 0.7, size: 2, color: '#3b82f6', label: 'Cape' },
    ];

    // Draw connection lines
    const connections = [
      [0, 3], // Gulf to India
      [0, 4], // Gulf to SE Asia
      [0, 2], // Gulf to Hormuz
      [2, 3], // Hormuz to India (blocked)
      [1, 5], // Red Sea to Europe
      [6, 7], // Africa to Cape
    ];

    connections.forEach(([from, to]) => {
      const p1 = mapPoints[from];
      const p2 = mapPoints[to];
      const isBlocked = from === 2 || to === 2;

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x * w, p1.y * h);
      this.ctx.lineTo(p2.x * w, p2.y * h);

      if (isBlocked) {
        this.ctx.setLineDash([4, 4]);
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      } else {
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      }
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    });

    // Draw points
    mapPoints.forEach((p) => {
      const x = p.x * w;
      const y = p.y * h;

      // Glow
      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size + 8, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.replace(')', ', 0.1)').replace('rgb', 'rgba');
      this.ctx.fill();

      // Dot
      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();

      // Label
      this.ctx.font = '500 9px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(139, 149, 176, 0.7)';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(p.label, x, y + p.size + 14);
    });

    // Animated pulse on Hormuz
    const hx = 0.55 * w;
    const hy = 0.42 * h;
    const pulse = Math.sin(this.time * 4) * 10 + 15;
    this.ctx.beginPath();
    this.ctx.arc(hx, hy, pulse, 0, Math.PI * 2);
    this.ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 - pulse * 0.01})`;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    requestAnimationFrame(() => this.animate());
  }
}

// ─── Price Chart Canvas ───
class PriceChartCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.drawn = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    if (this.drawn) this.draw();
  }

  draw() {
    this.drawn = true;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    this.ctx.clearRect(0, 0, w, h);

    // Grid lines
    const priceLabels = ['$80', '$100', '$120', '$140', '$160'];
    priceLabels.forEach((label, i) => {
      const y = padding.top + (chartH / (priceLabels.length - 1)) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(w - padding.right, y);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.ctx.font = '500 10px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(139, 149, 176, 0.5)';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(priceLabels[priceLabels.length - 1 - i], padding.left - 8, y + 4);
    });

    // Time labels
    const timeLabels = ['Pre-crisis', 'Day 1', 'Week 1', 'Week 4', 'Week 8', 'Week 12'];
    timeLabels.forEach((label, i) => {
      const x = padding.left + (chartW / (timeLabels.length - 1)) * i;
      this.ctx.font = '500 9px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(139, 149, 176, 0.5)';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(label, x, h - padding.bottom + 20);
    });

    // "Disruption" marker
    const disruptionX = padding.left + chartW * 0.15;
    this.ctx.beginPath();
    this.ctx.moveTo(disruptionX, padding.top);
    this.ctx.lineTo(disruptionX, h - padding.bottom);
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    this.ctx.setLineDash([4, 4]);
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.font = '600 9px Inter, sans-serif';
    this.ctx.fillStyle = '#ef4444';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⚠ DISRUPTION', disruptionX, padding.top - 8);

    // Price to Y helper
    const priceToY = (price) => {
      const minP = 80;
      const maxP = 160;
      return padding.top + chartH - ((price - minP) / (maxP - minP)) * chartH;
    };

    // Actual price line (before disruption)
    const actualPrices = [85, 87, 84, 86];
    const actualXStep = (chartW * 0.15) / (actualPrices.length - 1);

    this.ctx.beginPath();
    actualPrices.forEach((price, i) => {
      const x = padding.left + actualXStep * i;
      const y = priceToY(price);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.strokeStyle = '#e8ecf4';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Worst case (red band upper)
    const worstPrices = [86, 125, 148, 155, 152, 145];
    const basePrices = [86, 110, 132, 142, 138, 128];
    const bestPrices = [86, 98, 115, 120, 112, 105];
    const forecastXStep = (chartW * 0.85) / (basePrices.length - 1);
    const forecastStartX = disruptionX;

    // Fill area between worst and best (confidence band)
    this.ctx.beginPath();
    worstPrices.forEach((price, i) => {
      const x = forecastStartX + forecastXStep * i;
      const y = priceToY(price);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    for (let i = bestPrices.length - 1; i >= 0; i--) {
      const x = forecastStartX + forecastXStep * i;
      const y = priceToY(bestPrices[i]);
      this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(245, 158, 11, 0.07)';
    this.ctx.fill();

    // Worst case line
    this.ctx.beginPath();
    worstPrices.forEach((price, i) => {
      const x = forecastStartX + forecastXStep * i;
      const y = priceToY(price);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Best case line
    this.ctx.beginPath();
    bestPrices.forEach((price, i) => {
      const x = forecastStartX + forecastXStep * i;
      const y = priceToY(price);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Base case line (main forecast)
    this.ctx.beginPath();
    basePrices.forEach((price, i) => {
      const x = forecastStartX + forecastXStep * i;
      const y = priceToY(price);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // Data points on base case
    basePrices.forEach((price, i) => {
      const x = forecastStartX + forecastXStep * i;
      const y = priceToY(price);
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fill();
    });

    // Current price label
    const currentX = forecastStartX + forecastXStep * 2;
    const currentY = priceToY(basePrices[2]);
    this.ctx.font = '700 11px "JetBrains Mono", monospace';
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('$' + basePrices[2], currentX + 8, currentY - 8);
  }
}

// ─── Scroll Reveal ───
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Animate route bars when visible
          if (entry.target.classList.contains('routes-overview')) {
            setTimeout(() => {
              entry.target.querySelectorAll('.route-bar__fill').forEach((fill) => {
                fill.classList.add('animate');
              });
            }, 300);
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// ─── Counter Animation ───
function animateCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('[data-target]');
          counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = performance.now();

            function update(currentTime) {
              const elapsed = currentTime - start;
              const progress = Math.min(elapsed / duration, 1);
              // Easing
              const eased = 1 - Math.pow(1 - progress, 3);
              counter.textContent = Math.floor(eased * target);
              if (progress < 1) requestAnimationFrame(update);
            }

            requestAnimationFrame(update);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsSection = document.querySelector('.hero__stats');
  if (statsSection) observer.observe(statsSection);
}

// ─── Product Tabs ───
function initProductTabs() {
  const tabs = document.querySelectorAll('.product-tab');
  const screens = document.querySelectorAll('.product-screen');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      // Remove active from all
      tabs.forEach((t) => t.classList.remove('active'));
      screens.forEach((s) => {
        s.classList.remove('active');
        s.style.display = 'none';
      });

      // Activate selected
      tab.classList.add('active');
      const targetScreen = document.getElementById(`screen-${targetId}`);
      if (targetScreen) {
        targetScreen.style.display = 'block';
        targetScreen.classList.add('active');

        // Init price chart when pricing tab is shown
        if (targetId === 'pricing') {
          setTimeout(() => {
            const priceCanvas = document.getElementById('priceChart');
            if (priceCanvas && !priceCanvas._chart) {
              priceCanvas._chart = new PriceChartCanvas(priceCanvas);
              priceCanvas._chart.draw();
            }
          }, 100);
        }
      }
    });
  });
}

// ─── Scroll Progress Bar ───
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = progress + '%';
  });
}

// ─── Navigation ───
function initNavigation() {
  const nav = document.getElementById('nav');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks.classList.remove('open');
      }
    });
  });
}

// ─── Init Everything ───
document.addEventListener('DOMContentLoaded', () => {
  // Hero globe animation
  const globeCanvas = document.getElementById('globeCanvas');
  if (globeCanvas) {
    new GlobeAnimation(globeCanvas);
  }

  // Exposure map mini canvas
  const exposureMapCanvas = document.getElementById('exposureMapCanvas');
  if (exposureMapCanvas) {
    new ExposureMapCanvas(exposureMapCanvas);
  }

  initScrollReveal();
  animateCounters();
  initProductTabs();
  initNavigation();
  initScrollProgress();

  // Re-initialize lucide icons after DOM is ready
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Activate first product screen
  const firstScreen = document.getElementById('screen-exposure');
  if (firstScreen) {
    firstScreen.style.display = 'block';
  }
});
