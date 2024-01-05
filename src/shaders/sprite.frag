precision mediump float;
varying vec4 vColor;
varying float isDotted;

float circle(in vec2 _st){
  vec2 dist = _st-vec2(0.5);
  return 1.-smoothstep(0.8, 1.1, dot(dist,dist)*6.0);
}

void main() // DOTS
{
  gl_FragColor = vColor * vec4(circle(gl_PointCoord.xy)) * vec4(1.0, 1.0, 1.0, isDotted);
}
