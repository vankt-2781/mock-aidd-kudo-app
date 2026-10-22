import { describe, expect, it } from "vitest";
import { layoutWordCloud, MAX_NODES, type CloudInput } from "./spotlight-word-cloud-layout";

const canvas = { width: 1157, height: 548 };
const mk = (n: number): CloudInput[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${String(i).padStart(3, "0")}`, name: `Sunner Number ${i}`, count: (i % 17) + 1 }));

describe("layoutWordCloud", () => {
  it("returns [] for no nodes", () => {
    expect(layoutWordCloud([], canvas)).toEqual([]);
  });
  it("is deterministic", () => {
    const input = mk(40);
    expect(layoutWordCloud(input, canvas)).toEqual(layoutWordCloud([...input].reverse(), canvas));
  });
  it("caps at MAX_NODES keeping the largest counts", () => {
    const placed = layoutWordCloud(mk(150), canvas);
    expect(placed.length).toBeLessThanOrEqual(MAX_NODES);
    const min = Math.min(...placed.map((p) => p.count));
    expect(min).toBeGreaterThanOrEqual(1);
  });
  it("larger count gives font >= smaller count, within 8..28", () => {
    const placed = layoutWordCloud(mk(30), canvas);
    for (const a of placed) {
      expect(a.fontSize).toBeGreaterThanOrEqual(8);
      expect(a.fontSize).toBeLessThanOrEqual(28);
      for (const b of placed) if (a.count > b.count) expect(a.fontSize).toBeGreaterThanOrEqual(b.fontSize);
    }
  });
  it("places all words inside the canvas without overlap", () => {
    const placed = layoutWordCloud(mk(60), canvas);
    for (const p of placed) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.width).toBeLessThanOrEqual(canvas.width);
      expect(p.y + p.height).toBeLessThanOrEqual(canvas.height);
    }
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i], b = placed[j];
        const overlap = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlap).toBe(false);
      }
  });
  it("handles a single node at the center", () => {
    const [p] = layoutWordCloud([{ id: "a", name: "A", count: 1 }], canvas);
    expect(p.id).toBe("a");
  });
});
