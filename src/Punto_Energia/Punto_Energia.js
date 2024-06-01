import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'

class Punto_Energia extends THREE.Object3D{
    constructor(c, t, rot) {
        super();
        var circuito = c.tubeGeometry;

        //Creamos los materiales
        var Mat = new THREE.MeshStandardMaterial({
          color: 0xFFFF00,
          emissive: 0xFFFF00,
          emissiveIntensity: 1
        });

        var esferaMat = new THREE.MeshBasicMaterial({
          color: 0x0000FF,
          opacity: 0.2,
          transparent: true
        });
        
        //Creamos las geometrias
        var shape = new THREE.Shape();

        shape.moveTo(-0.5, -0.5);
        shape.lineTo(0.3, 0.3);
        shape.lineTo(0.001, 0.3);
        shape.lineTo(0.5, 0.8);
        shape.lineTo(-0.1, 0.8);
        shape.lineTo(-0.5, 0.1);
        shape.lineTo(-0.2, 0.1);

        var esfera = new THREE.SphereGeometry(0.95,30,30,0,2*Math.PI,0,Math.PI);


        // Un Mesh se compone de geometría y material
        var options = {depth: 0.2, steps: 1, bevelEnabled: false};

        var extrudeGeom = new THREE.ExtrudeGeometry(shape, options);
        extrudeGeom.translate(0, -0.2, -0.1);

        extrudeGeom.scale(0.2, 0.2, 0.2);
        esfera.scale(0.2, 0.2, 0.2);

        var rayoMesh = new THREE.Mesh(extrudeGeom, Mat);
        var esferaMesh = new THREE.Mesh(esfera, esferaMat);

        this.energia = new THREE.Object3D();

        // Y añadirlo como hijo del Object3D (el this)
        this.energia.add(rayoMesh);
        this.energia.add(esferaMesh);

        this.energia.userData = this;

        this.posicionar(circuito, t, rot);
        this.createColision();
    }

    colision(){
      var tween = new TWEEN.Tween(this.posSuperficie.position)
      .to({y: this.radio + 1}, 500)
      .onComplete(() => {
        this.energia.visible = false;
        setTimeout(() => {
          this.energia.visible = true;
          this.posSuperficie.position.y = this.radio + 0.3;
        }, 5000);
      })
      .start();
    }

    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this.energia);
      var boxHelper = new THREE.Box3Helper( box, 0xffff00 );
      boxHelper.visible = true;
      boxHelper.userData = this;
      this.energia.add(boxHelper);
    }

    posicionar(circuito, ti, rot){
      this.nodoPosOrientTubo = new THREE.Object3D();
      this.movimientoLateral = new THREE.Object3D();
      this.posSuperficie = new THREE.Object3D();
      this.posSuperficie.position.y = circuito.parameters.radius+0.3;
  
      this.add(this.nodoPosOrientTubo);
      this.nodoPosOrientTubo.add(this.movimientoLateral);
      this.movimientoLateral.add(this.posSuperficie);
      this.movimientoLateral.rotateZ(rot);
      this.posSuperficie.add(this.energia);
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

      TWEEN.update();
    }

    update(){
      this.energia.rotation.y += 0.01;
    }
}

export { Punto_Energia }
