import * as THREE from '../../libs/three.module.js'

import { CSG } from '../../libs/CSG-v2.js'
import * as TWEEN from '../../libs/tween.esm.js'

class Moneda_Premium extends THREE.Object3D{
    constructor() {
        super();

        this.velocidad = 5;
        // Se crea la parte de la interfaz que corresponde a la caja
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz

        //Creamos los materiales
        var Mat = new THREE.MeshStandardMaterial({color: 0x00AA00}); // Color verde
        var bordeMat = new THREE.MeshPhysicalMaterial({
          color: 0xffd700, // Color dorado
          metalness: 1,    // Ajusta la metalicidad para un aspecto dorado
          roughness: 0.5,  // Controla la rugosidad de la superficie (0 para una superficie perfectamente lisa, 1 para una superficie muy rugosa)
          reflectivity: 0.8, // Controla la reflectividad de la superficie (0 para ninguna reflectividad, 1 para una reflectividad total)
      });

        //Creamos las geometrias
        var shape = new THREE.Shape();

        shape.moveTo(-0.001, -0.5);
        shape.lineTo(0.45, -0.5);
        shape.quadraticCurveTo(0.5, -0.5, 0.5, -0.45);
        shape.lineTo(0.5, 0.45);
        shape.quadraticCurveTo(0.5, 0.5, 0.45, 0.5);
        shape.lineTo(-0.45, 0.5);
        shape.quadraticCurveTo(-0.5, 0.5, -0.5, 0.45);
        shape.lineTo(-0.5, -0.45);
        shape.quadraticCurveTo(-0.5, -0.5, -0.45, -0.5);
        shape.lineTo(-0.001, -0.5);

        var holeShape = new THREE.Shape();

        holeShape.moveTo(-0.001, -0.45);
        holeShape.lineTo(0.4, -0.45);
        holeShape.quadraticCurveTo(0.45, -0.45, 0.45, -0.4);
        holeShape.lineTo(0.45, 0.4);
        holeShape.quadraticCurveTo(0.45, 0.45, 0.4, 0.45);
        holeShape.lineTo(-0.4, 0.45);
        holeShape.quadraticCurveTo(-0.45, 0.45, -0.45, 0.4);
        holeShape.lineTo(-0.45, -0.4);
        holeShape.quadraticCurveTo(-0.45, -0.45, -0.4, -0.45);
        holeShape.lineTo(-0.001, -0.45);

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
        swadGeom.translate(0, 0, 0.02);

        flechaGeom.rotateZ(-Math.PI/4);
        flechaGeom.translate(0, 0, -0.0001);

        var bordeswadMesh = new THREE.Mesh(bordeGeom, bordeMat);
        var swadMesh = new THREE.Mesh(swadGeom, Mat);
        var flechaMesh = new THREE.Mesh(flechaGeom, bordeMat);

        // Y añadirlo como hijo del Object3D (el this)
        this.premium = new THREE.Object3D();
        this.premium.add(swadMesh);
        this.premium.add(bordeswadMesh);
        this.premium.add(flechaMesh);
        this.premium.userData = this;
        this.premium.position.z = -0.1;
        this.premium.scale.set(1.4, 1.4, 1.4);

        this.reloj = new THREE.Clock();
        this.createColision();
        this.add(this.premium);
        this.createRuta();
        this.sonido = new Audio('/sound/moneda_premium.wav');
    }

    createRuta(){
      this.ruta = new THREE.CatmullRomCurve3([
        new THREE.Vector3(18.195881, 6.114858, -13.206354),
        new THREE.Vector3(21.896887, 6.114858, -15.185962),
        new THREE.Vector3(27.663570, 6.114858, -16.390940),
        new THREE.Vector3(39.799423, 6.114858, -13.034214),
        new THREE.Vector3(43.500427, 6.114858, -9.505348),
        new THREE.Vector3(45.738243, 6.114858, -4.255085),
        new THREE.Vector3(48.320339, 6.114858, 2.974786),
        new THREE.Vector3(47.976059, 6.114858, 5.298673),
        new THREE.Vector3(47.201431, 6.114858, 6.761861),
        new THREE.Vector3(45.652172, 6.114858, 7.880770),
        new THREE.Vector3(43.328285, 6.114858, 7.708630),
        new THREE.Vector3(38.336231, 6.114858, 7.622560),
        new THREE.Vector3(-34.737110, 6.114858, 5.642952),
        new THREE.Vector3(-40.905453, 6.114858, 4.782254),
        new THREE.Vector3(-43.702724, 6.114858, 3.276031),
        new THREE.Vector3(-44.276524, 6.114858, 1.124284),
        new THREE.Vector3(-43.631001, 6.114858, -1.529537),
        new THREE.Vector3(-42.053051, 6.114858, -4.039908),
        new THREE.Vector3(-38.610256, 6.114858, -6.191655),
        new THREE.Vector3(-36.099884, 6.114858, -6.908904),
        new THREE.Vector3(-30.290167, 6.114858, -6.980629),
        new THREE.Vector3(-7.625097, 6.114858, -7.052354),
        new THREE.Vector3(7.867482, 6.114858, -7.410978),
        new THREE.Vector3(11.382003, 6.114858, -7.769603),
        new THREE.Vector3(14.250999, 6.114858, -8.917201),
        new THREE.Vector3(16.187572, 6.114858, -10.997223)
      ],true);

      var geometrLine = new THREE.BufferGeometry();
      geometrLine.setFromPoints(this.ruta.getPoints(80));
      // Linea de la ruta visible
      //var materialLine = new THREE.LineBasicMaterial({color: 0xff0000});
      //var line = new THREE.Line(geometrLine, materialLine);
      //this.add(line);
      this.segmentos = 100;
      this.binormales = this.ruta.computeFrenetFrames(this.segmentos, true).binormals;
      var origen = {t: 0};
      var destino = {t: 1};
      var tiempo = 15000; // 15 segundos

      var animacion = new TWEEN.Tween(origen).to(destino, tiempo).onUpdate(() => {
        var posicion = this.ruta.getPointAt(origen.t);
        this.premium.position.copy(posicion);
        this.premium.rotation.y -= this.velocidad*this.reloj.getDelta();
      });
      animacion.repeat(Infinity);
      animacion.start();
    }

    picked(){
      this.sonido.play();
      //console.log("PREMIUM recogida");
      this.velocidad = 25;
      setTimeout(() =>{
        this.velocidad = 5;
      },1000); //Aumenta el giro de la moneda durante un 1 segundo
    }

    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this.premium);
      var boxHelper = new THREE.Box3Helper(box, 0xffff00);
      boxHelper.visible = false;
      boxHelper.userData = this;
      this.premium.add(boxHelper);
    }

    update () {
        // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
        // Primero, el escalado
        // Segundo, la rotación en Z
        // Después, la rotación en Y
        // Luego, la rotación en X
        // Y por último la traslación
        TWEEN.update();
    }
}

export { Moneda_Premium }
