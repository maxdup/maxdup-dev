import {
  matrixRotate,
  matrixTranslate,
  identityMatrix,
  perspectiveMatrix,
} from '../utils';

function Camera(){
  this.pjMatrix = null;
  this.cpMatrix = null;

  let initMatrix = matrixTranslate(identityMatrix(4), [-0.5, 0, -6]);
  this.mvMatrix = initMatrix;

  this.updateAngle = (pitch, yaw, roll) => {
    this.mvMatrix = matrixRotate(initMatrix, pitch, [1,0,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, yaw, [0,1,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, roll, [0,0,1]);
  }
  this.updateSize = (width, height) => {
    this.pjMatrix = perspectiveMatrix(45, width / height, 0.1, 1000.0);
  }

}
export default Camera;
