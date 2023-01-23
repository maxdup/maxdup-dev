precision mediump float;
varying   vec4 vColor;
uniform sampler2D spriteTexture;

void main()
{
  vec3 tColor = texture2D(spriteTexture, gl_PointCoord).rgb;
  gl_FragColor = vec4(tColor.rgb, tColor.r) * vColor;
}
