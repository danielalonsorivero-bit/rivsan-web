// Vídeo de fondo pintado con el shader de señal analógica (senal-shader.ts).
// Marcado esperado dentro de `caja` (con position: relative):
//   <img class="… poster">                         fotograma inicial, se ve mientras carga
//   <video data-senal-video data-src-sd data-src-hd muted loop playsinline preload="none">
//   <canvas data-senal-gl>
// Al arrancar, `caja` recibe .is-gl (se ve el canvas) o .is-video (sin WebGL, se ve el vídeo):
// cada componente decide con CSS qué mostrar. Con «reducir movimiento», ahorro de datos o sin
// autoplay se queda el fotograma.
// Cortes de señal: en la costura del bucle (tapa el salto al primer fotograma), al arrancar y al
// azar cada pocos segundos. El encuadre lo marcan las variables CSS --media-x, --media-y (fracción
// desde arriba, como object-position) y --media-shift de `caja`.
import { senalShader } from './senal-shader';

// `hdDesde`: ancho de la caja en píxeles reales a partir del que se carga la versión HD
export function videoConSenal(caja: HTMLElement, { alCorte, hdDesde = 1600 }: { alCorte?: (corte: boolean) => void; hdDesde?: number } = {}) {
  const video = caja.querySelector<HTMLVideoElement>('[data-senal-video]');
  const canvas = caja.querySelector<HTMLCanvasElement>('[data-senal-gl]');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ahorro = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (!video || !canvas || quieto || ahorro) return;
  video.src = (caja.clientWidth * devicePixelRatio > hdDesde ? video.dataset.srcHd : video.dataset.srcSd) ?? '';
  video.play().then(
    () => caja.classList.add(iniciarGL(caja, video, canvas, alCorte) ? 'is-gl' : 'is-video'),
    () => {},
  );
}

function iniciarGL(caja: HTMLElement, video: HTMLVideoElement, canvas: HTMLCanvasElement, alCorte?: (corte: boolean) => void) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return false;
  const shader = (tipo: number, src: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = shader(gl.VERTEX_SHADER, senalShader.vertex);
  const fs = shader(gl.FRAGMENT_SHADER, senalShader.fragment);
  if (!vs || !fs) return false;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  for (const [k, v] of [
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
    [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
  ])
    gl.texParameteri(gl.TEXTURE_2D, k, v);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const [uRes, uVid, uPos, uShift, uTime, uGlitch] = ['uRes', 'uVid', 'uPos', 'uShift', 'uTime', 'uGlitch'].map(u);

  // Encuadre: lo marcan las variables CSS --media-x, --media-y y --media-shift (cambian con el ancho, ver estilos)
  const medir = () => {
    const r = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.min(Math.round(caja.clientWidth * r), 2200);
    canvas.height = Math.round(caja.clientHeight * (canvas.width / caja.clientWidth));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const css = getComputedStyle(caja);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    const y = parseFloat(css.getPropertyValue('--media-y'));
    // El shader mide la altura desde abajo
    gl.uniform2f(uPos, parseFloat(css.getPropertyValue('--media-x')) || 0.5, Number.isFinite(y) ? 1 - y : 0.5);
    gl.uniform1f(uShift, parseFloat(css.getPropertyValue('--media-shift')) || 0);
  };
  new ResizeObserver(medir).observe(caja);

  const inicio = performance.now();
  let rafaga = { desde: 0, hasta: 0.7, fuerza: 1 }; // corte fuerte al aparecer el vídeo
  let proxima = 3;
  let visible = true;
  let pintando = false;
  let enCorte = false;

  const frame = (ahora: number) => {
    if (!visible || document.hidden) return (pintando = false);
    const t = (ahora - inicio) / 1000;
    if (t > proxima) {
      rafaga = { desde: t, hasta: t + 0.12 + Math.random() * 0.25, fuerza: 0.3 + Math.random() * 0.4 };
      proxima = t + 2.5 + Math.random() * 3;
    }
    const enRafaga = t >= rafaga.desde && t < rafaga.hasta ? rafaga.fuerza * (1 - (t - rafaga.desde) / (rafaga.hasta - rafaga.desde)) : 0;
    // Costura del bucle: sube en los últimos 0,35 s y baja en los primeros 0,25 s
    const d = video.duration ? Math.min(video.duration - video.currentTime, video.currentTime * 1.4) : 1;
    const costura = Math.max(0, 1 - d / 0.35) ** 1.5;
    const g = Math.min(1, Math.max(enRafaga, costura));
    const corte = costura > 0.4;
    if (corte !== enCorte) alCorte?.((enCorte = corte));

    if (video.readyState >= 2) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.uniform2f(uVid, video.videoWidth, video.videoHeight);
    }
    gl.uniform1f(uTime, t);
    gl.uniform1f(uGlitch, g);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  };
  const arrancar = () => {
    if (visible && !document.hidden && !pintando) {
      pintando = true;
      requestAnimationFrame(frame);
    }
  };

  // Fuera de pantalla se para todo, también el vídeo
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? (video.play().catch(() => {}), arrancar()) : video.pause();
  }).observe(caja);
  document.addEventListener('visibilitychange', arrancar);
  medir();
  arrancar();
  return true;
}
