"use client";

import Link from "next/link";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import type { PlacedWord } from "./spotlight-word-cloud-layout";
import { formatViewBox, panViewBox, zoomViewBox, type Canvas, type ViewBox } from "./spotlight-viewbox";

export type SpotlightMode = "pan" | "zoom";
export const HIGHLIGHT_FILL = "#F17676";
const DRAG_THRESHOLD_PX = 4;
const WHEEL_STEP = 1.15;
const DRAG_ZOOM_PER_PX = 0.01;

export interface KudosSpotlightCanvasProps {
  canvas: Canvas;
  words: PlacedWord[];
  viewBox: ViewBox;
  setViewBox: Dispatch<SetStateAction<ViewBox>>;
  mode: SpotlightMode;
  /** Per word id: null = no active search, true = match, false = dimmed. */
  matches: ReadonlyMap<string, boolean | null>;
  hrefFor: (id: string) => string;
  onHover: (id: string | null) => void;
}

/** Hand-rolled SVG word cloud; pan/zoom only rewrite the viewBox. */
export function KudosSpotlightCanvas({ canvas, words, viewBox, setViewBox, mode, matches, hrefFor, onHover }: KudosSpotlightCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  // Units of canvas per screen pixel (1 when not laid out, e.g. jsdom).
  const unitsPerPx = (vb: ViewBox, rect: DOMRect) => (rect.width > 0 ? vb.width / rect.width : 1);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || mode !== "zoom") return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const factor = e.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP;
      setViewBox((vb) => {
        const k = unitsPerPx(vb, rect);
        return zoomViewBox(vb, factor, { x: vb.x + (e.clientX - rect.left) * k, y: vb.y + (e.clientY - rect.top) * k }, canvas);
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [mode, canvas, setViewBox]);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    suppressClick.current = false;
    // Do NOT capture here: capturing retargets the eventual click to the svg,
    // so node <a> links would never navigate. Capture starts with the drag.
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const start = drag.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    if (!start.moved) e.currentTarget.setPointerCapture?.(e.pointerId);
    start.moved = true;
    suppressClick.current = true;
    start.x = e.clientX;
    start.y = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    if (mode === "pan") {
      setViewBox((vb) => panViewBox(vb, -dx * unitsPerPx(vb, rect), -dy * unitsPerPx(vb, rect), canvas));
    } else {
      const focusX = e.clientX - rect.left;
      const focusY = e.clientY - rect.top;
      setViewBox((vb) => {
        const k = unitsPerPx(vb, rect);
        return zoomViewBox(vb, Math.exp(-dy * DRAG_ZOOM_PER_PX), { x: vb.x + focusX * k, y: vb.y + focusY * k }, canvas);
      });
    }
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={formatViewBox(viewBox)}
      className={`absolute inset-0 size-full touch-none select-none ${mode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
    >
      {words.map((w) => {
        const match = matches.get(w.id) ?? null;
        return (
          <Link
            key={w.id}
            href={hrefFor(w.id)}
            draggable={false}
            aria-label={w.name}
            onMouseEnter={() => onHover(w.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(w.id)}
            onBlur={() => onHover(null)}
            className="outline-none focus-visible:[&>text]:underline"
          >
            <text
              x={w.x + w.width / 2}
              y={w.y + w.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={w.fontSize}
              fontWeight={700}
              letterSpacing="0.03em"
              fill={match === true ? HIGHLIGHT_FILL : "#FFFFFF"}
              opacity={match === false ? 0.25 : undefined}
            >
              {w.name}
            </text>
          </Link>
        );
      })}
    </svg>
  );
}
