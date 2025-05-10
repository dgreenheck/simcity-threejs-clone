import * as THREE from 'three';
//import { ui } from '../../App';

// -- Constants --
const DEG2RAD = Math.PI / 180.0;
const RIGHT_MOUSE_BUTTON = 2;
const MIDDLE_MOUSE_BUTTON = 4;

// Camera constraints
const CAMERA_SIZE = 3;
const MIN_CAMERA_RADIUS = 0.03;
const MAX_CAMERA_RADIUS = 5;
const MIN_CAMERA_ELEVATION = 0;
const MAX_CAMERA_ELEVATION = 90;

// Camera sensitivity
const AZIMUTH_SENSITIVITY = 0.2;
const ELEVATION_SENSITIVITY = 0.2;
const ZOOM_SENSITIVITY = 0.002;
const PAN_SENSITIVITY = -0.02;

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export class CameraManager {
  camera: THREE.OrthographicCamera;
  cameraOrigin: THREE.Vector3;
  cameraRadius: number;
  cameraAzimuth: number;
  cameraElevation: number;

  constructor(gameWindow: HTMLDivElement) {
    const aspect = gameWindow.clientWidth / gameWindow.clientHeight;

    this.camera = new THREE.OrthographicCamera(
      (CAMERA_SIZE * aspect) / -2,
      (CAMERA_SIZE * aspect) / 2,
      CAMERA_SIZE / 2,
      CAMERA_SIZE / -2, 1, 1000);
    this.camera.layers.enable(1);

    this.cameraOrigin = new THREE.Vector3(3, 0, 3);
    this.cameraRadius = 0.5;
    this.cameraAzimuth = 225;
    this.cameraElevation = 45;

    this.updateCameraPosition();

    gameWindow.addEventListener('wheel', this.onMouseScroll.bind(this), false);
    gameWindow.addEventListener('mousedown', this.onMouseMove.bind(this), false);
    gameWindow.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  }

  /**
    * Applies any changes to camera position/orientation
    */
  updateCameraPosition() {
    this.camera.zoom = this.cameraRadius;
    this.camera.position.x = 100 * Math.sin(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.y = 100 * Math.sin(this.cameraElevation * DEG2RAD);
    this.camera.position.z = 100 * Math.cos(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.add(this.cameraOrigin);
    this.camera.lookAt(this.cameraOrigin);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  /**
   * Event handler for `mousemove` event
   * @param {MouseEvent} event Mouse event arguments
   */
  onMouseMove(event: MouseEvent) {
    // Handles the rotation of the camera
    if (event.buttons & MIDDLE_MOUSE_BUTTON) {
      this.cameraAzimuth += -(event.movementX * AZIMUTH_SENSITIVITY);
      this.cameraElevation += (event.movementY * ELEVATION_SENSITIVITY);
      this.cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, this.cameraElevation));
    }

    // Handles the panning of the camera
    if (event.buttons & RIGHT_MOUSE_BUTTON) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      this.cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * event.movementY));
      this.cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * event.movementX));
    }

    this.updateCameraPosition();
  }

  /**
   * Event handler for `wheel` event
   * @param {MouseEvent} event Mouse event arguments
   */
  onMouseScroll(event: any) {
    this.cameraRadius *= 1 - (event.deltaY * ZOOM_SENSITIVITY);
    this.cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, this.cameraRadius));

    this.updateCameraPosition();
  }

  resize(w: number, h: number) {
    const aspect = h > 0 ? w / h : 1;
    this.camera.left = (CAMERA_SIZE * aspect) / -2;
    this.camera.right = (CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
  }
}