import celestialBodies from './celestialBodies.json';

const canvas = document.getElementById('map') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

type Planet = {
  name: string;
  semiMajorAxis: number; // a in Au
  eccentricity: number; // e
  meanLongitude: number; // L in degrees
  longitudeOfPerihelion: number; // ϖ in degrees
  longitudeOfAscendingNode: number; // Ω in degrees
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

  function getM0(meanLongitude: number, longitudeOfPerihelion: number): number {
    // M₀ = L - ϖ
    const M0 = meanLongitude - longitudeOfPerihelion;
    const M0Rad = ((toRad(M0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return M0Rad;
  }

  function getJulianYearsSinceJ2000(): number {
    // returns n
    const millisecondsToDays = 86400000;
    const julianDaysBetweenBaseEpochs = 10957.5; // julian days between jan 1 1970 and jan 1.5 2000
    const julianDays =
      Date.now() / millisecondsToDays - julianDaysBetweenBaseEpochs; // converts millisecond value since jan 1 1970 to jullian days since j2000.0
    return julianDays / 365.25;
  }

  function getMeanAnomalyAtT(m0: number, a: number, n: number): number {
    // returns M
    const T = Math.pow(a, 1.5);
    const M = m0 + (2 * Math.PI * n) / T;
    return ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
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
    const meanAnomaly0 = getM0(p.meanLongitude, p.longitudeOfPerihelion);
    const argPeriapsis = getArgPeriapsis(
      p.longitudeOfPerihelion,
      p.longitudeOfAscendingNode,
    );

    const n = getJulianYearsSinceJ2000();
    const M = getMeanAnomalyAtT(meanAnomaly0, p.semiMajorAxis, n);
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
    //    const pX =
    //      cx +
    //      a_px * Math.cos(argPeriapsis) * Math.cos(v) -
    //      b_px * Math.sin(argPeriapsis) * Math.sin(v);
    //    const pY = -(
    //      cy +
    //      a_px * Math.sin(argPeriapsis) * Math.cos(v) +
    //      b_px * Math.cos(argPeriapsis) * Math.sin(v)
    //    );

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
    const meanAnomaly0 = getM0(p.meanLongitude, p.longitudeOfPerihelion);
    const argPeriapsis = getArgPeriapsis(
      p.longitudeOfPerihelion,
      p.longitudeOfAscendingNode,
    );
    const n = getJulianYearsSinceJ2000();
    const M = getMeanAnomalyAtT(meanAnomaly0, p.semiMajorAxis, n);
    const E = solveEccentricAnomaly(M, p.eccentricity);
    const v = getTrueAnomaly(E, p.eccentricity);

    console.group(`🪐 ${p.name}`);
    console.log('n (Julian years since J2000):', n.toFixed(6));
    console.log(
      'M₀ (mean anomaly at epoch, deg):',
      ((meanAnomaly0 * 180) / Math.PI).toFixed(4),
    );
    console.log(
      'M  (mean anomaly at T, deg):    ',
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
