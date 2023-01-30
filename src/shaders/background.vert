attribute vec2 position;
attribute float nconnection;
attribute float height;

varying   vec4 vColor;

const float minPSize = 0.2;
const float maxPSize = 0.65;
const float connPSize = 0.035;

const float maxDist = 3.0;

const vec3 distSharpness = vec3(4.0, 4.0, 5.0);
const vec3 distWidth = vec3(0.8, 0.8, 1.5);

const mat3 LINE_COLORS = %lineColors%;

uniform vec2 sheens[6];
uniform mat4 pjMatrix;
uniform mat4 mvMatrix;
uniform float screenScale;

uniform float dottedness;
uniform float nodeness;
uniform float gridness;
uniform float fogginess;

varying float dotted;
varying float lined;

float demap(float val, float minV, float maxV){
  return max(0.0, min(1.0, (val - minV) / (maxV - minV)));
}
vec3 remap(vec3 val, float minV, mat3 maxV){
  return val * (maxV - minV) + minV;
}
vec3 easeInOut(vec3 x, vec3 p){
  vec3 xp = pow(min(max(x, 0.0), 1.0), p);
  return xp / (xp + pow(1.0 - x, p));
}
float distToVec(vec2 point, vec2 angle, vec2 origin){
  return abs(dot(point - origin, normalize(vec2(angle.y,-angle.x))));
}

void main()
{
  float noded = min(1.0, nconnection) * nodeness; // [0,1]
  float nodeFactor = noded * nconnection; // [0, nconnection];

  dotted = max(noded, dottedness);
  lined = max(noded, gridness - min(1.0, nconnection));

  // POSITION
  float nodeHeightOffset = connPSize * nodeFactor;
  gl_Position = pjMatrix * mvMatrix * vec4(position.x, height + nodeHeightOffset, position.y, 1.0);

  // POINT SIZE
  float agnosticPointSize = mix(minPSize, maxPSize, min(height*5.0, 1.0));
  float scalePointSize = agnosticPointSize * screenScale;
  float scale = screenScale / 100.0;
  float nodePointSizeOffset = 1.0 * nodeFactor;
  gl_PointSize = dotted * (agnosticPointSize + nodePointSizeOffset) * scale ;

  // COLORS
  //float minZ = vec4(pjMatrix * mvMatrix * vec4(maxDist/2.0, 0.0, -maxDist/2.0, 1.0)).z;
  float minZ = vec4(pjMatrix * mvMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
  float maxZ = vec4(pjMatrix * mvMatrix * vec4(-maxDist, 0.0, maxDist, 1.0)).z;
  float fogged = 1.5 - mix(1.0, 0.0, demap(gl_Position.z, minZ, maxZ) * fogginess);
  float fogging = 1.0 - mix(0.0, 0.3, 1.0 - gl_Position.z * fogginess);

  vec2 pos = vec2(position.x, position.y);
  vec3 vdist = vec3(distToVec(pos, sheens[1], sheens[0]),
                    distToVec(pos, sheens[3], sheens[2]),
                    distToVec(pos, sheens[5], sheens[4]));
  vec3 distVec = min(vdist + distWidth, maxDist) / maxDist;
  distVec = 1.0 - easeInOut(distVec, distSharpness);
  vColor = vec4(remap(distVec, 0.4, LINE_COLORS) * fogged, 1.0);
}
