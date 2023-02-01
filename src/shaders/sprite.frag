precision mediump float;
varying vec4 vColor;
varying float isDotted;

uniform sampler2D spriteTexture;

void main() // DOTS
{
  vec3 tColor = texture2D(spriteTexture, gl_PointCoord).rgb;
  gl_FragColor = vec4(tColor.rgb, isDotted * tColor.r) * vColor;
}
