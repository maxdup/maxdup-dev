uniform vec2 sheens[6];
uniform mat4 pjMatrix;
uniform mat4 mvMatrix;
uniform float screenScale;

uniform float dottedness;
uniform float nodeness;
uniform float gridness;
uniform float fogginess;
uniform float mapness;

uniform sampler2D mtlTexture;

attribute vec3 position;
attribute float nconnection;
attribute float height;

varying vec4 vColor;
varying float isDotted;
varying float isLined;
varying vec2 texcoord;

const float maxDist = 3.0;
const float minPSize = 0.2;
const float maxPSize = 0.65;
const float connPSize = 1.5;
const float connHOffs = 0.035;

const vec3 distSharpness = vec3(4.0, 4.0, 5.0);
const vec3 distWidth = vec3(0.8, 0.8, 1.5);
const mat3 LINE_COLORS = %lineColors%;

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
  texcoord = vec2(position.x / 6.12 + 0.5, position.y / 6.12 + 0.5);
  vec3 mColor = texture2D(mtlTexture, texcoord).rgb;

  float freezeHeight = 1.0 - mColor.b * mapness * 0.5;
  float offsetHeight = mColor.g * (0.35 * mapness);
  float alphaMask = max(1.0 - mapness, (mapness * mColor.b * 2.0));

  float cHeight = height * freezeHeight + offsetHeight;


  float quaded = max(0.0, sign(position.z - cHeight)) * gridness;
  float noded = min(1.0, nconnection); // [0,1]
  float nodeFactor = noded * nodeness * nconnection; // [0, nconnection];

  float nodePointSizeOffset = connPSize * nodeFactor;
  float nodeHeightOffset = connHOffs * nodeFactor;

  isDotted = max(noded * nodeness, min(dottedness, 1.0-quaded));
  isLined = max(noded * nodeness, min(0.5, (quaded * gridness) - noded));


  // POSITION
  float z = position.z * quaded + cHeight * (1.0-quaded);
  vec4 pos = vec4(position.x, z + nodeHeightOffset, position.y, 1.0);
  gl_Position = pjMatrix * mvMatrix * pos;

  // POINT SIZE
  float agnosticPointSize = mix(minPSize, maxPSize, min(cHeight * 5.0, 1.0));
  float scalePointSize = agnosticPointSize * screenScale;
  float scale = screenScale / 100.0;
  gl_PointSize = isDotted * (agnosticPointSize + nodePointSizeOffset) * scale;

  // COLORS
  float minZ = vec4(pjMatrix * mvMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
  float maxZ = vec4(pjMatrix * mvMatrix * vec4(-maxDist, 0.0, -maxDist, 1.0)).z;
  float fog = 1.0 - (fogginess * (position.x - position.y) / maxDist / 2.0 + 0.5);

  vec3 vdist = vec3(distToVec(position.xy, sheens[1], sheens[0]),
                    distToVec(position.xy, sheens[3], sheens[2]),
                    distToVec(position.xy, sheens[5], sheens[4]));
  vec3 distVec = min(vdist + distWidth, maxDist) / maxDist;
  distVec = 1.0 - easeInOut(distVec, distSharpness);

  vColor = vec4(remap(distVec, 0.5, LINE_COLORS) * fog, alphaMask);
}
