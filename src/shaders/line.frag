precision mediump float;
varying vec4 vColor;
varying float isLined;

void main() // LINES
{
  gl_FragColor = vec4(vColor.rgb, isLined);
}
