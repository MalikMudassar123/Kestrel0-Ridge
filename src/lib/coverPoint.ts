/**
 * Where does a point inside an image land on screen when the image is shown with
 * `object-fit: cover`? We need this because the lantern flame, the suite window and
 * the dining fire move around depending on the screen's shape.
 *
 * box      = size of the element the image fills (px)
 * natural  = the image's natural size (px)
 * point    = the point inside the image, in % of the image (0–100)
 * position = the CSS object-position in % (default 50 50)
 * Returns the point in px, relative to the element's top-left corner.
 */
export function coverPoint(
  boxW: number,
  boxH: number,
  naturalW: number,
  naturalH: number,
  pointXPct: number,
  pointYPct: number,
  posXPct = 50,
  posYPct = 50,
) {
  const w = naturalW || 1536;
  const h = naturalH || 1024;
  const scale = Math.max(boxW / w, boxH / h);
  const drawnW = w * scale;
  const drawnH = h * scale;
  const offsetX = (boxW - drawnW) * (posXPct / 100);
  const offsetY = (boxH - drawnH) * (posYPct / 100);
  return {
    x: offsetX + drawnW * (pointXPct / 100),
    y: offsetY + drawnH * (pointYPct / 100),
  };
}
