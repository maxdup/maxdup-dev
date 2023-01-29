precision mediump float;
varying vec4 vColor;
varying float lined;

void main() // LINES
{
  gl_FragColor = vec4(vColor.rgb * 0.4, lined);
}
