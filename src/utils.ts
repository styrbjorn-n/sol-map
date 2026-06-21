export function getScaledDistance(AU: number) {
  const baseUnit = Math.min(window.innerWidth, window.innerHeight) / 12;

  if (AU < 2) {
    return AU * baseUnit;
  } else {
    return 2 * baseUnit + Math.pow(AU - 2, 0.65) * baseUnit * 0.4;
  }
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function drawCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  context.beginPath();

  context.arc(x, y, radius, 0, Math.PI * 2);

  context.fillStyle = color;

  context.fill();

  context.closePath();
}
