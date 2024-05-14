import * as THREE from '../../libs/three.module.js'

import { CSG } from '../../libs/CSG-v2.js'
import * as TWEEN from '../../libs/tween.esm.js'

class Cono_Trafico extends THREE.Object3D{
    constructor(c,t,rot) {
        super();
        var circuito = c.tubeGeometry;

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
        this.cono_trafico.userData = this;
        //this.cono_trafico.geometry.scale(0.4, 0.4, 0.4);
        this.cono_trafico.scale.set(0.4, 0.4, 0.4);
        // Y añadirlo como hijo del Object3D (el this)
        this.add(this.cono_trafico);
        this.posicionar(circuito,t,rot);
        this.createColision();
    }
    colision(){
        console.log("Caer al suelo");
        var origen = { x: 0};
        var destino = { x: Math.PI/2};
        var tween = new TWEEN.Tween(origen).to(destino, 500);
        tween.easing(TWEEN.Easing.Linear.None);
        tween.onUpdate(() => {
            this.cono_trafico.rotation.x = origen.x;
        });
        tween.start();

        var sonido = new Audio('/sound/cono.mp3');
        sonido.play();

        setTimeout(() => {
          this.cono_trafico.rotation.x = 0;
        }, 3000);//3 segundos
    }
    
    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this.cono_trafico);
      var boxHelper = new THREE.Box3Helper(box, 0xffff00);
      boxHelper.visible = true;
      boxHelper.userData = this;
      this.cono_trafico.add(boxHelper);
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
      this.posSuperficie.add(this.cono_trafico);
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
}

export { Cono_Trafico }
