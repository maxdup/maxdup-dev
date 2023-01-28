attribute vec2 position;
attribute float nconnection;
attribute float height;

varying   vec4 vColor;

const float minPSize = 0.0015;
const float maxPSize = 0.006;

const float maxDist = 3.0;

const vec3 distSharpness = vec3(4.0, 4.0, 5.0);
const vec3 distWidth = vec3(0.8, 0.8, 1.5);

const mat3 LINE_COLORS = %lineColors%;

uniform vec2 sheens[6];
uniform mat4 pjMatrix;
uniform mat4 mvMatrix;
uniform vec2 screenSize;

const float fogness = 1.0;
const float dottedness = 1.0;

const float nodeness = 1.0;
const float gridness = 1.0;

float demap(float val, float minV, float maxV){
  return (val - minV) / (maxV - minV);
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
  // POSITION
  float heightOffset = 0.035 * nconnection * nodeness;
  gl_Position = pjMatrix * mvMatrix * vec4(position.x, height + heightOffset, position.y, 1.0);

  // POINT SIZE
  float agnosticPointSize = mix(minPSize, maxPSize, min(height*5.0, 1.0));
  gl_PointSize = (agnosticPointSize + 0.01 * nconnection) * screenSize.x * dottedness ;

  // COLORS
  vec2 pos = vec2(position.x, position.y);
  vec3 vdist = vec3(distToVec(pos, sheens[1], sheens[0]),
                    distToVec(pos, sheens[3], sheens[2]),
                    distToVec(pos, sheens[5], sheens[4]));
  vec3 distVec = min(vdist + distWidth, maxDist) / maxDist;
  distVec = 1.0 - easeInOut(distVec, distSharpness);
  float minZ = vec4(pjMatrix * mvMatrix * vec4(maxDist, 0.035, maxDist, 1.0))[2];
  float maxZ = vec4(pjMatrix * mvMatrix * vec4(-maxDist, 0.035, -maxDist, 1.0))[2];
  float fogging = mix(0.7, 1.0, 1.0 - demap(gl_Position.z, minZ, maxZ) * fogness);

  vColor = max(vColor, vec4(remap(distVec, 0.4, LINE_COLORS) * fogging, 1.0));
  vColor = vColor * max(gridness * (1.0 - min(1.0,nconnection)), min(nodeness, nconnection));
}
