attribute vec2 position;
attribute float nconnection;
attribute float height;

varying   vec4 vColor;

const float minPSize = 0.0025;
const float maxPSize = 0.025;

const float maxDist = 3.0;

const vec3 distSharpness = vec3(4.0, 4.0, 5.0);
const vec3 distWidth = vec3(0.8, 0.8, 1.5);

const mat3 LINE_COLORS = %lineColors%;

uniform vec2 sheens[6];
uniform mat4 pjMatrix;
uniform mat4 mvMatrix;
uniform vec2 screenSize;

float remap(float val, float minV, float maxV){
  return val * (maxV - minV) + minV;
}
vec3 remapV(float val, float minV, vec3 maxV){
  return val * (maxV - minV) + minV;
}

float easeInOut(float x, float p){
  float xp = pow(x = min(1.0, max(0.0, x)),p);
  return xp / (xp + pow(1.0 - x, p));
}

float distToVec(vec2 point, vec2 angle, vec2 origin){
  vec2 v2 = point - origin;
  vec2 v3 = vec2(angle.y,-angle.x);
  return abs(dot(v2, normalize(v3)));
}

void main()
{
  vec2 pos = vec2(position.x, position.y);
  vec3 vdist = vec3(distToVec(pos, sheens[1], sheens[0]),
                    distToVec(pos, sheens[3], sheens[2]),
                    distToVec(pos, sheens[5], sheens[4]));

  for (int s=0; s<3; ++s){
    float d = 1.0 - easeInOut(min(vdist[s] + distWidth[s],
                                  maxDist) / maxDist, distSharpness[s]);
    vColor = max(vColor, vec4(remapV(d, 0.4, LINE_COLORS[s]), 1.0));
  }

  vec4 screenTransform = vec4(2.0 / screenSize.x, -2.0 / screenSize.y, -1.0, 1.0);
  gl_Position = pjMatrix * mvMatrix * vec4(position.x, height + 0.035 * nconnection, position.y, 1.0);
  gl_PointSize = remap(height,
                       screenSize.x * (minPSize + 0.005 * nconnection),
                       screenSize.x * (maxPSize + 0.01 * nconnection));
}
