import {
  matrixRotate,
  matrixTranslate,
  identityMatrix,
  perspectiveMatrix,
} from '../js/utils';

function Camera(){
  let initMatrix = matrixTranslate(identityMatrix(4), [-0.5, 0, -6]);
  this.pjMatrix = null;
  this.mvMatrix = initMatrix;

  this.resolutionScale = null;

  this.pitch = 0;
  this.pitchOffset = 0;
  this.yaw = 0;
  this.yawOffset = 0;
  this.roll = 0;

  this._update = () => {
    this.mvMatrix = initMatrix;
    this.mvMatrix = matrixRotate(this.mvMatrix, this.pitch + this.pitchOffset, [1,0,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, this.yaw + this.yawOffset, [0,1,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, this.roll, [0,0,1])
  }

  this.updateNudge = (pitchNudge, yawNudge) => {
    this.pitchOffset = pitchNudge * 0.05;
    this.yawOffset = yawNudge * 0.05;
    this._update();
  }

  this.updateAngle = (pitch, yaw, roll) => {
    this.pitch = pitch;
    this.yaw = yaw;
    this.roll = roll;
    this._update();
  }

  this.updateSize = (width, height) => {
    this.resolutionScale = height;
    this.pjMatrix = perspectiveMatrix(45, width / height, 0.1, 1000.0);
  }

  this.offset = 0;
  this.positions = [1,1,1,
                    1,1,-1,
                    1,-1,1,
                    1,-1,-1,
                    -1,1,1,
                    -1,1,-1,
                    -1,-1,1,
                    -1,-1,-1];

  this.len = 8;
}

export default Camera;
