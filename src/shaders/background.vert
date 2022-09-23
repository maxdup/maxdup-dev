attribute vec3 position;
attribute vec3 color;
attribute float pointSize;

varying   vec4 vColor;
uniform mat4 pjMatrix;
uniform mat4 mvMatrix;

void main()
{
    vColor = vec4(color, 1.0);
    gl_Position = pjMatrix * mvMatrix * vec4(position, 1.0);
    gl_PointSize = pointSize;
}
