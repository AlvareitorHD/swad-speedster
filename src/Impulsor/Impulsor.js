import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'


import { CSG } from '../../libs/CSG-v2.js'

class Impulsor extends THREE.Object3D {
  constructor(gui, titleGui, c, t, rot) {
    super();
    var circuito = c.tubeGeometry;
    //Creamos los materiales

    this.video = document.createElement('video');
    this.video.crossOrigin = 'anonymous';
    this.video.preload = '';
    this.video.loop = true;
    this.video.src = '../imgs/flechas1.mp4';
    this.video.load();
    var texture = new THREE.VideoTexture(this.video);
    texture.generateMipmaps = false; // si el video no es cuadrado
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    // Crear el material con la textura de vídeo y la emisión
    const Mat = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: new THREE.Color(0xffffff), // Color de la emisión
      emissiveIntensity: 1, // Intensidad de la emisión
      emissiveMap: texture // Textura de emisión
    });

    //Creamos las geometrias
    var base = new THREE.BoxGeometry(2, 0.05, 1);

    //Se posiciona y se orienta

    // Un Mesh se compone de geometría y material
    this.baseMesh = new THREE.Mesh(base, Mat);

    // Y añadirlo como hijo del Object3D (el this)
    this.add(this.baseMesh);
    this.video.play();
    this.posicionar(circuito, t, rot);
    this.createColision();
    this.sonido = new Audio('/sound/impulsor.mp3');
  }

  posicionar(circuito,ti,rot){
    this.baseMesh.geometry.rotateY(-Math.PI/2);
    this.nodoPosOrientTubo = new THREE.Object3D();
    this.movimientoLateral = new THREE.Object3D();
    this.posSuperficie = new THREE.Object3D();
    this.posSuperficie.position.y = circuito.parameters.radius;

    this.add(this.nodoPosOrientTubo);
    this.nodoPosOrientTubo.add(this.movimientoLateral);
    this.movimientoLateral.add(this.posSuperficie);
    this.movimientoLateral.rotateZ(rot);
    this.posSuperficie.add(this.baseMesh);
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

  colision(){
    this.sonido.play();
    var tween = new TWEEN.Tween(this.posSuperficie.position)
    .to({y: this.radio + 0.5}, 500)
    .onComplete(() => {

      this.posSuperficie.position.y = this.radio - 0.025;
    })
    .start();
  }

  createColision(){
    var box = new THREE.Box3();
    box.setFromObject(this.baseMesh);
    var boxHelper = new THREE.Box3Helper(box, 0xffff00);
    boxHelper.visible = false;
    boxHelper.userData = this;
    this.baseMesh.add(boxHelper);
  }
}

export { Impulsor }
