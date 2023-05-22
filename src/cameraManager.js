import * as THREE from 'three';

export function createCameraManager(gameWindow) {
  // -- Constants --
  const DEG2RAD = Math.PI / 180.0;

  // Camera constraints
  const MIN_CAMERA_RADIUS = 10;
  const MAX_CAMERA_RADIUS = 50;
  const MIN_CAMERA_ELEVATION = 10;
  const MAX_CAMERA_ELEVATION = 90;

  // Camera sensitivity
  const AZIMUTH_SENSITIVITY = 1;
  const ELEVATION_SENSITIVITY = 0.5;
  const ZOOM_SENSITIVITY = 0.01;
  const PAN_SENSITIVITY = -0.1;

  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  // -- Variables --
  const camera = new THREE.PerspectiveCamera(45, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);
  let cameraOrigin = new THREE.Vector3(6, 0, 6);
  let cameraRadius = (MIN_CAMERA_RADIUS + MAX_CAMERA_RADIUS) / 2;  
  let cameraAzimuth = 135;
  let cameraElevation = 45;

  let speed = {
    rotation: { x: 0, y: 0},
    translate: { x: 0, y: 0}
  }

  updateCameraPosition();

  function onKeyDown(event) {
    // Rotate
    if (event.key === 'a') speed.rotation.x = 1;
    if (event.key === 'd') speed.rotation.x = -1;
    if (event.key === 'w') speed.rotation.y = 1;
    if (event.key === 's') speed.rotation.y = -1;

    // Translate
    if (event.key === 'A') speed.translate.x = 1;
    if (event.key === 'D') speed.translate.x = -1;
    if (event.key === 'W') speed.translate.y = 1;
    if (event.key === 'S') speed.translate.y = -1;
  }

  function onKeyUp(event) {
    // Rotate
    if (event.key === 'a') speed.rotation.x = 0;
    if (event.key === 'd') speed.rotation.x = 0;
    if (event.key === 'w') speed.rotation.y = 0;
    if (event.key === 's') speed.rotation.y = 0;

    // Translate
    if (event.key === 'A') speed.translate.x = 0;
    if (event.key === 'D') speed.translate.x = 0;
    if (event.key === 'W') speed.translate.y = 0;
    if (event.key === 'S') speed.translate.y = 0;
  }

  /**
   * Event handler for `wheel` event
   * @param {MouseEvent} event Mouse event arguments
   */
  function onMouseScroll(event) {
    cameraRadius += event.deltaY * ZOOM_SENSITIVITY;
    cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, cameraRadius));
  }

  function updateCameraPosition() {
    cameraAzimuth += -(speed.rotation.x * AZIMUTH_SENSITIVITY);
    cameraElevation += (speed.rotation.y * ELEVATION_SENSITIVITY);
    cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, cameraElevation));

    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
    const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, cameraAzimuth * DEG2RAD);
    cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * speed.translate.y));
    cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * speed.translate.x));
    
    camera.position.x = cameraRadius * Math.sin(cameraAzimuth * DEG2RAD) * Math.cos(cameraElevation * DEG2RAD);
    camera.position.y = cameraRadius * Math.sin(cameraElevation * DEG2RAD);
    camera.position.z = cameraRadius * Math.cos(cameraAzimuth * DEG2RAD) * Math.cos(cameraElevation * DEG2RAD);
    camera.position.add(cameraOrigin);
    camera.lookAt(cameraOrigin);
    camera.updateMatrix();
  }

  return {
    camera,
    updateCameraPosition,
    onKeyDown,
    onKeyUp,
    onMouseScroll
  }
}