/* ═══════════════════════════════════════════════════════════
   REROUTE — Main JavaScript
   Interactive animations, globe, charts, scroll effects
   ═══════════════════════════════════════════════════════════ */

// ─── Globe / Particle Map Animation ───
class GlobeAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.routeParticles = [];
    this.rotationY = 0;
    this.rotationX = -0.2;
    this.pointerInfluenceX = 0;
    this.pointerInfluenceY = 0;
    this.nodes = {
      yanbu: { name: 'Yanbu', lat: 24.1, lon: 38.0, color: '#2dd4bf' },
      rasTanura: { name: 'Ras Tanura', lat: 26.7, lon: 50.2, color: '#60a5fa' },
      hormuz: { name: 'Hormuz', lat: 26.5, lon: 56.3, color: '#ef4444' },
      fujairah: { name: 'Fujairah', lat: 25.1, lon: 56.4, color: '#22d3ee' },
      jamnagar: { name: 'Jamnagar', lat: 22.5, lon: 70.1, color: '#22d3ee' },
      cape: { name: 'Cape Route', lat: -34.3, lon: 18.5, color: '#a855f7' },
      suez: { name: 'Suez', lat: 30.0, lon: 32.5, color: '#34d399' },
    };
    this.routes = [
      {
        key: 'pipeline',
        from: 'rasTanura',
        to: 'yanbu',
        color: '#34d399',
        width: 3.2,
        dashed: false,
        arcHeight: 0.07,
      },
      {
        key: 'active',
        from: 'fujairah',
        to: 'jamnagar',
        color: '#22d3ee',
        width: 2.1,
        dashed: false,
        arcHeight: 0.08,
      },
      {
        key: 'blocked',
        from: 'rasTanura',
        to: 'hormuz',
        color: '#ef4444',
        width: 1.8,
        dashed: true,
        arcHeight: 0.04,
      },
      {
        key: 'cape',
        from: 'hormuz',
        to: 'suez',
        via: 'cape',
        color: '#a855f7',
        width: 1.9,
        dashed: true,
        arcHeight: 0.12,
      },
    ];
    this.animationFrame = null;
    this.time = 0;
    this.heroCenter = { x: 0, y: 0 };
    this.radius = 0;
    this.resize();
    this.init();
    this.handlePointerMove = (event) => {
      const rx = event.clientX / Math.max(window.innerWidth, 1);
      const ry = event.clientY / Math.max(window.innerHeight, 1);
      this.pointerInfluenceX = (rx - 0.72) * 0.4;
      this.pointerInfluenceY = (ry - 0.5) * 0.25;
    };
    this.handlePointerLeave = () => {
      this.pointerInfluenceX = 0;
      this.pointerInfluenceY = 0;
    };
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerleave', this.handlePointerLeave);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.heroCenter.x = this.canvas.width * 0.73;
    this.heroCenter.y = this.canvas.height * 0.54;
    this.radius = Math.min(this.canvas.width, this.canvas.height) * 0.33;
    this.buildScene();
  }

  init() {
    for (let i = 0; i < 170; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        size: Math.random() * 1.8 + 0.4,
        pulse: Math.random() * 2 * Math.PI,
      });
    }

    this.animate();
  }

  buildScene() {
    this.routeParticles = this.routes.map((route) => ({
      routeKey: route.key,
      progress: Math.random(),
      speed: 0.0015 + Math.random() * 0.0022,
    }));
  }

  project(latDeg, lonDeg, radiusBoost = 1) {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180;

    const x0 = Math.cos(lat) * Math.cos(lon);
    const y0 = Math.sin(lat);
    const z0 = Math.cos(lat) * Math.sin(lon);

    const yaw = this.rotationY;
    const pitch = this.rotationX;

    const x1 = x0 * Math.cos(yaw) - z0 * Math.sin(yaw);
    const z1 = x0 * Math.sin(yaw) + z0 * Math.cos(yaw);
    const y1 = y0;

    const y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);
    const x2 = x1;

    const depth = (z2 + 1) / 2;
    const perspective = 0.5 + depth * 0.75;
    const radius = this.radius * radiusBoost;

    return {
      x: this.heroCenter.x + x2 * radius * perspective,
      y: this.heroCenter.y - y2 * radius * perspective,
      z: z2,
      depth,
      visible: z2 > -0.3,
    };
  }

  interpolateGeoPoint(start, end, t) {
    const p = (node) => {
      const lat = (node.lat * Math.PI) / 180;
      const lon = (node.lon * Math.PI) / 180;
      return {
        x: Math.cos(lat) * Math.cos(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.sin(lon),
      };
    };

    const a = p(start);
    const b = p(end);
    const omega = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z)));
    if (omega === 0) {
      return { lat: start.lat, lon: start.lon };
    }

    const s1 = Math.sin((1 - t) * omega) / Math.sin(omega);
    const s2 = Math.sin(t * omega) / Math.sin(omega);
    const x = a.x * s1 + b.x * s2;
    const y = a.y * s1 + b.y * s2;
    const z = a.z * s1 + b.z * s2;

    return {
      lat: (Math.atan2(y, Math.sqrt(x * x + z * z)) * 180) / Math.PI,
      lon: (Math.atan2(z, x) * 180) / Math.PI,
    };
  }

  drawGlobeShell() {
    const r = this.radius;
    const cx = this.heroCenter.x;
    const cy = this.heroCenter.y;

    const core = this.ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.35, r * 0.15, cx, cy, r);
    core.addColorStop(0, 'rgba(25, 56, 104, 0.35)');
    core.addColorStop(0.55, 'rgba(12, 28, 54, 0.28)');
    core.addColorStop(1, 'rgba(7, 15, 30, 0.05)');
    this.ctx.fillStyle = core;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(86, 154, 255, 0.15)';
    this.ctx.lineWidth = 1.1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  drawLatitudeLongitude() {
    const latLines = [-60, -30, 0, 30, 60];
    const lonLines = [-120, -80, -40, 0, 40, 80, 120];

    latLines.forEach((lat) => {
      this.ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 4) {
        const pt = this.project(lat, lon);
        if (lon === -180) this.ctx.moveTo(pt.x, pt.y);
        else this.ctx.lineTo(pt.x, pt.y);
      }
      this.ctx.strokeStyle = lat === 0 ? 'rgba(88, 170, 255, 0.2)' : 'rgba(88, 170, 255, 0.1)';
      this.ctx.lineWidth = lat === 0 ? 1.2 : 0.8;
      this.ctx.stroke();
    });

    lonLines.forEach((lon) => {
      this.ctx.beginPath();
      for (let lat = -80; lat <= 80; lat += 4) {
        const pt = this.project(lat, lon);
        if (lat === -80) this.ctx.moveTo(pt.x, pt.y);
        else this.ctx.lineTo(pt.x, pt.y);
      }
      this.ctx.strokeStyle = 'rgba(88, 170, 255, 0.09)';
      this.ctx.lineWidth = 0.7;
      this.ctx.stroke();
    });
  }

  drawRoute(route, progressOffset = null) {
    const startNode = this.nodes[route.from];
    const endNode = this.nodes[route.to];
    if (!startNode || !endNode) return;

    const samples = [];
    const segmentCount = 46;

    const drawSegment = (fromNode, toNode, tStart, tEnd) => {
      for (let i = 0; i <= segmentCount; i++) {
        const localT = i / segmentCount;
        const worldT = tStart + localT * (tEnd - tStart);
        const geo = this.interpolateGeoPoint(fromNode, toNode, localT);
        const lift = 1 + Math.sin(localT * Math.PI) * route.arcHeight;
        const pt = this.project(geo.lat, geo.lon, lift);
        samples.push({ ...pt, t: worldT });
      }
    };

    if (route.via) {
      const viaNode = this.nodes[route.via];
      drawSegment(startNode, viaNode, 0, 0.5);
      drawSegment(viaNode, endNode, 0.5, 1);
    } else {
      drawSegment(startNode, endNode, 0, 1);
    }

    this.ctx.beginPath();
    samples.forEach((pt, i) => {
      if (i === 0) this.ctx.moveTo(pt.x, pt.y);
      else this.ctx.lineTo(pt.x, pt.y);
    });
    this.ctx.strokeStyle = route.color;
    this.ctx.lineWidth = route.width;
    if (route.dashed) {
      this.ctx.setLineDash([7, 6]);
      this.ctx.lineDashOffset = -this.time * 45;
    }
    this.ctx.globalAlpha = 0.35;
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 1;

    this.ctx.beginPath();
    samples.forEach((pt, i) => {
      if (i === 0) this.ctx.moveTo(pt.x, pt.y);
      else this.ctx.lineTo(pt.x, pt.y);
    });
    const glow = this.ctx.createLinearGradient(samples[0].x, samples[0].y, samples[samples.length - 1].x, samples[samples.length - 1].y);
    glow.addColorStop(0, `${route.color}66`);
    glow.addColorStop(0.5, `${route.color}CC`);
    glow.addColorStop(1, `${route.color}66`);
    this.ctx.strokeStyle = glow;
    this.ctx.lineWidth = route.width + 0.8;
    this.ctx.stroke();

    if (progressOffset !== null) {
      const marker = samples[Math.floor(progressOffset * (samples.length - 1))];
      if (marker) {
        this.ctx.beginPath();
        this.ctx.arc(marker.x, marker.y, 3.2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(marker.x, marker.y, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = `${route.color}44`;
        this.ctx.fill();
      }
    }
  }

  drawNodes() {
    Object.values(this.nodes).forEach((node) => {
      const p = this.project(node.lat, node.lon, 1.02);
      if (!p.visible || p.x < this.canvas.width * 0.43) return;

      const size = 2 + p.depth * 3;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size + 4, 0, Math.PI * 2);
      this.ctx.fillStyle = `${node.color}33`;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();

      this.ctx.font = '600 10px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(187, 204, 229, 0.7)';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(node.name, p.x + 10, p.y - 6);
    });
  }

  drawLegend() {
    const x = this.canvas.width * 0.58;
    const y = this.canvas.height * 0.2;
    const items = [
      { label: 'Pipeline Bypass', color: '#34d399' },
      { label: 'Active Tanker', color: '#22d3ee' },
      { label: 'Cape Detour', color: '#a855f7', dashed: true },
      { label: 'Blockade', color: '#ef4444' },
    ];

    this.ctx.fillStyle = 'rgba(9, 18, 35, 0.6)';
    this.ctx.strokeStyle = 'rgba(120, 145, 185, 0.14)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(x - 12, y - 18, 320, 36, 10);
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

      this.ctx.font = '600 10px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(200, 214, 236, 0.74)';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.label, cursorX + 20, y + 3);
      cursorX += this.ctx.measureText(item.label).width + 18;
    });
  }

  drawBlockade() {
    const markerNode = this.nodes.hormuz;
    const marker = this.project(markerNode.lat, markerNode.lon, 1.04);
    if (!marker.visible) return;

    const pulse = Math.sin(this.time * 2.4) * 8 + 18;

    this.ctx.beginPath();
    this.ctx.arc(marker.x, marker.y, pulse, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(239, 68, 68, ${0.07 + Math.sin(this.time * 2.8) * 0.03})`;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(marker.x, marker.y, 30, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([4, 4]);
    this.ctx.lineDashOffset = -this.time * 45;
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    const badgeX = marker.x - 56;
    const badgeY = marker.y - 72;
    this.ctx.fillStyle = 'rgba(127, 29, 29, 0.62)';
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(badgeX, badgeY, 112, 22, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = '700 9px "JetBrains Mono", monospace';
    this.ctx.fillStyle = '#fecaca';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('BLOCKED', marker.x, badgeY + 14);
  }

  drawStars() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.stars.forEach((star) => {
      const x = star.x * w;
      const y = star.y * h;
      const alpha = 0.08 + star.z * 0.2 + (Math.sin(this.time * 0.8 + star.pulse) + 1) * 0.06;
      const size = star.size * (0.7 + star.z * 0.8);
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(122, 150, 191, ${alpha})`;
      this.ctx.fill();
    });
  }

  drawGlobalGlow() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const wash = this.ctx.createRadialGradient(this.heroCenter.x, this.heroCenter.y, this.radius * 0.15, this.heroCenter.x, this.heroCenter.y, this.radius * 1.35);
    wash.addColorStop(0, 'rgba(33, 83, 157, 0.22)');
    wash.addColorStop(1, 'rgba(7, 14, 28, 0)');
    this.ctx.fillStyle = wash;
    this.ctx.fillRect(0, 0, w, h);

    const leftMask = this.ctx.createLinearGradient(0, 0, w * 0.55, 0);
    leftMask.addColorStop(0, 'rgba(10, 14, 26, 0.82)');
    leftMask.addColorStop(1, 'rgba(10, 14, 26, 0)');
    this.ctx.fillStyle = leftMask;
    this.ctx.fillRect(0, 0, w * 0.58, h);
  }

  animate() {
    this.time += 0.01;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.rotationY += 0.0016;
    this.rotationX += (this.pointerInfluenceY - this.rotationX) * 0.01;
    const targetYawDrift = this.rotationY + this.pointerInfluenceX * 0.01;
    this.rotationY += (targetYawDrift - this.rotationY) * 0.04;

    const bg = this.ctx.createRadialGradient(w * 0.73, h * 0.5, 80, w * 0.73, h * 0.5, w * 0.7);
    bg.addColorStop(0, 'rgba(20, 50, 97, 0.24)');
    bg.addColorStop(1, 'rgba(3, 8, 20, 0.03)');
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, w, h);

    this.drawStars();
    this.drawGlobeShell();
    this.drawLatitudeLongitude();

    this.routes.forEach((route) => {
      const flow = this.routeParticles.find((particle) => particle.routeKey === route.key);
      if (flow) {
        flow.progress += flow.speed;
        if (flow.progress > 1) flow.progress = 0;
      }
      this.drawRoute(route, flow ? flow.progress : null);
    });

    this.drawNodes();
    this.drawBlockade();
    this.drawLegend();
    this.drawGlobalGlow();

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerleave', this.handlePointerLeave);
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

// ─── Hero Warroom 3D Tilt ───
function initHeroCardTilt() {
  const hero = document.querySelector('.hero');
  const card = document.querySelector('.hero-warroom');
  if (!hero || !card) return;

  const maxTilt = 6;

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
    const rotateY = (x - 0.5) * maxTilt;
    const rotateX = (0.5 - y) * maxTilt;

    card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
    card.style.boxShadow = `${-rotateY * 1.2}px ${rotateX * 1.4}px 46px rgba(0, 0, 0, 0.48), 0 0 80px rgba(245, 158, 11, 0.1)`;
  });

  hero.addEventListener('pointerleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    card.style.boxShadow = 'var(--shadow-lg), 0 0 70px rgba(245, 158, 11, 0.08)';
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
  initHeroCardTilt();

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
