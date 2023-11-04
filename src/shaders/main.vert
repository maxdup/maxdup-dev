uniform mat4 pjMatrix;
uniform mat4 mvMatrix;
uniform float screenScale;

uniform vec2 sheens[6];
uniform float nodeness;
uniform float gridness;
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
const float connHOffs = 0.075;


const vec3 distSharpness = vec3(4.0, 4.0, 5.0);
const vec3 distWidth = vec3(0.8, 0.8, 1.5);
const mat3 LINE_COLORS = %lineColors%;



float demap(float val, float minOut, float maxOut){
  const float minVal = 0.0;
  const float maxVal = 1.0;
  return max(0.0, min(1.0, (val - minOut) / (maxOut - minOut)));
}
vec3 remap(vec3 val, float minOut, mat3 maxOut){
  const vec3 minVal = vec3(0.0, 0.0, 0.0);
  const vec3 maxVal = vec3(1.0, 1.0, 1.0);
  return max(minVal, min(maxVal, val)) * (maxOut - minOut) + minOut;
}
vec3 easeInOut(vec3 x, vec3 p){
  vec3 xp = pow(min(max(x, 0.0), 1.0), p);
  return xp / (xp + pow(1.0 - x, p));
}
float distToVec(vec2 point, vec2 angle, vec2 origin){
  return abs(dot(point - origin, normalize(vec2(angle.y,-angle.x))));
}
float distToVecAlt(vec2 P, vec2 slope, vec2 O){
    vec2 D = normalize(slope);
    vec2 X = O + D * dot(P-O, D);
    return abs(distance(P, X));
}

float fogged(float z){
  const float fogstarts = 4.0;
  const float fogends = 8.0;
  return max(0.0, min(1.0, (z - fogstarts) / (fogends - fogstarts)));
}

void main()
{
  float isGrided = 1.0 - abs(sign(nconnection)); // [0<=n<=1]
  float isNoded = min(1.0, max(0.0, nconnection)); // [0<=n<=1]
  float isMapped = (min(-1.0, nconnection) + 1.0) * -1.0; // [0<=n<=1]

  float nodeFactor = isNoded * nodeness; // [0<=n<=1]
  float mapFactor = isMapped * mapness; // [0<=n<=1]

  texcoord = vec2(position.x / 6.12 + 0.5, position.y / 6.12 + 0.5);
  vec3 mColor = texture2D(mtlTexture, texcoord).rgb;

  // Effect calcs - grid
  float gridHeight = max(0.0, (position.z - height));
  float gridHeightOffset = gridHeight * gridness;

  // Effect calcs - nodes
  float nodeHeightOffset = connHOffs * nodeFactor * nconnection;
  float nodeRadiusOffset = connPSize * nodeFactor * nconnection;

  // Effect calcs - topography
  float topoAlphaMask = max(1.0 - mapness, (mapness * mColor.b * 2.0));
  float topoDotSize = (mColor.b - 0.75) * mapness * 1.4;
  float topoHeightFreeze = 1.0 - mColor.b * 0.5;
  float topoHeightTarget = max(-0.1, mColor.g - 0.6) * 0.65 * mapness;
  float topoHeightOffset = ((height * topoHeightFreeze + topoHeightTarget) - height) * mapness;

  isDotted = max(nodeFactor, min(1.0, 1.0 - gridHeightOffset));
  isLined = max(max(mapFactor, min(0.3, gridHeightOffset * isGrided)), nodeFactor * 0.6);

  // POSITION
  float z = height + gridHeightOffset + nodeHeightOffset + topoHeightOffset;

  vec4 pos = vec4(position.x, z, position.y, 1.0);
  gl_Position = pjMatrix * mvMatrix * pos;

  // POINT SIZE
  float agnosticPointSize = mix(minPSize, maxPSize, min(z * 5.0, 1.0));
  float scale = screenScale / 100.0;
  gl_PointSize = isDotted * max(agnosticPointSize + nodeRadiusOffset, topoDotSize) * scale;

  // COLORS
  float minZ = vec4(pjMatrix * mvMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
  float maxZ = vec4(pjMatrix * mvMatrix * vec4(-maxDist, 0.0, -maxDist, 1.0)).z;
  float fog = 1.0 - gridness * fogged(gl_Position.z);

  vec3 vdist = vec3(distToVec(position.xy, sheens[1], sheens[0]),
                    distToVec(position.xy, sheens[3], sheens[2]),
                    distToVec(position.xy, sheens[5], sheens[4]));
  vec3 distVec = min(vdist + distWidth, maxDist) / maxDist;
  distVec = 1.0 - easeInOut(distVec, distSharpness);

  vColor = vec4(remap(distVec, 0.35, LINE_COLORS), topoAlphaMask * fog);

}
