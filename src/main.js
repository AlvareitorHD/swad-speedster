
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import { Stats } from '../libs/stats.module.js'


// Clases de mi proyecto

import { Personaje } from './MyOBJ.js'
import { Circuito } from './Circuito.js'
import { Cono_Trafico } from './Cono_Trafico/Cono_Trafico.js'
import { Neumatico } from './Neumatico/Neumatico.js'
import { Rampa } from './Rampa/Rampa.js'

import { Moneda_Basica } from './Moneda_Basica/Moneda_Basica.js'
import { Moneda_Premium } from './Moneda_Premium/Moneda_Premium.js'
import { Punto_Escudo } from './Punto_Escudo/Punto_Escudo.js'


/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {

  constructor(myCanvas) {
    super();
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    this.createSky();
    // Establecer el estado inicial del botón y el audio
    this.musicEnabled = true; // Música activada por defecto
    this.alternarMusica();

    // Se añade a la gui los controles para manipular los elementos de esta clase
    this.gui = this.createGUI();
    this.circuito = new Circuito(this.gui, "Controles circuito");
    this.add(this.circuito);
    this.personaje = new Personaje(this.gui, "Controles de la Caja", this.circuito);
    this.add(this.personaje);
    var neumatico = new Neumatico(this.gui, "Controles del neumático", this.circuito,0.1);
    this.circuito.add(neumatico);

    this.t = 0.03;
    var rot = Math.PI / 2;
    var conos = [];
    for (var i = 0; i < 8; i++) {
      var cono = new Cono_Trafico(this.circuito, this.t, rot);
      conos.push(cono);
      this.t = (i/8+0.1)%1;
      rot += Math.PI / 4;
    }
    this.circuito.add(...conos);

    this.neumaticos = [];
    for (var i = 0; i < 5; i++) {
      var neumatico = new Neumatico(this.gui, "Controles del neumático", this.circuito,this.t);
      this.neumaticos.push(neumatico);
      this.t = (i/5+0.2)%1;
    }
    this.circuito.add(...this.neumaticos);

    this.basicas = [];
    for (var i = 0; i < 19; i++) {
      var basica = new Moneda_Basica(this.gui, "Controles de la moneda", this.circuito,this.t);
      this.basicas.push(basica);
      this.t = (i/20+0.2)%1;
    }
    this.circuito.add(...this.basicas);

    this.premium = new Moneda_Premium(this.gui, "Controles de la moneda", this.circuito);
    this.circuito.add(this.premium);

    this.initStats();

    this.rampa = new Rampa(this.circuito,0.05,Math.PI/2);
    this.circuito.add(this.rampa);

    var rot2 = -Math.PI / 2;
    this.punto_escudos = [];
    for (var i = 0; i < 5; i++) {
      var punto_escudo = new Punto_Escudo(this.circuito, this.t, rot2);
      this.punto_escudos.push(punto_escudo);
      this.t = (i/5+0.3)%1;
      rot2 += Math.PI / 4;
    }
    this.circuito.add(...this.punto_escudos);
    //this.add(this.punto_escudo);

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights();

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera();

    // Un suelo 
    //this.createGround();

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    // Todas las unidades están en metros
    this.axis = new THREE.AxesHelper(2);
    this.add(this.axis);

    this.cambiaCam = false;
    this.personajeCam = this.personaje.getCamara();

    var hijos = this.circuito.children.filter(child => !(child == this.circuito.tubeMesh));
    this.personaje.setObstaculos(hijos);
  }

  alternarMusica() {
        // Seleccionar el botón y el audio
        var toggleButton = document.getElementById('toggleMusic');
        var audio = new Audio('/sound/main_theme.mp3');
        audio.loop = true; // Repetir la música
        audio.volume = 0.2; // Volumen inicial del audio

        toggleButton.addEventListener('click', () => {
          this.musicEnabled = !this.musicEnabled; // Alternar el estado de la música

// Función para alternar la reproducción de la música
if (this.musicEnabled) {
  audio.pause(); // Pausar la música si está activada
  toggleButton.textContent = 'Activar Música'; // Cambiar el texto del botón
} else {
  audio.play(); // Reproducir la música si está desactivada
  toggleButton.textContent = 'Desactivar Música'; // Cambiar el texto del botón
}
// Agregar un evento de clic al botón para llamar a la función toggleMusic
toggleButton.addEventListener('click', toggleMusic);
        });
  }


  createSky() {
    var path = "/imgs/cube/";
    var format = '.bmp';
    var urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];
    var textureCube = new THREE.CubeTextureLoader().load(urls);
    this.background = textureCube;
  }

  initStats() {

    var stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    $("#Stats-output").append(stats.domElement);

    this.stats = stats;
  }

  createCamera() {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
    // Recuerda: Todas las unidades están en metros
    // También se indica dónde se coloca
    this.camera.position.set(45, 43, 45);
    // Y hacia dónde mira
    var look = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(look);
    this.add(this.camera);

    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new TrackballControls(this.camera, this.renderer.domElement);
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
    this.cambioCamara();
  }


  createGround() {
    // El suelo es un Mesh, necesita una geometría y un material.

    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry(10, 0.2, 10);

    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
    var materialGround = new THREE.MeshStandardMaterial({ map: texture });

    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh(geometryGround, materialGround);

    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.1;

    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add(ground);
  }

  createGUI() {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();

    // La escena le va a añadir sus propios controles. 
    // Se definen mediante un objeto de control
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = {
      // En el contexto de una función   this   alude a la función
      lightPower: 500.0,  // La potencia de esta fuente de luz se mide en lúmenes
      ambientIntensity: 0.5,
      axisOnOff: true,
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder('Luz y Ejes');

    // Se le añade un control para la potencia de la luz puntual
    folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz puntual : ')
      .onChange((value) => this.setLightPower(value));

    // Otro para la intensidad de la luz ambiental
    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental: ')
      .onChange((value) => this.setAmbientIntensity(value));

    // Y otro para mostrar u ocultar los ejes
    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes : ')
      .onChange((value) => this.setAxisVisible(value));
    return gui;
  }

  createLights() {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
    // La añadimos a la escena
    this.add(this.ambientLight);
    /*
    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.pointLight = new THREE.PointLight(0xffffff);
    this.pointLight.power = this.guiControls.lightPower;
    this.pointLight.position.set(2, 3, 1);
    this.add(this.pointLight);*/

    // Luz direccional
    this.directionalLight = new THREE.DirectionalLight(0xfdf3c6, 1.5);
    this.directionalLight.position.set(1, 1, 1);
    this.add(this.directionalLight);
  }

  setLightPower(valor) {
    this.pointLight.power = valor;
  }

  setAmbientIntensity(valor) {
    this.ambientLight.intensity = valor;
  }

  setAxisVisible(valor) {
    this.axis.visible = valor;
  }

  createRenderer(myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();

    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }
  updateHUD(){
    const speed = document.getElementById("speed");
    speed.innerHTML = "Speed: " + (this.personaje.speed * 1600).toFixed(2) + " km/h";
    const max_speed = document.getElementById("max_speed");
    max_speed.innerHTML = "Max Speed: " + (this.personaje.maxSpeed * 1600).toFixed(2) + " km/h";
    // Obtiene el elemento de la aguja
    var aguja = document.getElementById('aguja');
    // Aplica la rotación a la aguja mediante CSS
    // Calcula el ángulo de rotación de la aguja basado en la velocidad
    var angle = (this.personaje.speed*1600/ 120) * 300;
    aguja.style.transform = 'rotate(' + angle + 'deg)';
    const vueltas = document.getElementById("vueltas");
    vueltas.innerHTML = "Vueltas: " + this.personaje.vueltas;

    const vuelta = document.getElementById("vuelta");
    if(this.personaje.activaVuelta){
      vuelta.innerHTML = "( Vuelta " + this.personaje.vueltas+ " de 5 )";
      vuelta.style.display = "block";
      setTimeout(() => {
        this.personaje.activaVuelta = false;
        vuelta.style.display = "none";
      }, 3000);
    }
    const score = document.getElementById("score");
    score.innerHTML = "Score: " + this.personaje.score+ " pts";
  }
  getCamera() {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    if (this.cambiaCam)
      return this.camera;
    else {
      return this.personajeCam;
    }
  }

  setCameraAspect(ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();

  }

  onWindowResize() {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect(window.innerWidth / window.innerHeight);
    this.personaje.camera.aspect = window.innerWidth / window.innerHeight;
    this.personaje.camera.updateProjectionMatrix();
    // Y también el tamaño del renderizador
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  cambioCamara() {
    document.addEventListener('keyup', (event) => {
      if (event.key == " ") {
        this.cambiaCam = !this.cambiaCam;
      }
    });
  }

  update() {

    this.updateHUD();

    if (this.stats) this.stats.update();

    // Se actualizan los elementos de la escena para cada frame

    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update();

    this.personaje.update(/*this.hijos*/);

    this.neumaticos.forEach(neumatico => neumatico.update());
    this.basicas.forEach(basica => basica.update());
    this.premium.update();

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render(this, this.getCamera());
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
  }
}

/// La función   main
$(function () {

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
