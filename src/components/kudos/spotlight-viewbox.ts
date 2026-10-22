export interface Canvas {
  width: number;
  height: number;
}
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Point {
  x: number;
  y: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export const FULL_VIEWBOX = (canvas: Canvas): ViewBox => ({ x: 0, y: 0, width: canvas.width, height: canvas.height });

function clampPosition(vb: ViewBox, canvas: Canvas): ViewBox {
  return {
    ...vb,
    x: clamp(vb.x, 0, canvas.width - vb.width),
    y: clamp(vb.y, 0, canvas.height - vb.height),
  };
}

/** Multiplies the zoom by `factor` (>1 zooms in), keeping `focus` (canvas coords) fixed; zoom stays within 1×–4×. */
export function zoomViewBox(vb: ViewBox, factor: number, focus: Point, canvas: Canvas): ViewBox {
  const width = clamp(vb.width / factor, canvas.width / MAX_ZOOM, canvas.width / MIN_ZOOM);
  const scale = width / vb.width;
  const height = vb.height * scale;
  return clampPosition(
    { x: focus.x - (focus.x - vb.x) * scale, y: focus.y - (focus.y - vb.y) * scale, width, height },
    canvas,
  );
}

/** Moves the box by a canvas-unit delta, clamped to the canvas. */
export function panViewBox(vb: ViewBox, dx: number, dy: number, canvas: Canvas): ViewBox {
  return clampPosition({ ...vb, x: vb.x + dx, y: vb.y + dy }, canvas);
}

export function formatViewBox(vb: ViewBox): string {
  return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
}
