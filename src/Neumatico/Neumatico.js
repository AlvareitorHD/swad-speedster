import * as THREE from '../../libs/three.module.js'

class Neumatico extends THREE.Object3D{
    constructor(gui,titleGui,c,t) {
        super();

        // Se crea la parte de la interfaz que corresponde a la caja
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
        //this.createGUI(gui,titleGui);

        // Creamos la textura del neumatico
        var texture = new THREE.TextureLoader().load('../../imgs/neumatico.jpeg');
        var normalMap = new THREE.TextureLoader().load('../../imgs/normal-neu.png');
        //Le aplicamos la textura
        var Mat = new THREE.MeshStandardMaterial({map: texture, side: THREE.DoubleSide, color: 0xaaaaaa,
          normalMap: normalMap, normalScale: new THREE.Vector2(1, 1)
        });
        
        var shape = new THREE.Shape();

        //Se crea el contorno exterior
        shape.moveTo(0.5, -0.25);
        shape.quadraticCurveTo(0.5, -0.3, 1, -0.4);
        shape.bezierCurveTo(1.2, -0.2, 1.2, 0.2, 1, 0.4);
        shape.quadraticCurveTo(0.5, 0.3, 0.5, 0.25);

        var points = shape.extractPoints(24).shape;

        // Un Mesh se compone de geometría y material
        var neumaticoGeom = new THREE.LatheGeometry(points, 16, 0, Math.PI * 2);

        //Contruimos el mesh
        this.neumatico = new THREE.Mesh(neumaticoGeom, Mat);
        this.neumatico.userData = this;
        this.neumatico.scale.set(0.5, 0.5, 0.5);
        this.neumatico.geometry.rotateX(Math.PI / 2);
        // Y añadirlo como hijo del Object3D (el this)
        this.add(this.neumatico);
        this.reloj = new THREE.Clock();
        this.createColision();
        this.posicionar(c.tubeGeometry,t);
    }

    createColision(){
      var box = new THREE.Box3();
      box.setFromObject(this.neumatico);
      var boxHelper = new THREE.Box3Helper(box, 0xffff00);
      boxHelper.visible = false;
      boxHelper.userData = this;
      this.neumatico.add(boxHelper);
    }

    posicionar(circuito,ti){
      this.nodoPosOrientTubo = new THREE.Object3D();
      this.movimientoLateral = new THREE.Object3D();
      this.posSuperficie = new THREE.Object3D();
      this.posSuperficie.position.y = circuito.parameters.radius+0.5;
  
      this.add(this.nodoPosOrientTubo);
      this.nodoPosOrientTubo.add(this.movimientoLateral);
      this.movimientoLateral.add(this.posSuperficie);
      this.movimientoLateral.rotateZ(Math.PI / 2);
      this.posSuperficie.add(this.neumatico);
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
      var sonido = new Audio('/sound/qubodup-crash.ogg');
      sonido.play();
    }

    updatePos(){
      this.movimientoLateral.rotateZ(2 * this.reloj.getDelta());
    }

    update () {
      this.neumatico.rotation.z += (0.05);
      this.updatePos();
        // Con independencia de cómo se escriban las 3 siguientes líneas, el orden en el que se aplican las transformaciones es:
        // Primero, el escalado
        // Segundo, la rotación en Z
        // Después, la rotación en Y
        // Luego, la rotación en X
        // Y por último la traslación
       
        /*this.position.set (this.guiControls.posX,this.guiControls.posY,this.guiControls.posZ);
        this.scale.set (this.guiControls.sizeX,this.guiControls.sizeY,this.guiControls.sizeZ);
        this.rotation.set (this.guiControls.rotX,this.guiControls.rotY,this.guiControls.rotZ);*/
    }
}

export { Neumatico };
