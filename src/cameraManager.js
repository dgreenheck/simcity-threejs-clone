import * as THREE from 'three';

export function createCameraManager(gameWindow) {
  // -- Constants --
  const DEG2RAD = Math.PI / 180.0;
  const MIDDLE_MOUSE_BUTTON = 4;
  const RIGHT_MOUSE_BUTTON = 2;

  // Camera constraints
  const MIN_CAMERA_RADIUS = 10;
  const MAX_CAMERA_RADIUS = 100;
  const MIN_CAMERA_ELEVATION = 10;
  const MAX_CAMERA_ELEVATION = 90;

  // Camera sensitivity
  const AZIMUTH_SENSITIVITY = 0.2;
  const ELEVATION_SENSITIVITY = 0.2;
  const ZOOM_SENSITIVITY = 0.01;
  const PAN_SENSITIVITY = -0.01;

  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  // -- Variables --
  const camera = new THREE.PerspectiveCamera(45, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);
  let cameraOrigin = new THREE.Vector3(6, 0, 6);
  let cameraRadius = 30;
  let cameraAzimuth = 135;
  let cameraElevation = 45;

   /**
     * Applies any changes to camera position/orientation
     */
   function updateCameraPosition() {
    camera.position.x = cameraRadius * Math.sin(cameraAzimuth * DEG2RAD) * Math.cos(cameraElevation * DEG2RAD);
    camera.position.y = cameraRadius * Math.sin(cameraElevation * DEG2RAD);
    camera.position.z = cameraRadius * Math.cos(cameraAzimuth * DEG2RAD) * Math.cos(cameraElevation * DEG2RAD);
    camera.position.add(cameraOrigin);
    camera.lookAt(cameraOrigin);
    camera.updateMatrix();
  }

  return {
    /* PROPERTIES */
    camera,

    /* METHODS */

    /**
     * Event handler for `mousemove` event
     * @param {MouseEvent} event Mouse event arguments
     */
    onMouseMove(event) {
      // Handles the rotation of the camera
      if (event.buttons & RIGHT_MOUSE_BUTTON) {
        cameraAzimuth += -(event.movementX * AZIMUTH_SENSITIVITY);
        cameraElevation += (event.movementY * ELEVATION_SENSITIVITY);
        cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, cameraElevation));
      }

      // Handles the panning of the camera
      if (event.buttons & MIDDLE_MOUSE_BUTTON) {
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
        const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
        cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * event.movementY));
        cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * event.movementX));
      }

      updateCameraPosition();
    },

    /**
     * Event handler for `wheel` event
     * @param {MouseEvent} event Mouse event arguments
     */
    onMouseScroll(event) {
      cameraRadius += event.deltaY * ZOOM_SENSITIVITY;
      cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, cameraRadius));

      updateCameraPosition();
    }
  }
}