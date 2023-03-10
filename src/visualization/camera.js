import {
  matrixRotate,
  matrixTranslate,
  identityMatrix,
  perspectiveMatrix,
} from '../utils';

function Camera(){
  let initMatrix = matrixTranslate(identityMatrix(4), [-0.5, 0, -6]);
  this.pjMatrix = null;
  this.mvMatrix = initMatrix;

  this.resolutionScale = null;

  this.updateAngle = (pitch, yaw, roll) => {
    this.mvMatrix = matrixRotate(initMatrix, pitch, [1,0,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, yaw, [0,1,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, roll, [0,0,1]);
  }
  this.updateSize = (width, height) => {
    this.resolutionScale = height;
    this.pjMatrix = perspectiveMatrix(45, width / height, 0.1, 1000.0);
  }

}
export default Camera;
