attribute vec3 position;
attribute vec3 dist;

varying   vec4 vColor;

float minPSize = 2.0;
float maxPSize = 10.0;
float maxDist = 3.0;


mat3 LINE_COLORS = %lineColors%;

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

void main()
{
  vec3 distSharpness = vec3(2.0, 2.0, 4.0);
  vec3 distWidth = vec3(1.0, 1.0, 1.5);

  for (int s = 0; s<3; ++s){
    float d = 1.0 - easeInOut(min(dist[s] + distWidth[s], maxDist) / maxDist, distSharpness[s]);
    vColor = max(vColor, vec4(remapV(d, 0.5, LINE_COLORS[s]), 1.0));
  }

  gl_Position = pjMatrix * mvMatrix * vec4(position, 1.0);
  gl_PointSize = remap(position.y, minPSize, maxPSize);
}
