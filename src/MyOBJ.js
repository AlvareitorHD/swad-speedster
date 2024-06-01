import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import * as KeyCode from '../libs/keycode.esm.js'
import { Cono_Trafico } from './Cono_Trafico/Cono_Trafico.js';
import { Neumatico } from './Neumatico/Neumatico.js';
import { Rampa } from './Rampa/Rampa.js';
import * as TWEEN from '../../libs/tween.esm.js'
import { Moneda_Basica } from './Moneda_Basica/Moneda_Basica.js';
import { Moneda_Premium } from './Moneda_Premium/Moneda_Premium.js';

import { CSG } from '../../libs/CSG-v2.js';
import { Punto_Escudo } from './Punto_Escudo/Punto_Escudo.js';
import { Impulsor } from './Impulsor/Impulsor.js';

class Personaje extends THREE.Object3D {
  constructor(gui, titleGui, c) {

    super();
    var circuito = c.tubeGeometry;
    this.circuito = c;
    this.vueltas = 0;
    this.mitad = false;
    this.score = 0;
    this.puntuar = true;


    // Posición y dirección para el updateRayo
    this.pos = new THREE.Vector3();
    this.direccion = new THREE.Vector3();


    this.speed = 0; // Velocidad inicial del personaje
    this.acceleration = 0.0005; // Aceleración del personaje
    this.maxSpeed = 0.075; // Velocidad máxima del personaje
    this.minSpeed = -0.01; // Velocidad mínima del personaje (puede ser negativa para retroceder)
    this.friction = 0.0001; // Fricción para la desaceleración del personaje
    this.rotacionLateral = 0; // Rotación lateral del personaje
    this.desacelerar = false; // Bandera para desacelerar
    this.desgirar = false; // Bandera para desacelerar el giro

    this.personaje = new THREE.Object3D();
    this.createGUI(gui, titleGui);
    this.createChasis();
    this.createAlonso();
    this.createReloj();
    this.createCamara();

    this.createCanon();
    this.initMouseTracking();

    this.rot = 0;

    this.n1 = this.createNeumatico();
    this.n1.position.set(0.55, 0.2, 0.82); // Posicionar
    this.personaje.add(this.n1);
    this.n2 = this.createNeumatico();
    this.n2.geometry.rotateY(Math.PI);
    this.n2.position.set(-0.55, 0.2, 0.82); // Posicionar
    this.personaje.add(this.n2);
    this.n3 = this.createNeumatico();
    this.n3.position.set(0.55, 0.2, -1.22); // Posicionar
    this.personaje.add(this.n3);
    this.n4 = this.createNeumatico();
    this.n4.geometry.rotateY(Math.PI);
    this.n4.position.set(-0.55, 0.2, -1.22); // Posicionar
    this.personaje.add(this.n4);

    this.createLuzTrasera();
 
    this.nodoPosOrientTubo = new THREE.Object3D();
    this.movimientoLateral = new THREE.Object3D();
    this.posSuperficie = new THREE.Object3D();
    this.radio = circuito.parameters.radius;
    this.posSuperficie.position.y = this.radio;

    this.add(this.nodoPosOrientTubo);
    this.nodoPosOrientTubo.add(this.movimientoLateral);
    this.movimientoLateral.add(this.posSuperficie);
    this.movimientoLateral.rotateZ(Math.PI / 2);
    this.posSuperficie.add(this.personaje);
    //pergarlo al tubo
    this.t = 0;
    this.tubo = circuito;
    this.path = circuito.parameters.path;
    this.segmentos = circuito.parameters.tubularSegments;

    var posTemp = this.path.getPointAt(this.t);
    this.nodoPosOrientTubo.position.copy(posTemp);
    var tangente = this.path.getTangentAt(this.t);
    posTemp.add(tangente);
    var segmentoActual = Math.floor(this.t * this.segmentos);
    this.nodoPosOrientTubo.up = this.tubo.binormals[segmentoActual];
    this.nodoPosOrientTubo.lookAt(posTemp);

    this.createSonido();
    this.movimientoPrincipal();
    this.alternarVista();
    this.createColision();
    this.createRayCaster();
    this.personaje.scale.set(0.5, 0.5, 0.5);
    this.createSpeedParticles();
  }

  createCanon(){
    var material1 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,            // Color del material
      metalness: .8,               // Nivel de metalicidad (0: no metálico, 1: completamente metálico)
      roughness: 0.5,             // Rugosidad de la superficie (0: muy pulido, 1: muy rugoso)
      clearcoat: 0.5,             // Intensidad del recubrimiento claro (0: sin recubrimiento claro, 1: recubrimiento completo)
      clearcoatRoughness: 0.3,    // Rugosidad del recubrimiento claro (0: muy pulido, 1: muy rugoso)
      reflectivity: 1,            // Reflectividad del material (0: no reflectante, 1: completamente reflectante)
      ior: 1.5,                   // Índice de refracción (para simular efectos de refracción, por ejemplo, en vidrio)
      normalMap: new THREE.TextureLoader().load('../imgs/metalnormal.jpg'), // Mapa de normales
      normalScale: new THREE.Vector2(2, 2), // Escala del mapa de normales
  });
    var material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var material3 = new THREE.MeshPhysicalMaterial({
      normalMap: new THREE.TextureLoader().load('../imgs/metalnormal.jpg'),
      normalScale: new THREE.Vector2(1, 1),
      color: 0x05c5a8,
      metalness: .6,
      roughness: 0.5,
      clearcoat: 0.5,
      ior: 1.5,
  });

    //Creamos las geometrías
    var base = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12);
    var soporte = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 12);

    var semiSphere = new THREE.SphereGeometry(0.15, 16, 16);
    var cuboEliminar = new THREE.BoxGeometry(0.3, 0.3, 0.3);

    var semiCylynder = new THREE.CylinderGeometry(0.15, 0.15, 0.07, 12);

    var canon = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12);
    canon.translate(0, 0.15, 0);

    //Creamos los mesh
    var baseMesh = new THREE.Mesh(base, material1);
    var soporteMesh = new THREE.Mesh(soporte, material2);

    var semiSphereMesh = new THREE.Mesh(semiSphere, material3);
    var cuboEliminarMesh = new THREE.Mesh(cuboEliminar, material1);

    var semiCylynderMesh = new THREE.Mesh(semiCylynder, material2);

    this.canonMesh = new THREE.Mesh(canon, material1);
 
    //Posicionamos los mesh
    baseMesh.position.set(0, 0.15, 0);
    soporteMesh.position.set(0, 0.3, 0);

    cuboEliminarMesh.position.set(0, -0.15, 0);

    semiCylynderMesh.rotateZ(Math.PI/2);

    //canonMesh.geometry.scale(1, 0.7, 1);
    this.canonMesh.position.set(0, 0.35, 0);
    

    //Creamos un csg para crear la semicircunferencia
    var csg = new CSG();
    csg.subtract([semiSphereMesh, cuboEliminarMesh]);

    var csgMesh = csg.toMesh();
    csgMesh.position.set(0, 0.325, 0);

    //Reposicionamos el cuboEliminar
    cuboEliminarMesh.position.set(0, 0, -0.15);

    //Creamos otro csg para crear el semicilindro
    var csg2 = new CSG();
    csg2.subtract([semiCylynderMesh, cuboEliminarMesh]);

    cuboEliminarMesh.position.set(0, -0.15, 0);
    csg2.subtract([cuboEliminarMesh]);

    var csgMesh2 = csg2.toMesh();
    csgMesh2.position.set(0, 0.33, 0.005);


    //Creamos los object3D
    this.objetoSoporte = new THREE.Object3D();
    this.objetoSemiCircun = new THREE.Object3D();
    this.objetoSemiCylin = new THREE.Object3D();
    this.objetoCanon = new THREE.Object3D();

    this.objetoSemiCylin.add(this.canonMesh);
    this.objetoSemiCylin.add(csgMesh2);

    this.objetoSemiCircun.add(this.objetoSemiCylin);
    this.objetoSemiCircun.add(csgMesh);

    this.objetoSoporte.add(this.objetoSemiCircun);
    this.objetoSoporte.add(soporteMesh);

    this.objetoCanon.add(this.objetoSoporte);
    this.objetoCanon.add(baseMesh);

    this.objetoCanon.position.set(0, 0.8, -0.3);

    this.personaje.add(this.objetoCanon);
  }

  initMouseTracking() {
    var mouse = new THREE.Vector2();
    var lastMouseX = window.innerWidth / 2;
    var lastMouseY = window.innerHeight / 2;
  
    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 + 1;

      if (lastMouseX !== null) {
        var deltaX = event.clientX - lastMouseX;
        var deltaY = event.clientY - lastMouseY;
        var newYRotation = (this.objetoSemiCircun.rotation.y -= deltaX * 0.001);
        var newXRotation = -(this.canonMesh.rotation.x += deltaY * 0.0015);
         // Esto mueve el cañón horizontalmente
         if (newYRotation <= Math.PI*2 && newYRotation >= Math.PI){
          this.objetoSemiCircun.rotation.y = newYRotation;
        }

        // Esto mueve el cañón verticalmente
        if (newXRotation >= 0 && newXRotation <= Math.PI/2){
          this.canonMesh.rotation.x = newXRotation;
       }
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }
  }, false);
  }
  
  createLuzTrasera(){
    var caja = new THREE.BoxGeometry(0.2, 0.25, 0.1);
    var material = new THREE.MeshStandardMaterial({
      color: 0x555555,        // Color blanco
      metalness: 1,           // Nivel de metalidad
      roughness: 0.5,         // Nivel de rugosidad
    });
    var sujetador = new THREE.Mesh(caja, material);

    this.luz = new THREE.PointLight(0xff0000, 0, 10);
    var luminaria = new THREE.SphereGeometry(0.075, 12, 12);
    var material = new THREE.MeshPhysicalMaterial({ 
      color: 0xff0000,        // Color rojo
      emissive: 0xff0000,     // Emisión de luz roja
      emissiveIntensity: 0, // Intensidad de la emisión
      metalness: 0.5,         // Nivel de metalidad
      roughness: 0.5,          // Nivel de rugosidad
      //transmission:1,
      //thickness:0.01,
      //ior:2,
      transparent: true,
    });
    this.luz_trasera = new THREE.Mesh(luminaria, material);
    this.luz_trasera.add(sujetador);
    this.luz_trasera.add(this.luz);
    this.luz_trasera.position.set(0, 0.5, -1.5);
    this.personaje.add(this.luz_trasera);
  }

  setObstaculos(h){
    console.log(h);
    this.hijos = h;
  }

  createColision() {
    // Crea un nuevo Box3 para la colisión
    this.colision = new THREE.Box3();
    // Calcula las dimensiones del Box3 basándose en la geometría del personaje
    this.colision.setFromObject(this.personaje);
    // Crea un Box3Helper para visualizar el Box3
    var helper = new THREE.Box3Helper(this.colision, 0xffffff);
    helper.visible = true;
    // Añade el Box3Helper al personaje como hijo para que se mueva con él
    this.personaje.add(helper);
  }

  createRayCaster(){

    // Raycaster para detectar colisiones
    this.rayo = new THREE.Raycaster(
      new THREE.Vector3(0,0,-0.2),
      new THREE.Vector3(0, 0, 1),
      0,
      0.03
    );
    // Crea un rayo visual
  /*this.rayoVisual = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 1)]),
  new THREE.LineBasicMaterial({ color: 0xff0000 }) // Color rojo
);
this.rayoVisual.visible = true; // Oculta el rayo por defecto
this.add(this.rayoVisual); // Añade el rayo al raycaster
*/
    // PICKING
    this.raycaster = new THREE.Raycaster();
    document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
  }
/*
  actualizarRayoVisual() {
    this.rayoVisual.geometry.setFromPoints([this.rayo.ray.origin, this.rayo.ray.origin.clone().add(this.rayo.ray.direction)]);
  }
*/

  // Método para picking de monedas básicas y premium
  onDocumentMouseDown(event) {
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = 1 - 2 * (event.clientY / window.innerHeight);
    this.raycaster.setFromCamera(mouse, this.camera);
    var h = this.hijos.filter(hijo => hijo instanceof Moneda_Basica || hijo instanceof Moneda_Premium);
    var pickedObjects = this.raycaster.intersectObjects(h, true);

    if (pickedObjects.length > 0) {
      console.log("PICKING");
      var selectedObject = pickedObjects[0].object;
      var selectedPoint = pickedObjects[0].point;

      if(selectedObject.userData instanceof Moneda_Basica){
        console.log("Colisión con moneda básica");
        selectedObject.userData.picked();
        this.score += 1;
      }
      else if(selectedObject.userData instanceof Moneda_Premium && this.puntuar){
        this.puntuar = false;
        console.log("Colisión con moneda premium");
        selectedObject.userData.picked();
        this.score += 5;
        setTimeout(() =>{
          this.puntuar = true;
        },1500); // No volver a puntuar durante 1.5 segundos
      }
    }
  }

  createReloj() {
    this.reloj = new THREE.Clock();
  }

  createCamara() {
    // Crear un nodo para posicionar y orientar la cámara de tercera persona
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    // Recuerda: Todas las unidades están en metros
    // También se indica dónde se coloca
    this.camera.position.set(0, 2, -5);
    // Y hacia dónde mira
    var look = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(look);
    this.cameraController = new THREE.Object3D();
    this.cameraController.add(this.camera);
    this.personaje.add(this.cameraController);
  }
  
  // Método para crear el chasis del coche
  createChasis() {
    var ml = new MTLLoader();
    var ol = new OBJLoader();
    ml.load('../models/f1.mtl',
      (materials) => {
        ol.setMaterials(materials);
        ol.load('../models/f1.obj',
          (box) => {
            box.traverseVisible((o) => {
              if (o.isMesh) {
                if (o.material.name == "Material.001")
                  o.material.flatShading = true;
              }
            })
            box.scale.set(0.2, 0.2, 0.2); // Escalar
            box.translateY(0.3);// Moverlo un poco arriba
            this.personaje.add(box);
          }, null, null);
      });
  }

  // Método para crear el piloto del coche (Alonso)
  createAlonso() {
    var alonso = new THREE.Group();
    // Cabeza
    var sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    sphereGeometry.scale(1, 1.2, 1.5);
    var texture = new THREE.TextureLoader().load('../imgs/alonso.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1.2);
    var sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.scale.set(0.1, 0.1, 0.1);
    sphere.position.set(0, 0.7, 0);
    sphere.rotation.y -= Math.PI / 2;
    alonso.add(sphere);

    // Cuerpo
    var capsuleGeometry = new THREE.CapsuleGeometry(0.15, 0.1, 4, 8);
    capsuleGeometry.scale(1, 1.2, 1.1);
    var bodyMaterial = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('../imgs/mono.jpg'),
      roughness: 1,
      normalMap: new THREE.TextureLoader().load('../imgs/telanormal.jpg'),
    });
    var body = new THREE.Mesh(capsuleGeometry, bodyMaterial);
    body.position.set(0, 0.35, 0);
    body.rotation.y = Math.PI;
    alonso.add(body);

    // Brazos
    var armMaterial = new THREE.MeshStandardMaterial({ color: 0x037A68 });
    var handMaterial = new THREE.MeshStandardMaterial({ color: 0xFFE9D1 });

    // Brazo derecho
    var upperArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12);
    var lowerArmGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12);
    var jointGeometry = new THREE.SphereGeometry(0.05, 12, 12);
    var handGeometry = new THREE.SphereGeometry(0.05, 12, 12);

    this.upperArmR = new THREE.Mesh(upperArmGeometry, armMaterial);
    var lowerArmR = new THREE.Mesh(lowerArmGeometry, armMaterial);
    var elbowR = new THREE.Mesh(jointGeometry, armMaterial);
    var handR = new THREE.Mesh(handGeometry, handMaterial);

    this.upperArmR.position.set(0.2, 0.4, 0);
    this.upperArmR.rotation.z = Math.PI / 4;
    this.upperArmR.rotation.x = -Math.PI / 4;
    elbowR.position.set(0, -0.15, 0);
    elbowR.rotation.x = -Math.PI / 2;
    elbowR.rotation.z = -Math.PI / 4;
    lowerArmR.position.set(0, -0.15, 0);
    handR.position.set(0, -0.15, 0);

    this.upperArmR.add(elbowR);
    elbowR.add(lowerArmR);
    lowerArmR.add(handR);
    alonso.add(this.upperArmR);

    // Brazo izquierdo (espejo del derecho)
    this.upperArmL = new THREE.Mesh(upperArmGeometry, armMaterial);
    var lowerArmL = new THREE.Mesh(lowerArmGeometry, armMaterial);
    var elbowL = new THREE.Mesh(jointGeometry, armMaterial);
    var handL = new THREE.Mesh(handGeometry, handMaterial);

    this.upperArmL.position.set(-0.2, 0.4, 0);
    this.upperArmL.rotation.z = -Math.PI / 4;
    this.upperArmL.rotation.x = -Math.PI / 4;
    elbowL.position.set(0, -0.15, 0);
    elbowL.rotation.x = -Math.PI / 2;
    elbowL.rotation.z = Math.PI / 4;
    lowerArmL.position.set(0, -0.15, 0);
    handL.position.set(0, -0.15, 0);

    this.upperArmL.add(elbowL);
    elbowL.add(lowerArmL);
    lowerArmL.add(handL);
    alonso.add(this.upperArmL);

    //Casco
    var casco = this.createHelmet();
    casco.scale.y = 0.8;
    casco.position.set(0, 0.6, 0);
    alonso.add(casco);

    // General
    alonso.scale.set(0.6, 0.6, 0.6);
    alonso.position.set(0, 0.35, -0.05);
    this.personaje.add(alonso);
}

createHelmet() {
    var material = new THREE.MeshStandardMaterial({
        color: 0x037A68,
        metalness: 0.6,
        roughness: 0.5,
    });

    var visorMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.1,
        clearcoat: 1.0,
        transmission: 0.5, // Simula la transparencia con un toque metálico
        transparent: true,
        opacity: 0.5, // Opacidad baja
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 1,
        ior: 2.5, // Índice de refracción ajustado para simular un material metálico
    });

    // Geometrías
    var largeCapsule = new THREE.CapsuleGeometry(1, 2, 8, 12);
    var smallCapsule = new THREE.CapsuleGeometry(0.9, 1.9, 8, 12);
    var cube = new THREE.BoxGeometry(2, 2, 2);
    var visorCylinder = new THREE.CylinderGeometry(0.5, 0.5, 2, 12);
    visorCylinder.scale(1.5, 1, 1.175);

    // Meshes
    var largeCapsuleMesh = new THREE.Mesh(largeCapsule, material);
    var smallCapsuleMesh = new THREE.Mesh(smallCapsule, material);
    var cubeMesh = new THREE.Mesh(cube, material);
    var visorCylinderMesh = new THREE.Mesh(visorCylinder, material);

    // Posicionar el cubo y el cilindro
    smallCapsuleMesh.position.set(0, -0.1, 0);
    cubeMesh.position.set(0, -1, 0);
    visorCylinderMesh.position.set(0, 0.6, 0.9);
    visorCylinderMesh.rotation.x = Math.PI / 2;

    // Crear CSG y restar geometrías
    var csg = new CSG();
    csg.subtract([largeCapsuleMesh, smallCapsuleMesh, cubeMesh, visorCylinderMesh]);

    var helmetMesh = csg.toMesh();
    helmetMesh.geometry.scale(0.2, 0.2, 0.2);

    // Crear la visera
    var visorCSG = new CSG();
    var visorgeometry = visorCylinder.clone();
    visorgeometry.scale(0.25, 0.125, 0.2);
    var visorMesh = new THREE.Mesh(visorgeometry, visorMaterial);

    // Crear un cilindro para restar el sobrante
    var subtractCylinder = visorMesh.geometry.clone();
    var subtractCylinderMesh = new THREE.Mesh(subtractCylinder, visorMaterial);
    subtractCylinderMesh.position.set(0, 0, -0.05);

    visorCSG.subtract([visorMesh, subtractCylinderMesh]);

    var visorResultMesh = visorCSG.toMesh();
    visorResultMesh.position.set(0, 0.12, 0.12);

    // Agregar mini cilindros en las esquinas de la visera
    var hingeGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.025, 8);
    hingeGeometry.rotateZ(Math.PI / 2);
    var hingeMaterial = new THREE.MeshStandardMaterial( {
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.5,
  } );
  
    var hinge1 = new THREE.Mesh(hingeGeometry, hingeMaterial);
    var hinge2 = new THREE.Mesh(hingeGeometry, hingeMaterial);
    hinge2.rotation.y = Math.PI;

    hinge1.position.set(-0.2, 0.125, 0.1);
    hinge2.position.set(0.2, 0.125, 0.1);

    helmetMesh.add(hinge1);
    helmetMesh.add(hinge2);

    // Agrupar casco y visera
    var helmetGroup = new THREE.Group();
    helmetGroup.add(helmetMesh);
    helmetGroup.add(visorResultMesh);

    helmetGroup.position.set(0, 0, 0);
    return helmetGroup;
}

  createNeumatico() {
    var llanta = this.createLlanta();
    // Crear un toro estirado para representar el neumático
    var tireGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    tireGeometry.scale(1, 1, 2);
    tireGeometry.scale(0.35, 0.35, 0.35);
    tireGeometry.rotateY(Math.PI / 2);

    // Crear el material del neumático
    const material = new THREE.MeshStandardMaterial({
      color: 0x222222,
      normalMap: new THREE.TextureLoader().load('../imgs/normal-neu.png'), // Ruta del mapa normal
      metalness: 0.5,
      roughness: 0.5,
      normalScale: new THREE.Vector2(0.5, 0.5) // Ajustar la escala de la textura normal en X
    });

    var tire = new THREE.Mesh(tireGeometry, material);
    tire.add(llanta);
    return tire;
  }

  createLlanta() {
    // Crear un objeto por revolución
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1, 0);
    shape.lineTo(1, 0.1);
    shape.quadraticCurveTo(1, 0.2, 0.9, 0.3);
    shape.lineTo(0.1, 0.3);
    shape.lineTo(0,0.3);
  
    var geometry = new THREE.LatheGeometry(shape.getPoints(), 32);
    geometry.scale(0.2, 0.2, 0.2);
    geometry.rotateZ(-Math.PI / 2);
    var material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  createSonido(){
    this.aceleracion = new Audio('/sound/car-acceleration-inside-car.mp3');
    this.ralenti = new Audio('/sound/ralenti.mp3');
    this.ralenti.volume = 0.1;
    this.noEscudo = new Audio('/sound/noEscudo.mp3');
  }

  getCamara() {
    return this.camera;
  }

  createGUI(gui, titleGui) {
    // Controles para el tamaño, la orientación y la posición de la caja
    this.guiControls = {
      sizeX: 1.0,
      sizeY: 1.0,
      sizeZ: 1.0,

      rotX: 0.0,
      rotY: 0.0,
      rotZ: 0.0,

      posX: 0.0,
      posY: 0.0,
      posZ: 0.0,

      anim: false,
      // Un botón para dejarlo todo en su posición inicial
      // Cuando se pulse se ejecutará esta función.
      reset: () => {
        this.guiControls.sizeX = 1.0;
        this.guiControls.sizeY = 1.0;
        this.guiControls.sizeZ = 1.0;

        this.guiControls.rotX = 0.0;
        this.guiControls.rotY = 0.0;
        this.guiControls.rotZ = 0.0;

        this.guiControls.posX = 0.0;
        this.guiControls.posY = 0.0;
        this.guiControls.posZ = 0.0;
        this.guiControls.anim = false;
      }
    }

    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder(titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    // El método   listen()   permite que si se cambia el valor de la variable en código, el deslizador de la interfaz se actualice
    folder.add(this.guiControls, 'sizeX', 0.1, 5.0, 0.01).name('Tamaño X : ').listen();
    folder.add(this.guiControls, 'sizeY', 0.1, 5.0, 0.01).name('Tamaño Y : ').listen();
    folder.add(this.guiControls, 'sizeZ', 0.1, 5.0, 0.01).name('Tamaño Z : ').listen();

    folder.add(this.guiControls, 'rotX', 0.0, Math.PI / 2, 0.01).name('Rotación X : ').listen();
    folder.add(this.guiControls, 'rotY', 0.0, Math.PI / 2, 0.01).name('Rotación Y : ').listen();
    folder.add(this.guiControls, 'rotZ', 0.0, Math.PI / 2, 0.01).name('Rotación Z : ').listen();

    folder.add(this.guiControls, 'posX', -20.0, 20.0, 0.01).name('Posición X : ').listen();
    folder.add(this.guiControls, 'posY', 0.0, 10.0, 0.01).name('Posición Y : ').listen();
    folder.add(this.guiControls, 'posZ', -20.0, 20.0, 0.01).name('Posición Z : ').listen();
    folder.add(this.guiControls, 'anim').name('Girar: ').listen();
    folder.add(this.guiControls, 'reset').name('[ Reset ]');
  }

  movimientoPrincipal() {
    var luz_freno = new THREE.Color(0xff0000);
    var color_bombilla = new THREE.Color(0xaaaaaa);
    var luz_blanca = new THREE.Color(0xffffff);
    // Lógica de movimiento del personaje
    // Actualiza la velocidad según la entrada del usuario
    document.addEventListener('keydown', (event) => {
      if (event.key === 'w' || event.key === KeyCode.KEY_UP) {
        this.desacelerar = false;
        // Acelera hacia adelante
        this.speed += this.acceleration;
        this.speed = Math.min(this.speed, this.maxSpeed); // Limita la velocidad máxima
      } else if (event.key === 's'|| event.key == KeyCode.KEY_DOWN) {
        this.luz_trasera.material.emissiveIntensity = 1;
        if(this.speed < 0){
          this.luz.color = luz_blanca;
          this.luz_trasera.material.emissive = color_bombilla;
        }
        else{
          this.luz_trasera.material.emissive = luz_freno;
          this.luz.color = luz_freno;
        }

        this.luz.intensity = 1;
        this.desacelerar = false;
        // Desacelera o retrocede
        this.speed -= this.acceleration*2;
        this.speed = Math.max(this.speed, this.minSpeed); // Limita la velocidad mínima
      } else if ((event.key == 'a' || event.key == KeyCode.KEY_LEFT) && this.speed != 0) {
        // Aplica rotación hacia la izquierda si hay velocidad
        this.rotacionLateral = this.speed > 0 ? -this.speed : this.speed;
      } else if ((event.key == 'd' || event.key == KeyCode.KEY_RIGHT) && this.speed != 0) {
        // Aplica rotación hacia la derecha si hay velocidad
        this.rotacionLateral =  this.speed<0? -this.speed : this.speed; 
      }

      if((event.key == 'a' || event.key == 'd') && this.speed != 0){
        this.desgirar = false;
        this.movimientoLateral.rotateZ(this.rotacionLateral*Math.PI);
      }

    });

    document.addEventListener('keyup', (event) => {
      if (event.key == 'w' || event.key == 's' || event.key == KeyCode.KEY_UP || event.key == KeyCode.KEY_DOWN) {
        // Detiene la rotación lateral cuando se suelta la tecla
        this.desacelerar = true;

        if(this.speed == 0){
          this.ralenti.play();
        }
      }
      if(event.key == 's'){
        this.luz_trasera.material.emissiveIntensity = 0;
        this.luz.intensity = 0;
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.key == 'a' || event.key == 'd' || event.key == KeyCode.KEY_LEFT || event.key == KeyCode.KEY_RIGHT) {
        // Detiene la rotación lateral cuando se suelta la tecla
        this.desgirar = true;
      }
    });
  }

  alternarVista(){
    var c = false;
    document.addEventListener('keydown', (event) => {
      if(event.key == 'c'){
          this.cameraController.rotation.x = 0;
          this.cameraController.position.set(0, 0, 0);
          this.cameraController.rotation.y = (Math.PI);
      }
    });
    document.addEventListener('keyup', (event) => {
      if(event.key == 'c'){
          if(!c){
          this.cameraController.rotation.x = 0;
          this.cameraController.position.set(0, 0, 0);
        } else{
          this.cameraController.rotation.x = -0.06;
          this.cameraController.position.set(0, -1.05, 5.1);
        }
        this.cameraController.rotation.y = 0;
      }
    });
    document.addEventListener('keydown', (event) => {
      if(event.key == 'v'){
        c = !c;
        if(c){
          this.cameraController.rotation.x = -0.06;
          this.cameraController.position.set(0, -1.05, 5.1);
        } else{
          this.cameraController.rotation.x = 0;
          this.cameraController.position.set(0, 0, 0);
        }
      }
    });
  }

  createSpeedParticles() {
    const particles = new THREE.Group();
    const particleMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < 50; i++) {
        const particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            0, 0, 0,
            0, 0, 5 // Línea horizontal de longitud 1
        ]);
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        const particle = new THREE.Line(particleGeometry, particleMaterial);
        
        // Posicionar partículas aleatoriamente alrededor del coche
        particle.position.set(
            (Math.random() - 0.5) * 5, 
            (Math.random() - 0.5) * 5, 
            (Math.random() - 0.5) * 2
        );

        particles.add(particle);
    }

    this.speedParticles = particles;
    this.speedParticles.visible = false;
    this.personaje.add(this.speedParticles);
}



updateSpeedParticles() {
  if (this.speedParticles.visible) {
      this.speedParticles.children.forEach(particle => {
          // Hacer que las partículas se muevan hacia atrás
          //particle.position.z -= 0.1; // Ajusta la velocidad del movimiento
          particle.position.x += (Math.random() - 0.5) * 0.05;
          particle.position.y += (Math.random() - 0.5) * 0.05;
      });
  }
}


  // Método para compronar si el personaje ha colisionado con un obstáculo y actuar en consecuencia
  updateRayo(){
    // Actualiza la posición del rayo
    this.personaje.getWorldPosition(this.pos);
    // Actualiza la dirección del rayo
    this.personaje.getWorldDirection(this.direccion);
    // Actualiza la posición del rayo y su dirección
    this.rayo.set(this.pos, this.direccion.normalize());
    // Calcula los objetos impactados por el rayo
    var impactados = this.rayo.intersectObjects(this.hijos, true);
    // Si hay impactos y la distancia al primer objeto es menor que 0.5
    if (impactados.length > 0 && impactados[0].distance < 0.5) {
      // Si el objeto impactado es un cono de tráfico
      if (impactados[0].object.userData instanceof Cono_Trafico && !this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          this.timeout = false;
        }, 3000);

        console.log("Colisión con un cono de tráfico");

        if (this.tengoEscudo) {
          this.noEscudo.play();
          this.tengoEscudo = false;
        }
        else{
          impactados[0].object.userData.colision();
          this.speed *= 0.2; // Reduce la velocidad
          if(this.score > 0)
          this.score -= 1;
          else this.score = 0;
        }
      }
      // Si el objeto impactado es un neumático
      else if (impactados[0].object.userData instanceof Neumatico && !this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          this.timeout = false;
        }, 3000);

        console.log("Colisión con neumatico");

        if (this.tengoEscudo) {
          this.noEscudo.play();
          this.tengoEscudo = false;
        }
        else{
          this.speed = 0; // Paramos el personaje por completo
          impactados[0].object.userData.colision();
          //Simular choque
          var origen = { rot: 0};
          var destino = { rot: Math.PI/8 };
          // Crear una animación de choque y recuperación
          var tween = new TWEEN.Tween(origen).to(destino, 500);
          tween.easing(TWEEN.Easing.Quadratic.InOut);
          tween.onUpdate(() => {
              this.personaje.rotation.x = origen.rot;
          });
          tween.start();
          setTimeout(() => {
          origen = { rot: Math.PI/8};
          destino = {rot: 0};
          var tween = new TWEEN.Tween(origen).to(destino, 500);
          tween.easing(TWEEN.Easing.Linear.None);
          tween.onUpdate(() => {
              this.personaje.rotation.x = origen.rot;
          });
          tween.start();
          },500);
        }
      }
      // Si el objeto impactado es una rampa y no estamos saltando y la velocidad es positiva
      else if (impactados[0].object.userData instanceof Rampa && !this.salto && this.speed > 0) {
        this.salto = true;
        this.speed *=1.5;
        var origen = { y: this.radio, rot: 0};
        var destino = { y: this.radio + 1, rot: -Math.PI/4 };
        // Crear una animación de salto y caída
        var tween = new TWEEN.Tween(origen).to(destino, 500);
        tween.easing(TWEEN.Easing.Quadratic.InOut);
        tween.onUpdate(() => {
            this.posSuperficie.position.y = origen.y;
            this.personaje.rotation.x = origen.rot;
        });
        tween.start();
        impactados[0].object.userData.colision();
        setTimeout(() => {
        origen = { y: this.radio+1, rot: -Math.PI/4};
        destino = { y: this.radio, rot: 0};
        var tween = new TWEEN.Tween(origen).to(destino, 500);
        tween.easing(TWEEN.Easing.Linear.None);
        tween.onUpdate(() => {
            this.posSuperficie.position.y = origen.y;
            this.personaje.rotation.x = origen.rot;
        });
        tween.start();
        },500);
        console.log("Colisión con rampa");
        setTimeout(() => {
          // Vuelve a la velocidad normal
          this.speed /= 1.5;
          this.salto = false;
        }, 1000);// Tiempo de salto 1 segundo
      }
      else if (impactados[0].object.userData instanceof Punto_Escudo && !this.tengoEscudo) {
        console.log("Colisión con punto de escudo");
        impactados[0].object.userData.colision();
        this.tengoEscudo = true;
      }
      else if (impactados[0].object.userData instanceof Impulsor && !this.timeout && this.speed > 0){
        this.timeout = true;
        console.log("Colisión con impulsor");
        impactados[0].object.userData.colision();
        this.speed = this.maxSpeed;
        this.impulso = true;
        setTimeout(() => {
          this.impulso = false;
          this.speedParticles.visible = false;
        }, 1500);
        setTimeout(() => {
          this.timeout = false;
        }, 500);
      }
    }
  }

  animate() {
    if(this.speed != 0){
      this.n1.geometry.rotateX(this.speed*2*Math.PI);
      this.n2.geometry.rotateX(this.speed*2*Math.PI);
      this.n3.geometry.rotateX(this.speed*2*Math.PI);
      this.n4.geometry.rotateX(this.speed*2*Math.PI);
    }
    if(!this.desgirar && this.rotacionLateral > 0){
      // Alonso gira a la derecha
      this.upperArmR.rotation.x -= this.rotacionLateral;
      this.upperArmR.rotation.x = Math.max(this.upperArmR.rotation.x, -Math.PI/3.5);
      this.upperArmL.rotation.x += this.rotacionLateral;
      this.upperArmL.rotation.x = Math.min(this.upperArmL.rotation.x, -Math.PI/6);
      // Ruedas giran a la derecha
      this.n1.rotation.y -= this.rotacionLateral;
      this.n1.rotation.y = Math.max(this.n1.rotation.y, -Math.PI/4);
      this.n2.rotation.y -= this.rotacionLateral;
      this.n2.rotation.y = Math.max(this.n2.rotation.y, -Math.PI/4);
    } else if (!this.desgirar && this.rotacionLateral < 0) {
      // Alonso gira a la izquierda
      this.upperArmR.rotation.x -= this.rotacionLateral;
      this.upperArmR.rotation.x = Math.min(this.upperArmR.rotation.x, -Math.PI/6);
      this.upperArmL.rotation.x -= this.rotacionLateral;
      this.upperArmL.rotation.x = Math.min(this.upperArmL.rotation.x, -Math.PI/3.5);
      // Ruedas giran a la izquierda
      this.n1.rotation.y -= this.rotacionLateral; // Resta porque la rotación lateral es negativa
      this.n1.rotation.y = Math.min(this.n1.rotation.y, Math.PI / 4); // Limita la rotación en el rango
      this.n2.rotation.y -= this.rotacionLateral; // Resta porque la rotación lateral es negativa
      this.n2.rotation.y = Math.min(this.n2.rotation.y, Math.PI / 4); // Limita la rotación en el rango
  } else{
    if(this.desgirar && this.rotacionLateral > 0){
      // Alonso gira vuelve a la posición inicial
      this.upperArmR.rotation.x = -Math.PI/4;
      this.upperArmL.rotation.x = -Math.PI/4;

      this.n1.rotation.y -= this.friction;
      this.n1.rotation.y = Math.max(this.rotacionLateral, 0); // Velocidad mínima es cero
      this.n2.rotation.y -= this.friction;
      this.n2.rotation.y = Math.max(this.rotacionLateral, 0); // Velocidad mínima es cero
  }else if(this.desgirar && this.rotacionLateral < 0){

    // Alonso gira vuelve a la posición inicial
    this.upperArmR.rotation.x = -Math.PI/4;
    this.upperArmL.rotation.x = -Math.PI/4;
    
      this.n1.rotation.y += this.friction;
      this.n1.rotation.y = Math.min(this.rotacionLateral, 0); // Velocidad máxima es cero
      this.n2.rotation.y += this.friction;
      this.n2.rotation.y = Math.min(this.rotacionLateral, 0); // Velocidad máxima es cero
  }
  }
}


  update() {
    this.updateRayo();
    if(this.impulso){
      this.speedParticles.visible = true;
      this.updateSpeedParticles();
    }
    //this.actualizarRayoVisual();
    this.animate();

    if(this.speed == 0){
      this.aceleracion.pause();
      this.ralenti.play();
    } else{
      this.aceleracion.play();
      this.ralenti.pause();
    }

    if (this.desacelerar) {
      if (this.speed > 0) {
        this.speed -= this.friction;
        this.speed = Math.max(this.speed, 0); // Velocidad mínima es cero
      } else if (this.speed < 0) {
        this.speed += this.friction;
        this.speed = Math.min(this.speed, 0); // Velocidad máxima es cero
      }
    }
    if(this.desgirar){
      if(this.rotacionLateral > 0){
        this.rotacionLateral -= this.friction;
        this.rotacionLateral = Math.max(this.rotacionLateral, 0); // Velocidad mínima es cero
      }else if(this.rotacionLateral < 0){
        this.rotacionLateral += this.friction;
        this.rotacionLateral = Math.min(this.rotacionLateral, 0); // Velocidad máxima es cero
      }
    }
    // Comprobamos que el personaje haya recorrido media vuelta al menos
    if(this.t >= 0.5 && this.t < 0.65 && !this.mitad){
      this.mitad = true;
    }
    // Comprobamos que el personaje haya recorrido una vuelta entera y le aumentamos la velocidad máxima
    if(this.t >= 0 && this.t <= 0.1 && this.mitad){
      this.vueltas++; this.mitad = false;
      this.maxSpeed *= 1.1;
      this.activaVuelta = true;
    }
    // Actualiza la posición del personaje según la velocidad
    this.t = (this.t + this.speed * this.reloj.getDelta()) % 1.0;
    if (this.t < 0) this.t = 1 + this.t;
    var posTemp = this.path.getPointAt(this.t);
    this.nodoPosOrientTubo.position.copy(posTemp);
    var tangente = this.path.getTangentAt(this.t);
    posTemp.add(tangente);
    var segmentoActual = Math.floor(this.t * this.segmentos);
    this.nodoPosOrientTubo.up = this.tubo.binormals[segmentoActual];
    this.nodoPosOrientTubo.lookAt(posTemp);

    TWEEN.update();
  }
}

export { Personaje };
