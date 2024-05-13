import * as THREE from '../../libs/three.module.js'

import { CSG } from '../../libs/CSG-v2.js'

class Moneda_Basica extends THREE.Object3D{
    constructor(gui,titleGui, c, t) {
        super();

        //Creamos los materiales
        var Mat = new THREE.MeshStandardMaterial({color: 0x00FF00});
        var bordeMat = new THREE.MeshPhysicalMaterial({
          color: 0xFFD700,
          metalness: 0.5,
        });
        var flechaMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});

        //Creamos las geometrias
        var shape = new THREE.Shape();

        shape.moveTo(-0.001, -0.5);
        shape.quadraticCurveTo(0.48, -0.48, 0.5, 0);
        shape.quadraticCurveTo(0.48, 0.48, -0.001, 0.5);
        shape.quadraticCurveTo(-0.48, 0.48, -0.5, 0);
        shape.quadraticCurveTo(-0.48, -0.48, -0.001, -0.5);

        var holeShape = new THREE.Shape();

        holeShape.moveTo(-0.001, -0.4);
        holeShape.quadraticCurveTo(0.4, -0.4, 0.4, 0);
        holeShape.quadraticCurveTo(0.4, 0.4, -0.001, 0.4);
        holeShape.quadraticCurveTo(-0.4, 0.4, -0.4, 0);
        holeShape.quadraticCurveTo(-0.4, -0.4, -0.001, -0.4);

        var flecha = new THREE.Shape();
        flecha.moveTo(-0.001, -0.4);
        flecha.lineTo(0.1, -0.4);
        flecha.lineTo(0.1, 0.1);
        flecha.lineTo(0.3, -0.1);
        flecha.lineTo(0.4, 0);
        flecha.lineTo(0.001, 0.4);
        flecha.lineTo(-0.4, 0);
        flecha.lineTo(-0.3, -0.1);
        flecha.lineTo(-0.1, 0.1);
        flecha.lineTo(-0.1, -0.4);

        //Se posiciona y se orienta
        shape.holes.push(holeShape);

        // Un Mesh se compone de geometría y material
        var options = {depth: 0.2, steps: 1, bevelEnabled: false};

        var bordeGeom = new THREE.ExtrudeGeometry(shape, options);
        var swadGeom = new THREE.ExtrudeGeometry(holeShape, options);
        var flechaGeom = new THREE.ExtrudeGeometry(flecha, options);

        swadGeom.scale(1, 1, 0.8);
        swadGeom.translate(0, 0, 0.01);

        flechaGeom.scale(0.85, 0.85, 1);
        flechaGeom.rotateZ(-Math.PI/4);
        flechaGeom.translate(0, 0, -0.01);

        var bordeswadMesh = new THREE.Mesh(bordeGeom, bordeMat);
        var swadMesh = new THREE.Mesh(swadGeom, Mat);
        var flechaMesh = new THREE.Mesh(flechaGeom, flechaMat);

        // Y añadirlo como hijo del Object3D (el this)
        this.basica = new THREE.Object3D();
        this.basica.add(swadMesh);
        this.basica.add(bordeswadMesh);
        this.basica.add(flechaMesh);

        this.basica.scale.set(0.4, 0.4, 0.4);

        this.basica.userData = this;

        this.add(this.basica);
        this.reloj = new THREE.Clock();
        this.createColision();
        this.posicionar(c.tubeGeometry,t);
    }

    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this);
      var boxHelper = new THREE.Box3Helper(box, 0xffff00);
      boxHelper.visible = true;
      boxHelper.userData = this;
      this.basica.add(boxHelper);
    }

    posicionar(circuito,ti){
      this.nodoPosOrientTubo = new THREE.Object3D();
      this.movimientoLateral = new THREE.Object3D();
      this.posSuperficie = new THREE.Object3D();
      this.posSuperficie.position.y = circuito.parameters.radius+1.5;
  
      this.add(this.nodoPosOrientTubo);
      this.nodoPosOrientTubo.add(this.movimientoLateral);
      this.movimientoLateral.add(this.posSuperficie);
      this.movimientoLateral.rotateZ(Math.PI / 2);
      this.posSuperficie.add(this.basica);
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

    updatePos(){
      if ((this.t * 10) % 2 == 0){
        this.movimientoLateral.rotateZ(0.8 * this.reloj.getDelta());
      }
      else{
        this.movimientoLateral.rotateZ(-0.8 * this.reloj.getDelta());
      }
    }

    update () {
      this.basica.rotation.y += 0.05;
      this.updatePos();

        // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
        // Primero, el escalado
        // Segundo, la rotación en Z
        // Después, la rotación en Y
        // Luego, la rotación en X
        // Y por último la traslación
       
        /* this.position.set (this.guiControls.posX,this.guiControls.posY,this.guiControls.posZ);
        this.scale.set (this.guiControls.sizeX,this.guiControls.sizeY,this.guiControls.sizeZ);
        this.rotation.set (this.guiControls.rotX,this.guiControls.rotY,this.guiControls.rotZ); */
    }
}

export { Moneda_Basica }
