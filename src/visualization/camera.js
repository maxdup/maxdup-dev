import {
  matrixRotate,
  matrixTranslate,
  identityMatrix,
  perspectiveMatrix,
} from '../js/utils-matrix';

function Camera(){
  let initMatrix = matrixTranslate(identityMatrix(4), [-0.5, 0, -6]);
  this.pjMatrix = null;
  this.mvMatrix = initMatrix;

  this.viewWidth = null;
  this.viewHeight = null;

  this.renderScale = 1.0;

  this.renderHeight = null;
  this.renderWidth = null;

  this.resized = false;

  this.pitch = 0;
  this.pitchOffset = 0;
  this.yaw = 0;
  this.yawOffset = 0;
  this.roll = 0;

  this.offsetX = -0.5;
  this.offsetY = 0;
  this.offsetZ = -6;


  this.updateNudge = (pitchNudge, yawNudge) => {
    this.pitchOffset = pitchNudge * 0.05;
    this.yawOffset = yawNudge * 0.05;
    _onAngleChanged();
  }

  this.updateAngle = (pitch, yaw, roll, offsetX, offsetY, offsetZ) => {
    this.pitch = pitch;
    this.yaw = yaw;
    this.roll = roll;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.offsetZ = offsetZ;
    _onAngleChanged();
  }

  this.updateRenderScale = (scale) => {
    if (scale == this.renderScale) { return }
    this.renderScale = scale;
    _onRenderSizeChanged();
  }

  this.updateSize = (width, height) => {
    if (width == this.viewWidth && height == this.viewHeight) { return }
    this.viewWidth = width;
    this.viewHeight = height;
    _onRenderSizeChanged();

    this.aspectRatio = width / height;
    _onAspectRatioChanged();

    this.resized = true;
  }

  let _onAngleChanged = () => {
    this.mvMatrix = matrixTranslate(identityMatrix(4), [this.offsetX, this.offsetY, this.offsetZ]);
    this.mvMatrix = matrixRotate(this.mvMatrix, this.pitch + this.pitchOffset, [1,0,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, this.yaw + this.yawOffset, [0,1,0]);
    this.mvMatrix = matrixRotate(this.mvMatrix, this.roll, [0,0,1])
  }

  let _onRenderSizeChanged = () => {
    this.renderWidth = this.viewWidth * this.renderScale;
    this.renderHeight = this.viewHeight * this.renderScale;
  }

  let _onAspectRatioChanged = () => {
    this.pjMatrix = perspectiveMatrix(45, this.aspectRatio, 0.1, 1000.0);
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
