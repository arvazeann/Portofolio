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

const SCROLL_SCATTER_CONFIG = {
  progressMultiplier: 2,
  phaseOffset: 0.03,
  firstScrollKick: 0.08,
  firstScrollRange: 0.025,
  opacityFloorNear: 0.25,
  opacityFloorFar: 0.8,
  curveOffset: 18,
} as const;

const INTRO_HANDOFF_DURATION = 240;

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
    let currentProgress = 0;
    let targetProgress = 0;
    let introProgress = 1;
    let introStartedAt = 0;
    let introActive = false;
    let introRequested = false;
    let introHandoffPending = false;
    let introHandoffActive = false;
    let introHandoffStartedAt = 0;
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
    let particlePhase = new Float32Array();
    let particleDepth = new Float32Array();
    let frameX = new Float32Array();
    let frameY = new Float32Array();
    let frameSize = new Float32Array();
    let introHandoffStartX = new Float32Array();
    let introHandoffStartY = new Float32Array();
    let introHandoffOffsetX = new Float32Array();
    let introHandoffOffsetY = new Float32Array();
    let bucketNext = new Uint32Array();
    const bucketLevels = Array.from({ length: 64 }, (_, index) => (index + 1) / 64);
    const bucketHeads = new Uint32Array(bucketLevels.length);
    const minFrameInterval = 1000 / 36;
    const updateParticleColor = () => {
      particleColor = getComputedStyle(document.documentElement).getPropertyValue("--particle-color").trim() || "#e5ebe0";
    };
    updateParticleColor();

    const getScrollProgress = () => {
      return clamp(window.scrollY / Math.max(1, panel.offsetHeight * 0.7));
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
      particlePhase = new Float32Array(count);
      particleDepth = new Float32Array(count);
      frameX = new Float32Array(count);
      frameY = new Float32Array(count);
      frameSize = new Float32Array(count);
      introHandoffStartX = new Float32Array(count);
      introHandoffStartY = new Float32Array(count);
      introHandoffOffsetX = new Float32Array(count);
      introHandoffOffsetY = new Float32Array(count);
      bucketNext = new Uint32Array(count);

      const scatterColumns = Math.ceil(Math.sqrt(count * panelWidth / Math.max(1, panelHeight)));
      const scatterRows = Math.ceil(count / scatterColumns);
      const scatterSlots = new Uint32Array(count);
      for (let slot = 0; slot < count; slot += 1) scatterSlots[slot] = slot;
      for (let slot = count - 1; slot > 0; slot -= 1) {
        const other = Math.floor(hash(slot + 7001) * (slot + 1));
        [scatterSlots[slot], scatterSlots[other]] = [scatterSlots[other], scatterSlots[slot]];
      }
      for (let particle = 0; particle < count; particle += 1) {
        const sourceIndex = chosen[particle];
        const sourceX = sourceIndex % columns;
        const sourceY = Math.floor(sourceIndex / columns);
        homeX[particle] = photoLeft + (sourceX + 0.5) * photoWidth / columns;
        homeY[particle] = photoTop + (sourceY + 0.5) * photoHeight / rows;
        particleAlpha[particle] = chosenAlpha[particle];
        particleSize[particle] = cellSize * 0.72 * chosenFade[particle] * chosenEdgeScale[particle];
        particlePhase[particle] = hash(particle + 223);
        particleDepth[particle] = hash(particle + 811);

        // Evenly distribute destinations across the hero; each point keeps its source identity.
        const destinationSlot = scatterSlots[particle];
        const gridX = destinationSlot % scatterColumns;
        const gridY = Math.floor(destinationSlot / scatterColumns);
        targetX[particle] = (gridX + 0.14 + hash(particle + 3001) * 0.72) * panelWidth / scatterColumns;
        targetY[particle] = (gridY + 0.14 + hash(particle + 4001) * 0.72) * panelHeight / scatterRows;
      }
      return true;
    };

    const render = (progress: number, formationProgress = 1, now = performance.now()) => {
      context.clearRect(0, 0, panelWidth, panelHeight);
      bucketHeads.fill(0xffffffff);
      const formation = ease(formationProgress);
      if (introHandoffPending) {
        introHandoffStartedAt = now;
        introHandoffActive = true;
      }
      const handoffProgress = introHandoffActive
        ? ease((now - introHandoffStartedAt) / INTRO_HANDOFF_DURATION)
        : 1;
      const handoffOffsetStrength = 1 - handoffProgress;
      for (let index = 0; index < count; index += drawStride) {
        const phase = particlePhase[index];
        const scatterPhase = clamp(progress * SCROLL_SCATTER_CONFIG.progressMultiplier
          - phase * SCROLL_SCATTER_CONFIG.phaseOffset);
        // Keep the first wheel movement visible instead of easing away the initial response.
        const firstScrollKick = SCROLL_SCATTER_CONFIG.firstScrollKick
          * ease(progress / SCROLL_SCATTER_CONFIG.firstScrollRange);
        const q = Math.max(scatterPhase, firstScrollKick);
        const formedX = targetX[index] + (homeX[index] - targetX[index]) * formation;
        const formedY = targetY[index] + (homeY[index] - targetY[index]) * formation;
        const xDelta = targetX[index] - formedX;
        const yDelta = targetY[index] - formedY;
        const distance = Math.max(1, Math.hypot(xDelta, yDelta));
        const curve = Math.sin(Math.PI * q) * SCROLL_SCATTER_CONFIG.curveOffset * (phase - 0.5);
        let x = formedX + xDelta * q - (yDelta / distance) * curve;
        let y = formedY + yDelta * q + (xDelta / distance) * curve;
        const depth = particleDepth[index];
        if (introHandoffPending) {
          introHandoffOffsetX[index] = introHandoffStartX[index] - x;
          introHandoffOffsetY[index] = introHandoffStartY[index] - y;
        }
        x += introHandoffOffsetX[index] * handoffOffsetStrength;
        y += introHandoffOffsetY[index] * handoffOffsetStrength;
        // Scatter each source particle from its fixed portrait anchor without dropping it.
        const scatteredAlpha = SCROLL_SCATTER_CONFIG.opacityFloorNear
          + (1 - depth) * (SCROLL_SCATTER_CONFIG.opacityFloorFar
            - SCROLL_SCATTER_CONFIG.opacityFloorNear);
        const land = ease((1 - q - 0.55) / 0.45);
        // Keep the scattered portrait visible from the first frame, then gather it
        // into the source image instead of fading it in from an empty canvas.
        const introVisibility = 0.36 + formationProgress * 0.64;
        const alpha = particleAlpha[index] * introVisibility
          * (scatteredAlpha + (1 - scatteredAlpha) * land);
        let bucket = 0;
        while (bucket < bucketLevels.length - 1 && alpha > bucketLevels[bucket]) bucket += 1;
        frameX[index] = x;
        frameY[index] = y;
        frameSize[index] = particleSize[index] * (0.48 + formation * 0.52)
          * (1 - q * 0.12);
        bucketNext[index] = bucketHeads[bucket];
        bucketHeads[bucket] = index;
      }
      introHandoffPending = false;
      if (handoffProgress >= 1) introHandoffActive = false;

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

    const drawStatic = () => render(0, 1);
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
      // Follow scroll directly so there is no perceptible wait before particles react.
      currentProgress = targetProgress;
      if (introActive) {
        introProgress = clamp((now - introStartedAt) / 3000);
        if (introProgress >= 1) introActive = false;
      }
      render(currentProgress, introProgress, now);
      const cost = performance.now() - started;
      slowFrames = cost > 20 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
      if (slowFrames > 150 && drawStride < 4) {
        drawStride += 1;
        slowFrames = 0;
      }
      lastFrame = now;
      if (introActive || introHandoffActive) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    function start() {
      if (!running || raf || !visible || document.hidden || reducedMotion.matches
        || (!introActive && !introHandoffActive && !introHandoffPending
          && Math.abs(targetProgress - currentProgress) < 0.0001)) return;
      raf = window.requestAnimationFrame(tick);
    }

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    function syncIntroReveal() {
      introRequested = true;
      if (!count || reducedMotion.matches || debugMode) return;

      const recordedStart = Number(document.documentElement.dataset.portraitRevealAt);
      introStartedAt = Number.isFinite(recordedStart) && recordedStart > 0
        ? recordedStart
        : performance.now();
      introProgress = clamp((performance.now() - introStartedAt) / 3000);
      introActive = introProgress < 1;
      if (!introActive) introProgress = 1;
      start();
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!samplePhoto()) return;
        if (reducedMotion.matches || debugMode) drawStatic();
        else {
          targetProgress = getScrollProgress();
          currentProgress = targetProgress;
          render(currentProgress, introProgress);
        }
      }, 120);
    };

    const onScroll = () => {
      if (debugMode || !running) return;
      const nextProgress = getScrollProgress();
      if (introActive) {
        introActive = false;
        for (let index = 0; index < count; index += 1) {
          introHandoffStartX[index] = frameX[index];
          introHandoffStartY[index] = frameY[index];
        }
        introHandoffPending = true;
      }
      targetProgress = nextProgress;
      start();
    };

    const onImageReady = () => {
      if (!samplePhoto()) {
        return;
      }
      const preloadActive = document.documentElement.dataset.preload === "1"
        && !reducedMotion.matches && !debugMode;
      introProgress = preloadActive ? 0 : 1;
      targetProgress = debugMode || reducedMotion.matches ? 0 : getScrollProgress();
      currentProgress = targetProgress;
      running = !reducedMotion.matches && !debugMode;
      if (preloadActive && (introRequested || document.documentElement.dataset.portraitRevealAt)) syncIntroReveal();
      render(currentProgress, introProgress);
      observer.observe(wrapper);
      if (running && visible) start();
    };

    const onIntroReveal = () => {
      syncIntroReveal();
    };

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        running = false;
        introActive = false;
        introProgress = 1;
        targetProgress = 0;
        currentProgress = 0;
        introHandoffActive = false;
        introHandoffPending = false;
        stop();
        if (count) drawStatic();
        else image.style.opacity = "1";
      } else {
        running = !debugMode;
        targetProgress = getScrollProgress();
        currentProgress = targetProgress;
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
      if (count) render(currentProgress, introProgress);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    resizeObserver.observe(panel);
    resizeObserver.observe(image);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    image.addEventListener("load", onImageReady);
    window.addEventListener("portfolio-intro-reveal", onIntroReveal);
    reducedMotion.addEventListener("change", onMotionChange);
    if (document.documentElement.dataset.portraitRevealAt) syncIntroReveal();
    if (image.complete) onImageReady();

    return () => {
      destroyed = true;
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      image.removeEventListener("load", onImageReady);
      window.removeEventListener("portfolio-intro-reveal", onIntroReveal);
      reducedMotion.removeEventListener("change", onMotionChange);
      window.clearTimeout(resizeTimer);
      image.style.removeProperty("opacity");
      fallback.style.removeProperty("opacity");
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-canvas" aria-hidden="true" />;
}
