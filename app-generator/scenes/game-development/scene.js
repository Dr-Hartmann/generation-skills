let sceneTotalSteps = 10;

window.AppScene = {
  init(api) {
    if (api && Array.isArray(api.steps) && api.steps.length) {
      sceneTotalSteps = api.steps.length;
    }
  },

  draw(ctx, frame) {
    const { width, height, palette, step, stepIndex, elapsedMs } = frame;
    if (!width || !height || !step) return;

    const accent = palette.accent;
    const accentDark = palette.accent_dark;
    const accentSoft = palette.accent_soft;
    const text = palette.text;
    const muted = palette.muted_text;
    const panel = palette.panel;
    const border = palette.border;

    const scale = Math.max(0.72, Math.min(1.25, Math.min(width / 420, height / 520)));
    const time = elapsedMs || 0;
    const panelW = Math.min(width * 0.90, 760 * scale);
    const panelH = Math.min(height * 0.38, 360 * scale);
    const panelX = (width - panelW) / 2;
    const panelY = height * 0.255;
    const innerX = panelX + 14 * scale;
    const innerW = panelW - 28 * scale;
    const contentTop = panelY + 14 * scale;
    const contentBottom = panelY + panelH - 30 * scale;
    const contentH = contentBottom - contentTop;
    const noteY = panelY + panelH - 13 * scale;

    const roundRect = (x, y, w, h, radius, fill, stroke) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, Math.max(0, radius));
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = Math.max(1, 1.1 * scale);
        ctx.stroke();
      }
    };

    const fitText = (value, x, y, maxWidth, size, color, weight = 600, align = "left", minSize = 7.5) => {
      let fontSize = size;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.font = weight + " " + fontSize + "px system-ui, sans-serif";
      while (ctx.measureText(value).width > maxWidth && fontSize > minSize) {
        fontSize -= 0.5;
        ctx.font = weight + " " + fontSize + "px system-ui, sans-serif";
      }
      ctx.fillText(value, x, y);
    };

    const wrappedText = (value, x, y, maxWidth, size, lineHeight, color, maxLines = 2) => {
      ctx.font = "600 " + size + "px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      const words = String(value).split(/\s+/);
      const lines = [];
      let line = "";
      for (const word of words) {
        const candidate = line ? line + " " + word : word;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
      const visible = lines.slice(0, maxLines);
      if (lines.length > maxLines && visible.length) {
        let last = visible[visible.length - 1];
        while (ctx.measureText(last + "…").width > maxWidth && last.length > 2) {
          last = last.slice(0, -1);
        }
        visible[visible.length - 1] = last + "…";
      }
      visible.forEach((lineText, index) => {
        ctx.fillText(lineText, x, y + index * lineHeight);
      });
    };

    const dot = (x, y, radius, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const arrow = (x1, y1, x2, y2, color, alpha = 0.8) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.2, 1.5 * scale);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = 6.5 * scale;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(angle - 0.44), y2 - head * Math.sin(angle - 0.44));
      ctx.lineTo(x2 - head * Math.cos(angle + 0.44), y2 - head * Math.sin(angle + 0.44));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const dashedRect = (x, y, w, h, color, alpha = 0.9) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.setLineDash([5 * scale, 4 * scale]);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    };

    const infoCard = (x, y, w, h, label, detail, opts = {}) => {
      roundRect(x, y, w, h, 9 * scale, opts.fill || panel, border);
      dot(x + 12 * scale, y + 15 * scale, 3 * scale, accent);
      fitText(label, x + 22 * scale, y + 15 * scale, w - 30 * scale,
        opts.labelSize || Math.max(9, 10.5 * scale), text, 750);
      if (detail) {
        wrappedText(detail, x + 12 * scale, y + h - 15 * scale,
          w - 24 * scale, Math.max(7.5, 8.5 * scale), 9.5 * scale, muted, 2);
      }
    };

    const chip = (x, y, w, h, label, opts = {}) => {
      roundRect(x, y, w, h, opts.radius || 9 * scale, opts.fill || panel, opts.stroke || border);
      fitText(label, x + w / 2, y + h / 2, w - 10 * scale,
        opts.size || Math.max(8.5, 10 * scale), opts.color || text, opts.weight || 700, "center");
    };

    const colHeader = (label, x, y, w) => {
      fitText(String(label).toUpperCase(), x, y, w, Math.max(8, 9 * scale), accent, 800);
    };

    // Фоновая сетка и точки — нейтральный фон сцены.
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    const grid = 34 * scale;
    for (let gx = grid; gx < width; gx += grid) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = grid; gy < height; gy += grid) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }
    ctx.restore();

    for (let index = 0; index < 18; index += 1) {
      const x = ((index * 97 + 31) % 997) / 997 * width;
      const y = ((index * 173 + 67) % 991) / 991 * height;
      dot(x, y, (index % 3 + 1) * 0.65 * scale, accent, 0.12);
    }

    // Шапка сцены.
    fitText(String(step.eyebrow || "РАЗРАБОТКА ИГР").toUpperCase(),
      width * 0.06, height * 0.105, width * 0.84, Math.max(8.5, 10 * scale), accent, 800);
    wrappedText(step.headline || "", width * 0.06, height * 0.17,
      width * 0.86, Math.max(13, 21 * scale), 24 * scale, text, 2);

    // Основная панель.
    roundRect(panelX, panelY, panelW, panelH, 16 * scale, "rgba(26, 26, 32, 0.92)", border);

    const pulse = 0.72 + 0.18 * Math.sin(time / 620);
    dot(panelX + panelW - 17 * scale, panelY + 17 * scale, 4 * scale, accent, pulse);

    const kind = step.kind;

    if (kind === "anatomy") {
      const items = step.items || [];
      const cx = panelX + panelW / 2;
      const cy = panelY + panelH * 0.43;
      const rx = panelW * 0.34;
      const ry = panelH * 0.29;
      const capW = Math.min(128 * scale, rx - 10 * scale);
      const showDetails = capW >= 118 * scale;
      const capH = (showDetails ? 34 : 26) * scale;
      const angles = [-90, -30, 30, 90, 150, 210];

      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = muted;
      ctx.lineWidth = Math.max(1, 1.1 * scale);
      angles.forEach((a) => {
        const rad = (a * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * rx * 0.82, cy + Math.sin(rad) * ry * 0.82);
        ctx.stroke();
      });
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1, 1.3 * scale);
      ctx.beginPath();
      ctx.arc(cx, cy, (30 + 5 * Math.sin(time / 700)) * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, 26 * scale, 0, Math.PI * 2);
      ctx.fillStyle = accentSoft;
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1.2, 1.4 * scale);
      ctx.stroke();
      fitText("ИГРА", cx, cy, 46 * scale, Math.max(10, 12 * scale), accent, 850, "center");

      items.forEach((item, index) => {
        const a = (angles[index % angles.length] * Math.PI) / 180;
        const nx = cx + Math.cos(a) * rx;
        const ny = cy + Math.sin(a) * ry;
        roundRect(nx - capW / 2, ny - capH / 2, capW, capH, capH / 2, panel, border);
        if (showDetails) {
          fitText(item.label, nx, ny - 6.5 * scale, capW - 12 * scale,
            Math.max(8.5, 9.5 * scale), text, 750, "center");
          fitText(item.detail || "", nx, ny + 8 * scale, capW - 10 * scale,
            Math.max(7.5, 8 * scale), muted, 500, "center");
        } else {
          fitText(item.label, nx, ny, capW - 12 * scale,
            Math.max(8.5, 9.5 * scale), text, 750, "center");
        }
      });
    } else if (kind === "design") {
      const loop = step.loop || [];
      const items = step.items || [];
      const narrow = panelW < 500 * scale;
      const cx = narrow ? panelX + panelW / 2 : panelX + innerW * 0.24;
      const cy = narrow ? panelY + panelH * 0.26 : panelY + panelH * 0.43;
      const r = narrow ? panelH * 0.145 : panelH * 0.26;

      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = muted;
      ctx.lineWidth = Math.max(1, 1.1 * scale);
      ctx.setLineDash([4 * scale, 5 * scale]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const nodeAngles = [-90, 0, 90, 180];
      loop.forEach((label, index) => {
        const a = ((nodeAngles[index % 4]) * Math.PI) / 180;
        const nx = cx + Math.cos(a) * r;
        const ny = cy + Math.sin(a) * r;
        const w = 74 * scale;
        const h = 24 * scale;
        roundRect(nx - w / 2, ny - h / 2, w, h, h / 2, panel, border);
        fitText(label, nx, ny, w - 10 * scale, Math.max(8.5, 10 * scale), text, 750, "center");
      });

      for (let index = 0; index < 4; index += 1) {
        const a1 = ((nodeAngles[index] + 26) * Math.PI) / 180;
        const a2 = ((nodeAngles[(index + 1) % 4] - 26) * Math.PI) / 180;
        ctx.save();
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = Math.max(1.2, 1.5 * scale);
        ctx.beginPath();
        ctx.arc(cx, cy, r, a1, a2);
        ctx.stroke();
        const ex = cx + Math.cos(a2) * r;
        const ey = cy + Math.sin(a2) * r;
        const tang = a2 + Math.PI / 2;
        const head = 6 * scale;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - head * Math.cos(tang - 0.44), ey - head * Math.sin(tang - 0.44));
        ctx.lineTo(ex - head * Math.cos(tang + 0.44), ey - head * Math.sin(tang + 0.44));
        ctx.closePath();
        ctx.fillStyle = accent;
        ctx.fill();
        ctx.restore();
      }

      dot(cx, cy, 3.5 * scale, accent, pulse);
      fitText("ИГРОВОЙ", cx, cy + 12 * scale, r * 1.4, Math.max(7.5, 8.5 * scale), accent, 800, "center");
      fitText("ЦИКЛ", cx, cy + 22 * scale, r * 1.4, Math.max(7.5, 8.5 * scale), accent, 800, "center");

      const gridX = narrow ? innerX : innerX + innerW * 0.48;
      const gridY = narrow ? panelY + panelH * 0.50 : contentTop;
      const gridW = narrow ? innerW : innerW * 0.52;
      const gridH = narrow ? panelH * 0.35 : contentH;
      const gap = 8 * scale;
      const cellW = (gridW - gap) / 2;
      const cellH = (gridH - gap) / 2;
      items.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        infoCard(gridX + col * (cellW + gap), gridY + row * (cellH + gap),
          cellW, cellH, item.label, item.detail);
      });
    } else if (kind === "engine") {
      const hierarchy = step.hierarchy || [];
      const inspector = step.inspector || [];
      const layers = step.layers || [];
      const languages = step.languages || [];

      const winX = innerX;
      const winY = contentTop;
      const winW = innerW;
      const winH = contentH * 0.56;

      roundRect(winX, winY, winW, winH, 10 * scale, panel, border);
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = border;
      ctx.beginPath();
      ctx.moveTo(winX, winY + 18 * scale);
      ctx.lineTo(winX + winW, winY + 18 * scale);
      ctx.stroke();
      ctx.restore();
      fitText("Редактор сцены", winX + 10 * scale, winY + 9 * scale,
        winW * 0.6, Math.max(7.5, 8.5 * scale), muted, 700);
      [accent, muted, accentDark].forEach((color, index) => {
        dot(winX + winW - (10 + index * 8) * scale, winY + 9 * scale, 2.6 * scale, color, 0.8);
      });

      const viewX = winX + 8 * scale;
      const viewY = winY + 24 * scale;
      const viewW = winW - 16 * scale;
      const viewH = winH * 0.52;
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      for (let gx = viewX + 12 * scale; gx < viewX + viewW; gx += 12 * scale) {
        ctx.beginPath();
        ctx.moveTo(gx, viewY);
        ctx.lineTo(gx, viewY + viewH);
        ctx.stroke();
      }
      for (let gy = viewY + 10 * scale; gy < viewY + viewH; gy += 10 * scale) {
        ctx.beginPath();
        ctx.moveTo(viewX, gy);
        ctx.lineTo(viewX + viewW, gy);
        ctx.stroke();
      }
      ctx.restore();
      const objW = 52 * scale;
      const objH = 16 * scale;
      roundRect(viewX + viewW * 0.12, viewY + viewH * 0.42, objW, objH, 4 * scale, accentSoft, accent);
      fitText("Игрок", viewX + viewW * 0.12 + objW / 2, viewY + viewH * 0.42 + objH / 2,
        objW - 6 * scale, Math.max(7.5, 8 * scale), text, 700, "center");
      roundRect(viewX + viewW * 0.55, viewY + viewH * 0.18, objW, objH, 4 * scale, panel, border);
      fitText("Враг", viewX + viewW * 0.55 + objW / 2, viewY + viewH * 0.18 + objH / 2,
        objW - 6 * scale, Math.max(7.5, 8 * scale), muted, 700, "center");
      dashedRect(viewX + viewW * 0.58, viewY + viewH * 0.62, objW * 0.8, objH * 0.8, muted, 0.7);
      fitText("Камера", viewX + viewW * 0.58 + objW * 0.4, viewY + viewH * 0.62 + objH * 0.4,
        objW * 0.9, Math.max(7.5, 8 * scale), muted, 600, "center");

      const listY = viewY + viewH + 8 * scale;
      const listH = winY + winH - listY - 8 * scale;
      const colW = (viewW - 12 * scale) / 2;
      colHeader("Иерархия", viewX, listY, colW);
      hierarchy.forEach((item, index) => {
        fitText("· " + item, viewX + 6 * scale, listY + (index + 1) * (listH / 4),
          colW - 10 * scale, Math.max(7.5, 8.5 * scale), text, 600);
      });
      const insX = viewX + colW + 12 * scale;
      colHeader("Инспектор", insX, listY, colW);
      inspector.forEach((item, index) => {
        fitText("· " + item, insX + 6 * scale, listY + (index + 1) * (listH / 4),
          colW - 10 * scale, Math.max(7.5, 8.5 * scale), text, 600);
      });

      const chipY = winY + winH + 10 * scale;
      const chipH = 22 * scale;
      const chipW = (innerW - 3 * 8 * scale) / 4;
      layers.forEach((label, index) => {
        chip(innerX + index * (chipW + 8 * scale), chipY, chipW, chipH, label,
          { size: Math.max(7.5, 8.5 * scale), color: muted, weight: 700 });
      });
      const langY = chipY + chipH + 7 * scale;
      const langW = (innerW - 8 * scale) / 2;
      languages.forEach((label, index) => {
        chip(innerX + index * (langW + 8 * scale), langY, langW, chipH, label,
          { size: Math.max(8, 9.5 * scale), color: accent, weight: 800,
            fill: accentSoft, stroke: accent });
      });
    } else if (kind === "code") {
      const input = step.input || [];
      const states = step.states || [];
      const systems = step.systems || [];
      const gap = 10 * scale;
      const colW = (innerW - 2 * gap) / 3;

      colHeader("Ввод", innerX, contentTop, colW);
      roundRect(innerX, contentTop + 12 * scale, colW, contentH - 12 * scale, 10 * scale, panel, border);
      input.forEach((item, index) => {
        fitText(item, innerX + 10 * scale, contentTop + (index + 1.4) * (contentH / 4.6),
          colW - 16 * scale, Math.max(7.5, 8.5 * scale), text, 650);
      });

      const x2 = innerX + colW + gap;
      colHeader("Состояния", x2, contentTop, colW);
      const stTop = contentTop + 16 * scale;
      const stH = (contentH - 16 * scale - 2 * 12 * scale) / 3;
      states.forEach((label, index) => {
        const y = stTop + index * (stH + 12 * scale);
        roundRect(x2, y, colW, stH, 8 * scale, index === 0 ? accentSoft : panel, index === 0 ? accent : border);
        fitText(label, x2 + colW / 2, y + stH / 2, colW - 10 * scale,
          Math.max(8.5, 9.5 * scale), index === 0 ? accent : text, 750, "center");
        if (index < states.length - 1) {
          arrow(x2 + colW / 2, y + stH + 2 * scale, x2 + colW / 2, y + stH + 10 * scale, accent, 0.75);
        }
      });

      const x3 = innerX + (colW + gap) * 2;
      colHeader("Системы", x3, contentTop, colW);
      const sysTop = contentTop + 14 * scale;
      const sysH = (contentH - 14 * scale - 4 * 6 * scale) / 5;
      systems.forEach((label, index) => {
        const y = sysTop + index * (sysH + 6 * scale);
        roundRect(x3, y, colW, sysH, 7 * scale, panel, border);
        dot(x3 + 9 * scale, y + sysH / 2, 2.4 * scale, accent);
        fitText(label, x3 + 17 * scale, y + sysH / 2, colW - 24 * scale,
          Math.max(7.5, 8.5 * scale), text, 650);
      });

      const midY = contentTop + contentH * 0.46;
      arrow(innerX + colW + 1 * scale, midY, x2 - 1 * scale, midY, muted, 0.7);
      arrow(x2 + colW + 1 * scale, midY, x3 - 1 * scale, midY, muted, 0.7);
    } else if (kind === "art") {
      const pipeline = step.pipeline || [];
      const chipH = 24 * scale;
      const arrowGap = 16 * scale;
      const chipW = (innerW - (pipeline.length - 1) * arrowGap) / pipeline.length;
      const narrow = chipW < 52 * scale;
      const perRow = narrow ? 3 : pipeline.length;
      const rowGap = 7 * scale;

      pipeline.forEach((label, index) => {
        const row = Math.floor(index / perRow);
        const inRow = Math.min(perRow, pipeline.length - row * perRow);
        const rowW = innerW - (inRow - 1) * arrowGap;
        const cellW = rowW / inRow;
        const col = index % perRow;
        const y = contentTop + row * (chipH + rowGap);
        const x = innerX + col * (cellW + arrowGap);
        chip(x, y, cellW, chipH, label, { size: Math.max(7.5, 9 * scale), color: text, weight: 700 });
        const nextInRow = col < inRow - 1;
        if (nextInRow) {
          arrow(x + cellW + 2 * scale, y + chipH / 2, x + cellW + arrowGap - 2 * scale, y + chipH / 2, accent, 0.7);
        }
      });

      const artTop = contentTop + (narrow ? 2 : 1) * (chipH + rowGap) + 12 * scale;
      const artH = contentBottom - artTop;
      const mx = panelX + panelW * 0.28;
      const my = artTop + artH * 0.42;
      const s = artH * 0.34;
      const verts = [
        [0, -1.15], [0.95, -0.5], [0.6, 0.55], [0, 1.15], [-0.6, 0.55], [-0.95, -0.5],
      ];
      const center = [0, -0.02];
      const P = (v) => [mx + v[0] * s, my + v[1] * s];
      const faces = [
        [center, verts[0], verts[1]], [center, verts[1], verts[2]],
        [center, verts[2], verts[3]], [center, verts[3], verts[4]],
        [center, verts[4], verts[5]], [center, verts[5], verts[0]],
      ];
      faces.forEach((face, index) => {
        ctx.beginPath();
        face.forEach((v, i) => {
          const [px0, py0] = P(v);
          if (i === 0) ctx.moveTo(px0, py0);
          else ctx.lineTo(px0, py0);
        });
        ctx.closePath();
        if (index === 0 || index === 4) {
          ctx.fillStyle = accentSoft;
          ctx.fill();
        }
        ctx.strokeStyle = muted;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = Math.max(1, 1.1 * scale);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = Math.max(1.2, 1.5 * scale);
      ctx.beginPath();
      ctx.moveTo(...P(verts[0]));
      ctx.lineTo(...P(verts[3]));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(...P([0, -0.5]));
      ctx.lineTo(...P([0.55, 0.12]));
      ctx.moveTo(...P([0, -0.5]));
      ctx.lineTo(...P([-0.55, 0.12]));
      ctx.stroke();
      ctx.restore();
      [verts[0], [0, -0.5], center, verts[3]].forEach((v) => {
        const [px0, py0] = P(v);
        dot(px0, py0, 2.4 * scale, accent);
      });
      fitText("Полигональная модель и скелет", mx, artTop + artH - 8 * scale,
        panelW * 0.44, Math.max(7.5, 8.5 * scale), muted, 600, "center");

      const px0 = panelX + panelW * 0.72;
      const py0 = my;
      const rise = artH * 0.6;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = border;
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.beginPath();
      ctx.arc(px0, py0 + rise * 0.35, 9 * scale, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();
      ctx.restore();
      for (let index = 0; index < 14; index += 1) {
        const p = (time / 1600 + index / 14) % 1;
        const a = index * 2.39;
        const dist = p * s * 1.5;
        const ax = px0 + Math.cos(a) * dist * 0.75;
        const ay = py0 + rise * 0.35 - Math.sin(a) * dist * 0.55 - p * rise * 0.3;
        dot(ax, ay, (1 - p) * 3.2 * scale + 1, accent, 1 - p * 0.85);
      }
      dot(px0, py0 + rise * 0.35, 3.5 * scale, accent, pulse);
      fitText("Система частиц", px0, artTop + artH - 8 * scale,
        panelW * 0.44, Math.max(7.5, 8.5 * scale), muted, 600, "center");
    } else if (kind === "physics") {
      const groundY = panelY + panelH * 0.74;
      ctx.save();
      ctx.strokeStyle = muted;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = Math.max(1.4, 1.8 * scale);
      ctx.beginPath();
      ctx.moveTo(innerX, groundY);
      ctx.lineTo(innerX + innerW, groundY);
      ctx.stroke();
      ctx.restore();

      const r = 11 * scale;
      const x0 = innerX + innerW * 0.16;
      const x1 = innerX + innerW * 0.68;
      const hmax = panelH * 0.38;
      const p = (time / 2600) % 1;
      const hop = Math.abs(Math.cos(Math.PI * p));
      const bx = x0 + (x1 - x0) * p;
      const by = groundY - r - hmax * Math.pow(hop, 1.15);

      for (let k = 4; k >= 1; k -= 1) {
        const pk = (p - k * 0.024 + 1) % 1;
        const hk = Math.abs(Math.cos(Math.PI * pk));
        const tx = x0 + (x1 - x0) * pk;
        const ty = groundY - r - hmax * Math.pow(hk, 1.15);
        dot(tx, ty, r * (1 - k * 0.13), accent, 0.18 - k * 0.03);
      }

      const trigX = innerX + innerW * 0.60;
      const trigW = innerW * 0.22;
      const trigH = panelH * 0.30;
      const inBand = bx >= trigX && bx <= trigX + trigW && by >= groundY - trigH;
      dashedRect(trigX, groundY - trigH, trigW, trigH, inBand ? accent : muted, inBand ? 1 : 0.55);
      fitText(inBand ? "Триггер: событие" : "Триггер", trigX + trigW / 2, groundY - trigH - 9 * scale,
        trigW + 40 * scale, Math.max(7.5, 8.5 * scale), inBand ? accent : muted, 700, "center");

      const gX = innerX + innerW * 0.30;
      const gY0 = panelY + panelH * 0.20;
      arrow(gX, gY0, gX, gY0 + 26 * scale, accent, 0.85);
      fitText("Гравитация", gX, gY0 + 36 * scale, innerW * 0.3, Math.max(7.5, 8.5 * scale), muted, 650, "center");

      if (hop < 0.08) {
        const intensity = (0.08 - hop) / 0.08;
        ctx.save();
        ctx.strokeStyle = accent;
        ctx.globalAlpha = intensity;
        ctx.lineWidth = Math.max(1, 1.3 * scale);
        for (let index = 0; index < 5; index += 1) {
          const a = Math.PI + (index / 4) * Math.PI;
          ctx.beginPath();
          ctx.moveTo(bx + Math.cos(a) * r * 1.3, groundY + Math.sin(a) * r * 0.5);
          ctx.lineTo(bx + Math.cos(a) * (r * 1.3 + 6 * scale), groundY + Math.sin(a) * (r * 0.5 + 4 * scale));
          ctx.stroke();
        }
        ctx.restore();
        dot(bx, groundY, 3 * scale, accent, intensity);
      }
      fitText("Коллизия", innerX + innerW * 0.06, groundY + 11 * scale,
        innerW * 0.3, Math.max(7.5, 8.5 * scale), muted, 650);

      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.strokeStyle = text;
      ctx.lineWidth = Math.max(1.2, 1.6 * scale);
      ctx.stroke();
      arrow(bx + r + 6 * scale, by - 4 * scale, bx + r + 18 * scale, by - 10 * scale, text, 0.55);

      if (step.chip) {
        chip(innerX, contentTop, Math.min(innerW * 0.5, 200 * scale), 22 * scale, step.chip,
          { size: Math.max(7.5, 8.5 * scale), color: muted, weight: 650 });
      }
    } else if (kind === "audio") {
      const tracks = step.tracks || [];
      const narrow = innerW < 360 * scale;
      const wave = (x, y, w, amp, freq, phase, color) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = Math.max(1, 1.4 * scale);
        ctx.beginPath();
        const n = 26;
        for (let index = 0; index <= n; index += 1) {
          const lx = x + (w * index) / n;
          const ly = y + amp * Math.sin((index / n) * freq * Math.PI * 2 + time * 0.004 + phase);
          if (index === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.restore();
      };
      const amps = [5, 8, 6.5];
      const freqs = [2, 6, 3.5];

      let ex;
      let ew;
      let mx;
      let mw;
      let tx;
      let tw;
      let rowTop;
      let rowH;
      let eventY;
      let mixerY;
      if (narrow) {
        ew = innerW * 0.62;
        ex = innerX + (innerW - ew) / 2;
        eventY = contentTop;
        mw = innerW * 0.5;
        mx = innerX + (innerW - mw) / 2;
        mixerY = contentTop + 42 * scale;
        tx = innerX;
        tw = innerW;
        rowTop = contentTop + 84 * scale;
        rowH = (contentBottom - rowTop - 2 * 8 * scale) / 3;
      } else {
        ew = innerW * 0.24;
        ex = innerX;
        eventY = panelY + panelH * 0.40;
        mw = innerW * 0.18;
        mx = ex + ew + 22 * scale;
        mixerY = eventY;
        tx = mx + mw + 22 * scale;
        tw = innerX + innerW - tx;
        rowTop = contentTop;
        rowH = (contentH - 2 * 10 * scale) / 3;
      }

      roundRect(ex, eventY, ew, 30 * scale, 9 * scale, panel, border);
      dot(ex + 14 * scale, eventY + 15 * scale, 3.5 * scale, accent, pulse);
      fitText(step.event || "Событие", ex + 24 * scale, eventY + 15 * scale,
        ew - 30 * scale, Math.max(8, 9.5 * scale), text, 750);

      roundRect(mx, mixerY, mw, 26 * scale, 9 * scale, accentSoft, accent);
      fitText(step.mixer || "Микшер", mx + mw / 2, mixerY + 13 * scale,
        mw - 10 * scale, Math.max(8, 9.5 * scale), accent, 800, "center");

      if (narrow) {
        arrow(ex + ew / 2, eventY + 32 * scale, mx + mw / 2, mixerY - 2 * scale, muted, 0.7);
      } else {
        arrow(ex + ew + 2 * scale, eventY + 15 * scale, mx - 2 * scale, mixerY + 13 * scale, muted, 0.7);
      }

      tracks.forEach((label, index) => {
        const y = rowTop + index * (rowH + (narrow ? 8 : 10) * scale);
        const cy = y + rowH / 2;
        roundRect(tx, y, tw, rowH, 8 * scale, panel, border);
        fitText(label, tx + 10 * scale, cy, tw * 0.26, Math.max(8, 9.5 * scale), text, 750);
        wave(tx + tw * 0.30, cy, tw * 0.62, amps[index % 3] * scale, freqs[index % 3],
          index * 1.3, index === 1 ? accent : muted);
        if (narrow) {
          arrow(mx + mw / 2 + (index - 1) * 14 * scale, mixerY + 28 * scale,
            tx + tw * 0.14, y, muted, 0.45);
        } else {
          arrow(mx + mw + 2 * scale, mixerY + 13 * scale, tx - 2 * scale, cy, muted, 0.5);
        }
      });
    } else if (kind === "network") {
      const clients = step.clients || [];
      const serverW = Math.min(230 * scale, innerW * 0.52);
      const serverH = 36 * scale;
      const sx = panelX + panelW / 2 - serverW / 2;
      const sy = contentTop + 4 * scale;

      fitText(step.model || "Клиент-серверная модель", innerX, contentTop + 8 * scale,
        innerW * 0.4, Math.max(7.5, 8 * scale), muted, 700);

      roundRect(sx, sy, serverW, serverH, 10 * scale, accentSoft, accent);
      fitText("Сервер", sx + serverW / 2, sy + 13 * scale, serverW - 16 * scale,
        Math.max(9, 11 * scale), accent, 850, "center");
      fitText("авторитетное состояние мира", sx + serverW / 2, sy + 26 * scale,
        serverW - 14 * scale, Math.max(7.5, 8 * scale), muted, 600, "center");

      const pingW = 96 * scale;
      chip(sx + serverW + 10 * scale, sy + (serverH - 22 * scale) / 2, pingW, 22 * scale,
        step.ping || "Задержка ~40 мс", { size: Math.max(7.5, 8.5 * scale), color: muted, weight: 700 });

      const clY = contentBottom - 32 * scale;
      const clH = 32 * scale;
      const clGap = 10 * scale;
      const clW = (innerW - 2 * clGap) / 3;
      const serverCX = sx + serverW / 2;
      const bottom = clY;

      clients.forEach((label, index) => {
        const x = innerX + index * (clW + clGap);
        const cx = x + clW / 2;
        roundRect(x, bottom, clW, clH, 9 * scale, panel, border);
        fitText(label, cx, bottom + clH / 2, clW - 10 * scale,
          Math.max(8.5, 9.5 * scale), text, 750, "center");

        const topY = sy + serverH;
        const len = bottom - topY;
        const dirY = bottom + clH / 2 < topY ? 1 : -1;
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = muted;
        ctx.lineWidth = Math.max(1, 1.1 * scale);
        ctx.beginPath();
        ctx.moveTo(serverCX, topY + (dirY > 0 ? 0 : 0));
        ctx.lineTo(cx, bottom);
        ctx.stroke();
        ctx.restore();

        const u1 = (time / 1700 + index * 0.37) % 1;
        dot(serverCX + (cx - serverCX) * u1, topY + len * u1, 3 * scale, accent, 0.9);
        const u2 = (time / 1700 + index * 0.37 + 0.5) % 1;
        dot(serverCX + (cx - serverCX) * u2, topY + len * u2, 3 * scale, text, 0.55);
      });

      fitText("состояния: вниз · действия: вверх", panelX + panelW / 2, contentBottom - 42 * scale,
        innerW * 0.7, Math.max(7.5, 8 * scale), muted, 600, "center");
    } else if (kind === "team") {
      const roles = step.roles || [];
      const board = step.board || [];
      const narrow = panelW < 500 * scale;

      const roleW = narrow ? innerW : innerW * 0.5;
      const roleCols = narrow ? 3 : 2;
      const roleRows = Math.ceil(roles.length / roleCols);
      const roleGap = 7 * scale;
      const roleCellW = (roleW - (roleCols - 1) * roleGap) / roleCols;
      const roleCellH = narrow ? (contentH * 0.40 - roleGap) / 2 : (contentH - 2 * roleGap) / roleRows;
      roles.forEach((item, index) => {
        const col = index % roleCols;
        const row = Math.floor(index / roleCols);
        const x = innerX + col * (roleCellW + roleGap);
        const y = contentTop + row * (roleCellH + roleGap);
        roundRect(x, y, roleCellW, roleCellH, 9 * scale, panel, border);
        dot(x + 10 * scale, y + roleCellH / 2, 3 * scale, accent);
        fitText(item.label, x + 18 * scale, y + roleCellH / 2,
          roleCellW - 24 * scale, Math.max(7.5, 9 * scale), text, 700);
      });

      const rightX = narrow ? innerX : innerX + innerW * 0.54;
      const rightW = narrow ? innerW : innerW * 0.46;
      const sprintY = narrow ? contentTop + contentH * 0.46 : contentTop;
      colHeader(step.sprint || "Спринт", rightX, sprintY, rightW);

      const kanY = sprintY + 14 * scale;
      const kanH = (narrow ? contentH * 0.22 : contentH * 0.34);
      const kanGap = 7 * scale;
      const kanW = (rightW - 2 * kanGap) / 3;
      const tasksPerCol = [3, 2, 2];
      board.forEach((label, index) => {
        const x = rightX + index * (kanW + kanGap);
        roundRect(x, kanY, kanW, kanH, 8 * scale, panel, border);
        fitText(label, x + kanW / 2, kanY + 9 * scale, kanW - 8 * scale,
          Math.max(7.5, 8 * scale), accent, 800, "center");
        const count = tasksPerCol[index % 3];
        for (let t = 0; t < count; t += 1) {
          const barW = (kanW - 14 * scale) * (0.9 - t * 0.22);
          const fill = index === 0 ? palette.control_background
            : index === 1 ? accentSoft : accentDark;
          roundRect(x + 7 * scale, kanY + (t + 1.4) * (kanH / 4.2), barW,
            7 * scale, 3 * scale, fill, null);
        }
      });

      const gitY = narrow ? contentBottom - 18 * scale : kanY + kanH + 18 * scale;
      const node1 = rightX + rightW * 0.16;
      const node2 = rightX + rightW * 0.62;
      const branchY = gitY - 12 * scale;
      ctx.save();
      ctx.strokeStyle = muted;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = Math.max(1, 1.3 * scale);
      ctx.beginPath();
      ctx.moveTo(rightX + 4 * scale, gitY);
      ctx.lineTo(rightX + rightW * 0.86, gitY);
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(node1, gitY);
      ctx.quadraticCurveTo(node1 + 14 * scale, branchY, node1 + 30 * scale, branchY);
      ctx.lineTo(node2 - 16 * scale, branchY);
      ctx.quadraticCurveTo(node2, branchY, node2, gitY);
      ctx.stroke();
      ctx.restore();
      dot(node1, gitY, 3 * scale, muted);
      dot(node2, gitY, 3 * scale, accent);
      dot((node1 + node2) / 2, branchY, 3 * scale, accent);
      fitText("main", rightX + rightW * 0.90, gitY, rightW * 0.2,
        Math.max(7.5, 8 * scale), muted, 700);
      fitText("feature-ветка", (node1 + node2) / 2, branchY - 8 * scale, rightW * 0.5,
        Math.max(7.5, 8 * scale), accent, 700, "center");
    } else if (kind === "release") {
      const phases = step.phases || [];
      const items = step.items || [];
      const lineY = panelY + panelH * 0.34;
      const x0 = innerX + 8 * scale;
      const x1 = innerX + innerW - 8 * scale;
      const spacing = (x1 - x0) / Math.max(1, phases.length - 1);
      const highlight = Math.floor(time / 900) % phases.length;

      ctx.save();
      ctx.strokeStyle = muted;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = Math.max(1.2, 1.6 * scale);
      ctx.beginPath();
      ctx.moveTo(x0, lineY);
      ctx.lineTo(x1, lineY);
      ctx.stroke();
      ctx.restore();

      phases.forEach((label, index) => {
        const x = x0 + index * spacing;
        const active = index < highlight;
        const current = index === highlight;
        ctx.beginPath();
        ctx.arc(x, lineY, (current ? 6.5 : 5) * scale, 0, Math.PI * 2);
        ctx.fillStyle = current ? accent : active ? accentDark : panel;
        ctx.fill();
        ctx.strokeStyle = current ? accent : border;
        ctx.lineWidth = Math.max(1.2, 1.5 * scale);
        ctx.stroke();
        if (current) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = accent;
          ctx.beginPath();
          ctx.arc(x, lineY, (10 + 3 * Math.sin(time / 300)) * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        const above = index % 2 === 0;
        const ly = above ? lineY - 16 * scale : lineY + 16 * scale;
        fitText(label, x, ly, spacing + 30 * scale, Math.max(7.5, 8.5 * scale),
          current ? accent : active ? text : muted, 700, "center");
      });

      const chipY = lineY + 34 * scale;
      const chipH = Math.max(28, 32 * scale);
      const chipGap = 8 * scale;
      const chipW = (innerW - chipGap) / 2;
      items.forEach((item, index) => {
        infoCard(innerX + index * (chipW + chipGap), chipY, chipW, chipH,
          item.label, item.detail, { labelSize: Math.max(8.5, 10 * scale) });
      });
    } else {
      const items = step.items || [];
      const gap = 8 * scale;
      const pad = 13 * scale;
      const footer = 34 * scale;
      const top = contentTop;
      const cellW = (innerW - pad * 0 - gap * 1) / 2;
      const rows = Math.ceil(items.length / 2);
      const cellH = (contentH - footer - gap * (rows - 1)) / rows;
      items.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        infoCard(innerX + col * (cellW + gap), top + row * (cellH + gap),
          cellW, cellH, item.label, item.detail);
      });
    }

    if (step.note) {
      fitText(step.note, panelX + 14 * scale, noteY, panelW - 28 * scale,
        Math.max(7.5, 8.5 * scale), accent, 650);
    }

    const points = Math.max(1, sceneTotalSteps);
    const dotGap = Math.min(17 * scale, (width * 0.72) / (points - 1));
    const total = dotGap * (points - 1);
    const startX = (width - total) / 2;
    const dotY = Math.min(height * 0.795, panelY + panelH + 20 * scale);
    // На узких макетах HTML-субтитр перекрывает низ канваса.
    const overlaySubtitle = frame.videoMode === true || width < 700;
    const subtitleTop = height - 210;
    if (!overlaySubtitle || dotY < subtitleTop - 6) {
      for (let index = 0; index < points; index += 1) {
        const active = index <= stepIndex;
        dot(startX + index * dotGap, dotY, active ? 3.2 * scale : 2.3 * scale,
          active ? accent : muted, active ? 1 : 0.45);
      }
    }
  },
};
