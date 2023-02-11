// This core-utils contains the most important/top-level functions needed in creating a threejs application

import * as THREE from "three"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"

global.THREE = THREE
let activeScene = null
let activeComposer = null
/**
 * This function contains the boilerplate code to set up the environment for a threejs app;
 * e.g. HTML canvas, resize listener, mouse events listener, requestAnimationFrame
 * Consumer needs to provide the created renderer, camera and (optional) composer to this setup function
 * This has the benefit of bringing the app configurations directly to the consumer, instead of hiding/passing them down one more layer
 * @param {object} app a custom Threejs app instance that needs to call initScene and (optioal) updateScene if animation is needed
 * @param {object} scene Threejs scene instance
 * @param {object} renderer Threejs renderer instance
 * @param {object} camera Threejs camera instance
 * @param {bool} enableAnimation whether the app needs to animate stuff
 * @param {object} uniforms Uniforms object to be used in fragments, u_resolution/u_mouse/u_time got updated here
 * @param {object} composer Threejs EffectComposer instance
 * @returns a custom threejs app instance that has the basic setup ready that can be further acted upon/customized
 */
export const runApp = (app, scene, renderer, camera, enableAnimation = false, composer = null) => {
    // Create the HTML container, styles defined in index.html
    let container = document.getElementById('container3d')
    //const container = document.getElementById("container")
    container.append(renderer.domElement)
    activeScene = scene
    activeComposer = composer
    // Register resize listener
    window.addEventListener("resize", () => {
        camera.aspect = (window.innerWidth - 25) / (window.innerHeight - 40)
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth - 25, window.innerHeight - 40)
    })

    // Define your app
    if (app.updateScene === undefined) {
        app.updateScene = (delta, elapsed) => { }
    }
    Object.assign(app, { ...app, container })

    // The engine that powers your scene into movement
    const clock = new THREE.Clock()
    const animate = () => {
        if (enableAnimation) {
            requestAnimationFrame(animate)
        }

        const delta = clock.getDelta()
        const elapsed = clock.getElapsedTime()

        app.updateScene(delta, elapsed)

        // if (activeComposer === null) {
            renderer.render(activeScene, camera)
        // } else {
        //     activeComposer.render()
        // }
    }

    app.initScene()
        .then(() => {
            return true
        })
        .then(animate)
        .then(() => {
            // debugging info
            renderer.info.reset()
            // not sure if reliable enough, numbers change everytime...
            console.log("Renderer info", renderer.info)
        })
        .catch((error) => {
            console.log(error);
        });
}

export const changeScene = (scene, composer) => {
    activeComposer = composer
    activeScene = scene
}

/**
 * This creates the renderer, by default calls renderer's setPixelRatio and setSize methods
 * further reading on color management: See https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
 * @param {object} rendererProps props fed to WebGlRenderer constructor
 * @param {function} configureRenderer custom function for consumer to tune the renderer, takes renderer as the only parameter
 * @returns created renderer
 */
export const createRenderer = (rendererProps = {}, configureRenderer = (renderer) => { }) => {
    const renderer = new THREE.WebGLRenderer(rendererProps)
    renderer.setSize(window.innerWidth - 25, window.innerHeight - 40)

    // more configurations to the renderer from the consumer
    configureRenderer(renderer)

    return renderer
}

/**
 * This function creates the EffectComposer object for post processing
 * @param {object} renderer The threejs renderer
 * @param {object} scene The threejs scene
 * @param {object} camera The threejs camera
 * @param {function} extraPasses custom function that takes takes composer as the only parameter, for the consumer to add custom passes
 * @returns The created composer object used for post processing
 */
export const createComposer = (renderer, scene, camera, extraPasses) => {
    const renderScene = new RenderPass(scene, camera)

    let composer = new EffectComposer(renderer)
    composer.addPass(renderScene)

    // custom passes that the consumer wants to add
    extraPasses(composer)

    return composer
}

/**
 * This function creates the three.js camera
 * @param {number} fov Field of view, def = 45
 * @param {number} near nearest distance of camera render range
 * @param {number} far furthest distance of camera render range
 * @param {object} camPos {x,y,z} of camera position
 * @param {object} camLookAt {x,y,z} where camera's looking at
 * @param {number} aspect Aspect ratio of camera, def = screen aspect
 * @returns the created camera object
 */
export const createCamera = (
    fov = 45,
    near = 0.1,
    far = 100,
    camPos = { x: 0, y: 0, z: 5 },
    camLookAt = { x: 0, y: 0, z: 0 },
    aspect = (window.innerWidth - 25) / (window.innerHeight - 40),
) => {
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    //camera.position.set(camPos.x, camPos.y, camPos.z)
    //camera.lookAt(camLookAt.x, camLookAt.y, camLookAt.z) // this only works when there's no OrbitControls
    camera.updateProjectionMatrix()
    return camera
}
