import { describe, expect, it } from "vitest";
import { formatViewBox, FULL_VIEWBOX, MAX_ZOOM, panViewBox, zoomViewBox } from "./spotlight-viewbox";

const canvas = { width: 1000, height: 500 };

describe("zoomViewBox", () => {
  it("zooms in around the focus point, keeping it fixed", () => {
    const vb = zoomViewBox(FULL_VIEWBOX(canvas), 2, { x: 500, y: 250 }, canvas);
    expect(vb).toEqual({ x: 250, y: 125, width: 500, height: 250 });
  });
  it("clamps to 1x (never wider than canvas)", () => {
    expect(zoomViewBox(FULL_VIEWBOX(canvas), 0.5, { x: 10, y: 10 }, canvas)).toEqual(FULL_VIEWBOX(canvas));
  });
  it("clamps to MAX_ZOOM", () => {
    const vb = zoomViewBox(FULL_VIEWBOX(canvas), 100, { x: 500, y: 250 }, canvas);
    expect(vb.width).toBe(canvas.width / MAX_ZOOM);
  });
  it("keeps the box inside the canvas when focus is at an edge", () => {
    const vb = zoomViewBox(FULL_VIEWBOX(canvas), 4, { x: 0, y: 0 }, canvas);
    expect(vb.x).toBe(0);
    expect(vb.y).toBe(0);
  });
});

describe("panViewBox", () => {
  const zoomed = { x: 250, y: 125, width: 500, height: 250 };
  it("moves by delta", () => {
    expect(panViewBox(zoomed, 10, -20, canvas)).toEqual({ ...zoomed, x: 260, y: 105 });
  });
  it("clamps to canvas bounds", () => {
    expect(panViewBox(zoomed, 9999, 9999, canvas)).toEqual({ ...zoomed, x: 500, y: 250 });
    expect(panViewBox(zoomed, -9999, -9999, canvas)).toEqual({ ...zoomed, x: 0, y: 0 });
  });
  it("is a no-op at 1x", () => {
    expect(panViewBox(FULL_VIEWBOX(canvas), 50, 50, canvas)).toEqual(FULL_VIEWBOX(canvas));
  });
});

describe("formatViewBox", () => {
  it("serialises for the svg attribute", () => {
    expect(formatViewBox({ x: 1, y: 2, width: 3, height: 4 })).toBe("1 2 3 4");
  });
});
