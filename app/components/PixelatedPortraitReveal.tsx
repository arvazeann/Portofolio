"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function hash(index: number) {
  let value = index | 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_295;
}

function ease(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

const PARTICLE_FADE_CONFIG = {
  opacity: 0.81,
  bottomStart: 0.6,
  bottomEnd: 0.86,
  bottomOffsetPx: 70,
  sideStartY: 0.48,
  sideFullY: 0.76,
  sideWidth: 0.22,
  edgeOpacityFloor: 0.55,
  edgeSizeFloor: 0.72,
  discardFadeBelow: 0.03,
  discardAlphaBelow: 0.03,
} as const;

function getParticleFade(u: number, v: number, portraitHeight: number) {
  const bottomPosition = v - PARTICLE_FADE_CONFIG.bottomOffsetPx / portraitHeight;
  const bottomFade = 1 - ease((bottomPosition - PARTICLE_FADE_CONFIG.bottomStart)
    / (PARTICLE_FADE_CONFIG.bottomEnd - PARTICLE_FADE_CONFIG.bottomStart));
  const sideStrength = ease((v - PARTICLE_FADE_CONFIG.sideStartY)
    / (PARTICLE_FADE_CONFIG.sideFullY - PARTICLE_FADE_CONFIG.sideStartY));
  const distanceFromSide = Math.min(u, 1 - u);
  const edgeFade = 1 - ease(distanceFromSide / PARTICLE_FADE_CONFIG.sideWidth);
  const sideFade = 1 - sideStrength * edgeFade;

  return bottomFade * sideFade;
}

export default function PixelatedPortraitReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = canvas?.parentElement;
    const wrapper = panel?.parentElement;
    const image = panel?.querySelector<HTMLImageElement>(".portrait-photo");
    const fallback = panel?.querySelector<HTMLImageElement>(".portrait-static-fallback");
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !panel || !wrapper || !image || !fallback || !context) return;

    // Add ?heroDebug=1 to freeze the sampled portrait at its initial frame for inspection.
    const debugMode = new URLSearchParams(window.location.search).get("heroDebug") === "1";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let running = false;
    let destroyed = false;
    let raf = 0;
    let resizeTimer = 0;
    let lastFrame = 0;
    let slowFrames = 0;
    let drawStride = 1;
    let smoothedProgress = 0;
    let targetProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let pointerStrength = 0;
    let targetPointerStrength = 0;
    let pixelRatio = 1;
    let panelWidth = 0;
    let panelHeight = 0;
    let particleColor = "#e5ebe0";
    let photoLeft = 0;
    let photoTop = 0;
    let photoWidth = 0;
    let photoHeight = 0;
    let columns = 0;
    let rows = 0;
    let count = 0;
    let homeX = new Float32Array();
    let homeY = new Float32Array();
    let targetX = new Float32Array();
    let targetY = new Float32Array();
    let particleAlpha = new Float32Array();
    let particleSize = new Float32Array();
    let delay = new Float32Array();
    let duration = new Float32Array();
    let frameX = new Float32Array();
    let frameY = new Float32Array();
    let frameSize = new Float32Array();
    let bucketNext = new Uint32Array();
    const bucketLevels = [0.06, 0.12, 0.18, 0.24, 0.3, 0.36, 0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84, 0.9, 0.96];
    const bucketHeads = new Uint32Array(bucketLevels.length);
    const minFrameInterval = 1000 / 36;
    const updateParticleColor = () => {
      particleColor = getComputedStyle(document.documentElement).getPropertyValue("--particle-color").trim() || "#e5ebe0";
    };
    updateParticleColor();

    const getScrollProgress = () => {
      const range = wrapper.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;
      return clamp(-wrapper.getBoundingClientRect().top / range);
    };

    const sizeCanvas = () => {
      panelWidth = panel.clientWidth;
      panelHeight = panel.clientHeight;
      pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(panelWidth * pixelRatio));
      canvas.height = Math.max(1, Math.round(panelHeight * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const samplePhoto = () => {
      if (!image.complete || !image.naturalWidth || !image.naturalHeight) return false;
      sizeCanvas();
      const rect = image.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      photoLeft = rect.left - panelRect.left;
      photoTop = rect.top - panelRect.top;
      photoWidth = rect.width;
      photoHeight = rect.height;
      if (!photoWidth || !photoHeight) return false;

      const cellSize = window.innerWidth <= 600 ? 2.7 : window.innerWidth <= 900 ? 3.4 : 4;
      columns = Math.ceil(photoWidth / cellSize);
      rows = Math.ceil(photoHeight / cellSize);
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = columns;
      sampleCanvas.height = rows;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) return false;

      const scale = Math.max(photoWidth / image.naturalWidth, photoHeight / image.naturalHeight);
      const renderedWidth = image.naturalWidth * scale;
      const renderedHeight = image.naturalHeight * scale;
      const positions = getComputedStyle(image).objectPosition.split(/\s+/);
      const xPercent = Number.parseFloat(positions[0]) / 100 || 0.5;
      const yPercent = Number.parseFloat(positions[1] ?? positions[0]) / 100 || 0.5;
      const offsetX = (photoWidth - renderedWidth) * xPercent;
      const offsetY = (photoHeight - renderedHeight) * yPercent;
      sampleContext.drawImage(
        image,
        (offsetX * columns) / photoWidth,
        (offsetY * rows) / photoHeight,
        (renderedWidth * columns) / photoWidth,
        (renderedHeight * rows) / photoHeight,
      );

      const data = sampleContext.getImageData(0, 0, columns, rows).data;
      const raw = new Float32Array(columns * rows);
      const histogram = new Uint32Array(256);
      for (let index = 0; index < raw.length; index += 1) {
        const offset = index * 4;
        const gray = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
        raw[index] = gray;
        histogram[Math.round(gray)] += 1;
      }
      const lower = raw.length * 0.02;
      const upper = raw.length * 0.98;
      let cumulative = 0;
      let blackPoint = 0;
      let whitePoint = 255;
      for (let gray = 0; gray < 256; gray += 1) {
        cumulative += histogram[gray];
        if (cumulative >= lower) { blackPoint = gray; break; }
      }
      cumulative = 0;
      for (let gray = 0; gray < 256; gray += 1) {
        cumulative += histogram[gray];
        if (cumulative >= upper) { whitePoint = gray; break; }
      }
      const levelRange = Math.max(1, whitePoint - blackPoint);
      const grayLevels = new Float32Array(raw.length);
      for (let index = 0; index < raw.length; index += 1) {
        const stretched = clamp((raw[index] - blackPoint) / levelRange);
        grayLevels[index] = Math.pow(stretched, 0.82);
      }

      // A restrained local contrast pass keeps facial landmarks without outlining them.
      const local = new Float32Array(raw.length);
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          let total = 0;
          let samples = 0;
          for (let oy = -1; oy <= 1; oy += 1) {
            for (let ox = -1; ox <= 1; ox += 1) {
              const sx = x + ox;
              const sy = y + oy;
              if (sx < 0 || sy < 0 || sx >= columns || sy >= rows) continue;
              total += grayLevels[sy * columns + sx];
              samples += 1;
            }
          }
          local[y * columns + x] = total / samples;
        }
      }

      const chosen: number[] = [];
      const chosenFade: number[] = [];
      const chosenAlpha: number[] = [];
      const chosenEdgeScale: number[] = [];
      const tonalValue = new Float32Array(raw.length);
      for (let index = 0; index < raw.length; index += 1) {
        const tone = clamp(grayLevels[index] + (grayLevels[index] - local[index]) * 0.45);
        tonalValue[index] = tone;
        const sourceX = (index % columns + 0.5) / columns;
        const sourceY = (Math.floor(index / columns) + 0.5) / rows;
        const fade = getParticleFade(sourceX, sourceY, photoHeight);
        const boundarySupport = clamp((local[index] + 0.035) / (grayLevels[index] + 0.035));
        const edgeOpacity = PARTICLE_FADE_CONFIG.edgeOpacityFloor
          + (1 - PARTICLE_FADE_CONFIG.edgeOpacityFloor) * boundarySupport;
        const edgeSize = PARTICLE_FADE_CONFIG.edgeSizeFloor
          + (1 - PARTICLE_FADE_CONFIG.edgeSizeFloor) * boundarySupport;
        // Bake the edge mask into each particle's luminance-derived alpha before rendering.
        const alpha = tone * fade * PARTICLE_FADE_CONFIG.opacity * edgeOpacity;
        if (raw[index] > 4 && fade >= PARTICLE_FADE_CONFIG.discardFadeBelow
          && alpha >= PARTICLE_FADE_CONFIG.discardAlphaBelow) {
          chosen.push(index);
          chosenFade.push(fade);
          chosenAlpha.push(alpha);
          chosenEdgeScale.push(edgeSize);
        }
      }

      if (debugMode) {
        const probes = [
          { area: "face center", u: 0.5, v: 0.4 },
          { area: "left head edge", u: 0.01, v: 0.4 },
          { area: "right head edge", u: 0.99, v: 0.4 },
          { area: "left shoulder edge", u: 0.01, v: 0.7 },
          { area: "right shoulder edge", u: 0.99, v: 0.7 },
          { area: "bottom center", u: 0.5, v: 0.99 },
        ];
        console.table(probes.map(({ area, u, v }) => ({
          area,
          u,
          v,
          fade: Number(getParticleFade(u, v, photoHeight).toFixed(3)),
        })));
      }

      count = chosen.length;
      drawStride = 1;
      homeX = new Float32Array(count);
      homeY = new Float32Array(count);
      targetX = new Float32Array(count);
      targetY = new Float32Array(count);
      particleAlpha = new Float32Array(count);
      particleSize = new Float32Array(count);
      delay = new Float32Array(count);
      duration = new Float32Array(count);
      frameX = new Float32Array(count);
      frameY = new Float32Array(count);
      frameSize = new Float32Array(count);
      bucketNext = new Uint32Array(count);

      const scatterColumns = Math.ceil(Math.sqrt(count * panelWidth / Math.max(1, panelHeight)));
      const scatterRows = Math.ceil(count / scatterColumns);
      for (let particle = 0; particle < count; particle += 1) {
        const sourceIndex = chosen[particle];
        const sourceX = sourceIndex % columns;
        const sourceY = Math.floor(sourceIndex / columns);
        homeX[particle] = photoLeft + (sourceX + 0.5) * photoWidth / columns;
        homeY[particle] = photoTop + (sourceY + 0.5) * photoHeight / rows;
        particleAlpha[particle] = chosenAlpha[particle];
        particleSize[particle] = cellSize * 0.72 * chosenFade[particle] * chosenEdgeScale[particle];

        // Jittered regular grid gives the source pixels a deterministic, evenly spread destination.
        const gridX = particle % scatterColumns;
        const gridY = Math.floor(particle / scatterColumns);
        targetX[particle] = (gridX + 0.14 + hash(particle + 3001) * 0.72) * panelWidth / scatterColumns;
        targetY[particle] = (gridY + 0.14 + hash(particle + 4001) * 0.72) * panelHeight / scatterRows;

        const x = sourceX / columns;
        const y = sourceY / rows;
        const edge = Math.min(x, y, 1 - x, 1 - y);
        const edgeBias = 1 - clamp(edge * 2.2);
        delay[particle] = 0.04 + 0.5 * (hash(particle + 223) * 0.7 + edgeBias * 0.18 + y * 0.12);
        duration[particle] = Math.min(0.36 + hash(particle + 109) * 0.34, 1 - delay[particle]);
      }
      return true;
    };

    const render = (progress: number) => {
      context.clearRect(0, 0, panelWidth, panelHeight);
      bucketHeads.fill(0xffffffff);
      for (let index = 0; index < count; index += drawStride) {
        const q = ease((progress - delay[index]) / duration[index]);
        const xDelta = targetX[index] - homeX[index];
        const yDelta = targetY[index] - homeY[index];
        const distance = Math.max(1, Math.hypot(xDelta, yDelta));
        const curve = Math.sin(Math.PI * q) * 9;
        let x = homeX[index] + xDelta * q - (yDelta / distance) * curve;
        let y = homeY[index] + yDelta * q + (xDelta / distance) * curve;
        const bubbleX = x - pointerX;
        const bubbleY = y - pointerY;
        const bubbleDistance = Math.max(1, Math.hypot(bubbleX, bubbleY));
        const bubbleRadius = clamp(panelWidth * 0.06, 26, 56) * 4.5;
        const bubbleInfluence = Math.sin(clamp(1 - bubbleDistance / bubbleRadius) * Math.PI / 2) * pointerStrength;
        const bubblePush = bubbleInfluence * 18;
        x += (bubbleX / bubbleDistance) * bubblePush;
        y += (bubbleY / bubbleDistance) * bubblePush;
        // Scatter and fade each sampled source particle together so the portrait
        // fully dissolves instead of leaving a faint grid at the end of the scroll.
        const alpha = particleAlpha[index] * (1 - q);
        if (alpha < PARTICLE_FADE_CONFIG.discardAlphaBelow) {
          bucketNext[index] = 0xffffffff;
          continue;
        }
        let bucket = 0;
        while (bucket < bucketLevels.length - 1 && alpha > bucketLevels[bucket]) bucket += 1;
        frameX[index] = x;
        frameY[index] = y;
        frameSize[index] = particleSize[index] * (1 - q * 0.12)
          * (1 + bubbleInfluence * 0.9);
        bucketNext[index] = bucketHeads[bucket];
        bucketHeads[bucket] = index;
      }

      for (let bucket = 0; bucket < bucketLevels.length; bucket += 1) {
        if (bucketHeads[bucket] === 0xffffffff) continue;
        context.beginPath();
        for (let index = bucketHeads[bucket]; index !== 0xffffffff; index = bucketNext[index]) {
          const size = frameSize[index];
          context.rect(frameX[index] - size / 2, frameY[index] - size / 2, size, size);
        }
        context.fillStyle = particleColor;
        context.globalAlpha = (bucket + 0.5) / bucketLevels.length;
        context.fill();
      }
      context.globalAlpha = 1;
      canvas.style.opacity = "1";
      fallback.style.opacity = "0";
    };

    const drawStatic = () => render(0);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0 });

    const tick = (now: number) => {
      raf = 0;
      if (!running || destroyed || !visible || document.hidden || reducedMotion.matches) return;
      if (now - lastFrame < minFrameInterval) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      const started = performance.now();
      smoothedProgress += (targetProgress - smoothedProgress) * 0.2;
      const isSettled = Math.abs(targetProgress - smoothedProgress) < 0.001;
      if (isSettled) smoothedProgress = targetProgress;
      pointerX += (targetPointerX - pointerX) * 0.28;
      pointerY += (targetPointerY - pointerY) * 0.28;
      pointerStrength += (targetPointerStrength - pointerStrength) * 0.24;
      const pointerIsSettled = Math.abs(targetPointerX - pointerX) < 0.5
        && Math.abs(targetPointerY - pointerY) < 0.5
        && Math.abs(targetPointerStrength - pointerStrength) < 0.01;
      if (pointerIsSettled) {
        pointerX = targetPointerX;
        pointerY = targetPointerY;
        pointerStrength = targetPointerStrength;
      }
      render(smoothedProgress);
      const cost = performance.now() - started;
      slowFrames = cost > 20 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
      if (slowFrames > 150 && drawStride < 4) {
        drawStride += 1;
        slowFrames = 0;
      }
      lastFrame = now;
      if (!isSettled || !pointerIsSettled) raf = window.requestAnimationFrame(tick);
    };

    function start() {
      if (!running || raf || !visible || document.hidden || reducedMotion.matches
        || (Math.abs(targetProgress - smoothedProgress) < 0.001
          && Math.abs(targetPointerX - pointerX) < 0.5
          && Math.abs(targetPointerY - pointerY) < 0.5
          && Math.abs(targetPointerStrength - pointerStrength) < 0.01)) return;
      raf = window.requestAnimationFrame(tick);
    }

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!samplePhoto()) return;
        if (reducedMotion.matches || debugMode) drawStatic();
        else {
          targetProgress = getScrollProgress();
          smoothedProgress = targetProgress;
          render(smoothedProgress);
        }
      }, 120);
    };

    const onScroll = () => {
      if (debugMode || !running) return;
      targetProgress = getScrollProgress();
      start();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (debugMode || reducedMotion.matches || event.pointerType === "touch") return;
      const rect = panel.getBoundingClientRect();
      targetPointerX = event.clientX - rect.left;
      targetPointerY = event.clientY - rect.top;
      targetPointerStrength = 0.4;
      start();
    };

    const onPointerLeave = () => {
      targetPointerStrength = 0;
      start();
    };

    const onImageReady = () => {
      if (!samplePhoto()) {
        return;
      }
      targetProgress = debugMode || reducedMotion.matches ? 0 : getScrollProgress();
      smoothedProgress = targetProgress;
      render(smoothedProgress);
      running = !reducedMotion.matches && !debugMode;
      observer.observe(wrapper);
      if (running && visible) start();
    };

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        running = false;
        targetProgress = 0;
        smoothedProgress = 0;
        targetPointerStrength = 0;
        pointerStrength = 0;
        stop();
        if (count) drawStatic();
        else image.style.opacity = "1";
      } else {
        running = !debugMode;
        targetProgress = getScrollProgress();
        if (count) start();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const resizeObserver = new ResizeObserver(onResize);
    const themeObserver = new MutationObserver(() => {
      updateParticleColor();
      if (count) render(smoothedProgress);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    resizeObserver.observe(panel);
    resizeObserver.observe(image);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    panel.addEventListener("pointermove", onPointerMove, { passive: true });
    panel.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    image.addEventListener("load", onImageReady);
    reducedMotion.addEventListener("change", onMotionChange);
    if (image.complete) onImageReady();

    return () => {
      destroyed = true;
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      panel.removeEventListener("pointermove", onPointerMove);
      panel.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      image.removeEventListener("load", onImageReady);
      reducedMotion.removeEventListener("change", onMotionChange);
      window.clearTimeout(resizeTimer);
      image.style.removeProperty("opacity");
      fallback.style.removeProperty("opacity");
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-canvas" aria-hidden="true" />;
}
