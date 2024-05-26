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

import { CSG } from '../libs/CSG.js';

class Personaje extends THREE.Object3D {
  constructor(gui, titleGui, c) {

    super();

    var circuito = c.tubeGeometry;
    this.circuito = c;
    this.vueltas = 0;
    this.mitad = false;
    this.score = 0;
    this.puntuar = true;

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
    
  }

  createCanon(){
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    //Creamos las geometrías
    var base = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 32);
    var soporte = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32);
    var semiSphere = new THREE.SphereGeometry(0.15, 32, 32);
    var cuboEliminar = new THREE.BoxGeometry(0.15, 0.15, 0.15);

    //Creamos los mesh
    var baseMesh = new THREE.Mesh(base, material);
    var soporteMesh = new THREE.Mesh(soporte, material);

    var semiSphereMesh = new THREE.Mesh(semiSphere, material);
    var cuboEliminarMesh = new THREE.Mesh(cuboEliminar, material);

    //Posicionamos los mesh
    baseMesh.position.set(0, 0.95, -0.3);
    soporteMesh.position.set(0, 1.1, -0.3);

    cuboEliminarMesh.position.set(0, 0.075, 0);

    var csg = new CSG();
    csg.subtract([semiSphereMesh, cuboEliminarMesh]);

    //Creamos los object3D
    var objetoSoporte = new THREE.Object3D();
    var objetoSemi = new THREE.Object3D();

    objetoSoporte.add(baseMesh);
    objetoSoporte.add(soporteMesh);

    objetoSemi.add(objetoSoporte);
    objetoSemi.add(csg.toMesh());

    this.personaje.add(objetoSemi);
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
    var luminaria = new THREE.SphereGeometry(0.075, 16, 16);
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
  this.rayoVisual = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 1)]),
  new THREE.LineBasicMaterial({ color: 0xff0000 }) // Color rojo
);
this.rayoVisual.visible = true; // Oculta el rayo por defecto
this.add(this.rayoVisual); // Añade el rayo al raycaster

    // PICKING
    this.raycaster = new THREE.Raycaster();
    document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
  }

  actualizarRayoVisual() {
    this.rayoVisual.geometry.setFromPoints([this.rayo.ray.origin, this.rayo.ray.origin.clone().add(this.rayo.ray.direction)]);
  }

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
        },1000); //Aumenta el giro de la moneda durante un 1 segundo
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

  createAlonso() {
    // Crear una esfera escalada en Y
    var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);//THREE.CapsuleGeometry(1,0.5,64,32);
    sphereGeometry.scale(1, 1.2, 1.5);
    //sphereGeometry.scale(1,0.5,1);
    var texture = new THREE.TextureLoader().load('../imgs/alonso.jpg');
    // Ajustar las propiedades de repetición de la textura para evitar estiramiento
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1.2); // Ajustar la repetición en Y según tus necesidades
    var sphereMaterial = new THREE.MeshStandardMaterial({
      map: texture
    });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.scale.set(0.1, 0.1, 0.1); // Escalar
    sphere.position.set(0, 0.7, 0.1); // Posicionar
    sphere.rotation.y -= Math.PI / 2; // Rotar
    this.personaje.add(sphere);
  }

  createNeumatico() {
    var llanta = this.createLlanta();
    // Crear un toro estirado para representar el neumático
    var tireGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
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
          this.luz.color = new THREE.Color(0xffffff);
          this.luz_trasera.material.emissive = new THREE.Color(0xaaaaaa);
        }
        else{
          this.luz_trasera.material.emissive = new THREE.Color(0xff0000);
          this.luz.color = new THREE.Color(0xff0000);
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
    document.addEventListener('keydown', (event) => {
      if(event.key == 'c'){
        this.cameraController.rotation.y = (Math.PI);
      }
    });
    document.addEventListener('keyup', (event) => {
      if(event.key == 'c'){
        this.cameraController.rotation.y = 0;
      }
    });

    document.addEventListener('keydown', (event) => {
      if(event.key == 'v'){
        this.cameraController.rotation.x = -0.005;
        this.cameraController.position.set(0, -1.2, 5.12);
      }
    });
    document.addEventListener('keyup', (event) => {
      if(event.key == 'v'){
        this.cameraController.rotation.x = 0;
        this.cameraController.position.set(0, 0, 0);
      }
    });
  }

  updateRayo(){
    var pos = new THREE.Vector3();
    this.personaje.getWorldPosition(pos);
    var direccion = new THREE.Vector3();
    this.personaje.getWorldDirection(direccion);
    this.rayo.set(pos, direccion.normalize());
    var impactados = this.rayo.intersectObjects(this.hijos, true);
    if (impactados.length > 0 && impactados[0].distance < 0.5) {
      if (impactados[0].object.userData instanceof Cono_Trafico && !this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          this.timeout = false;
        }, 3000);
        impactados[0].object.userData.colision();
        console.log("Colisión con un cono de tráfico");
        this.speed *= 0.2; // Reduce la velocidad
        if(this.score > 0)
        this.score -= 1;
        else this.score = 0;
      }
      else if (impactados[0].object.userData instanceof Neumatico && !this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          this.timeout = false;
        }, 3000);
        console.log("Colisión con neumatico");
        this.speed = 0; // Reduce la velocidad
        impactados[0].object.userData.colision();
        //Simular choque
        var origen = { rot: 0};
        var destino = { rot: Math.PI/8 };
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
      else if (impactados[0].object.userData instanceof Rampa && !this.salto && this.speed > 0) {
        this.salto = true;
        this.speed *=1.5;
        var origen = { y: this.radio, rot: 0};
        var destino = { y: this.radio + 1, rot: -Math.PI/4 };
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
          this.speed /= 1.5;
          this.salto = false;
        }, 1000);//3 segundos
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
      this.n1.rotation.y -= this.rotacionLateral;
      this.n1.rotation.y = Math.max(this.n1.rotation.y, -Math.PI/4);
      this.n2.rotation.y -= this.rotacionLateral;
      this.n2.rotation.y = Math.max(this.n2.rotation.y, -Math.PI/4);
    } else if (!this.desgirar && this.rotacionLateral < 0) {
      this.n1.rotation.y -= this.rotacionLateral; // Resta porque la rotación lateral es negativa
      this.n1.rotation.y = Math.min(this.n1.rotation.y, Math.PI / 4); // Limita la rotación en el rango
      this.n2.rotation.y -= this.rotacionLateral; // Resta porque la rotación lateral es negativa
      this.n2.rotation.y = Math.min(this.n2.rotation.y, Math.PI / 4); // Limita la rotación en el rango
  } else{
    if(this.desgirar && this.rotacionLateral > 0){
      this.n1.rotation.y -= this.friction;
      this.n1.rotation.y = Math.max(this.rotacionLateral, 0); // Velocidad mínima es cero
      this.n2.rotation.y -= this.friction;
      this.n2.rotation.y = Math.max(this.rotacionLateral, 0); // Velocidad mínima es cero
  }else if(this.desgirar && this.rotacionLateral < 0){
      this.n1.rotation.y += this.friction;
      this.n1.rotation.y = Math.min(this.rotacionLateral, 0); // Velocidad máxima es cero
      this.n2.rotation.y += this.friction;
      this.n2.rotation.y = Math.min(this.rotacionLateral, 0); // Velocidad máxima es cero
  }
  }
}


  update() {
    this.updateRayo();
    this.actualizarRayoVisual();
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
    if(this.t >= 0.5 && this.t < 0.65 && !this.mitad){
      this.mitad = true;
      console.log("Mitad del circuito");
    }
    if(this.t >= 0 && this.t <= 0.1 && this.mitad){
      this.vueltas++; this.mitad = false; console.log("Vuelta completada");
      this.maxSpeed *= 1.1;
      this.activaVuelta = true;
    }
    // Actualiza la posición del personaje según la velocidad
    this.t = (this.t + this.speed * this.reloj.getDelta()) % 1;
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
