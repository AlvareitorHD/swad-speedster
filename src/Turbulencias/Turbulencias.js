import * as THREE from '../../libs/three.module.js'

import { CSG } from '../../libs/CSG-v2.js'
import * as TWEEN from '../../libs/tween.esm.js'

class Turbulencias extends THREE.Object3D{
    constructor(c, t, rot) {
        super();
        var circuito = c.tubeGeometry;

        //Creamos los materiales
        var texture = new THREE.TextureLoader().load('../../imgs/acero.jpeg');
        var Mat = new THREE.MeshStandardMaterial({
          color: 0xCCCCCC,
          roughness: 0.5,
          metalness: 0.7
        });
        
        //Creamos las geometrias
        var base = new THREE.BoxGeometry(2, 0.05, 1);
        var cono = new THREE.CylinderGeometry(0.001, 0.4, 1, 8, 5);

        //Se posiciona y se orienta
        base.scale(0.4, 0.4, 0.4);
        cono.scale(0.1, 0.1, 0.1);

        // Un Mesh se compone de geometría y material
        var baseMesh = new THREE.Mesh(base, Mat);
        var conoMesh = new THREE.Mesh(cono, Mat);

        //Creamos el csg
        var csg = new CSG();

        var avanzar_delante = 0;
        var avanzar_detras = 0;

        for (let i = 0; i < 8; i++){
          if (i % 2 == 0){
            conoMesh.position.set(-0.25+avanzar_delante, 0.05, 0.1);
            avanzar_delante += 0.15;
          }
          else{
            conoMesh.position.set(-0.25+avanzar_detras, 0.05, -0.1);
            avanzar_detras += 0.15;
          }

          csg.union([baseMesh, conoMesh]);
        }

        this.turbulencias = csg.toMesh();
        // Y añadirlo como hijo del Object3D (el this)
        this.turbulencias.userData = this;

        this.sonido = new Audio('/sound/pinchazo.mp3');

        this.posicionar(circuito, t, rot);
        this.createColision();
    }

    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this.turbulencias);
      var boxHelper = new THREE.Box3Helper( box, 0xffff00 );
      boxHelper.visible = true;
      boxHelper.userData = this;
      this.turbulencias.add(boxHelper);
    }

    colision(){
      this.sonido.play();
    }

    posicionar(circuito, ti, rot){
      this.nodoPosOrientTubo = new THREE.Object3D();
      this.movimientoLateral = new THREE.Object3D();
      this.posSuperficie = new THREE.Object3D();
      this.posSuperficie.position.y = circuito.parameters.radius;
  
      this.add(this.nodoPosOrientTubo);
      this.nodoPosOrientTubo.add(this.movimientoLateral);
      this.movimientoLateral.add(this.posSuperficie);
      this.movimientoLateral.rotateZ(rot);
      this.posSuperficie.add(this.turbulencias);
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
}

export { Turbulencias }
