import { Vector2 } from "../Vector2/Vector2";
import { LayerPositionUtils } from "./LayerPositionUtils";

describe("LayerPositionUtils", () => {
  it("should copy over", () => {
    const source = { position: new Vector2(5, 6), layer: "sourceLayer" };
    const target = { position: new Vector2(0, 0), layer: "targetLayer" };
    LayerPositionUtils.copyOver(source, target);
    expect(target).toEqual(source);
    expect(target).not.toBe(source);
  });

  it("should clone", () => {
    const pos = { position: new Vector2(5, 6), layer: "sourceLayer" };
    const clone = LayerPositionUtils.clone(pos);
    expect(clone).toEqual(pos);
    expect(clone).not.toBe(pos);
  });

  it("should check equality", () => {
    const pos = { position: new Vector2(5, 6), layer: "sourceLayer" };
    const posDifferentX = { position: new Vector2(6, 6), layer: "sourceLayer" };
    const posDifferentY = { position: new Vector2(5, 7), layer: "sourceLayer" };
    const posDifferentLayer = {
      position: new Vector2(5, 6),
      layer: "otherLayer",
    };
    const equalPos = { position: new Vector2(5, 6), layer: "sourceLayer" };
    expect(LayerPositionUtils.equal(pos, posDifferentX)).toBe(false);
    expect(LayerPositionUtils.equal(pos, posDifferentY)).toBe(false);
    expect(LayerPositionUtils.equal(pos, posDifferentLayer)).toBe(false);
    expect(LayerPositionUtils.equal(pos, equalPos)).toBe(true);
    expect(LayerPositionUtils.equal(equalPos, pos)).toBe(true);
  });

  it("should convert to string", () => {
    const pos = { position: new Vector2(5, 6), layer: "sourceLayer" };
    expect(LayerPositionUtils.toString(pos)).toEqual("5#6#sourceLayer");
  });
});
