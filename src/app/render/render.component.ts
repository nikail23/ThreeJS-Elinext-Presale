import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {
  BoxGeometry,
  Clock,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  WebGLRenderer
} from "three";
import {KeyboardState} from "./keyboard-state.class";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {APP_CONFIG} from "../configs/app-config";
import {SceneService} from "../services/scene.service";

@Component({
  selector: 'app-render',
  templateUrl: './render.component.html',
  styleUrls: ['./render.component.scss']
})
export class RenderComponent implements AfterViewInit {
  // @ts-ignore
  @ViewChild('canvas') private canvasRef: ElementRef;

  public cameraZ: number = 10;
  public cameraY: number = 3;
  public fieldOfView: number = 90;
  public nearClippingPlane: number = 1;
  public farClippingPlane: number = 1000;
  public exportType: 'PNG' | 'JPG' = 'PNG';

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private _camera!: PerspectiveCamera;
  private _controls!: OrbitControls;
  private _textureLoader: TextureLoader = new TextureLoader();

  private _cube: Mesh = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshBasicMaterial({ map: this._textureLoader.load("/assets/texture.jpg") })
  );
  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _clock: Clock = new Clock();
  private _keyboardState: KeyboardState = new KeyboardState();

  constructor(
    private _sceneService: SceneService,
  ) {}

  public ngAfterViewInit(): void {
    this._createScene();
    this._startRenderingLoop();
  }

  public loadBackground(): void {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      if (event.target.files.length > 0) {
        this._scene.background = this._textureLoader.load(APP_CONFIG.TEXTURES_PATH + event.target.files[0].name);
      }
    }
    input.click();
  }

  public exportImage(): void {
    this._renderer.render(this._scene, this._camera);

    let dataURL: string;
    let fileName: string;

    switch (this.exportType) {
      case "JPG":
        dataURL = this._renderer.domElement.toDataURL( 'image/jpg' );
        fileName = 'export.jpg';
        break;
      case "PNG":
        dataURL = this._renderer.domElement.toDataURL( 'image/png' );
        fileName = 'export.png';
        break;
    }

    const a: HTMLAnchorElement = document.createElement('a');
    a.href = dataURL;
    a.download = fileName;
    a.click();
  }

  private _createScene(): void {
    //* Scene
    const wallGeometry = new BoxGeometry( 10, 10, 2, 1, 1, 1 );
    const wallMaterial = new MeshBasicMaterial({ map: this._textureLoader.load("/assets/crate.gif") });

    this._scene = new Scene();
    this._scene.background = new Color(0xFFFFFF);
    this._cube.scale.set(1, 1, 1);
    this._cube.position.y = 1;
    this._scene.add(this._cube);

    const wall: Mesh = new Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 5, -6);
    this._scene.add(wall);

    const wall2: Mesh = new Mesh(wallGeometry, wallMaterial);
    wall2.position.set(6, 5, 0);
    wall2.rotation.y = 3.14159 / 2;
    this._scene.add(wall2);


    //* Camera
    let aspectRatio: number = this._getAspectRatio();
    this._camera = new PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this._camera.position.z = this.cameraZ;
    this._camera.position.y = this.cameraY;

    this._sceneService.loadObject(this._scene, './assets/stair.gltf', wallMaterial);
  }

  private _getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private _render(): void {
    this._renderer.render(this._scene, this._camera);
  }

  private _update(): void {
    const delta: number = this._clock.getDelta(); // seconds.
    const moveDistance: number = 20 * delta; // 20 pixels per second
    const rotateAngle: number = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

    if (this._keyboardState.pressed("Q")) this._cube.rotation.y += rotateAngle;
    if (this._keyboardState.pressed("A")) this._cube.rotation.y -= rotateAngle;
    if (this._keyboardState.pressed("W")) this._cube.rotation.x += rotateAngle;
    if (this._keyboardState.pressed("S")) this._cube.rotation.x -= rotateAngle;
    if (this._keyboardState.pressed("E")) this._cube.rotation.z += rotateAngle;
    if (this._keyboardState.pressed("D")) this._cube.rotation.z -= rotateAngle;

    if (this._keyboardState.pressed("left")) this._cube.position.x -= moveDistance;
    if (this._keyboardState.pressed("right")) this._cube.position.x += moveDistance;
    if (this._keyboardState.pressed("up")) this._cube.position.z -= moveDistance;
    if (this._keyboardState.pressed("down")) this._cube.position.z += moveDistance;
  }

  private _startRenderingLoop(): void {
    //* Renderer
    // Use canvas element in template
    this._renderer = new WebGLRenderer({ canvas: this.canvas });
    this._renderer.setPixelRatio(devicePixelRatio);
    this._renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);

    let component: RenderComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component._render();
      component._update();
    }());
  }
}
