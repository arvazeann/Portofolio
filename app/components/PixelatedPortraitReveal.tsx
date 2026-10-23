"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const MAX_PHOTO_PARTICLES = 10_000;

function hash(index: number) {
  let value = index | 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_295;
}

function smoothstep(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export default function PixelatedPortraitReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = canvas?.parentElement;
    const wrapper = panel?.parentElement;
    const image = panel?.querySelector<HTMLImageElement>(".portrait-photo");
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !panel || !wrapper || !image || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visibility = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startLoop();
      else stopLoop();
    }, { threshold: 0 });
    let isVisible = false;
    let active = false;
    let destroyed = false;
    let animationFrame = 0;
    let resizeTimer = 0;
    let lastFrameAt = 0;
    let degradationStride = 1;
    let slowFrames = 0;
    let pixelRatio = 1;
    let panelWidth = 0;
    let panelHeight = 0;
    let portraitLeft = 0;
    let portraitTop = 0;
    let portraitWidth = 0;
    let portraitHeight = 0;
    let columns = 0;
    let rows = 0;
    let imageLuminance = new Float32Array();
    let imageKeep = new Uint8Array();
    let photoCount = 0;
    let dustCount = 0;
    let totalCount = 0;
    let homeX = new Float32Array();
    let homeY = new Float32Array();
    let scatterX = new Float32Array();
    let scatterY = new Float32Array();
    let brightness = new Float32Array();
    let sizes = new Float32Array();
    let delays = new Float32Array();
    let durations = new Float32Array();
    let phases = new Float32Array();
    let frameX = new Float32Array();
    let frameY = new Float32Array();
    let frameSize = new Float32Array();
    let frameBucket = new Uint8Array();
    const buckets = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    const minFrameInterval = 1000 / 36;

    const getProgress = () => {
      const scrollRange = wrapper.offsetHeight - window.innerHeight;
      if (scrollRange <= 0) return 0;
      return clamp(-wrapper.getBoundingClientRect().top / scrollRange);
    };

    const setCanvasSize = () => {
      panelWidth = panel.clientWidth;
      panelHeight = panel.clientHeight;
      const maxRatio = window.innerWidth <= 600 ? 1.5 : 2;
      pixelRatio = Math.min(window.devicePixelRatio || 1, maxRatio);
      const width = Math.max(1, Math.round(panelWidth * pixelRatio));
      const height = Math.max(1, Math.round(panelHeight * pixelRatio));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const samplePortrait = () => {
      if (!image.complete || !image.naturalWidth || !image.naturalHeight) return false;
      setCanvasSize();

      const imageRect = image.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      portraitLeft = imageRect.left - panelRect.left;
      portraitTop = imageRect.top - panelRect.top;
      portraitWidth = imageRect.width;
      portraitHeight = imageRect.height;
      if (!portraitWidth || !portraitHeight) return false;

      const cellSize = window.innerWidth <= 600 ? 8 : 5;
      columns = Math.max(1, Math.ceil(portraitWidth / cellSize));
      rows = Math.max(1, Math.ceil(portraitHeight / cellSize));
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = columns;
      sampleCanvas.height = rows;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) return false;

      const scale = Math.max(portraitWidth / image.naturalWidth, portraitHeight / image.naturalHeight);
      const renderedWidth = image.naturalWidth * scale;
      const renderedHeight = image.naturalHeight * scale;
      const objectPosition = getComputedStyle(image).objectPosition.split(/\s+/);
      const xFactor = objectPosition[0] === "left" ? 0 : objectPosition[0] === "right" ? 1 : Number.parseFloat(objectPosition[0]) / 100 || 0.5;
      const yFactor = objectPosition[1] === "top" ? 0 : objectPosition[1] === "bottom" ? 1 : Number.parseFloat(objectPosition[1]) / 100 || 0.5;
      const offsetX = (portraitWidth - renderedWidth) * xFactor;
      const offsetY = (portraitHeight - renderedHeight) * yFactor;
      sampleContext.drawImage(
        image,
        (offsetX * columns) / portraitWidth,
        (offsetY * rows) / portraitHeight,
        (renderedWidth * columns) / portraitWidth,
        (renderedHeight * rows) / portraitHeight,
      );

      const rgba = sampleContext.getImageData(0, 0, columns, rows).data;
      const count = columns * rows;
      const gray = new Float32Array(count);
      let minGray = 255;
      let maxGray = 0;
      for (let index = 0; index < count; index += 1) {
        const offset = index * 4;
        const value = rgba[offset] * 0.299 + rgba[offset + 1] * 0.587 + rgba[offset + 2] * 0.114;
        gray[index] = value;
        if (value < minGray) minGray = value;
        if (value > maxGray) maxGray = value;
      }

      // Approximate the 2nd/98th percentile stretch without sorting image data.
      const histogram = new Uint32Array(256);
      for (let index = 0; index < count; index += 1) histogram[Math.round(gray[index])] += 1;
      const lowerTarget = Math.floor(count * 0.02);
      const upperTarget = Math.ceil(count * 0.98);
      let cumulative = 0;
      let low = minGray;
      let high = maxGray;
      for (let value = 0; value < 256; value += 1) {
        cumulative += histogram[value];
        if (cumulative >= lowerTarget) { low = value; break; }
      }
      cumulative = 0;
      for (let value = 0; value < 256; value += 1) {
        cumulative += histogram[value];
        if (cumulative >= upperTarget) { high = value; break; }
      }
      const range = Math.max(1, high - low);
      imageLuminance = new Float32Array(count);
      imageKeep = new Uint8Array(count);
      for (let index = 0; index < count; index += 1) {
        const level = clamp((gray[index] - low) / range);
        const normalized = clamp((level - 0.08) / 0.92);
        imageLuminance[index] = clamp((normalized - 0.5) * 1.16 + 0.5);
      }
      let selected = 0;
      const maskCenterX = columns * 0.5;
      const maskCenterY = rows * 0.47;
      const maskRadiusX = columns * 0.51;
      const maskRadiusY = rows * 0.53;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const index = y * columns + x;
          const contrast = imageLuminance[index];
          imageLuminance[index] = contrast;
          const nx = (x - maskCenterX) / maskRadiusX;
          const ny = (y - maskCenterY) / maskRadiusY;
          const radial = Math.sqrt(nx * nx + ny * ny);
          const mask = 1 - smoothstep((radial - 0.76) / 0.2);
          if (mask < 0.04 || contrast < 0.12) continue;

          const left = imageLuminance[index - 1] ?? contrast;
          const right = imageLuminance[index + 1] ?? contrast;
          const above = imageLuminance[index - columns] ?? contrast;
          const below = imageLuminance[index + columns] ?? contrast;
          const detail = clamp((Math.abs(left - right) + Math.abs(above - below)) * 2.5);
          const probability = mask * clamp((contrast - 0.06) * 1.35) * (0.22 + detail * 0.9);
          if (hash(index + 8021) <= probability) {
            imageKeep[index] = 1;
            selected += 1;
          }
        }
      }

      const photoParticleLimit = window.innerWidth <= 600 ? 1800 : window.innerWidth <= 900 ? 5000 : MAX_PHOTO_PARTICLES;
      if (selected > photoParticleLimit) {
        const keepRatio = photoParticleLimit / selected;
        selected = 0;
        for (let index = 0; index < count; index += 1) {
          if (imageKeep[index] && hash(index + 6501) > keepRatio) imageKeep[index] = 0;
          if (imageKeep[index]) selected += 1;
        }
      }

      photoCount = selected;
      dustCount = window.innerWidth <= 600 ? 4200 : window.innerWidth <= 900 ? 2800 : 3200;
      totalCount = photoCount + dustCount;
      homeX = new Float32Array(totalCount);
      homeY = new Float32Array(totalCount);
      scatterX = new Float32Array(totalCount);
      scatterY = new Float32Array(totalCount);
      brightness = new Float32Array(totalCount);
      sizes = new Float32Array(totalCount);
      delays = new Float32Array(totalCount);
      durations = new Float32Array(totalCount);
      phases = new Float32Array(totalCount);
      frameX = new Float32Array(totalCount);
      frameY = new Float32Array(totalCount);
      frameSize = new Float32Array(totalCount);
      frameBucket = new Uint8Array(totalCount);

      let particle = 0;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const sourceIndex = y * columns + x;
          if (!imageKeep[sourceIndex]) continue;
          const index = particle++;
          const luminance = imageLuminance[sourceIndex];
          const jitter = 0.32 + hash(index + 17) * 0.36;
          homeX[index] = portraitLeft + (x + jitter) * portraitWidth / columns;
          homeY[index] = portraitTop + (y + jitter) * portraitHeight / rows;
          brightness[index] = 0.35 + luminance * 0.65;
          sizes[index] = 1 + luminance * 1.65;
          const edgeDistance = Math.min(x / columns, y / rows, (columns - 1 - x) / columns, (rows - 1 - y) / rows);
          const edgeBias = 1 - clamp(edgeDistance * 2);
          delays[index] = 0.04 + 0.51 * (hash(index + 223) * 0.55 + (y / rows) * 0.25 + edgeBias * 0.2);
          durations[index] = Math.min(0.35 + hash(index + 109) * 0.34, 1 - delays[index]);
          phases[index] = hash(index + 907);
        }
      }

      // Place photo particles in a jittered grid so the dispersed field covers the whole panel.
      const aspect = panelWidth / Math.max(1, panelHeight);
      const gridColumns = Math.ceil(Math.sqrt(dustCount * aspect));
      const gridRows = Math.ceil(dustCount / gridColumns);
      for (let dust = 0; dust < dustCount; dust += 1) {
        const index = photoCount + dust;
        const gridX = dust % gridColumns;
        const gridY = Math.floor(dust / gridColumns);
        scatterX[index] = (gridX + 0.18 + hash(index + 3001) * 0.64) * panelWidth / gridColumns;
        scatterY[index] = (gridY + 0.18 + hash(index + 4001) * 0.64) * panelHeight / gridRows;
        homeX[index] = scatterX[index];
        homeY[index] = scatterY[index];
        brightness[index] = 0.35 + hash(index + 5001) * 0.34;
        sizes[index] = 0.75 + hash(index + 6001) * 1.05;
        delays[index] = 0;
        durations[index] = 1;
        phases[index] = hash(index + 7001);
      }

      const photoColumns = Math.ceil(Math.sqrt(Math.max(1, photoCount) * aspect));
      const photoRows = Math.ceil(Math.max(1, photoCount) / photoColumns);
      for (let photo = 0; photo < photoCount; photo += 1) {
        const index = photo;
        const gridX = photo % photoColumns;
        const gridY = Math.floor(photo / photoColumns);
        scatterX[index] = (gridX + 0.12 + hash(index + 9101) * 0.76) * panelWidth / photoColumns;
        scatterY[index] = (gridY + 0.12 + hash(index + 9201) * 0.76) * panelHeight / photoRows;
      }
      return true;
    };

    const paint = (progress: number, elapsed: number) => {
      context.clearRect(0, 0, panelWidth, panelHeight);
      const photoBlend = smoothstep((progress - 0.01) / 0.05);

      for (let index = 0; index < totalCount; index += degradationStride) {
          const isPhoto = index < photoCount;
          const delay = isPhoto ? delays[index] : 0;
          const q = smoothstep(clamp((progress - delay) / durations[index]));
          const alpha = isPhoto
            ? photoBlend > 0.99
              ? Math.max(0.35, brightness[index] * (0.42 + q * 0.58))
              : brightness[index] * (0.42 + q * 0.58) * photoBlend
            : brightness[index];
          if (isPhoto && alpha < 0.01) {
            frameBucket[index] = 255;
            continue;
          }
          let particleBucket = 0;
          while (particleBucket < buckets.length - 1 && alpha > buckets[particleBucket]) particleBucket += 1;

          const dx = scatterX[index] - homeX[index];
          const dy = scatterY[index] - homeY[index];
          const curve = Math.sin(Math.PI * q) * 10;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const waveX = Math.sin(homeX[index] * 0.018 + elapsed * 0.34 + phases[index]);
          const waveY = Math.cos(homeY[index] * 0.016 + elapsed * 0.27 + phases[index]);
          const idleAmplitude = 1.2 + q * 5.2;
          const x = homeX[index] + dx * q - (dy / distance) * curve + waveX * idleAmplitude;
          const y = homeY[index] + dy * q + (dx / distance) * curve + waveY * idleAmplitude;
          const size = sizes[index] * (isPhoto ? 1 - q * 0.12 : 1);
          frameX[index] = x;
          frameY[index] = y;
          frameSize[index] = size;
          frameBucket[index] = particleBucket;
      }

      for (let bucket = 0; bucket < buckets.length; bucket += 1) {
        context.beginPath();
        for (let index = 0; index < totalCount; index += degradationStride) {
          if (frameBucket[index] !== bucket) continue;
          const size = frameSize[index];
          context.rect(frameX[index] - size / 2, frameY[index] - size / 2, size, size);
        }
        context.fillStyle = `rgb(${Math.round(92 + bucket * 25)} ${Math.round(92 + bucket * 25)} ${Math.round(92 + bucket * 25)})`;
        context.globalAlpha = 0.35 + bucket * 0.1083;
        context.fill();
      }

      context.globalAlpha = 1;
      image.style.opacity = String(1 - photoBlend);
      canvas.style.opacity = "1";
    };

    const resize = () => {
      if (destroyed) return;
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (samplePortrait()) {
          if (active) startLoop();
        }
      }, 120);
    };

    const tick = (now: number) => {
      animationFrame = 0;
      if (destroyed || !active || !isVisible || document.hidden || reducedMotion.matches) return;
      if (now - lastFrameAt < minFrameInterval) {
        animationFrame = window.requestAnimationFrame(tick);
        return;
      }
      const frameStarted = performance.now();
      const progress = getProgress();
      const elapsed = now / 1000;
      paint(progress, elapsed);
      const cost = performance.now() - frameStarted;
      slowFrames = cost > 20 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
      if (slowFrames > 150 && degradationStride < 4) {
        degradationStride += 1;
        slowFrames = 0;
      }
      lastFrameAt = now;
      animationFrame = window.requestAnimationFrame(tick);
    };

    function startLoop() {
      if (!active || !isVisible || document.hidden || reducedMotion.matches || animationFrame) return;
      animationFrame = window.requestAnimationFrame(tick);
    }

    function stopLoop() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        active = false;
        stopLoop();
        canvas.style.opacity = "0";
        image.style.removeProperty("opacity");
      } else if (!active && samplePortrait()) {
        wrapper.classList.add("is-scroll-enhanced");
        active = true;
        startLoop();
      }
    };

    const onImageReady = () => {
      if (!samplePortrait()) return;
      if (!reducedMotion.matches) {
        wrapper.classList.add("is-scroll-enhanced");
        active = true;
        startLoop();
      }
    };

    visibility.observe(wrapper);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(panel);
    resizeObserver.observe(image);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    image.addEventListener("load", onImageReady);
    reducedMotion.addEventListener("change", onMotionChange);
    if (image.complete) onImageReady();

    return () => {
      destroyed = true;
      stopLoop();
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      image.removeEventListener("load", onImageReady);
      reducedMotion.removeEventListener("change", onMotionChange);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      image.style.removeProperty("opacity");
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-canvas" aria-hidden="true" />;
}
