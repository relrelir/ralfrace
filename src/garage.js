import * as THREE from 'three';
import { buildCar } from './carmodel.js';
import * as TX from './textures.js';

// The menu background: your kart on a rotating candy podium.
export class GarageScene {
  constructor() {
    const scene = new THREE.Scene();
    this.scene = scene;
    scene.background = TX.skyTexture('#7fd3ff', '#ffd1f0');
    scene.fog = new THREE.Fog('#ffd1f0', 40, 140);
    scene.add(new THREE.HemisphereLight('#ffffff', '#ffb3d9', 1.8));
    const sun = new THREE.DirectionalLight('#ffffff', 1.6);
    sun.position.set(5, 10, 6);
    scene.add(sun);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(200, 48), new THREE.MeshLambertMaterial({ map: (() => { const t = TX.groundTexture('#ffc4e6'); t.repeat.set(30, 30); return t; })() }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    this.podium = new THREE.Group();
    const top = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.6, 40), new THREE.MeshLambertMaterial({ map: TX.swirlTexture('#ffffff', '#ff7ad9') }));
    top.position.y = 0.3;
    this.podium.add(top);
    scene.add(this.podium);

    // candy props around
    const props = [
      [-9, '#ff6fb5', 'lolli'], [9, '#6fd6ff', 'lolli'], [-14, '#ffd54f', 'gum'], [13, '#7cf08a', 'gum'], [-6, '#9b7bff', 'gum'], [6, '#ff8a5c', 'gum'],
    ];
    for (const [x, c, type] of props) {
      const g = new THREE.Group();
      if (type === 'lolli') {
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6, 8), new THREE.MeshLambertMaterial({ color: '#fff' }));
        stick.position.y = 3;
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.4, 24), new THREE.MeshLambertMaterial({ map: TX.swirlTexture(c, '#ffffff') }));
        disc.rotation.x = Math.PI / 2; disc.position.y = 7;
        g.add(stick, disc);
        g.position.set(x, 0, -10);
      } else {
        const gum = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: c, shininess: 90 }));
        g.add(gum);
        g.position.set(x, 0, -6 - Math.abs(x) * 0.3);
      }
      scene.add(g);
    }

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    this.camera.position.set(0, 3.6, 10.5);
    this.camera.lookAt(0, 1.2, 0);
    this.car = null;
    this.t = 0;
  }

  setCar(cfg) {
    if (this.car) this.podium.remove(this.car);
    this.car = buildCar(cfg);
    this.car.position.y = 0.6;
    this.podium.add(this.car);
  }

  update(dt) {
    this.t += dt;
    this.podium.rotation.y += dt * 0.5;
    if (this.car) for (const w of this.car.userData.wheels) w.rotation.x -= dt * 2;
  }

  render(renderer, w, h, offsetX = 0) {
    this.camera.aspect = w / h;
    // shift the car to one side when a panel covers the other side
    this.camera.setViewOffset(w, h, offsetX, 0, w, h);
    this.camera.updateProjectionMatrix();
    renderer.setViewport(0, 0, w, h);
    renderer.render(this.scene, this.camera);
  }
}
