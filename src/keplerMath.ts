import type { OrbitRenderData, Planet } from "./types";
import { getScaledDistance, toRad } from "./utils";

export function getJulianCenturiesSinceJ2000(): number {
    // returns n
    const msPerDay = 86400000;
    const jd = Date.now() / msPerDay + 2440587.5;
    return (jd - 2451545.0) / 36525;
  }

  function getOrbitalElementsAtT(p: Planet, T: number) {
    return {
      L: p.meanLongitude + p.meanLongitudeRate * T,
      Varpi: p.longitudeOfPerihelion + p.longitudeOfPerihelionRate * T,
      Omega: p.longitudeOfAscendingNode + p.longitudeOfAscendingNodeRate * T,
    };
  }

  function solveEccentricAnomaly(
    M: number,
    e: number,
    iterations = 50,
  ): number {
    // returns E
    let E = M; // the initial guess
    for (let i = 0; i < iterations; i++) {
      E = M + e * Math.sin(E);
    }
    return E;
  }

  function getTrueAnomaly(E: number, e: number): number {
    return (
      2 *
      Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2),
      )
    );
  }

  export function orbitPropagation(p: Planet, T: number): OrbitRenderData {
    const { L, Varpi, Omega } = getOrbitalElementsAtT(p, T);

    const M =
      ((toRad(L - Varpi) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const E = solveEccentricAnomaly(M, p.eccentricity);
    const v = getTrueAnomaly(E, p.eccentricity);

    const a_px = getScaledDistance(p.semiMajorAxis, true);
    const e = p.eccentricity;
    const b_px = a_px * Math.sqrt(1 - e ** 2);
    const c_px = a_px * e;
    const omega = toRad(Varpi - Omega);
    const OMEGA = toRad(Omega);
    const angle = v + omega + OMEGA;
    const cx = -c_px * Math.cos(omega + OMEGA);
    const cy = -c_px * Math.sin(omega + OMEGA);

    const r = (a_px * (1 - e ** 2)) / (1 + e * Math.cos(v));
    const pX = r * Math.cos(angle);
    const pY = r * Math.sin(angle);

    return { cx, cy, a_px, b_px, omega, OMEGA, pX, pY };
  }