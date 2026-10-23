"use client";

import { useEffect, useRef } from "react";

const REVEAL_START = 0.08;
const MAX_PARTICLES = 12_000;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function hash(index: number) {
  let value = index | 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = (value ^ (value >>> 16)) >>> 0;
  return value / 4_294_967_295;
}

function positionFactor(value: string | undefined, axis: "x" | "y") {
  if (!value) return 0.5;
  if (value.endsWith("%")) return clamp(Number.parseFloat(value) / 100);
  if (value === "left" || value === "top") return 0;
  if (value === "right" || value === "bottom") return 1;
  if (value === "center") return 0.5;
  return axis === "x" ? 0.5 : 0.5;
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

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let frameWidth = 0;
    let frameHeight = 0;
    let frameLeft = 0;
    let frameTop = 0;
    let cellSize = 8;
    let columns = 0;
    let rows = 0;
    let colors = new Uint8ClampedArray();
    let thresholds = new Float32Array();
    let offsetsX = new Float32Array();
    let driftY = new Float32Array();
    let animationFrame = 0;
    let pendingProgress: number | null = null;
    let lastProgress = -1;
    let pixelRatio = 1;
    let destroyed = false;

    const readProgress = () => {
      const maxTravel = wrapper.offsetHeight - window.innerHeight;
      if (maxTravel <= 0) return 0;
      const rect = wrapper.getBoundingClientRect();
      return clamp(-rect.top / maxTravel);
    };

    const sampleImage = () => {
      if (!image.complete || !image.naturalWidth || !image.naturalHeight) return false;

      const imageRect = image.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      frameWidth = imageRect.width;
      frameHeight = imageRect.height;
      frameLeft = imageRect.left - panelRect.left;
      frameTop = imageRect.top - panelRect.top;
      if (!frameWidth || !frameHeight) return false;

      cellSize = window.innerWidth <= 800 ? 10 : 8;
      columns = Math.max(1, Math.ceil(frameWidth / cellSize));
      rows = Math.max(1, Math.ceil(frameHeight / cellSize));
      if (columns * rows > MAX_PARTICLES) {
        cellSize *= Math.sqrt((columns * rows) / MAX_PARTICLES);
        columns = Math.max(1, Math.ceil(frameWidth / cellSize));
        rows = Math.max(1, Math.ceil(frameHeight / cellSize));
      }

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = columns;
      sampleCanvas.height = rows;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) return false;

      const scale = Math.max(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
      const renderedWidth = image.naturalWidth * scale;
      const renderedHeight = image.naturalHeight * scale;
      const objectPosition = getComputedStyle(image).objectPosition.split(/\s+/);
      const offsetX = (frameWidth - renderedWidth) * positionFactor(objectPosition[0], "x");
      const offsetY = (frameHeight - renderedHeight) * positionFactor(objectPosition[1] ?? objectPosition[0], "y");

      sampleContext.filter = getComputedStyle(image).filter;
      sampleContext.drawImage(
        image,
        (offsetX * columns) / frameWidth,
        (offsetY * rows) / frameHeight,
        (renderedWidth * columns) / frameWidth,
        (renderedHeight * rows) / frameHeight,
      );

      const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
      colors = new Uint8ClampedArray(pixels);
      thresholds = new Float32Array(columns * rows);
      offsetsX = new Float32Array(columns * rows);
      driftY = new Float32Array(columns * rows);

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const index = y * columns + x;
          const random = hash(index + 173);
          const topBias = 1 - y / Math.max(1, rows - 1);
          const edgeDistance = Math.min(
            x / Math.max(1, columns - 1),
            y / Math.max(1, rows - 1),
            (columns - 1 - x) / Math.max(1, columns - 1),
            (rows - 1 - y) / Math.max(1, rows - 1),
          );
          const edgeBias = 1 - clamp(edgeDistance * 2);
          thresholds[index] = 0.04 + 0.91 * (random * 0.62 + (1 - topBias) * 0.2 + (1 - edgeBias) * 0.18);
          offsetsX[index] = (hash(index + 953) - 0.5) * 2;
          driftY[index] = 48 + hash(index + 2141) * 112;
        }
      }

      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const canvasWidth = Math.max(1, Math.round(panel.clientWidth * pixelRatio));
      const canvasHeight = Math.max(1, Math.round(panel.clientHeight * pixelRatio));
      if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
      if (canvas.height !== canvasHeight) canvas.height = canvasHeight;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      return true;
    };

    const paint = (progress: number) => {
      const width = panel.clientWidth;
      const height = panel.clientHeight;
      context.clearRect(0, 0, width, height);

      const imageFilter = getComputedStyle(image).filter;
      if (progress <= REVEAL_START) {
        context.filter = imageFilter;
        context.globalAlpha = 1 - progress / REVEAL_START;
        const scale = Math.max(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
        const renderedWidth = image.naturalWidth * scale;
        const renderedHeight = image.naturalHeight * scale;
        const objectPosition = getComputedStyle(image).objectPosition.split(/\s+/);
        const offsetX = (frameWidth - renderedWidth) * positionFactor(objectPosition[0], "x");
        const offsetY = (frameHeight - renderedHeight) * positionFactor(objectPosition[1] ?? objectPosition[0], "y");
        context.drawImage(
          image,
          frameLeft + offsetX,
          frameTop + offsetY,
          renderedWidth,
          renderedHeight,
        );

        const mosaicMix = clamp(progress / REVEAL_START);
        context.filter = "none";
        context.globalAlpha = mosaicMix;
        for (let index = 0; index < columns * rows; index += 1) {
          const colorIndex = index * 4;
          const red = colors[colorIndex];
          const green = colors[colorIndex + 1];
          const blue = colors[colorIndex + 2];
          const brightness = red * 0.2126 + green * 0.7152 + blue * 0.0722;
          if (brightness < 10) continue;
          const x = index % columns;
          const y = Math.floor(index / columns);
          context.fillStyle = `rgb(${red} ${green} ${blue})`;
          context.fillRect(frameLeft + x * frameWidth / columns, frameTop + y * frameHeight / rows, frameWidth / columns + 0.5, frameHeight / rows + 0.5);
        }
        context.globalAlpha = 1;
        context.filter = "none";
        return;
      }

      const localProgress = clamp((progress - REVEAL_START) / (1 - REVEAL_START));
      for (let index = 0; index < columns * rows; index += 1) {
        const colorIndex = index * 4;
        const red = colors[colorIndex];
        const green = colors[colorIndex + 1];
        const blue = colors[colorIndex + 2];
        if (red * 0.2126 + green * 0.7152 + blue * 0.0722 < 10) continue;

        const releaseAt = thresholds[index];
        const phase = clamp((localProgress - releaseAt) / (1 - releaseAt));
        const eased = phase * phase * (3 - 2 * phase);
        if (eased >= 1) continue;

        const x = index % columns;
        const y = Math.floor(index / columns);
        const cellWidth = frameWidth / columns;
        const cellHeight = frameHeight / rows;
        const size = Math.max(0.35, cellWidth * (1 - eased * 0.88));
        const driftX = offsetsX[index] * (12 + eased * 82);
        const driftUp = eased * driftY[index];
        context.globalAlpha = 1 - eased;
        context.fillStyle = `rgb(${red} ${green} ${blue})`;
        context.fillRect(
          frameLeft + x * cellWidth + driftX + (cellWidth - size) / 2,
          frameTop + y * cellHeight - driftUp + (cellHeight - size) / 2,
          size,
          size,
        );
      }
      context.globalAlpha = 1;
    };

    const updateProgress = (progress: number, force = false) => {
      if (!active || destroyed || (!force && progress === lastProgress)) return;
      lastProgress = progress;
      paint(progress);
      canvas.style.opacity = progress > 0 ? "1" : "0";
      image.style.opacity = progress > 0.01 ? "0" : String(1 - progress / 0.01);
    };

    const scheduleProgress = () => {
      if (!active || animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        const progress = readProgress();
        if (progress !== pendingProgress) {
          pendingProgress = progress;
          updateProgress(progress);
        }
      });
    };

    const startEffect = () => {
      if (destroyed || active || motionPreference.matches || !sampleImage()) return;
      wrapper.classList.add("is-scroll-enhanced");
      active = true;
      lastProgress = -1;
      pendingProgress = null;
      // The wrapper height changes when the sticky effect is enabled, so sample once more after layout.
      window.requestAnimationFrame(() => {
        if (!active || destroyed) return;
        sampleImage();
        updateProgress(readProgress(), true);
      });
    };

    const stopEffect = () => {
      active = false;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      wrapper.classList.remove("is-scroll-enhanced");
      canvas.style.opacity = "0";
      image.style.removeProperty("opacity");
      context.clearRect(0, 0, canvas.width, canvas.height);
      lastProgress = -1;
      pendingProgress = null;
    };

    const handleResize = () => {
      if (!active) return;
      sampleImage();
      lastProgress = -1;
      pendingProgress = null;
      scheduleProgress();
    };

    const handleMotionChange = () => {
      if (motionPreference.matches) stopEffect();
      else startEffect();
    };

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);
    resizeObserver?.observe(panel);
    resizeObserver?.observe(image);
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    image.addEventListener("load", startEffect);
    motionPreference.addEventListener("change", handleMotionChange);
    if (image.complete) startEffect();

    return () => {
      destroyed = true;
      stopEffect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", handleResize);
      image.removeEventListener("load", startEffect);
      motionPreference.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-canvas" aria-hidden="true" />;
}
