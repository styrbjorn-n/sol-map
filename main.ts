import celestialBodies from './celestialBodies.json';

const canvas = document.getElementById('map') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

type Planet = {
  name: string;
  semiMajorAxis: number; // a in Au
  eccentricity: number; // e
  meanLongitude: number; // L in degrees
  meanLongitudeRate: number;
  longitudeOfPerihelion: number; // ϖ in degrees
  longitudeOfPerihelionRate: number;
  longitudeOfAscendingNode: number; // Ω in degrees
  longitudeOfAscendingNodeRate: number;
  size: number;
  color: string;
};

if (ctx !== null) {
  const context = ctx;

  function getScaledDistance(AU: number) {
    const baseUnit = Math.min(window.innerWidth, window.innerHeight) / 12;

    if (AU < 2) {
      return AU * baseUnit;
    } else {
      return 2 * baseUnit + Math.pow(AU - 2, 0.65) * baseUnit * 0.4;
    }
  }

  function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  function getArgPeriapsis(
    longitudeOfPerihelion: number,
    longitudeOfAscendingNode: number,
  ): number {
    // ω = ϖ - Ω
    return toRad(longitudeOfPerihelion - longitudeOfAscendingNode);
  }

  function getJulianCenturiesSinceJ2000(): number {
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

  // should get split up and only handle rendering itself
  function drawPlanet(p: Planet) {
    const T = getJulianCenturiesSinceJ2000();
    const { L, Varpi, Omega } = getOrbitalElementsAtT(p, T);

    const M =
      ((toRad(L - Varpi) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const argPeriapsis = toRad(Varpi - Omega);

    const E = solveEccentricAnomaly(M, p.eccentricity);
    const v = getTrueAnomaly(E, p.eccentricity);

    const a_px = getScaledDistance(p.semiMajorAxis);
    const e = p.eccentricity;
    const b_px = a_px * Math.sqrt(1 - e ** 2);
    const c_px = a_px * e;
    const cx = -c_px * Math.cos(argPeriapsis);
    const cy = c_px * Math.sin(argPeriapsis);

    context.beginPath();
    context.ellipse(cx, cy, a_px, b_px, argPeriapsis, 0, 2 * Math.PI);
    context.strokeStyle = 'gray';
    context.lineWidth = 1;
    context.stroke();
    context.closePath();

    const r = (a_px * (1 - e ** 2)) / (1 + e * Math.cos(v));
    const angle = v + argPeriapsis;
    const pX = r * Math.cos(angle);
    const pY = -r * Math.sin(angle);

    context.beginPath();
    context.arc(pX, pY, 17, 0, 2 * Math.PI);
    context.fillStyle = 'black';
    context.fill();
    context.closePath();

    context.beginPath();
    context.ellipse(pX, pY, 9, 9, 0, 0, 2 * Math.PI);
    context.strokeStyle = p.color;
    context.lineWidth = 1;
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(pX, pY, 1.5, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.closePath();
  }

  // could probably be integrated with the resize map function to be more concentrated
  function renderSystem() {
    const cb: Planet[] = celestialBodies.celestitalBodies;
    drawCircle(0, 0, 10, 'white'); // the sun
    cb.forEach((body) => {
      drawPlanet(body);
    });
  }

  function resizeMap() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    renderSystem();
    context.restore();
  }
  // legit does noting exept drawing the sun right now
  function drawCircle(x: number, y: number, radius: number, color: string) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
  }

  function debugPlanet(p: Planet) {
    const T = getJulianCenturiesSinceJ2000();
    const { L, Varpi, Omega } = getOrbitalElementsAtT(p, T);

    const M =
      ((toRad(L - Varpi) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const argPeriapsis = toRad(Varpi - Omega);

    const E = solveEccentricAnomaly(M, p.eccentricity);
    const v = getTrueAnomaly(E, p.eccentricity);

    console.group(`🪐 ${p.name}`);
    console.log('n (Julian years since J2000):', T.toFixed(6));
    console.log(
      'M (mean anomaly at T, deg):',
      ((M * 180) / Math.PI).toFixed(4),
    );
    console.log(
      'E  (eccentric anomaly, deg):    ',
      ((E * 180) / Math.PI).toFixed(4),
    );
    console.log(
      'ν  (true anomaly, deg):         ',
      ((v * 180) / Math.PI).toFixed(4),
    );
    console.log(
      'ω  (arg of periapsis, deg):     ',
      ((argPeriapsis * 180) / Math.PI).toFixed(4),
    );
    console.groupEnd();
  }

  // calling of functions
  const cb: Planet[] = celestialBodies.celestitalBodies;
  debugPlanet(cb[2]);
  resizeMap();

  window.addEventListener('resize', resizeMap);
} else {
  throw new Error('Canvas not supported!');
}
