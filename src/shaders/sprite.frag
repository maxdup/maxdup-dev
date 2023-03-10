precision mediump float;
varying vec4 vColor;
varying float isDotted;

uniform sampler2D dotTexture;

void main() // DOTS
{
  vec3 tColor = texture2D(dotTexture, gl_PointCoord).rgb;

  gl_FragColor = vec4(tColor.rgb, isDotted * tColor.r) * vColor;
}
