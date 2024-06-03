import * as THREE from '../../libs/three.module.js';
import { CSG } from '../../libs/CSG-v2.js';
import * as TWEEN from '../../libs/tween.esm.js';

class Moneda_Basica extends THREE.Object3D {
    constructor(gui, titleGui, c, t) {
        super();

        // Creamos los materiales
        const Mat = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
        const bordeMat = new THREE.MeshPhysicalMaterial({
            color: 0xFFD700,
            metalness: 0.5,
        });
        const flechaMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

        // Creamos las geometrías
        const shape = new THREE.Shape();
        shape.moveTo(-0.001, -0.5);
        shape.quadraticCurveTo(0.48, -0.48, 0.5, 0);
        shape.quadraticCurveTo(0.48, 0.48, -0.001, 0.5);
        shape.quadraticCurveTo(-0.48, 0.48, -0.5, 0);
        shape.quadraticCurveTo(-0.48, -0.48, -0.001, -0.5);

        const holeShape = new THREE.Shape();
        holeShape.moveTo(-0.001, -0.4);
        holeShape.quadraticCurveTo(0.4, -0.4, 0.4, 0);
        holeShape.quadraticCurveTo(0.4, 0.4, -0.001, 0.4);
        holeShape.quadraticCurveTo(-0.4, 0.4, -0.4, 0);
        holeShape.quadraticCurveTo(-0.4, -0.4, -0.001, -0.4);

        const flecha = new THREE.Shape();
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

        // Se posiciona y se orienta
        shape.holes.push(holeShape);

        // Un Mesh se compone de geometría y material
        const options = { depth: 0.2, steps: 1, bevelEnabled: false };

        const bordeGeom = new THREE.ExtrudeGeometry(shape, options);
        const swadGeom = new THREE.ExtrudeGeometry(holeShape, options);
        const flechaGeom = new THREE.ExtrudeGeometry(flecha, options);

        swadGeom.scale(1, 1, 0.8);
        swadGeom.translate(0, 0, 0.01);

        flechaGeom.scale(0.85, 0.85, 1);
        flechaGeom.rotateZ(-Math.PI / 4);
        flechaGeom.translate(0, 0, -0.01);

        const bordeswadMesh = new THREE.Mesh(bordeGeom, bordeMat);
        const swadMesh = new THREE.Mesh(swadGeom, Mat);
        const flechaMesh = new THREE.Mesh(flechaGeom, flechaMat);

        // Añadirlo como hijo del Object3D (el this)
        this.basica = new THREE.Object3D();
        swadMesh.geometry.scale(0.4, 0.4, 0.4);
        bordeswadMesh.geometry.scale(0.4, 0.4, 0.4);
        flechaMesh.geometry.scale(0.4, 0.4, 0.4);
        this.basica.add(swadMesh);
        this.basica.add(bordeswadMesh);
        this.basica.add(flechaMesh);

        this.basica.userData = this;

        this.add(this.basica);
        this.reloj = new THREE.Clock();
        this.createColision();
        this.posicionar(c.tubeGeometry, t);
        this.initialPosY = this.posSuperficie.position.y;
    }

    picked() {
        //console.log("Moneda recogida");
        const rot = this.movimientoLateral.rotation.z;
        const audio = new Audio('/sound/coin.flac');
        audio.volume = 0.5;
        audio.play();

        // Inicia el Tween para animar el movimiento
        const tween = new TWEEN.Tween(this.posSuperficie.position)
            .to({ y: this.posSuperficie.position.y + 3 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                this.posSuperficie.rotation.y += 0.5;
                this.movimientoLateral.rotation.z = rot;
            })
            .start();

        // Desaparece la moneda después de 1 segundo
        setTimeout(() => {
            this.posSuperficie.visible = false;

            // Después de 10 segundos, la moneda vuelve a ser visible y vuelve a la posición inicial
            setTimeout(() => {
                this.posSuperficie.visible = true;
                this.posSuperficie.position.y = this.initialPosY; // Restaurar la posición inicial en Y
            }, 10000);
        }, 1000);
    }

    createColision() {
        const box = new THREE.Box3();
        box.setFromObject(this.basica);
        const boxHelper = new THREE.Box3Helper(box, 0xffff00);
        boxHelper.visible = false;
        boxHelper.userData = this;
        this.basica.add(boxHelper);
    }

    posicionar(circuito, ti) {
        this.nodoPosOrientTubo = new THREE.Object3D();
        this.movimientoLateral = new THREE.Object3D();
        this.posSuperficie = new THREE.Object3D();
        this.posSuperficie.position.y = circuito.parameters.radius + 1.5;

        this.add(this.nodoPosOrientTubo);
        this.nodoPosOrientTubo.add(this.movimientoLateral);
        this.movimientoLateral.add(this.posSuperficie);
        this.movimientoLateral.rotateZ(Math.PI / 2);
        this.posSuperficie.add(this.basica);

        // Pegarlo al tubo
        this.t = ti;
        this.tubo = circuito;
        this.path = circuito.parameters.path;
        this.radio = circuito.parameters.radius;
        this.segmentos = circuito.parameters.tubularSegments;

        const posTemp = this.path.getPointAt(this.t);
        this.nodoPosOrientTubo.position.copy(posTemp);
        const tangente = this.path.getTangentAt(this.t);
        posTemp.add(tangente);
        const segmentoActual = Math.floor(this.t * this.segmentos);
        this.nodoPosOrientTubo.up = this.tubo.binormals[segmentoActual];
        this.nodoPosOrientTubo.lookAt(posTemp);
    }

    updatePos() {
        const delta = this.reloj.getDelta();
        if ((this.t * 10) % 2 == 0) {
            this.movimientoLateral.rotateZ(0.7 * delta);
        } else {
            this.movimientoLateral.rotateZ(-0.7 * delta);
        }
    }

    update() {
        this.basica.rotation.y += 0.05;
        this.updatePos();
    }
}

export { Moneda_Basica };
