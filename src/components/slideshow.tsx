"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type SlideImage = {
  id: string;
  file: string;
  width: number;
  height: number;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Category gallery: shows images two-at-a-time (one on mobile),
 * auto-advances with a soft crossfade, click / arrows / keyboard to navigate.
 * The left info column stays fixed while this changes.
 */
export default function Slideshow({
  images,
  title,
}: {
  images: SlideImage[];
  title: string;
}) {
  const [pairSize, setPairSize] = useState<number>(2);
  const [index, setIndex] = useState(0);
  const [prevPairSize, setPrevPairSize] = useState(pairSize);
  const paused = useRef(false);

  // reset the slide index when the pair size changes (render-time adjustment)
  if (prevPairSize !== pairSize) {
    setPrevPairSize(pairSize);
    setIndex(0);
  }

  // 2 images per slide on md+, 1 on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPairSize(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const pairs = useMemo(() => chunk(images, pairSize), [images, pairSize]);
  const count = pairs.length;

  const next = useCallback(
    () => setIndex((i) => (i + 1) % Math.max(count, 1)),
    [count],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1)),
    [count],
  );

  // auto-advance every 4.5s
  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % count);
    }, 4500);
    return () => clearInterval(t);
  }, [count]);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (images.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400">
        No images in this category yet
      </div>
    );
  }

  const visible = pairs[Math.min(index, count - 1)] ?? [];

  return (
    <div
      role="region"
      aria-label={`Gallery of ${title}`}
      className="relative h-full w-full cursor-pointer select-none overflow-hidden bg-white"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onClick={next}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${pairSize}-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className={`absolute inset-0 grid gap-2 md:gap-3 px-2 pb-2 md:px-3 md:pb-3 ${
            pairSize === 2 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {Array.from({ length: pairSize }).map((_, cell) => {
            const img = visible[cell];
            return (
              <div
                key={cell}
                className="relative overflow-hidden bg-neutral-100"
              >
                {img ? (
                  <>
                    <img
                      src={img.file}
                      alt={`${title} — image ${images.indexOf(img) + 1}`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </>
                ) : (
                  <div aria-hidden className="h-full w-full" />
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous images"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="flex h-9 w-9 items-center justify-center bg-white/85 text-neutral-700 transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next images"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="flex h-9 w-9 items-center justify-center bg-white/85 text-neutral-700 transition hover:bg-white"
            >
              ›
            </button>
            <span className="ml-1 text-[10px] tracking-[0.2em] text-neutral-500">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
