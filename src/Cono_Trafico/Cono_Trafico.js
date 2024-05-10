import * as THREE from '../../libs/three.module.js'

import { CSG } from '../../libs/CSG-v2.js'

class Cono_Trafico extends THREE.Object3D{
    constructor(gui,titleGui,c) {
        super();

        var circuito = c.tubeGeometry;
        // Se crea la parte de la interfaz que corresponde a la caja
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
        this.createGUI(gui,titleGui);

        //Creamos los materiales
        var texture = new THREE.TextureLoader().load('../../imgs/cono_trafico.jpeg');
        var Mat = new THREE.MeshStandardMaterial({map: texture});
        
        //Creamos las geometrias
        var base = new THREE.BoxGeometry(1, 0.05, 1);
        var cono = new THREE.CylinderGeometry(0.05, 0.4, 1);

        var conoExtraer = new THREE.CylinderGeometry(0.001, 0.5, 1.6);

        //Se posiciona y se orienta
        cono.translate(0, 0.5, 0);

        conoExtraer.scale(0.9, 0.9, 0.9);
        conoExtraer.translate(0, 0.4, 0);

        // Un Mesh se compone de geometría y material
        var baseMesh = new THREE.Mesh(base, Mat);
        var conoMesh = new THREE.Mesh(cono, Mat);

        var conoExtraerMesh = new THREE.Mesh(conoExtraer, Mat);

        //Creamos el csg
        var csg = new CSG();
        csg.union([baseMesh, conoMesh]);
        csg.subtract([conoExtraerMesh]);

        this.cono_trafico = csg.toMesh();
        this.cono_trafico.geometry.scale(0.4, 0.4, 0.4);
        // Y añadirlo como hijo del Object3D (el this)
        this.add(this.cono_trafico);
        this.posicionar(circuito);
    }

    posicionar(circuito){
      this.nodoPosOrientTubo = new THREE.Object3D();
      this.movimientoLateral = new THREE.Object3D();
      this.posSuperficie = new THREE.Object3D();
      this.posSuperficie.position.y = circuito.parameters.radius;
  
      this.add(this.nodoPosOrientTubo);
      this.nodoPosOrientTubo.add(this.movimientoLateral);
      this.movimientoLateral.add(this.posSuperficie);
      this.movimientoLateral.rotateZ(Math.PI / 2.5);
      this.posSuperficie.add(this.cono_trafico);
      //pergarlo al tubo
      this.t = 0.025;
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
        // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
        // Primero, el escalado
        // Segundo, la rotación en Z
        // Después, la rotación en Y
        // Luego, la rotación en X
        // Y por último la traslación
       
        this.position.set (this.guiControls.posX,this.guiControls.posY,this.guiControls.posZ);
        this.scale.set (this.guiControls.sizeX,this.guiControls.sizeY,this.guiControls.sizeZ);
        this.rotation.set (this.guiControls.rotX,this.guiControls.rotY,this.guiControls.rotZ);
    }
}

export { Cono_Trafico }
