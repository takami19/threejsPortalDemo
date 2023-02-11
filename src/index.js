import * as THREE from "three"
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import TouchControls from "./js/TouchControls"
import { changeScene, createCamera, createRenderer, runApp } from "./core-utils"
import Tile2 from './assets/checker_tile.png'

import texturefk from './img/nightsky_ft.png'
import texturebk from './img/nightsky_bk.png'
import textureup from './img/nightsky_up.png'
import texturedn from './img/nightsky_dn.png'
import texturert from './img/nightsky_rt.png'
import texturelf from './img/nightsky_lf.png'

import { Vector2 } from "three"

global.THREE = THREE
let gScene = new THREE.Scene()

let renderer = createRenderer({ antialias: true }, (_renderer) => {
  _renderer.outputEncoding = THREE.sRGBEncoding
})

let camera = createCamera(45, 1, 1000, { x: 0, y: 5, z: -15 })

const createDoor = (scene, color, x, y, z) => {
  let rectLight = new THREE.RectAreaLight(color, 5, 4, 10)
  rectLight.position.set(x, 5, z)
  scene.add(rectLight)
  scene.add(new RectAreaLightHelper(rectLight))

  let geometry = new THREE.BoxGeometry( 4, 10, 2 )
  const material = new THREE.MeshBasicMaterial( { color: 0xfffff, transparent: true, opacity:0.1 } );
  let door = new THREE.Mesh( geometry, material );
  door.position.set(x, y+5, z)
  scene.add(door)
  return door
}

const loadTexture = async(mshStdFloor, tile, xc, yc) => {
  return new Promise((resolve, reject) => {
    var loader = new THREE.TextureLoader()
    loader.load(tile, function (texture) {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(xc, yc)
      mshStdFloor.material.map = texture
      resolve()
    }, undefined, function (error) {
      console.log(error)
      reject(error)
    })
  })
}

const createFloor = async(scene, tile, xc, yc) => {
  const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000)
  const matStdFloor = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.5, metalness: 0 })
  const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor)
  await loadTexture(mshStdFloor, tile, xc, yc)
  scene.add(mshStdFloor)
}

const checkCollision = (obj, camera) => {
  var collidableMeshList = [];
  collidableMeshList.push(obj);

  var ray = new THREE.Raycaster( )
  ray.setFromCamera(new Vector2(0, 0), camera)
  var collisionResults = ray.intersectObjects( collidableMeshList );
  if (collisionResults.length > 0 && collisionResults[0].distance < 5) {
    return true
  }
  return false
}

const createScene1 = () => {
  let _scene = new THREE.Scene()
  const light = new THREE.AmbientLight( 0xff5050 )
  _scene.add( light );
  _scene.background = new THREE.Color( 0xffffff );
  return _scene
}

const createScene2 = () => {
  let _scene = new THREE.Scene()
  const light = new THREE.AmbientLight( 0x50ff50 )
  _scene.add( light );
  _scene.background = new THREE.Color( 0xffffff );
  return _scene
}

const createScene3 = () => {
  let _scene = new THREE.Scene()
  const light = new THREE.AmbientLight( 0x5050ff )
  _scene.add( light );
  _scene.background = new THREE.Color( 0xffffff );
  return _scene
}

let app = {
  async initScene() {
    this.scene = gScene
    this.activeScene = 0
    //this.controls = new FirstPersonControls(camera, renderer.domElement)
    
    // Controls
      let options = {
        delta: 0.75,           // coefficient of movement
        moveSpeed: 0.15,        // speed of movement
        rotationSpeed: 0.0015,  // coefficient of rotation
        maxPitch: 55,          // max camera pitch angle
        hitTest: false,         // stop on hitting objects
        hitTestDistance: 5    // distance to test for hit
    }
    let container = document.getElementById('container3d')
    this.controls = new TouchControls(container.parentNode, camera, options)
    this.controls.setPosition(0, 5, -15)
    this.controls.setRotation(0, 3.14)
    this.controls.addToScene(this.scene)
    this.camera = camera
    
    this.scene1 = createScene1()
    this.scene2 = createScene2()
    this.scene3 = createScene3()

    document.addEventListener("keydown", (evt) => {
      evt = evt || window.event;
      var isEscape = false
      if ("key" in evt) {
          isEscape = (evt.key === "Escape" || evt.key === "Esc");
      } else {
          isEscape = (evt.keyCode === 27);
      }
      if (isEscape) {
        this.controls.object.position.set(0, 5, -15)
        changeScene(this.scene, null)
      }
    }, false);

    RectAreaLightUniformsLib.init()

    const light = new THREE.AmbientLight( 0x404040 )
    this.scene.add( light );

    //creat doors
    this.door1 = createDoor(this.scene, 0xff0000, -15, 0, 5)
    this.door2 = createDoor(this.scene, 0x00ff00, 0, 0, 5)
    this.door3 = createDoor(this.scene, 0x0000ff, 15, 0, 5)

    this.exitDoor1 = createDoor(this.scene1, 0xff0000, 0, 0, 10)
    this.exitDoor2 = createDoor(this.scene2, 0x00ff00, 0, 0, 10)
    this.exitDoor3 = createDoor(this.scene3, 0x0000ff, 0, 0, 10)

    //create skybox
    const loader = new THREE.CubeTextureLoader()
    const textureCube = loader.load( [
      texturefk,
      texturebk,
      textureup,
      texturedn,
      texturert,
      texturelf
    ] );
    this.scene.background = textureCube
   
    const gltfLoader = new GLTFLoader().setPath( 'assets/' );
    gltfLoader.load( 'ground.glb', ( gltf ) => {
      this.scene.add( gltf.scene );
    } );

    // createFloor(this.scene, Tile, 1000, 1000)
    createFloor(this.scene1, Tile2, 200, 200)
    createFloor(this.scene2, Tile2, 200, 200)
    createFloor(this.scene3, Tile2, 200, 200)
  },
  updateScene(interval, elapsed) {
    this.controls.update()

    // Scene1
    if(this.activeScene == 0 && checkCollision(this.door1, this.camera)) {
      this.controls.setPosition(0, 5, -15)
      this.controls.setRotation(0, 3.14)
      changeScene(this.scene1, null)
      this.activeScene = 1
      this.controls.removeFromScene(this.scene)
      this.controls.addToScene(this.scene1)
    }
    else if(this.activeScene == 1 && checkCollision(this.exitDoor1, this.camera)) {
      this.controls.setPosition(0, 5, -15)
      this.controls.setRotation(0, 3.14)
      changeScene(this.scene, null)
      this.activeScene = 0
      this.controls.removeFromScene(this.scene1)
      this.controls.addToScene(this.scene)
    }

    // Scene2
    else if(this.activeScene == 0 && checkCollision(this.door2, this.camera)) {
      this.controls.setPosition(0, 5, -15)
      this.controls.setRotation(0, 3.14)
      changeScene(this.scene2, null)
      this.activeScene = 2
      this.controls.removeFromScene(this.scene)
      this.controls.addToScene(this.scene2)
    }

    else if(this.activeScene == 2 && checkCollision(this.exitDoor2, this.camera)) {
      this.controls.setPosition(0, 5, -15)
      this.controls.setRotation(0, 3.14)
      changeScene(this.scene, null)
      this.activeScene = 0
      this.controls.removeFromScene(this.scene2)
      this.controls.addToScene(this.scene)
    }

    // Scene3
    else if(this.activeScene == 0 && checkCollision(this.door3, this.camera)) {
      this.controls.setPosition(0, 5, -15)
      this.controls.setRotation(0, 3.14)
      changeScene(this.scene3, null)
      this.activeScene = 3
      this.controls.removeFromScene(this.scene)
      this.controls.addToScene(this.scene3)
    }

    else if(this.activeScene == 3 && checkCollision(this.exitDoor3, this.camera)) {
      this.controls.setPosition(0, 5, -15)
      this.controls.setRotation(0, 3.14)
      changeScene(this.scene, null)
      this.activeScene = 0
      this.controls.removeFromScene(this.scene3)
      this.controls.addToScene(this.scene)
    }
  }
}

runApp(app, gScene, renderer, camera, true, null)
