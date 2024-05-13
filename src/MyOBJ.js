import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import * as KeyCode from '../libs/keycode.esm.js'
import { Cono_Trafico } from './Cono_Trafico/Cono_Trafico.js';
import { Neumatico } from './Neumatico/Neumatico.js';
import { Tween } from '../libs/tween.esm.js';
import { Moneda_Basica } from './Moneda_Basica/Moneda_Basica.js';
import { Moneda_Premium } from './Moneda_Premium/Moneda_Premium.js';

class Personaje extends THREE.Object3D {
  constructor(gui, titleGui, c) {

    super();

    var circuito = c.tubeGeometry;
    this.circuito = c;

    this.speed = 0; // Velocidad inicial del personaje
    this.acceleration = 0.0005; // Aceleración del personaje
    this.maxSpeed = 0.075; // Velocidad máxima del personaje
    this.minSpeed = -0.005; // Velocidad mínima del personaje (puede ser negativa para retroceder)
    this.friction = 0.0001; // Fricción para la desaceleración del personaje
    this.rotacionLateral = 0; // Rotación lateral del personaje
    this.desacelerar = false; // Bandera para desacelerar
    this.desgirar = false; // Bandera para desacelerar el giro
    
    this.personaje = new THREE.Group();
    this.createGUI(gui, titleGui);
    this.createChasis();
    this.createAlonso();
    this.createReloj();
    this.createCamara();

    this.rot = 0;

    this.n1 = this.createNeumatico();
    this.n1.position.set(0.55, 0.2, 0.82); // Posicionar
    this.personaje.add(this.n1);
    this.n2 = this.createNeumatico();
    this.n2.position.set(-0.55, 0.2, 0.82); // Posicionar
    this.personaje.add(this.n2);
    this.n3 = this.createNeumatico();
    this.n3.position.set(0.55, 0.2, -1.22); // Posicionar
    this.personaje.add(this.n3);
    this.n4 = this.createNeumatico();
    this.n4.position.set(-0.55, 0.2, -1.22); // Posicionar
    this.personaje.add(this.n4);

    this.personaje.scale.set(0.5, 0.5, 0.5);
    this.nodoPosOrientTubo = new THREE.Object3D();
    this.movimientoLateral = new THREE.Object3D();
    this.posSuperficie = new THREE.Object3D();
    this.posSuperficie.position.y = circuito.parameters.radius;

    this.add(this.nodoPosOrientTubo);
    this.nodoPosOrientTubo.add(this.movimientoLateral);
    this.movimientoLateral.add(this.posSuperficie);
    this.movimientoLateral.rotateZ(Math.PI / 2);
    this.posSuperficie.add(this.personaje);
    //pergarlo al tubo
    this.t = 0;
    this.tubo = circuito;
    this.path = circuito.parameters.path;
    this.radio = circuito.parameters.radius;
    this.segmentos = circuito.parameters.tubularSegments;

    var posTemp = this.path.getPointAt(this.t);
    this.nodoPosOrientTubo.position.copy(posTemp);
    var tangente = this.path.getTangentAt(this.t);
    posTemp.add(tangente);
    var segmentoActual = Math.floor(this.t * this.segmentos);
    this.nodoPosOrientTubo.up = this.tubo.binormals[segmentoActual];
    this.nodoPosOrientTubo.lookAt(posTemp);

    this.movimientoPrincipal();
    this.alternarVista();
    this.createColision();
    this.createRayCaster();
    
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
    this.rayo = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0,
      0.01
    );
    this.raycaster = new THREE.Raycaster();
    document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
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
      }
      else if(selectedObject.userData instanceof Moneda_Premium){
        console.log("Colisión con moneda premium");
        selectedObject.userData.picked();
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
    return tire;
  }

  createLlanta() {
    // Crear un objeto por revolución
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
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
        this.desacelerar = false;
        // Desacelera o retrocede
        this.speed -= this.acceleration;
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
        this.movimientoLateral.rotateZ(this.rotacionLateral);
      }

    });

    document.addEventListener('keyup', (event) => {
      if (event.key == 'w' || event.key == 's' || event.key == KeyCode.KEY_UP || event.key == KeyCode.KEY_DOWN) {
        // Detiene la rotación lateral cuando se suelta la tecla
        this.desacelerar = true;
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
    this.rayo.set(pos, new THREE.Vector3(0, 0, 1).normalize());
    var impactados = this.rayo.intersectObjects(this.hijos, true);
    if (impactados.length > 0) {
      if (impactados[0].object.userData instanceof Cono_Trafico && !this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          this.timeout = false;
        }, 3000);
        impactados[0].object.userData.colision();
        console.log("Colisión con un cono de tráfico");
        this.speed *= 0.2; // Reduce la velocidad           
      }
      else if (impactados[0].object.userData instanceof Neumatico && !this.timeout) {
        this.timeout = true;
        setTimeout(() => {
          this.timeout = false;
        }, 3000);
        console.log("Colisión con neumatico");
        this.speed = 0; // Reduce la velocidad
      }
    }
  }

  animate() {
    if(this.speed != 0){
      this.n1.rotation.x += this.speed*2*Math.PI;
      this.n2.rotation.x += this.speed*2*Math.PI;
      this.n3.rotation.x += this.speed*2*Math.PI;
      this.n4.rotation.x += this.speed*2*Math.PI;
    }
  }

  update() {
    this.updateRayo();

    this.animate();

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
  }
}

export { Personaje };
