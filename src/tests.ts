// async function debugPlanet(p: Planet) {
  //   const T = getJulianCenturiesSinceJ2000();
  //   const { L, Varpi, Omega } = getOrbitalElementsAtT(p, T);

  //   const M =
  //     ((toRad(L - Varpi) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  //   const argPeriapsis = toRad(Varpi - Omega);

  //   const E = solveEccentricAnomaly(M, p.eccentricity);
  //   const v = getTrueAnomaly(E, p.eccentricity);

  //   const r_AU =
  //     (p.semiMajorAxis * (1 - p.eccentricity ** 2)) /
  //     (1 + p.eccentricity * Math.cos(v));
  //   const angle = v + argPeriapsis;
  //   const computed_x = r_AU * Math.cos(angle);
  //   const computed_y = r_AU * Math.sin(angle);

  //   console.group(`🪐 ${p.name}`);
  //   console.log('T  (Julian centuries since J2000):', T.toFixed(6));
  //   console.log('M  (mean anomaly, deg):', ((M * 180) / Math.PI).toFixed(4));
  //   console.log(
  //     'E  (eccentric anomaly, deg):',
  //     ((E * 180) / Math.PI).toFixed(4),
  //   );
  //   console.log('ν  (true anomaly, deg):', ((v * 180) / Math.PI).toFixed(4));
  //   console.log(
  //     'ω  (arg of periapsis, deg):',
  //     ((argPeriapsis * 180) / Math.PI).toFixed(4),
  //   );
  //   console.log('r  (heliocentric distance, AU):', r_AU.toFixed(6));
  //   console.log('--- Computed heliocentric XY (AU, ecliptic plane) ---');
  //   console.log('  x:', computed_x.toFixed(6), '  y:', computed_y.toFixed(6));

  //   Planet name → Horizons COMMAND code
  //   const horizonsCodes: Record<string, string> = {
  //     Mercury: '199',
  //     Venus: '299',
  //     Earth: '399',
  //     Mars: '499',
  //     Jupiter: '599',
  //     Saturn: '699',
  //     Uranus: '799',
  //     Neptune: '899',
  //   };

  //   const code = horizonsCodes[p.name];
  //   if (!code) {
  //     console.warn('No Horizons code for', p.name, '— skipping API comparison');
  //     console.groupEnd();
  //     return;
  //   }

  //   Today and tomorrow as YYYY-MM-DD
  //   const now = new Date();
  //   const tomorrow = new Date(now);
  //   tomorrow.setDate(now.getDate() + 1);
  //   const fmt = (d: Date) => d.toISOString().split('T')[0];

  //   Horizons VECTORS ephemeris, heliocentric (CENTER='@10'), ecliptic J2000
  //   const params = new URLSearchParams({
  //     format: 'json',
  //     COMMAND: `'${code}'`,
  //     EPHEM_TYPE: "'VECTORS'",
  //     CENTER: "'@10'", // heliocentric
  //     REF_PLANE: "'ECLIPTIC'", // ecliptic plane, matches Kepler XY
  //     START_TIME: `'${fmt(now)}'`,
  //     STOP_TIME: `'${fmt(tomorrow)}'`,
  //     STEP_SIZE: "'1 d'",
  //     VEC_TABLE: "'2'", // position + velocity
  //     CSV_FORMAT: "'NO'",
  //   });

  //   const horizonsUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?${params}`;
  //   corsproxy.io forwards the request with appropriate headers
  //   const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(horizonsUrl)}`;

  //   try {
  //     console.log('⏳ Fetching Horizons data...');
  //     const res = await fetch(proxyUrl);
  //     const json = await res.json();
  //     const raw: string = json.result;

  //     Parse X, Y, Z from the $$SOE...$$EOE block
  //     Horizons vector format: X= ... Y= ... Z= ...
  //     const xMatch = raw.match(/X =\s*([-\d.E+]+)/);
  //     const yMatch = raw.match(/Y =\s*([-\d.E+]+)/);
  //     const zMatch = raw.match(/Z =\s*([-\d.E+]+)/);

  //     if (xMatch && yMatch && zMatch) {
  //       const AU_KM = 149597870.7;
  //       const hx = parseFloat(xMatch[1]) / AU_KM;
  //       const hy = parseFloat(yMatch[1]) / AU_KM;
  //       const hz = parseFloat(zMatch[1]) / AU_KM;
  //       const hr = Math.sqrt(hx ** 2 + hy ** 2 + hz ** 2);

  //       console.log('--- Horizons heliocentric XYZ (AU, ecliptic J2000) ---');
  //       console.log(
  //         '  x:',
  //         hx.toFixed(6),
  //         '  y:',
  //         hy.toFixed(6),
  //         '  z:',
  //         hz.toFixed(6),
  //       );
  //       console.log('  r:', hr.toFixed(6));

  //       const dx = computed_x - hx;
  //       const dy = computed_y - hy;
  //       const dr = r_AU - hr;
  //       console.log('--- Δ (computed − Horizons) ---');
  //       console.log(
  //         '  Δx:',
  //         dx.toFixed(6),
  //         'AU  (',
  //         (dx * 149597870.7).toFixed(0),
  //         'km )',
  //       );
  //       console.log(
  //         '  Δy:',
  //         dy.toFixed(6),
  //         'AU  (',
  //         (dy * 149597870.7).toFixed(0),
  //         'km )',
  //       );
  //       console.log(
  //         '  Δr:',
  //         dr.toFixed(6),
  //         'AU  (',
  //         (dr * 149597870.7).toFixed(0),
  //         'km )',
  //       );
  //     } else {
  //       console.warn('Could not parse Horizons response. Raw result:');
  //       console.log(raw);
  //     }
  //   } catch (err) {
  //     console.error('Horizons fetch failed:', err);
  //   }

  //   console.groupEnd();
  // }