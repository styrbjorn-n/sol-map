import type { Planet } from './main';
import { getScaledDistance } from './utils';

export function zoom(
  zoomLevel: number,
  zoomDirection: number,
  zoomStep: number = 0.1,
) {
  const maxZoomLevel = 5;
  const minZoomLevel = 0.18;
  let newZoomLevel = 1;

  if (zoomDirection < 0) {
    newZoomLevel = zoomLevel - zoomStep;
  } else {
    newZoomLevel = zoomLevel + zoomStep;
  }
  switch (true) {
    case newZoomLevel >= maxZoomLevel:
      return maxZoomLevel;
    case newZoomLevel <= minZoomLevel:
      return minZoomLevel;
    default:
      return newZoomLevel;
  }
}

export function getVisablePlants(
  bodies: Planet[],
  zoomLevel: number,
  w: number,
  h: number,
): Set<string> {
    const MIN_GAP_PX = 24
    const SUN_CLEARANCE_PX = 30

    const maxR = Math.hypot(w,h) / 2
    const celestialBodiesReversed = [...bodies].sort((a,b) => b.semiMajorAxis - a.semiMajorAxis)

    const visable = new Set<string>()
    let lastShownR = Infinity

    for (const p of celestialBodiesReversed) {
        const r = getScaledDistance(p.semiMajorAxis, true) * zoomLevel

        if (r > maxR) continue
        if (r < SUN_CLEARANCE_PX) continue
        if (lastShownR - r < MIN_GAP_PX) continue

        visable.add(p.name)
        lastShownR = r
    }
    return visable
}
