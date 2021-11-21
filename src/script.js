import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import elephantVertexShader from './shaders/elephant/vertex.glsl'
import elephantFragmentShader from './shaders/elephant/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x132020 )

//Helper
/* const axesHelper = new THREE.AxesHelper( 30 )
scene.add( axesHelper ) */

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 2000)
camera.position.x = 0
camera.position.y = 300
camera.position.z = 700
camera.lookAt(0,0,0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


//Add 
const lineGroup = new THREE.Group()
const dotGroup = new THREE.Group()
const shaderGroup = new THREE.Group()
scene.add(lineGroup,dotGroup,shaderGroup)
 



//Points
let sampler = null
let tempPosition = null
let points = null
const vertices = []
let pointsGeometry = null

const shaderVertices = []
let shaderPoints = null
let shaderPointsGeometry= null
let shaderMaterial = null




//Lines
let paths=[]


const lineMaterials = 
    [new THREE.LineBasicMaterial({color: 0xFAAD80, transparent: true, opacity: 0.7}),
    new THREE.LineBasicMaterial({color: 0xFF6767, transparent: true, opacity: 0.7}),
    new THREE.LineBasicMaterial({color: 0xFF3D68, transparent: true, opacity: 0.7}),
    new THREE.LineBasicMaterial({color: 0xA73489, transparent: true, opacity: 0.7})]

 //Model
let elephantModel = null
let whaleModel = null
const gltfLoader = new GLTFLoader()
const objLoader = new OBJLoader()

function loadGLTFModel(url){
    return new Promise(resolve =>{
        gltfLoader.load(url,resolve)
  })
}

function loadOBJModel(url){
    return new Promise(resolve =>{
        objLoader.load(url,resolve)
  })
}


const p1 = loadGLTFModel('/models/Elephant.glb')
    .then(result=>{elephantModel = result.scene.children[0]})



Promise.all([p1]).then( ()=>{

    
    /*  scene.add(elephantModel)
   
        elephantModel.material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: 0xffa0e6,
            transparent: true,
            opacity: 0
        })  */

    }).then(()=>{

    //Sampling
    sampler = new MeshSurfaceSampler(elephantModel).build() 
    tempPosition = new THREE.Vector3()

    //Points
    pointsGeometry = new THREE.BufferGeometry()
    const pointsMaterial = new THREE.PointsMaterial({
        color: 0xffa0e6,
        size: 2.0
    })
    points = new THREE.Points(pointsGeometry, pointsMaterial)
    dotGroup.add(points)

    //Points with Shader
    shaderPointsGeometry = new THREE.BufferGeometry()
    shaderMaterial = new THREE.ShaderMaterial({

        vertexShader: elephantVertexShader,
        fragmentShader: elephantFragmentShader,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms:{
            uTime:{value:0}
        }
    })
    shaderPoints = new THREE.Points(shaderPointsGeometry, shaderMaterial)
    shaderGroup.add(shaderPoints)
 

    //Loop through 4 different colors
    for (let i = 0;i < 4; i++) {
        const path = new Path(i)
        paths.push(path)
        lineGroup.add(path.line)
    }
    
    animateScene()
})
const addPoints = ()=>{
    sampler.sample(tempPosition)
    vertices.push(tempPosition.x+200, tempPosition.y, tempPosition.z)
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

}

const addPointsWithShaders = () =>{
    sampler.sample(tempPosition)
    shaderVertices.push(tempPosition.x, tempPosition.y, tempPosition.z)
    shaderPointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shaderVertices, 3))
    

}



class Path {
    constructor(index){

    this.geometry = new THREE.BufferGeometry(),
    this.material = lineMaterials[index%4]
    this.line = new THREE.Line(this.geometry, this.material),
    this.vertices = [],

    sampler.sample(tempPosition),
    this.previousPoint = tempPosition.clone()
    }

    update(){
        let pointFound = false
        while(!pointFound){
            sampler.sample(tempPosition)
            if(tempPosition.distanceTo(this.previousPoint)<30){
                this.vertices.push(tempPosition.x-200, tempPosition.y, tempPosition.z)
                this.previousPoint = tempPosition.clone()
                pointFound = true
            }
        }
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3))
    }
}


 
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const animateScene = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    shaderMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    //Animate Dots

    dotGroup.rotation.y = elapsedTime * 0.25 
    shaderGroup.rotation.y = elapsedTime * 0.25
   //Update points
    if(vertices.length<5000){
        addPoints()
    }

    if(vertices.length<5000){
        addPointsWithShaders()
    }
    //Animate Lines
    paths.forEach(path=>{
        if(path.vertices.length <3000){
            path.update()
        }
    })
    
    lineGroup.rotation.y = elapsedTime * 0.25
 
    // Render
    renderer.render(scene, camera)

    // Call animateScene again on the next frame
    window.requestAnimationFrame(animateScene)
}
