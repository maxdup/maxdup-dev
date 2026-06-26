uniform mat4 mvpMatrix;
uniform float screenScale;

attribute vec3 position;   // (x, height, y) — already in world space
attribute float intensity; // 0..1 spark/trail brightness

varying float vIntensity;

const float sparkSize = 1.5;

void main()
{
  gl_Position = mvpMatrix * vec4(position.x, position.y, position.z, 1.0);
  gl_PointSize = intensity * sparkSize * screenScale * 0.01;
  vIntensity = intensity;
}
