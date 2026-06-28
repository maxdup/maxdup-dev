uniform mat4 mvpMatrix;
uniform float screenScale;

uniform vec2 sheens[6];
uniform float nodeness; // 0≤r≤1 transition
uniform float gridness; // 0≤r≤1 transition
uniform float toponess; // 0≤r≤1 transition
uniform float sheenness; // 0≤r≤1 — how much the ambient sheen colours show

// "Signal sweep" over the mountain (trajectory scene): a band of light that
// descends from peaks to valleys, driven from the worker.
uniform float sweepHeight;    // model-space elevation of the band right now
uniform float sweepIntensity; // 0 when idle

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

const float SWEEP_WIDTH = 0.6;                  // band thickness, elevation units
const vec3 SWEEP_COLOR = vec3(0.45, 0.62, 0.85); // subtle cool signal tint


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
  float isGrided = 1.0 - abs(sign(nconnection));  // [0, 1]
  float isNoded = max(0.0, sign(nconnection)); // [0, 1]
  float isTopoed = clamp(-nconnection - 1.0, 0.0, 1.0); // [0, 1]

  float nodeFactor = isNoded * nodeness; // 0≤r≤1 transition
  float topoFactor = isTopoed * toponess; // 0≤r≤1 transition

  // Effect calcs - grid
  float gridHeight = max(0.0, position.z - height);
  float gridHeightOffset = gridHeight * gridness; // 0≤r≤gridHeight

  // Effect calcs - nodes
  float connFactor = nodeFactor * nconnection; // 0≤r≤1
  float nodeHeightOffset = connHOffs * connFactor; // [0, 0.075]
  float nodeRadiusOffset = connPSize * connFactor; // [0, 1.5]

  // Effect calcs - topography
  // Elevation (topology.x) is the sharp land/water signal, so it owns the
  // brightness -> a hard edge against black water. The coast mask (topology.y)
  // is ADDED on top as a shoreline highlight (its original intent), instead of
  // being the mask itself (which gave a soft, muddy edge).
  float waterLevel = 0.25;
  float landMask = smoothstep(waterLevel, waterLevel + 0.06, topology.x);
  float coastHi = max(0.0, topology.y - 0.4) * 1.2; // just the bright coast halo
  float topoLum = clamp(landMask * 0.85 + coastHi, 0.0, 1.0);
  float topoAlphaMask = max(1.0 - toponess, toponess * topoLum);
  float topoDotSize = (topology.y - 0.75) * toponess * 1.4; // need opt
  float topoHeightFreeze = topology.y * -0.5 + 1.0;
  float topoHeightTarget = max(-0.1, topology.x - 0.6) * 0.65 * toponess; // need opt
  float topoHeightOffset = (height * topoHeightFreeze + topoHeightTarget - height) * toponess;

  isDotted = clamp(1.0 - gridHeightOffset, nodeFactor, 1.0); // 0≤r≤1
  isLined = clamp(min(1.0, (gridHeightOffset* 3.0)) * isGrided, max(topoFactor, nodeFactor), 1.0);

  // POSITION
  float z = height + gridHeightOffset + nodeHeightOffset + topoHeightOffset;
  gl_Position = mvpMatrix * vec4(position.x, z, position.y, 1.0);

  // POINT SIZE
  float agnosticPointSize = mix(minPSize, maxPSize, min(z * 5.0, 1.0));
  float scale = screenScale * .01;
  // land keeps a floor in topo view so the height bob can't shrink it to zero
  // (water is left free to vanish)
  float topoMinSize = landMask * toponess * 0.15;
  gl_PointSize = isDotted *
    max(max(agnosticPointSize + nodeRadiusOffset, topoDotSize), topoMinSize) *
    scale;

  // COLORS
  float fog = 1.0 - gridness * fogged(gl_Position.z);

  vec3 vdist = vec3(distToVec(position.xy, sheens[1], sheens[0]),
                    distToVec(position.xy, sheens[3], sheens[2]),
                    distToVec(position.xy, sheens[5], sheens[4]));

  vec3 distVec = min((vdist + distWidth) / maxDist, 1.0);
  // sheenness scales the coloured sweep away to the base tone per scene
  distVec = (1.0 - easeInOut(distVec, distSharpness)) * sheenness;

  vColor = vec4(remap(distVec, 0.35, LINE_COLORS), topoAlphaMask * fog);

  // Signal sweep — a band of light at the current sweep elevation, washing
  // down the mountain. Scoped to the mountain scene (gridness).
  float bandDist = abs(position.z - sweepHeight);
  float band = (1.0 - smoothstep(0.0, SWEEP_WIDTH, bandDist)) *
    sweepIntensity * gridness;
  vColor.rgb += band * SWEEP_COLOR;
}
