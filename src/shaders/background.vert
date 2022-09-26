attribute vec2 position;
attribute float height;

varying   vec4 vColor;

const float minPSize = 2.0;
const float maxPSize = 15.0;
const float maxDist = 3.0;

const vec3 distSharpness = vec3(2.0, 2.0, 4.0);
const vec3 distWidth = vec3(1.0, 1.0, 1.5);

const mat3 LINE_COLORS = %lineColors%;
uniform vec2 lines[6];
uniform mat4 pjMatrix;
uniform mat4 mvMatrix;

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
  vec3 vdist = vec3(distToVec(pos, lines[1], lines[0]),
                    distToVec(pos, lines[3], lines[2]),
                    distToVec(pos, lines[5], lines[4]));

  for (int s=0; s<3; ++s){
    float d = 1.0 - easeInOut(min(vdist[s] + distWidth[s],
                                  maxDist) / maxDist, distSharpness[s]);
    vColor = max(vColor, vec4(remapV(d, 0.5, LINE_COLORS[s]), 1.0));
  }

  gl_Position = pjMatrix * mvMatrix * vec4(position.x, height, position.y, 1.0);
  gl_PointSize = remap(height, minPSize, maxPSize);
}
