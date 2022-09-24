attribute vec3 position;
attribute vec3 dist;

varying   vec4 vColor;

float minPSize = 2.0;
float maxPSize = 10.0;
float maxDist = 3.0;

vec3 colors[3];

uniform mat4 pjMatrix;
uniform mat4 mvMatrix;


float remap(float val, float minV, float maxV){
  return val * (maxV - minV) + minV;
}
float easeInOut(float x, float p){
  float xp = pow(x = min(1.0, max(0.0, x)),p);
  return xp / (xp + pow(1.0 - x, p));
}

void main()
{
  colors[0] = vec3(0.9, 0.0, 0.2);
  colors[1] = vec3(0.0, 0.2, 1.0);
  colors[2] = vec3(1.0, 1.0, 1.0);

  vec3 color = vec3(0.0, 0.0, 0.0);
  vec3 distSharpness = vec3(2.0, 2.0, 4.0);
  vec3 distWidth = vec3(1.0, 1.0, 1.5);

  for (int s = 0; s<3; ++s){
    float d = 1.0 - easeInOut(min(dist[s] + distWidth[s], maxDist) / maxDist, distSharpness[s]);
    for (int c = 0; c<3; ++c){
      color[c] = max(color[c], remap(d, 0.5, colors[s][c]));
    }
  }

  vColor = vec4(color, 1.0);
  gl_Position = pjMatrix * mvMatrix * vec4(position, 1.0);
  gl_PointSize = remap(position.y, minPSize, maxPSize);
}
