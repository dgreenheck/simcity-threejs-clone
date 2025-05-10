import * as THREE from 'three';
import { AssetManager } from "./AssetManager"
import { SimObject3D } from "./SimObject3D";
import { Tiles3D } from './Tiles3D';
import { CameraManager } from './CameraManager';
import type { UIProps } from './GameUI';
import { InputManager } from './InputManager';
import { SimBridge } from '../sim/SimBridge';
import { Cars3D } from './Cars3D';
import { ICityChanged } from '../sim/Init';
import { random, setRandomSeed } from '../sim/Rng';
import { appConstants } from '../AppConstants';
import { Painter } from '../sim/Painter';



export class Scene3D {
    assetManager: AssetManager = new AssetManager(this)
    tiles3D!: Tiles3D;
    cars3D!: Cars3D;
    cameraManager!: CameraManager;
    inputManager!: InputManager;
    sim = new SimBridge(this).createCaller();
    focusedObject: SimObject3D | null = null;
    renderer!: THREE.WebGLRenderer;
    scene!: THREE.Scene;
    raycaster!: THREE.Raycaster;
    grid?: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
    overlay?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
    painter!: Painter;

    constructor(readonly uiProps: UIProps) { }

    async init() {
        let uiProps = this.uiProps;

        let pendingAssetManager = this.assetManager.init()
        this.tiles3D = new Tiles3D(this);
        this.cars3D = new Cars3D(this)
        this.cameraManager = new CameraManager(uiProps.gameWindow);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.scene = new THREE.Scene();

        this.inputManager = new InputManager(uiProps.gameWindow);

        this.renderer.setSize(uiProps.gameWindow.clientWidth, uiProps.gameWindow.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        this.raycaster = new THREE.Raycaster();


        this.scene.clear();
        this.#setupLights();

        this.tiles3D.init();

        uiProps.gameWindow.appendChild(this.renderer.domElement);

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                this.onResize(width, height);
            }
        });

        resizeObserver.observe(uiProps.gameWindow);
        this.start();
        await pendingAssetManager;
        uiProps.setIsLoading(false);

        let changes = await this.sim.init();
        if (changes.cityChanged) {
            this.onCityChanged(changes.cityChanged);
        }
        if (changes.tileChanged) {
            this.tiles3D.onTileChanged(changes.tileChanged);
        }
        if (changes.carChanged) {
            this.cars3D.onCarsChanged(changes.carChanged);
        }
    }

    onTilesResized() {
        this.#setupGrid();
        this.#setupOverlay();
    }


    start() {
        this.renderer.setAnimationLoop((d) => this.drawFrame(d));
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }

    onCityChanged(cityChanged: ICityChanged) {
        this.uiProps.setCityName(cityChanged.name);
        this.tiles3D.setSize(cityChanged.width, cityChanged.height);
        if (cityChanged.clear) this.tiles3D.clearCity();
    }

    #setupGrid() {
        if (this.grid) this.scene.remove(this.grid)
        let { width, height } = this.tiles3D
        // Add the grid
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            map: this.assetManager.textures['grid'],
            transparent: true,
            opacity: 0.2
        });
        gridMaterial.map!.repeat = new THREE.Vector2(width, height);
        gridMaterial.map!.wrapS = THREE.RepeatWrapping; // city.size; 
        gridMaterial.map!.wrapT = THREE.RepeatWrapping; // city.size;


        const grid = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.1, height),
            gridMaterial
        );
        grid.position.set(width / 2 - 0.5, -0.04, height / 2 - 0.5);
        this.grid = grid;
        this.scene.add(grid);
    }

    #setupOverlay() {
        let { width, height } = this.tiles3D;
        if (this.overlay) this.scene.remove(this.overlay);
        if (width || height) {
            let pw = width * appConstants.PixelPerTile;
            let ph = height * appConstants.PixelPerTile;
            setRandomSeed(1);
            const data = new Uint8Array(pw * ph * 4); // RGBA
            for (let i = 0; i < data.length; i += 4) {
                let v = random(255);
                data[i] = 0;       // R
                data[i + 1] = 0;   // G
                data[i + 2] = v;   // B
                data[i + 3] = 80;   // A

            }

            const texture = new THREE.DataTexture(data, pw, ph, THREE.RGBAFormat);
            texture.needsUpdate = true;

            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            const geometry = new THREE.PlaneGeometry(width, height);
            const overlay = new THREE.Mesh(geometry, material);
            this.overlay = overlay;

            overlay.position.set(width / 2 - 0.5, -0.5, height / 2 - 0.5);
            overlay.rotation.x = -Math.PI / 2; // à plat au sol

            function getPixel(x: number, y: number): boolean {
                if (x >= 0 && y >= 0 && x < pw && y < ph) {
                    let index = (pw * y + x) * 4 + 2;
                    return data[index + 2] > 0
                }
                return false;
            }
            function setPixel(x: number, y: number, value: boolean): void {
                if (x >= 0 && y >= 0 && x < pw && y < ph) {
                    let v = value ? 255 : 0;
                    let index = (pw * y + x) * 4 + 2;
                    data[index] = v
                }

            }

            this.scene.add(overlay);
            this.painter = new Painter({
                get: getPixel,
                set: setPixel,
                width: pw,
                height: ph
            });
        }
    }

    #setupLights() {
        const sun = new THREE.DirectionalLight(0xffffff, 2)
        sun.position.set(-10, 20, 0);
        sun.castShadow = true;
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 50;
        sun.shadow.normalBias = 0.01;
        this.scene.add(sun);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    }


    drawFrame(now: number) {
        this.updateFocusedObject();

        if (this.inputManager.isLeftMouseDown) {
            //this.useTool();
        }
        this.cars3D.drawFrame(now)
        this.tiles3D.drawFrame(now)
        this.renderer.render(this.scene, this.cameraManager.camera);
    }

    updateSelectedObject() {
        let selected = this.uiProps.selectedObject();
        if (this.focusedObject != selected) {
            selected?.setSelected(false);
            this.uiProps.setSelectedObject(this.focusedObject);
            this.focusedObject?.setSelected(true);
        }
    }

    updateFocusedObject() {
        const newObject = this.#raycast();
        if (newObject !== this.focusedObject) {
            //     this.focusedObject?.setFocused(false);
            //     this.focusedObject = newObject;
            //     this.focusedObject?.setFocused(true);
        }
    }


    #raycast(): SimObject3D | null {
        var coords = new THREE.Vector2(
            (this.inputManager.x / this.renderer.domElement.clientWidth) * 2 - 1,
            -(this.inputManager.y / this.renderer.domElement.clientHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(coords, this.cameraManager.camera);

        let intersections = this.raycaster.intersectObjects(this.tiles3D.root.children, true);
        if (intersections.length > 0) {
            // The SimObject attached to the mesh is stored in the user data
            const selectedObject = intersections[0].object.userData as SimObject3D | null;
            return selectedObject;
        } else {
            return null;
        }
    }

    /**
     * Resizes the renderer to fit the current game window
     */
    onResize(w: number, h: number) {
        this.cameraManager.resize(w, h);
        this.renderer.setSize(w, h);
    }
}
