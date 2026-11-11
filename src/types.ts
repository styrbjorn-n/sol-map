export type Planet = {
  name: string;
  semiMajorAxis: number; // a in AU
  eccentricity: number; // e
  meanLongitude: number; // L in degrees
  meanLongitudeRate: number; // L' in degrees/century
  longitudeOfPerihelion: number; // ϖ in degrees
  longitudeOfPerihelionRate: number; // ϖ' in degrees/century
  longitudeOfAscendingNode: number; // Ω in degrees
  longitudeOfAscendingNodeRate: number; // Ω' in degrees/century
  size: number;
  color: string;
};

export type OrbitRenderData = {
  // X offset of the ellipse's center from the Sun (focus), in px.
  cx: number;
  // Y offset of the ellipse's center from the Sun (focus), in px.
  cy: number;
  // Semi-major axis: half the ellipse's long diameter, in px.
  a_px: number;
  // Semi-minor axis: half the short diameter, a·√(1 − e²), in px.
  b_px: number;
  // Argument of perihelion (ϖ − Ω): angle from the ascending node to perihelion, in radians.
  omega: number;
  // Longitude of the ascending node (Ω), in radians.
  OMEGA: number;
  // Planet's X position relative to the Sun at time T, in px.
  pX: number;
  // Planet's Y position relative to the Sun at time T, in px.
  pY: number;
};