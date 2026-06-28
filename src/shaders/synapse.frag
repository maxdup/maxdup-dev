precision mediump float;
varying float vIntensity;

uniform vec3 sparkColor; // set per particle system, kept below node brightness

float circle(in vec2 coord){
  // solid disc with a thin antialiased rim
  float d = length(coord - vec2(0.5));
  return 1.0 - smoothstep(0.45, 0.5, d);
}

void main() // SYNAPSE SPARKS (additive)
{
  gl_FragColor = vec4(sparkColor, vIntensity * circle(gl_PointCoord.xy));
}
