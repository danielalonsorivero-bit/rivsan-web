// Shader del vídeo del hero: señal analógica NTSC.
// Siempre: luma nítida con croma sangrada en horizontal, leve desplazamiento R/B y ondulación de cinta.
// Con uGlitch (0–1): desgarros por bandas, salto vertical, franjas amarillas de marca, estática y líneas perdidas.
// uShift desplaza la imagen a la derecha (fracción del ancho) para dejar a los agentes fuera del texto.
export const heroShader = {
  vertex: `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,
  fragment: `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uVid;
uniform vec2 uPos;
uniform float uShift;
uniform float uTime;
uniform float uGlitch;

const mat3 toYIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
const mat3 toRGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);

float h1(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// object-fit: cover + object-position y, si uShift > 0, desplazamiento a la derecha con borde fundido a negro
vec3 vid(vec2 uv) {
  float ra = uRes.x / uRes.y;
  float va = uVid.x / uVid.y;
  vec2 s = ra > va ? vec2(1.0, va / ra) : vec2(ra / va, 1.0);
  vec2 c = uv * s + (1.0 - s) * uPos;
  c.x -= uShift;
  float borde = uShift > 0.0 ? smoothstep(0.0, 0.12, c.x) : 1.0;
  float dentro = borde * step(c.y, 1.0) * step(0.0, c.y);
  return texture2D(uTex, clamp(c, 0.0, 1.0)).rgb * dentro;
}

void main() {
  float t = mod(uTime, 600.0);
  float g = uGlitch;
  float fr = floor(t * 24.0);
  vec2 uv = vUv;

  uv.x += sin(uv.y * 220.0 + t * 9.0) * 0.0004 + sin(uv.y * 5.0 - t * 0.8) * 0.0012;

  float banda = floor(uv.y * mix(14.0, 42.0, h1(floor(t * 8.0))));
  float rota = step(1.0 - g * 0.55, h1(banda * 1.7 + fr));
  uv.x += (h1(banda + fr * 3.1) - 0.5) * 0.18 * g * rota;
  uv.y += step(0.75, g) * (h1(fr * 0.37) - 0.5) * 0.08 * g;

  vec3 yiq = toYIQ * vid(uv);
  vec2 iq = vec2(0.0);
  for (int k = -3; k <= 3; k++) iq += (toYIQ * vid(uv + vec2(float(k) * 0.0022 + 0.0018, 0.0))).yz;
  vec3 col = toRGB * vec3(yiq.x, iq / 7.0);

  float ab = 0.0012 + g * 0.014;
  col.r = mix(col.r, vid(uv + vec2(ab, 0.0)).r, 0.6);
  col.b = mix(col.b, vid(uv - vec2(ab, 0.0)).b, 0.6);

  col = mix(col, col * 0.4 + vec3(0.97, 0.77, 0.0) * 0.32, rota * g * step(0.8, h1(banda * 5.3 + fr)));

  float n = h2(vUv * uRes + fr);
  col = mix(col, vec3(n), 0.02 + g * 0.4 * rota + g * g * 0.22);
  col *= 1.0 - 0.04 * h1(fr) - g * 0.15 * h1(fr + 1.0);
  col *= 1.0 - g * step(0.97, h1(floor(vUv.y * uRes.y * 0.5) + fr));

  gl_FragColor = vec4(col, 1.0);
}`,
};
