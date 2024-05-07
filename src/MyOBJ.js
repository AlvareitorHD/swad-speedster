import * as THREE from '../libs/three.module.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'

class Personaje extends THREE.Object3D {
  constructor(gui, titleGui, c) {
    var circuito = c.tubeGeometry;
    super();
    this.personaje = new THREE.Group();
    // Se crea la parte de la interfaz que corresponde a la caja
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui, titleGui);
    this.createChasis();
    this.createAlonso();

    this.rot = 0;
    
    var n1 = this.createNeumatico();
    n1.position.set(0.55, 0.2, 0.82); // Posicionar
    this.personaje.add(n1);
    var n2 = this.createNeumatico();
    n2.position.set(-0.55, 0.2, 0.82); // Posicionar
    this.personaje.add(n2);
    var n3 = this.createNeumatico();
    n3.position.set(0.55, 0.2, -1.22); // Posicionar
    this.personaje.add(n3);
    var n4 = this.createNeumatico();
    n4.position.set(-0.55, 0.2, -1.22); // Posicionar
    this.personaje.add(n4);

    this.personaje.scale.set(0.5,0.5,0.5);

    this.nodoPosOrientTubo = new THREE.Object3D();
    this.movimientoLateral = new THREE.Object3D();
    this.posSuperficie = new THREE.Object3D();
    this.posSuperficie.position.y = circuito.parameters.radius;
    
    this.add(this.nodoPosOrientTubo);
    this.nodoPosOrientTubo.add(this.movimientoLateral);
    this.movimientoLateral.add(this.posSuperficie);
    this.movimientoLateral.rotateZ(Math.PI/2);
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
  }

  createCamara(){
    // Crear un nodo para posicionar y orientar la cámara de tercera persona
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
    // Recuerda: Todas las unidades están en metros
    // También se indica dónde se coloca
    this.camera.position.set (0, 2, -2);
    // Y hacia dónde mira
    var look = new THREE.Vector3 (0,0,2);
    this.camera.lookAt(look);
    this.cameraController = new THREE.Object3D();
    this.cameraController.add(this.camera);
    this.personaje.add(this.cameraController);
  }

  createChasis(){

    var ml = new MTLLoader();
    var ol = new OBJLoader();
    ml.load('../models/f1.mtl',
      (materials) => {
        ol.setMaterials(materials);
        ol.load('../models/f1.obj',
          (box) => {
            box.traverseVisible((o)=>{
              if(o.isMesh){
                if(o.material.name == "Material.001")
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
    sphere.rotation.y -= Math.PI/2; // Rotar
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

  update() {
    // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
    // Primero, el escalado
    // Segundo, la rotación en Z
    // Después, la rotación en Y
    // Luego, la rotación en X
    // Y por último la traslación
    this.t = (this.t +0.0001)%1;
    var posTemp = this.path.getPointAt(this.t);
    this.nodoPosOrientTubo.position.copy(posTemp);
    var tangente = this.path.getTangentAt(this.t);
    posTemp.add(tangente);
    var segmentoActual = Math.floor(this.t * this.segmentos);
    this.nodoPosOrientTubo.up = this.tubo.binormals[segmentoActual];
    this.nodoPosOrientTubo.lookAt(posTemp);
    /*this.position.set(this.guiControls.posX, this.guiControls.posY, this.guiControls.posZ);
    if (this.guiControls.anim) {
      this.rot = (this.rot + 0.01) % (Math.PI * 2);
      this.rotation.set(this.guiControls.rotX, this.rot, this.guiControls.rotZ);
    } else {
      this.rotation.set(this.guiControls.rotX, this.guiControls.rotY, this.guiControls.rotZ);
    }
    this.scale.set(this.guiControls.sizeX, this.guiControls.sizeY, this.guiControls.sizeZ);*/
  }
}

export { Personaje };
