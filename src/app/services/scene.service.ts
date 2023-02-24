import { Injectable } from '@angular/core';
import {Material, Mesh, Object3D, Scene} from "three";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private _gltfLoader: GLTFLoader = new GLTFLoader();

  public loadObject(
    scene: Scene,
    url: string,
    material?: Material,
    scale?: { x: number, y: number, z: number }
  ): void {
    this._gltfLoader.load(url, (gltf: GLTF) => {
      const epson = gltf.scene;

      if (scale) {
        epson.scale.set(scale.x, scale.y, scale.z);
      }

      if (material) {
        gltf.scene.traverse( (object: Object3D) => {
          if ( object instanceof Mesh ) {
            object.material = material;
          }
        });
      }

      scene.add(epson);
    });
  }
}
