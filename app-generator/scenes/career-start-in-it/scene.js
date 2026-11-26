window.AppScene = {
  draw(ctx, frame) {
    const { width, height, palette, step, stepIndex, elapsedMs } = frame;
    if (!width || !height || !step) return;

    const scale = Math.max(0.72, Math.min(1.25, Math.min(width / 420, height / 520)));
    const accent = palette.accent;
    const text = palette.text;
    const muted = palette.muted_text;
    const panel = palette.panel;
    const border = palette.border;
    const left = width * 0.06;

    const roundRect = (x, y, w, h, radius, fill, stroke) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = Math.max(1, scale);
        ctx.stroke();
      }
    };

    const fitText = (value, x, y, maxWidth, size, color, weight = 600, align = "left") => {
      let fontSize = size;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.font = weight + " " + fontSize + "px system-ui, sans-serif";
      while (ctx.measureText(value).width > maxWidth && fontSize > 7.5) {
        fontSize -= 0.5;
        ctx.font = weight + " " + fontSize + "px system-ui, sans-serif";
      }
      ctx.fillText(value, x, y);
    };

    const wrappedText = (value, x, y, maxWidth, size, lineHeight, color, maxLines = 2) => {
      ctx.font = "700 " + size + "px system-ui, sans-serif";
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
      return visible.length;
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

    const card = (x, y, w, h, label, detail, index) => {
      roundRect(x, y, w, h, 10 * scale, panel, border);
      dot(x + 14 * scale, y + 17 * scale, 3.2 * scale, accent);
      fitText(label, x + 24 * scale, y + 18 * scale, w - 34 * scale,
        Math.max(10, 13 * scale), text, 750);
      wrappedText(detail, x + 13 * scale, y + h * 0.67,
        w - 26 * scale, Math.max(8, 9.5 * scale), 11 * scale, muted, 2);
      if (Number.isInteger(index)) {
        fitText(String(index + 1).padStart(2, "0"), x + w - 12 * scale,
          y + 17 * scale, 20 * scale, Math.max(7.5, 8 * scale),
          muted, 700, "right");
      }
    };

    const drawGrid = (items, columns = 2) => {
      const rows = Math.ceil(items.length / columns);
      const gap = 8 * scale;
      const pad = 13 * scale;
      const footer = 35 * scale;
      const top = panelY + 13 * scale;
      const innerW = panelW - pad * 2;
      const innerH = panelH - 13 * scale - footer - 10 * scale;
      const cellW = (innerW - gap * (columns - 1)) / columns;
      const cellH = (innerH - gap * (rows - 1)) / rows;
      items.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        card(
          panelX + pad + col * (cellW + gap),
          top + row * (cellH + gap),
          cellW,
          cellH,
          item.label,
          item.detail,
          index,
        );
      });
    };

    // Фоновая сетка и редкие точки не конкурируют с содержанием.
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    const grid = 34 * scale;
    for (let x = grid; x < width; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = grid; y < height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    for (let index = 0; index < 18; index += 1) {
      const x = ((index * 97 + 31) % 997) / 997 * width;
      const y = ((index * 173 + 67) % 991) / 991 * height;
      dot(x, y, (index % 3 + 1) * 0.65 * scale, accent, 0.12);
    }

    // Шапка сцены.
    fitText(String(step.eyebrow || "МАРШРУТ В IT").toUpperCase(),
      left, height * 0.105, width * 0.84, Math.max(8.5, 10 * scale),
      accent, 800);
    wrappedText(step.headline || "", left, height * 0.17,
      width * 0.86, Math.max(14, 22 * scale), 25 * scale, text, 2);

    // Основная карточка ограничена шириной и находится выше субтитров.
    const panelW = Math.min(width * 0.90, 760 * scale);
    const panelH = Math.min(height * 0.46, 360 * scale);
    const panelX = (width - panelW) / 2;
    const panelY = height * 0.255;
    roundRect(panelX, panelY, panelW, panelH, 16 * scale, "rgba(26, 26, 32, 0.92)", border);

    const pulse = 0.72 + 0.18 * Math.sin((elapsedMs || 0) / 620);
    dot(panelX + panelW - 17 * scale, panelY + 17 * scale,
      4 * scale, accent, pulse);

    if (step.kind === "languages") {
      wrappedText(step.note || "", left, height * 0.232, width * 0.86,
        Math.max(7.5, 8.5 * scale), 9 * scale, muted, 2);
      const items = step.items || [];
      const innerX = panelX + 12 * scale;
      const rowTop = panelY + 13 * scale;
      const rowH = (panelH - 50 * scale) / Math.max(1, items.length);
      const nameW = Math.min(94 * scale, panelW * 0.32);
      const percentW = 38 * scale;
      const barX = innerX + nameW + 5 * scale;
      const barW = Math.max(35 * scale, panelW - nameW - percentW - 36 * scale);

      items.forEach((item, index) => {
        const y = rowTop + index * rowH;
        const pct = Math.max(0, Math.min(100, Number(item.usage) || 0));
        fitText(item.label, innerX, y + 7 * scale, nameW,
          Math.max(8.5, 10.5 * scale), text, 750);
        fitText(item.detail, barX, y + 7 * scale, barW,
          Math.max(7.5, 8.5 * scale), muted, 600);
        roundRect(barX, y + 17 * scale, barW, 4 * scale, 2 * scale,
          "rgba(255,255,255,0.08)", null);
        roundRect(barX, y + 17 * scale, barW * pct / 100, 4 * scale,
          2 * scale, accent, null);
        fitText(pct.toFixed(1) + "%", panelX + panelW - 12 * scale,
          y + 19 * scale, percentW, Math.max(7.5, 8.5 * scale),
          text, 700, "right");
      });

      const footY = panelY + panelH - 22 * scale;
      fitText(step.source || "", panelX + 12 * scale, footY - 4 * scale,
        panelW - 24 * scale, Math.max(7.2, 8 * scale), text, 700);
      fitText(step.sourceNote || "", panelX + 12 * scale, footY + 8 * scale,
        panelW - 24 * scale, Math.max(7, 7.5 * scale), muted, 500);
    } else if (step.kind === "portfolio") {
      const items = step.items || [];
      const gap = 8 * scale;
      const x = panelX + 13 * scale;
      const w = panelW - 26 * scale;
      const rowH = (panelH - 60 * scale) / 3;
      items.forEach((item, index) => {
        const y = panelY + 12 * scale + index * (rowH + 4 * scale);
        roundRect(x, y, w, rowH, 9 * scale, panel, border);
        roundRect(x + 10 * scale, y + 8 * scale, 28 * scale, 28 * scale,
          8 * scale, palette.accent_soft, null);
        fitText(String(index + 1).padStart(2, "0"),
          x + 24 * scale, y + 22 * scale, 24 * scale,
          10 * scale, accent, 800, "center");
        fitText(item.label, x + 48 * scale, y + 16 * scale,
          w - 62 * scale, Math.max(10, 12 * scale), text, 750);
        fitText(item.detail, x + 48 * scale, y + 34 * scale,
          w - 62 * scale, Math.max(8, 9 * scale), muted, 500);
      });
      fitText(step.note || "", panelX + 13 * scale,
        panelY + panelH - 13 * scale, panelW - 26 * scale,
        Math.max(7.5, 8.5 * scale), accent, 650);
    } else if (step.kind === "safety") {
      const items = step.items || [];
      const gap = 8 * scale;
      const pad = 13 * scale;
      const cellW = (panelW - pad * 2 - gap) / 2;
      const cellH = (panelH - 58 * scale - gap) / 2;
      items.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = panelX + pad + col * (cellW + gap);
        const y = panelY + 12 * scale + row * (cellH + gap);
        roundRect(x, y, cellW, cellH, 10 * scale, panel, border);
        dot(x + 15 * scale, y + 17 * scale, 5 * scale, accent);
        fitText("✓", x + 15 * scale, y + 17 * scale,
          12 * scale, 9 * scale, palette.background, 900, "center");
        wrappedText(item.label, x + 11 * scale, y + 38 * scale,
          cellW - 20 * scale, Math.max(9, 11 * scale), 12 * scale, text, 2);
        wrappedText(item.detail, x + 11 * scale, y + cellH - 15 * scale,
          cellW - 20 * scale, Math.max(7.5, 8.5 * scale), 10 * scale, muted, 2);
      });
      fitText(step.note || "", panelX + 13 * scale,
        panelY + panelH - 13 * scale, panelW - 26 * scale,
        Math.max(7.2, 8 * scale), accent, 650);
    } else if (step.kind === "roadmap") {
      const items = step.items || [];
      const gap = 7 * scale;
      const pad = 12 * scale;
      const columns = 3;
      const rows = 2;
      const cellW = (panelW - pad * 2 - gap * (columns - 1)) / columns;
      const cellH = (panelH - 57 * scale - gap) / rows;
      items.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = panelX + pad + col * (cellW + gap);
        const y = panelY + 12 * scale + row * (cellH + gap);
        roundRect(x, y, cellW, cellH, 9 * scale, panel, border);
        fitText(item.label, x + 9 * scale, y + 16 * scale,
          cellW - 18 * scale, Math.max(8, 9.5 * scale), accent, 800);
        wrappedText(item.detail, x + 9 * scale, y + 34 * scale,
          cellW - 18 * scale, Math.max(7.5, 8.5 * scale), 10 * scale, text, 2);
      });
      fitText(step.note || "", panelX + 13 * scale,
        panelY + panelH - 13 * scale, panelW - 26 * scale,
        Math.max(7.2, 8 * scale), muted, 600);
    } else {
      drawGrid(step.items || [], 2);
      fitText(step.note || "", panelX + 13 * scale,
        panelY + panelH - 13 * scale, panelW - 26 * scale,
        Math.max(7.5, 8.5 * scale), accent, 650);
    }

    // Индикатор маршрута подчёркивает последовательность, не управляя ею.
    const points = 8;
    const gap = Math.min(17 * scale, (width * 0.72) / (points - 1));
    const total = gap * (points - 1);
    const startX = (width - total) / 2;
    const y = height * 0.795;
    for (let index = 0; index < points; index += 1) {
      const active = index <= stepIndex;
      dot(startX + index * gap, y, active ? 3.2 * scale : 2.3 * scale,
        active ? accent : muted, active ? 1 : 0.45);
    }
  },
};
