uniform mat4 pjMatrix;
uniform mat4 mvMatrix;
uniform float screenScale;

attribute vec3 debugPosition;

varying vec4 vColor;
varying float isDotted;
varying float isLined;

void main()
{

  // POS
  vec4 pos = vec4(debugPosition.x, debugPosition.y, debugPosition.z, 1.0);
  gl_Position = pjMatrix * mvMatrix * pos;

  // SCALE
  float scale = screenScale / 100.0;
  gl_PointSize = 1.0 * scale;

  // COLOR
  isDotted = 1.0;
  isLined = 1.0;
  vColor = vec4(1.0, 1.0, 1.0, 1.0);
}
