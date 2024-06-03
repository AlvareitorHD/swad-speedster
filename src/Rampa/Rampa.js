import * as THREE from '../../libs/three.module.js'

import { CSG } from '../../libs/CSG-v2.js'

class Rampa extends THREE.Object3D{
    constructor(c,t,rot) {
        super();
        var circuito = c.tubeGeometry;
        //Creamos los materiales
        var texture = new THREE.TextureLoader().load('../../imgs/rampa.webp');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1,1);
        texture.rotation = -Math.PI/2;

        var Mat = new THREE.MeshStandardMaterial({map: texture});
        
        //Creamos las geometrias
        var rampa = new THREE.BoxGeometry(2, 1, 1);

        var subs = new THREE.BoxGeometry(4, 1, 1);

        //Se posiciona y se orienta
        subs.rotateZ(Math.PI/8);
        subs.translate(0, 0.45, 0);

        // Un Mesh se compone de geometría y material
        var rampaMesh = new THREE.Mesh(rampa, Mat);
        var subsMesh = new THREE.Mesh(subs, Mat);

        //Creamos el csg
        var csg = new CSG();
        csg.subtract([rampaMesh, subsMesh]);

        this.rampa = csg.toMesh();
        this.rampa.userData = this;
        this.rampa.geometry.scale(1, 0.5, 1);
        this.rampa.geometry.translate(0, 0.225, 0);
        this.rampa.geometry.rotateY(-Math.PI/2);
        // Y añadirlo como hijo del Object3D (el this)
        this.add(this.rampa);
        this.posicionar(circuito,t,rot);
        this.createColision();
        this.sonido = new Audio('/sound/rampa.mp3' );
    }

    colision(){
      this.sonido.play();
    }

    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this.rampa);
      var boxHelper = new THREE.Box3Helper(box, 0xffff00);
      boxHelper.visible = false;
      boxHelper.userData = this;
      this.rampa.add(boxHelper);
    }

    posicionar(circuito,ti,rot){
      this.nodoPosOrientTubo = new THREE.Object3D();
      this.movimientoLateral = new THREE.Object3D();
      this.posSuperficie = new THREE.Object3D();
      this.posSuperficie.position.y = circuito.parameters.radius;
  
      this.add(this.nodoPosOrientTubo);
      this.nodoPosOrientTubo.add(this.movimientoLateral);
      this.movimientoLateral.add(this.posSuperficie);
      this.movimientoLateral.rotateZ(rot);
      this.posSuperficie.add(this.rampa);
      //pergarlo al tubo
      this.t = ti;
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

    createGUI (gui,titleGui) {
        // Controles para el tamaño, la orientación y la posición de la caja
        this.guiControls = {
          sizeX : 1.0,
          sizeY : 1.0,
          sizeZ : 1.0,
          
          rotX : 0.0,
          rotY : 0.0,
          rotZ : 0.0,
          
          posX : 0.0,
          posY : 0.0,
          posZ : 0.0,
          
          // Un botón para dejarlo todo en su posición inicial
          // Cuando se pulse se ejecutará esta función.
          reset : () => {
            this.guiControls.sizeX = 1.0;
            this.guiControls.sizeY = 1.0;
            this.guiControls.sizeZ = 1.0;
            
            this.guiControls.rotX = 0.0;
            this.guiControls.rotY = 0.0;
            this.guiControls.rotZ = 0.0;
            
            this.guiControls.posX = 0.0;
            this.guiControls.posY = 0.0;
            this.guiControls.posZ = 0.0;
          }
        }

    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder (titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    // El método   listen()   permite que si se cambia el valor de la variable en código, el deslizador de la interfaz se actualice
    folder.add (this.guiControls, 'sizeX', 0.1, 5.0, 0.01).name ('Tamaño X : ').listen();
    folder.add (this.guiControls, 'sizeY', 0.1, 5.0, 0.01).name ('Tamaño Y : ').listen();
    folder.add (this.guiControls, 'sizeZ', 0.1, 5.0, 0.01).name ('Tamaño Z : ').listen();
    
    folder.add (this.guiControls, 'rotX', 0.0, Math.PI/2, 0.01).name ('Rotación X : ').listen();
    folder.add (this.guiControls, 'rotY', 0.0, Math.PI/2, 0.01).name ('Rotación Y : ').listen();
    folder.add (this.guiControls, 'rotZ', 0.0, Math.PI/2, 0.01).name ('Rotación Z : ').listen();
    
    folder.add (this.guiControls, 'posX', -20.0, 20.0, 0.01).name ('Posición X : ').listen();
    folder.add (this.guiControls, 'posY', 0.0, 10.0, 0.01).name ('Posición Y : ').listen();
    folder.add (this.guiControls, 'posZ', -20.0, 20.0, 0.01).name ('Posición Z : ').listen();

    folder.add (this.guiControls, 'reset').name ('[ Reset ]');
    }

    update () {

    }
}

export { Rampa }
