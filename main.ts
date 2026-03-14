import celestialBodies from './celestialBodies.json';

const canvas = document.getElementById('map') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

type Planet = {
  name: string;
  angularPosition: number; // temp
  semiMajorAxis: number; // a in Au
  eccentricity: number; // e
  meanAnomaly0: number; // M₀ at J2000.0 in radians
  argPeriapsis: number; // ω at  J2000.0 in radians
  orbitalPeriod: number; // T, in Julian years
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

  function getJulianYearsSinceJ2000(): number {
    // returns n
    const millisecondsToDays = 86400000;
    const julianDaysBetweenBaseEpochs = 10957.5; // julian days between jan 1 1970 and jan 1.5 2000
    const julianDays =
      Date.now() / millisecondsToDays - julianDaysBetweenBaseEpochs; // converts millisecond value since jan 1 1970 to jullian days since j2000.0
    return julianDays / 365.25;
  }

  function getMeanAnomalyAtT(m0: number, T: number, n: number): number {
    // returns M
    return m0 + ((Math.PI * 2) / T) * n;
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
    const n = getJulianYearsSinceJ2000();
    const M = getMeanAnomalyAtT(p.meanAnomaly0, p.orbitalPeriod, n);
    const E = solveEccentricAnomaly(M, p.eccentricity);
    const v = getTrueAnomaly(E, p.eccentricity);
    const angle = v;

    const a_px = getScaledDistance(p.semiMajorAxis);
    const e = p.eccentricity;
    const b_px = a_px * Math.sqrt(1 - e ** 2);
    const c_px = a_px * e;
    const cx = -c_px * Math.cos(p.argPeriapsis);
    const cy = -c_px * Math.sin(p.argPeriapsis);

    context.beginPath();
    context.ellipse(cx, cy, a_px, b_px, p.argPeriapsis, 0, 2 * Math.PI);
    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.stroke();
    context.closePath();

    const pX =
      cx +
      a_px * Math.cos(p.argPeriapsis) * Math.cos(v) -
      b_px * Math.sin(p.argPeriapsis) * Math.sin(v);
    const pY =
      cy +
      a_px * Math.sin(p.argPeriapsis) * Math.cos(v) +
      b_px * Math.cos(p.argPeriapsis) * Math.sin(v);

    context.beginPath();
    context.arc(pX, pY, p.size, 0, 2 * Math.PI);
    context.fillStyle = p.color;
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

  // calling of functions

  resizeMap();

  window.addEventListener('resize', resizeMap);
} else {
  throw new Error('Canvas not supported!');
}
