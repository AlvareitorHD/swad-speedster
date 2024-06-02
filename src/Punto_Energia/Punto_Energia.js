import { color } from '../../libs/dat.gui.module.js';
import * as THREE from '../../libs/three.module.js'
import * as TWEEN from '../../libs/tween.esm.js'

class Punto_Energia extends THREE.Object3D {
  constructor(c, t, rot) {
    super();
    var circuito = c.tubeGeometry;

    // Crear los materiales
    var Mat = new THREE.MeshStandardMaterial({
      color: 0xFFFF00,
      emissive: 0xFFFF00,
      emissiveIntensity: 1
    });

    var esferaMat = new THREE.MeshPhysicalMaterial({
      color: 0x0000FF,
      metalness: .9,
      roughness: .05,
      envMapIntensity: 0.9,
      clearcoat: 1,
      transparent: true,
      opacity: .6,
      reflectivity: 0.2,
      ior: 0.9,
      side: THREE.BackSide,
    });

    // Crear las geometrías
    var shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.5);
    shape.lineTo(0.3, 0.3);
    shape.lineTo(0.001, 0.3);
    shape.lineTo(0.5, 0.8);
    shape.lineTo(-0.1, 0.8);
    shape.lineTo(-0.5, 0.1);
    shape.lineTo(-0.2, 0.1);

    var esfera = new THREE.SphereGeometry(0.95, 16, 16);

    // Un Mesh se compone de geometría y material
    var options = { depth: 0.2, steps: 1, bevelEnabled: false };
    var extrudeGeom = new THREE.ExtrudeGeometry(shape, options);
    extrudeGeom.translate(0, -0.2, -0.1);
    extrudeGeom.scale(0.2, 0.2, 0.2);
    esfera.scale(0.2, 0.2, 0.2);

    var rayoMesh = new THREE.Mesh(extrudeGeom, Mat);
    var esferaMesh = new THREE.Mesh(esfera, esferaMat);

    this.energia = new THREE.Object3D();
    this.energia.add(rayoMesh);
    this.energia.add(esferaMesh);
    this.energia.userData = this;

    this.luz = new THREE.PointLight(0xFFFF00, 1, 2);
    this.luz.position.set(0, 0, 0);

    this.posicionar(circuito, t, rot);
    this.createColision();
    this.sonido = new Audio('/sound/electric.mp3');

    // Crear el sistema de partículas
    this.createParticles(extrudeGeom);
  }

  createParticles(rayo) {
    var rayoMesh = rayo.clone();
    rayoMesh.scale(0.5, 0.5, 0.5);

    this.particles = new THREE.Group();
    var particleCount = 15;
    var particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFF00,
    });

    for (var i = 0; i < particleCount; i++) {
      var particle = new THREE.Mesh(rayoMesh, particleMaterial);
      particle.position.set(
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1
    );
    this.particles.add(particle);
    }

    this.energia.add(this.particles);
    this.particles.visible = false;
  }

  colision() {
    var tween = new TWEEN.Tween(this.posSuperficie.position)
      .to({ y: this.radio + 1 }, 500)
      .onComplete(() => {
        this.energia.visible = false;
        setTimeout(() => {
          this.energia.visible = true;
          this.posSuperficie.position.y = this.radio + 0.3;
          this.particles.visible = false;
          this.particles.children.forEach(particle => {particle.position.set(0,0,0);});
        }, 2000);
      })
      .start();

      this.particles.visible = true;

    // Reproducir sonido
    this.sonido.play();
  }

  animateParticles() {
    this.particles.children.forEach(particle => {
        particle.position.x += (Math.random() - 0.5) * 0.1; // Movimiento aleatorio en el eje X
        particle.position.y += (Math.random() - 0.5) * 0.1; // Movimiento aleatorio en el eje Y
        particle.position.z += (Math.random() - 0.5) * 0.1; // Movimiento aleatorio en el eje Z
        particle.rotation.x += (Math.random() - 0.5) * 0.2; // Rotación aleatoria en el eje X
        particle.rotation.y += (Math.random() - 0.5) * 0.2; // Rotación aleatoria en el eje Y
        particle.rotation.z += (Math.random() - 0.5) * 0.2; // Rotación aleatoria en el eje Z
    });
}




  createColision() {
    var box = new THREE.Box3();
    box.setFromObject(this.energia);
    var boxHelper = new THREE.Box3Helper(box, 0xffff00);
    boxHelper.visible = true;
    boxHelper.userData = this;
    this.energia.add(boxHelper);
  }

  posicionar(circuito, ti, rot) {
    this.nodoPosOrientTubo = new THREE.Object3D();
    this.movimientoLateral = new THREE.Object3D();
    this.posSuperficie = new THREE.Object3D();
    this.posSuperficie.position.y = circuito.parameters.radius + 0.3;

    this.add(this.nodoPosOrientTubo);
    this.nodoPosOrientTubo.add(this.movimientoLateral);
    this.movimientoLateral.add(this.posSuperficie);
    this.movimientoLateral.rotateZ(rot);
    this.posSuperficie.add(this.energia);
    this.posSuperficie.add(this.luz);
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

  update() {
    if(this.particles.visible){
      this.animateParticles();
    }

    this.energia.rotation.y += 0.01;
  }
}

export { Punto_Energia }
