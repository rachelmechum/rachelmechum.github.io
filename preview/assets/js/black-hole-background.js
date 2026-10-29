(() => {
  const canvas = document.getElementById("orbit-background");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stars = Array.from({ length: 105 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.4 + Math.random() * 0.9,
    alpha: 0.15 + Math.random() * 0.28,
    phase: Math.random() * Math.PI * 2,
  }));

  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let scale = 1;
  let time = 0;
  let previousFrame = 0;

  function project(x, z) {
    const depth = 0.5;
    const squash = 0.48;
    const vertical = z * squash;
    const perspective = 440 / (440 - z * 0.8);
    return {
      x: centerX + (x * Math.cos(depth) + vertical * Math.sin(depth)) * perspective,
      y: centerY + (-x * Math.sin(depth) + vertical * Math.cos(depth)) * perspective,
      perspective,
    };
  }

  function drawHole(x, y, radius, alpha) {
    context.save();
    context.globalAlpha = alpha;
    const glow = context.createRadialGradient(x, y, radius, x, y, radius * 2.2);
    glow.addColorStop(0, "rgba(224,169,183,.42)");
    glow.addColorStop(0.3, "rgba(170,179,148,.16)");
    glow.addColorStop(1, "rgba(170,179,148,0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#09070c";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#dfb5bf";
    context.lineWidth = 1;
    context.stroke();
    context.restore();
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    const background = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width * 0.82, 300));
    background.addColorStop(0, "rgba(111,74,104,.25)");
    background.addColorStop(1, "rgba(36,29,40,0)");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    for (const star of stars) {
      context.globalAlpha = star.alpha * (0.78 + 0.22 * Math.sin(time * 0.5 + star.phase));
      context.fillStyle = "#f3e5dc";
      context.beginPath();
      context.arc(((star.x + time * 0.0005) % 1) * width, star.y * height, star.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;

    const home = document.getElementById("home");
    if (home && !home.hidden) return;

    const cycle = reduceMotion.matches ? 5 : time % 18;
    const progress = Math.min(cycle / 10, 1);
    const merge = smooth(Math.max(0, Math.min(1, (cycle - 9.3) / 1.5)));
    const fade = cycle > 16 ? 1 - smooth((cycle - 16) / 2) : 1;
    const distance = 58 * scale * Math.pow(1 - progress, 0.8);
    const angle = 0.8 + cycle * 1.25 + 0.065 * cycle * cycle;

    if (merge < 1) {
      context.save();
      context.globalAlpha = 0.12 * fade;
      context.strokeStyle = "#c7a8bc";
      context.lineWidth = 0.9;
      context.beginPath();
      for (let point = 0; point <= 90; point++) {
        const theta = (point / 90) * Math.PI * 2;
        const projected = project(Math.cos(theta) * distance, Math.sin(theta) * distance);
        if (point === 0) context.moveTo(projected.x, projected.y);
        else context.lineTo(projected.x, projected.y);
      }
      context.stroke();
      context.restore();

      const bodies = [
        { ...project(Math.cos(angle) * distance, Math.sin(angle) * distance), radius: 15 * scale },
        { ...project(-Math.cos(angle) * distance, -Math.sin(angle) * distance), radius: 13 * scale },
      ].sort((a, b) => a.perspective - b.perspective);
      for (const body of bodies) drawHole(body.x, body.y, body.radius * body.perspective, fade * (1 - merge));
    }

    if (merge > 0) {
      for (let ring = 0; ring < 4; ring++) {
        const age = cycle - 10.1 - ring * 0.72;
        if (age > 0 && age < 5.6) {
          context.save();
          context.translate(centerX, centerY);
          context.rotate(-0.42);
          context.globalAlpha = fade * 0.42 * (1 - age / 5.6);
          context.strokeStyle = ring % 2 ? "#aab394" : "#e0a9b7";
          context.lineWidth = 1.2;
          context.beginPath();
          context.ellipse(0, 0, (20 + age * 27) * scale, (14 + age * 19) * scale, 0, 0, Math.PI * 2);
          context.stroke();
          context.restore();
        }
      }
      drawHole(centerX, centerY, 20 * scale, fade * merge);
    }
  }

  function smooth(value) {
    return value * value * (3 - 2 * value);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    centerX = width * 0.9;
    centerY = Math.min(height * 0.58, 620);
    scale = Math.min(0.9, width / 1200);
    draw();
  }

  function animate(timestamp) {
    if (previousFrame) time += Math.min((timestamp - previousFrame) / 1000, 0.06);
    previousFrame = timestamp;
    draw();
    if (!reduceMotion.matches) window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("hashchange", draw);
  reduceMotion.addEventListener("change", () => {
    previousFrame = 0;
    if (!reduceMotion.matches) window.requestAnimationFrame(animate);
    else draw();
  });

  resize();
  if (!reduceMotion.matches) window.requestAnimationFrame(animate);
})();
