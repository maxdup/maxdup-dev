uniform mat4 pjMatrix;
uniform mat4 mvMatrix;
uniform float screenScale;

uniform vec2 sheens[6];
uniform float nodeness;
uniform float gridness;
uniform float toponess;

attribute vec3 position;
attribute float nconnection;
attribute vec2 topology;
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
  return clamp((val - minOut) / (maxOut - minOut), 0.0, 1.0);
}
vec3 remap(vec3 val, float minOut, mat3 maxOut){
  return clamp(val, vec3(0.0), vec3(1.0)) * (maxOut - minOut) + minOut;
}
vec3 easeInOut(vec3 x, vec3 p){
  vec3 xp = pow(clamp(x, 0.0, 1.0), p);
  return xp / (xp + pow(1.0 - x, p));
}
float distToVec(vec2 point, vec2 angle, vec2 origin){
  return abs(dot(point - origin, normalize(vec2(angle.y,-angle.x))));
}
float distToVecAlt(vec2 P, vec2 slope, vec2 O){
    vec2 D = normalize(slope);
    vec2 X = D * dot(P-O, D) + O;
    return abs(distance(P, X));
}

float fogged(float z){
  const float fogstarts = 4.0;
  const float fogends = 8.0;
  return clamp((z - fogstarts) / (fogends - fogstarts), 0.0, 1.0);
}

void main()
{
  float isGrided = 1.0 - abs(sign(nconnection)); // [0<=n<=1]
  float isNoded = clamp(nconnection, 0.0, 1.0); // [0<=n<=1]
  float isTopoed = clamp(-nconnection - 1.0, 0.0, 1.0); // [0<=n<=1]

  float nodeFactor = isNoded * nodeness; // [0<=n<=1]
  float topoFactor = isTopoed * toponess; // [0<=n<=1]

  // Effect calcs - grid
  float gridHeight = max(0.0, position.z - height);
  float gridHeightOffset = gridHeight * gridness;

  // Effect calcs - nodes
  float connFactor = nodeFactor * nconnection;
  float nodeHeightOffset = connHOffs * connFactor;
  float nodeRadiusOffset = connPSize * connFactor;

  // Effect calcs - topography
  float topoAlphaMask = max(1.0 - toponess, (toponess * topology.y * 2.0));
  float topoDotSize = (topology.y - 0.75) * toponess * 1.4; // need opt
  float topoHeightFreeze = topology.y * -0.5 + 1.0;
  float topoHeightTarget = max(-0.1, topology.x - 0.6) * 0.65 * toponess; // need opt
  float topoHeightOffset = (height * topoHeightFreeze + topoHeightTarget - height) * toponess;

  isDotted = clamp(1.0 - gridHeightOffset, nodeFactor, 1.0);
  isLined = clamp(gridHeightOffset * isGrided, max(topoFactor, nodeFactor * 0.6), 0.3);

  // POSITION
  float z = height + gridHeightOffset + nodeHeightOffset + topoHeightOffset;
  gl_Position = pjMatrix * mvMatrix * vec4(position.x, z, position.y, 1.0);

  // POINT SIZE
  float agnosticPointSize = mix(minPSize, maxPSize, min(z * 5.0, 1.0));
  float scale = screenScale * .01;
  gl_PointSize = isDotted * max(agnosticPointSize + nodeRadiusOffset, topoDotSize) * scale;

  // COLORS
  float minZ = vec4(pjMatrix * mvMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
  float maxZ = vec4(pjMatrix * mvMatrix * vec4(-maxDist, 0.0, -maxDist, 1.0)).z;
  float fog = 1.0 - gridness * fogged(gl_Position.z);

  vec3 vdist = vec3(distToVec(position.xy, sheens[1], sheens[0]),
                    distToVec(position.xy, sheens[3], sheens[2]),
                    distToVec(position.xy, sheens[5], sheens[4]));

  vec3 distVec = min((vdist + distWidth) / maxDist, 1.0);
  distVec = 1.0 - easeInOut(distVec, distSharpness);

  vColor = vec4(remap(distVec, 0.35, LINE_COLORS), topoAlphaMask * fog);
}
