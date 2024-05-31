import * as THREE from '../../libs/three.module.js'

import { CSG } from '../../libs/CSG-v2.js'

class Punto_Escudo extends THREE.Object3D{
    constructor(gui,titleGui) {
        super();

        // Se crea la parte de la interfaz que corresponde a la caja
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
        //this.createGUI(gui,titleGui);

        //Creamos los materiales
        var texture = new THREE.TextureLoader().load('../../imgs/wood.jpg');
        var Mat = new THREE.MeshStandardMaterial({color: 0xFFFF00});

        var bordeMat = new THREE.MeshStandardMaterial({map: texture});        
        //Creamos las geometrias
        var shape = new THREE.Shape();

        shape.moveTo(0.001, -0.5);
        shape.quadraticCurveTo(0.5, -0.1, 0.6, 0.6);
        shape.quadraticCurveTo(0.1, 0.6, 0.001, 0.8);
        shape.quadraticCurveTo(-0.1, 0.6, -0.6, 0.6);
        shape.quadraticCurveTo(-0.5, -0.1, 0.001, -0.5);

        //Se posiciona y se orienta


        // Un Mesh se compone de geometría y material
        var options = {depth: 0.2, steps: 1, bevelEnabled: false};

        var bordeGeom = new THREE.ExtrudeGeometry(shape, options);

        var escudoGeom = new THREE.ExtrudeGeometry(shape, options);
        escudoGeom.scale(0.93, 0.93, 1.2);
        escudoGeom.translate(0, 0, -0.02);

        var bordeescudoMesh = new THREE.Mesh(bordeGeom, bordeMat);
        var escudoMesh = new THREE.Mesh(escudoGeom, Mat);

        // Y añadirlo como hijo del Object3D (el this)
        this.add(escudoMesh);
        this.add(bordeescudoMesh);
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

export { Punto_Escudo }
