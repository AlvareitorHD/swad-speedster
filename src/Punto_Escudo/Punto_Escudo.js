import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'

class Punto_Escudo extends THREE.Object3D{
    constructor(c, t, rot) {
        super();
        var circuito = c.tubeGeometry;

        // Se crea la parte de la interfaz que corresponde a la caja
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
        //this.createGUI(gui,titleGui);

        //Creamos los materiales
        var texture = new THREE.TextureLoader().load('/imgs/wood.jpg');
        var metal = new THREE.TextureLoader().load('/imgs/metalnormal2.jpg');
        metal.wrapS = THREE.RepeatWrapping;
        metal.wrapT = THREE.RepeatWrapping;
        var Mat = new THREE.MeshStandardMaterial({
          color: 0xFFD700,  // Color dorado
          metalness: 0.7,   // Material completamente metálico
          roughness: 0.3,    // Ajustar para obtener un brillo dorado
          normalMap: metal,
      });

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

        escudoGeom.scale(0.4, 0.4, 0.4);
        bordeGeom.scale(0.4, 0.4, 0.4);

        var bordeescudoMesh = new THREE.Mesh(bordeGeom, bordeMat);
        var escudoMesh = new THREE.Mesh(escudoGeom, Mat);
        
        this.escudo = new THREE.Object3D();

        // Y añadirlo como hijo del Object3D (el this)
        this.escudo.add(escudoMesh);
        this.escudo.add(bordeescudoMesh);

        this.escudo.userData = this;

        this.posicionar(circuito, t, rot);
        this.createColision();
        this.sonido = new Audio('/sound/escudo.mp3');
    }

    colision(){
      this.sonido.play();
      var tween = new TWEEN.Tween(this.posSuperficie.position)
      .to({y: this.radio + 1}, 500)
      .onComplete(() => {
        this.escudo.visible = false;
        setTimeout(() => {
          this.escudo.visible = true;
          this.posSuperficie.position.y = this.radio + 0.3;
        }, 5000);
      })
      .start();
    }

    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this.escudo);
      var boxHelper = new THREE.Box3Helper( box, 0xffff00 );
      boxHelper.visible = true;
      boxHelper.userData = this;
      this.escudo.add(boxHelper);
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
      this.posSuperficie.add(this.escudo);
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
      this.escudo.rotation.y += 0.01;
    }
}

export { Punto_Escudo }
