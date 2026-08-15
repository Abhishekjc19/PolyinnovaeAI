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
    this.nodes = [];
    this.landmasses = [];
    this.animationFrame = null;
    this.time = 0;
    this.initialized = false;
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;

    if (this.initialized) {
      this.buildScene();
    }
  }

  init() {
    // Background particles to keep the canvas alive without distracting the hero copy.
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.6 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
        pulseSpeed: Math.random() * 0.03 + 0.005,
      });
    }

    this.buildScene();
    this.initialized = true;
    this.animate();
  }

  buildScene() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const p = (nx, ny) => ({ x: w * nx, y: h * ny });

    this.nodes = [
      { key: 'yanbu', label: 'Yanbu (7.0 Mbpd)', ...p(0.34, 0.55), color: '#2dd4bf', size: 6 },
      { key: 'ras', label: 'Ras Tanura', ...p(0.5, 0.48), color: '#60a5fa', size: 5 },
      { key: 'hormuz', label: 'Hormuz', ...p(0.57, 0.5), color: '#ef4444', size: 6 },
      { key: 'fujairah', label: 'Fujairah (1.8 Mbpd)', ...p(0.615, 0.56), color: '#2dd4bf', size: 6 },
      { key: 'jamnagar', label: 'Jamnagar', ...p(0.72, 0.52), color: '#22d3ee', size: 6 },
      { key: 'cape', label: 'Cape Route (+14-18d)', ...p(0.18, 0.8), color: '#a855f7', size: 5 },
      { key: 'suez', label: 'Suez', ...p(0.43, 0.28), color: '#34d399', size: 5 },
    ];

    const node = (key) => this.nodes.find((n) => n.key === key);

    this.landmasses = [
      [p(0.12, 0.28), p(0.18, 0.4), p(0.24, 0.66), p(0.21, 0.86), p(0.14, 0.86), p(0.1, 0.64), p(0.1, 0.42)],
      [p(0.36, 0.26), p(0.52, 0.3), p(0.6, 0.34), p(0.67, 0.46), p(0.69, 0.58), p(0.62, 0.72), p(0.53, 0.76), p(0.45, 0.72), p(0.37, 0.8), p(0.28, 0.84), p(0.2, 0.8), p(0.18, 0.66), p(0.21, 0.54), p(0.26, 0.38)],
      [p(0.74, 0.34), p(0.79, 0.42), p(0.85, 0.48), p(0.89, 0.62), p(0.86, 0.76), p(0.82, 0.9), p(0.76, 0.8), p(0.72, 0.68), p(0.71, 0.56)],
    ];

    this.routes = [
      {
        type: 'pipeline',
        points: this.generateCurve(node('ras'), p(0.42, 0.52), node('yanbu'), 24),
        color: '#34d399',
        glowColor: 'rgba(52, 211, 153, 0.24)',
        width: 4,
        dashed: false,
        blocked: false,
        flow: true,
      },
      {
        type: 'active',
        points: this.generateCurve(node('fujairah'), p(0.67, 0.54), node('jamnagar'), 20),
        color: '#22d3ee',
        glowColor: 'rgba(34, 211, 238, 0.24)',
        width: 2.3,
        dashed: false,
        blocked: false,
        flow: true,
      },
      {
        type: 'blocked',
        points: this.generateCurve(node('ras'), p(0.545, 0.49), node('hormuz'), 16),
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.3)',
        width: 2,
        dashed: true,
        blocked: true,
        flow: false,
      },
      {
        type: 'cape',
        points: this.generateMultiCurve([
          p(0.52, 0.5),
          p(0.45, 0.67),
          p(0.3, 0.82),
          p(0.22, 0.9),
          node('cape'),
          p(0.1, 0.78),
          p(0.12, 0.56),
          p(0.16, 0.36),
          node('suez'),
        ], 55),
        color: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.2)',
        width: 2,
        dashed: true,
        blocked: false,
        flow: true,
      },
    ];

    this.routes.forEach((route) => {
      route.travelingParticles = [];
      if (route.flow) {
        for (let i = 0; i < 3; i++) {
          route.travelingParticles.push({
            progress: Math.random(),
            speed: 0.0018 + Math.random() * 0.0025,
          });
        }
      }
    });
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
        x: (start.x + end.x) / 2 + (Math.random() - 0.5) * 26,
        y: (start.y + end.y) / 2 + (Math.random() - 0.5) * 26,
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

  drawGrid() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const major = Math.max(90, Math.floor(w / 12));
    const minor = Math.floor(major / 3);

    this.ctx.lineWidth = 1;
    for (let x = 0; x < w; x += minor) {
      const isMajor = x % major === 0;
      this.ctx.strokeStyle = isMajor ? 'rgba(59, 130, 246, 0.09)' : 'rgba(59, 130, 246, 0.04)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }

    for (let y = 0; y < h; y += minor) {
      const isMajor = y % major === 0;
      this.ctx.strokeStyle = isMajor ? 'rgba(59, 130, 246, 0.09)' : 'rgba(59, 130, 246, 0.04)';
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }
  }

  drawLandmasses() {
    this.landmasses.forEach((shape) => {
      this.ctx.beginPath();
      shape.forEach((point, i) => {
        if (i === 0) this.ctx.moveTo(point.x, point.y);
        else this.ctx.lineTo(point.x, point.y);
      });
      this.ctx.closePath();
      this.ctx.fillStyle = 'rgba(20, 34, 58, 0.43)';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(94, 121, 163, 0.14)';
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();
    });
  }

  drawLegend() {
    const x = this.canvas.width * 0.06;
    const y = this.canvas.height * 0.2;
    const items = [
      { label: 'Overland Pipeline Bypass', color: '#34d399' },
      { label: 'Active Tanker Lane', color: '#22d3ee' },
      { label: 'Cape Detour (+14-18d)', color: '#a855f7', dashed: true },
      { label: 'Chokepoint Blockade', color: '#ef4444' },
    ];

    this.ctx.fillStyle = 'rgba(9, 18, 35, 0.7)';
    this.ctx.strokeStyle = 'rgba(120, 145, 185, 0.18)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(x - 16, y - 20, 420, 44, 12);
    this.ctx.fill();
    this.ctx.stroke();

    let cursorX = x;
    items.forEach((item) => {
      this.ctx.beginPath();
      if (item.dashed) this.ctx.setLineDash([5, 4]);
      this.ctx.strokeStyle = item.color;
      this.ctx.lineWidth = 3;
      this.ctx.moveTo(cursorX, y);
      this.ctx.lineTo(cursorX + 14, y);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.ctx.font = '600 11px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(200, 214, 236, 0.85)';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.label, cursorX + 20, y + 4);
      cursorX += this.ctx.measureText(item.label).width + 46;
    });
  }

  drawRegions() {
    const labels = [
      { text: 'MEDITERRANEAN', x: 0.38, y: 0.26 },
      { text: 'RED SEA', x: 0.2, y: 0.52 },
      { text: 'PERSIAN GULF', x: 0.5, y: 0.44 },
      { text: 'ARABIAN SEA', x: 0.67, y: 0.78 },
    ];

    this.ctx.font = '700 12px "JetBrains Mono", monospace';
    this.ctx.fillStyle = 'rgba(46, 169, 255, 0.38)';
    this.ctx.textAlign = 'center';
    labels.forEach((label) => {
      this.ctx.fillText(label.text, this.canvas.width * label.x, this.canvas.height * label.y);
    });
  }

  drawRoutes() {
    this.routes.forEach((route) => {
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Glow pass
      this.ctx.strokeStyle = route.glowColor;
      this.ctx.lineWidth = route.width + 5;
      this.ctx.beginPath();
      route.points.forEach((point, i) => {
        if (i === 0) this.ctx.moveTo(point.x, point.y);
        else this.ctx.lineTo(point.x, point.y);
      });
      this.ctx.stroke();

      // Main path
      if (route.dashed) {
        this.ctx.setLineDash([7, 6]);
        this.ctx.lineDashOffset = -this.time * 35;
      } else {
        this.ctx.setLineDash([]);
      }
      this.ctx.strokeStyle = route.color;
      this.ctx.lineWidth = route.width;
      this.ctx.beginPath();
      route.points.forEach((point, i) => {
        if (i === 0) this.ctx.moveTo(point.x, point.y);
        else this.ctx.lineTo(point.x, point.y);
      });
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Traveling flow particles
      route.travelingParticles.forEach((flowParticle) => {
        flowParticle.progress += flowParticle.speed;
        if (flowParticle.progress > 1) flowParticle.progress = 0;

        const idx = Math.floor(flowParticle.progress * (route.points.length - 1));
        const point = route.points[idx];
        if (!point) return;

        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 3.3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 7.5, 0, Math.PI * 2);
        this.ctx.fillStyle = route.glowColor;
        this.ctx.fill();
      });
    });
  }

  drawNodes() {
    this.nodes.forEach((node) => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.size + 4, 0, Math.PI * 2);
      this.ctx.fillStyle = `${node.color}22`;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.size + 1.5, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(236, 246, 255, 0.65)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.ctx.font = '600 10px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(181, 196, 220, 0.85)';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(node.label, node.x + 10, node.y - 8);
    });
  }

  drawBlockade() {
    const marker = this.nodes.find((node) => node.key === 'hormuz');
    if (!marker) return;

    const pulse = Math.sin(this.time * 2.8) * 10 + 22;

    this.ctx.beginPath();
    this.ctx.arc(marker.x, marker.y, pulse, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(239, 68, 68, ${0.08 + Math.sin(this.time * 2.8) * 0.03})`;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(marker.x, marker.y, 30, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([4, 4]);
    this.ctx.lineDashOffset = -this.time * 45;
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    const badgeX = marker.x - 66;
    const badgeY = marker.y - 72;
    this.ctx.fillStyle = 'rgba(127, 29, 29, 0.78)';
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(badgeX, badgeY, 132, 24, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = '700 10px "JetBrains Mono", monospace';
    this.ctx.fillStyle = '#fecaca';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('HORMUZ BLOCKED', marker.x, badgeY + 16);
  }

  animate() {
    this.time += 0.01;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;

    const bg = this.ctx.createRadialGradient(w * 0.62, h * 0.48, 120, w * 0.55, h * 0.5, w * 0.82);
    bg.addColorStop(0, 'rgba(14, 30, 58, 0.32)');
    bg.addColorStop(1, 'rgba(3, 8, 20, 0.05)');
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, w, h);

    this.drawGrid();
    this.drawLandmasses();

    this.particles.forEach((particle) => {
      const pulse = Math.sin(this.time * particle.pulseSpeed * 90) * 0.3 + 0.72;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(123, 149, 192, ${particle.opacity * pulse})`;
      this.ctx.fill();
    });

    this.drawRegions();
    this.drawRoutes();
    this.drawNodes();
    this.drawBlockade();
    this.drawLegend();

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
