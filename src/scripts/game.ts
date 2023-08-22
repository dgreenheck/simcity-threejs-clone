import { Event } from "three";
import { City } from "./city.js";
import { SceneManager } from "./sceneManager";
import { BuildingKind } from "../types/Building.js";
import { Tile } from "./tile.js";

export class Game {
  selectedControl = document.getElementById("button-select");
  activeToolId = "select";
  isPaused = false;
  city: City;
  sceneManager: SceneManager;

  /**
   * The current focused object
   * @type {Building | Tile}
   */
  focusedObject: Tile | null = null;
  // Last time mouse was moved
  // This was new Date(); before
  lastMove = Date.now();

  constructor() {
    /**
     * The city data model
     * @type {City}
     */
    this.city = new City(16);
    /**
     * The 3D game scene
     */
    this.sceneManager = new SceneManager(this.city, () => {
      console.log("scene loaded");
      const loading = document.getElementById("loading");

      if (loading) loading.remove();

      this.sceneManager.start();
      setInterval(this.step.bind(this), 1000);
    });

    const gameWindow = document.getElementById("render-target");

    if (gameWindow) {
      // Hookup event listeners
      gameWindow.addEventListener(
        "wheel",
        this.sceneManager.cameraManager.onMouseScroll.bind(
          this.sceneManager.cameraManager
        ),
        false
      );
      gameWindow.addEventListener(
        "mousedown",
        this.#onMouseDown.bind(this),
        false
      );
      gameWindow.addEventListener(
        "mousemove",
        this.#onMouseMove.bind(this),
        false
      );

      // Prevent context menu from popping up
      gameWindow.addEventListener(
        "contextmenu",
        (event) => event.preventDefault(),
        false
      );
    }
  }

  /**
   * Main update method for the game
   */
  step() {
    if (this.isPaused) return;
    // Update the city data model first, then update the scene
    this.city.step();
    this.sceneManager.applyChanges(this.city);

    this.#updateTitleBar();
    this.#updateInfoPanel();
  }

  /**
   *
   * @param {*} event
   */
  onToolSelected(event: Event) {
    // Deselect previously selected button and selected this one
    if (this.selectedControl) {
      this.selectedControl.classList.remove("selected");
    }

    this.selectedControl = event.target;
    this.selectedControl?.classList.add("selected");

    this.activeToolId = this.selectedControl?.getAttribute("data-type") ?? ""; //TODO: fix this ;
    console.log(this.activeToolId);
  }

  /**
   * Toggles the pause state of the game
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    console.log(`Is Paused: ${this.isPaused}`);

    // TODO: Fix this
    const pauseButton = document.getElementById(
      "pause-button"
    ) as HTMLImageElement;

    if (this.isPaused) {
      if (pauseButton) pauseButton.src = "/icons/play.png";
    } else {
      pauseButton.src = "/icons/pause.png";
    }
  }

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event
   */
  #onMouseDown(event: Event) {
    // Check if left mouse button pressed
    if (event.button === 0) {
      const selectedObject = this.sceneManager.getSelectedObject(event);
      this.#useActiveTool(selectedObject);
    }

    this.sceneManager.cameraManager.onMouseMove(event);
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event
   */
  #onMouseMove(event: Event) {
    // Throttle event handler so it doesn't kill the browser
    if (Date.now() - this.lastMove < 1 / 60.0) return;
    this.lastMove = Date.now();

    // Get the object the mouse is currently hovering over
    const hoverObject = this.sceneManager.getSelectedObject(event);

    this.sceneManager.setHighlightedMesh(hoverObject);

    // If left mouse-button is down, use the tool as well
    if (hoverObject && event.buttons & 1) {
      this.#useActiveTool(hoverObject);
    }

    this.sceneManager.cameraManager.onMouseMove(event);
  }

  #useActiveTool(object: any) {
    // If no object is selected, clear the info panel
    if (!object) {
      // This method was used with arg null before
      this.#updateInfoPanel();
      return;
    } else {
      const tile = object.userData as Tile;
      if (this.activeToolId === "select") {
        this.sceneManager.setActiveObject(object);
        this.focusedObject = tile;
        this.#updateInfoPanel();
      } else if (this.activeToolId === "bulldoze") {
        this.city.bulldoze(tile.x, tile.y);
        this.sceneManager.applyChanges(this.city);
      } else if (!tile.building) {
        const buildingType = this.activeToolId as BuildingKind;
        this.city.placeBuilding(tile.x, tile.y, buildingType);
        this.sceneManager.applyChanges(this.city);
      }
    }
  }

  #updateInfoPanel() {
    const infoDetails = document.getElementById("info-details");
    if (infoDetails) {
      if (this.focusedObject && this.focusedObject?.toHTML) {
        infoDetails.innerHTML = this.focusedObject.toHTML();
      } else {
        infoDetails.innerHTML = "";
      }
    }
  }

  #updateTitleBar() {
    const populationCounter = document.getElementById("population-counter");
    if (populationCounter) {
      populationCounter.innerHTML = this.city.getPopulation().toString();
    }
  }
}
