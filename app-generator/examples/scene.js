window.AppScene = {
  draw(ctx, frame) {
    const { width, height, stepIndex, palette } = frame;
    const count = 6;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.29;

    ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.006);
    ctx.strokeStyle = palette.muted_text;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();

    for (let index = 0; index < count; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;

    for (let index = 0; index < count; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const active = index <= stepIndex;

      ctx.beginPath();
      ctx.arc(x, y, Math.max(10, Math.min(width, height) * 0.025), 0, Math.PI * 2);
      ctx.fillStyle = active ? palette.accent : palette.panel;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.text;
      ctx.stroke();
    }

    ctx.fillStyle = palette.text;
    ctx.font = "700 " + Math.max(18, Math.min(width, height) * 0.055) + "px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ШАГ " + (stepIndex + 1), centerX, centerY);
  }
};
