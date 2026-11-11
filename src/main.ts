import celestialBodies from '../celestialBodies.json';
import { getJulianCenturiesSinceJ2000, orbitPropagation } from './keplerMath';
import type { OrbitRenderData } from './types';
import { drawCircle } from './utils';
import { getVisablePlants, zoom } from './zoom';

const canvas = document.getElementById('map') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (ctx !== null) {
  const context = ctx;

  function drawPlanet(o: OrbitRenderData, zoomLevel: number, color: string) {
    context.beginPath();
    context.ellipse(
      o.cx,
      o.cy,
      o.a_px,
      o.b_px,
      o.omega + o.OMEGA,
      0,
      2 * Math.PI,
    );
    context.strokeStyle = 'gray';
    context.lineWidth = 1 / zoomLevel;
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(o.pX, o.pY, 17 / zoomLevel, 0, 2 * Math.PI);
    context.fillStyle = 'black';
    context.fill();
    context.closePath();

    context.beginPath();
    context.ellipse(
      o.pX,
      o.pY,
      9 / zoomLevel,
      9 / zoomLevel,
      0,
      0,
      2 * Math.PI,
    );
    context.strokeStyle = color;
    context.lineWidth = 1.15 / zoomLevel;
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(o.pX, o.pY, 1.5 / zoomLevel, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.closePath();
  }

  function renderSystem(zoomLevel: number) {
    const T = getJulianCenturiesSinceJ2000();
    const visableCB = getVisablePlants(
      celestialBodies.celestitalBodies,
      zoomLevel,
      canvas.width,
      canvas.height,
    );
    celestialBodies.celestitalBodies.forEach((body) => {
      if (visableCB.has(body.name)) {
        const o = orbitPropagation(body, T);
        drawPlanet(o, zoomLevel, body.color);
      }
    });
    drawCircle(context, 0, 0, 12.5 / zoomLevel, 'white'); // the sun
  }

  function resizeMap(zoomLevel: number) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(zoomLevel, zoomLevel);
    renderSystem(zoomLevel);
    context.restore();
  }

  // calling of functions
  let zoomLevel = 1;
  resizeMap(zoomLevel);

  window.addEventListener('resize', () => {
    resizeMap(zoomLevel);
  });
  window.addEventListener('wheel', (e) => {
    zoomLevel = zoom(zoomLevel, e.deltaY);

    resizeMap(zoomLevel);
  });
} else {
  throw new Error('Canvas not supported!');
}
