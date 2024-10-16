
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
import { Impulsor } from './Impulsor/Impulsor.js'
import { Punto_Energia } from './Punto_Energia/Punto_Energia.js'
import { Turbulencias } from './Turbulencias/Turbulencias.js'


/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {

  constructor(myCanvas) {
    super();
    // Fin de partida
    this.gameOver = false;
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    this.createSky();
    // Se añaden los objetos únicos a la escena
    this.gui = this.createGUI();
    this.circuito = new Circuito();
    this.add(this.circuito);
    this.personaje = new Personaje(this.circuito);
    this.add(this.personaje);
    this.premium = new Moneda_Premium();
    this.circuito.add(this.premium);

    this.initStats();
    // Se añaden los objetos que se repiten en la escena
    this.createObjetos();
    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights();
    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera();
    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    // Todas las unidades están en metros
    //this.axis = new THREE.AxesHelper(2);
    //this.add(this.axis);

    this.cambiaCam = false;
    this.personajeCam = this.personaje.getCamara();

    var hijos = this.circuito.children.filter(child => !(child == this.circuito.tubeMesh));
    this.personaje.setObstaculos(hijos);
  }

  createObjetos() {
    // Se añaden los objetos que se repiten en la escena
    var impulsor = new Impulsor(this.gui, "Controles del impulsor", this.circuito, 0.94, Math.PI / 2);
    this.circuito.add(impulsor);

    // Función para generar valores de t evitando t=0
    function generarPosiciones(n, offset) {
      let posiciones = [];
      for (let i = 0; i < n; i++) {
        let t = ((i + 1) / (n + 1) + offset) % 1;
        posiciones.push(t);
      }
      return posiciones;
    }

    // Conos de Tráfico
    var rot = Math.PI / 2;
    var conos = [];
    let posicionesConos = generarPosiciones(8, 0.1);
    for (var i = 0; i < 8; i++) {
      var cono = new Cono_Trafico(this.circuito, posicionesConos[i], rot);
      conos.push(cono);
      rot += Math.PI / 4;
    }
    this.circuito.add(...conos);

    // Neumáticos
    this.neumaticos = [];
    let posicionesNeumaticos = generarPosiciones(5, 0.2);
    for (var i = 0; i < 5; i++) {
      var neumatico = new Neumatico(this.gui, "Controles del neumático", this.circuito, posicionesNeumaticos[i]);
      this.neumaticos.push(neumatico);
    }
    this.circuito.add(...this.neumaticos);

    // Monedas Básicas
    this.basicas = [];
    let posicionesBasicas = generarPosiciones(10, 0.15);
    for (var i = 0; i < 10; i++) {
      var basica = new Moneda_Basica(this.gui, "Controles de la moneda", this.circuito, posicionesBasicas[i]);
      this.basicas.push(basica);
    }
    this.circuito.add(...this.basicas);

    // Rampa
    this.rampa = new Rampa(this.circuito, 0.05, Math.PI / 2);
    this.circuito.add(this.rampa);

    // Puntos de Escudos
    var rot2 = -Math.PI / 2;
    this.punto_escudos = [];
    let posicionesEscudos = generarPosiciones(5, 0.3);
    for (var i = 0; i < 5; i++) {
      var punto_escudo = new Punto_Escudo(this.circuito, posicionesEscudos[i], rot2);
      this.punto_escudos.push(punto_escudo);
      rot2 += Math.PI / 4;
    }
    this.circuito.add(...this.punto_escudos);

    // Puntos de Energía
    var rot3 = -Math.PI / 4;
    this.puntos_energia = [];
    let posicionesEnergia = generarPosiciones(5, 0.25);
    for (var i = 0; i < 5; i++) {
      var punto_energia = new Punto_Energia(this.circuito, posicionesEnergia[i], rot3);
      this.puntos_energia.push(punto_energia);
      rot3 += Math.PI / 8;
    }
    this.circuito.add(...this.puntos_energia);

    // Turbulencia
    this.turbulencias = [];
    let posicionesTurbulencias = generarPosiciones(3, 0.1);
    for (var i = 0; i < 3; i++) {
      var turbulencia = new Turbulencias(this.circuito, posicionesTurbulencias[i], Math.PI / 2 + i * Math.PI);
      this.turbulencias.push(turbulencia);
    }
    this.circuito.add(...this.turbulencias);
  }

  createSky() {
    var path = "../imgs/cube/";
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
    stats.domElement.style.left = '95%';
    stats.domElement.style.top = '20%';

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

  createGUI() {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();

    // La escena le va a añadir sus propios controles. 
    // Se definen mediante un objeto de control
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = {
      // En el contexto de una función   this   alude a la función
      ambientIntensity: 0.5,
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder('Luz ambiental');

    // Otro para la intensidad de la luz ambiental
    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental: ')
      .onChange((value) => this.setAmbientIntensity(value));

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
    // Luz direccional
    this.directionalLight = new THREE.DirectionalLight(0xfdf3c6, 1.5);
    this.directionalLight.position.set(1, 1, 1);
    this.add(this.directionalLight);
  }

  setAmbientIntensity(valor) {
    this.ambientLight.intensity = valor;
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

  updateHUD() {
    const escudo = document.getElementById("escudo");
    if (this.personaje.tengoEscudo) {
      escudo.style.display = "flex";
    }
    else {
      escudo.style.display = "none";
    }
    const speed = document.getElementById("speed");
    speed.innerHTML = "Speed: " + (this.personaje.speed * 1600).toFixed(2) + " km/h";
    const max_speed = document.getElementById("max_speed");
    max_speed.innerHTML = "Max Speed: " + (this.personaje.maxSpeed * 1600).toFixed(2) + " km/h";
    // Obtiene el elemento de la aguja
    var aguja = document.getElementById('aguja');
    // Aplica la rotación a la aguja mediante CSS
    // Calcula el ángulo de rotación de la aguja basado en la velocidad
    var angle = (this.personaje.speed * 1600 / 120) * 300;
    aguja.style.transform = 'rotate(' + angle + 'deg)';
    const vueltas = document.getElementById("vueltas");
    vueltas.innerHTML = "Vueltas: " + this.personaje.vueltas;

    const vuelta = document.getElementById("vuelta");
    if (this.personaje.activaVuelta) {
      vuelta.innerHTML = "( Vuelta " + this.personaje.vueltas + " de 5 )";
      vuelta.style.display = "block";
      setTimeout(() => {
        this.personaje.activaVuelta = false;
        vuelta.style.display = "none";
      }, 3000);

      if (this.personaje.vueltas >= 5) {
        this.gameOver = true;
        setTimeout(() => {
        this.finPartida(this.personaje.score);
        }, 1000);
      }
    }
    const score = document.getElementById("score");
    score.innerHTML = "Score: " + this.personaje.score + " pts";
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

  finPartida(puntuacion) {
    // Crear un contenedor para el mensaje de Game Over
    const gameOverContainer = document.createElement('div');
    gameOverContainer.id = 'gameOverContainer';
    gameOverContainer.style.position = 'fixed';
    gameOverContainer.style.top = '0';
    gameOverContainer.style.left = '0';
    gameOverContainer.style.width = '100%';
    gameOverContainer.style.height = '100%';
    gameOverContainer.style.display = 'flex';
    gameOverContainer.style.justifyContent = 'center';
    gameOverContainer.style.alignItems = 'center';
    gameOverContainer.style.zIndex = '9999';
    gameOverContainer.style.backdropFilter = 'blur(5px)'; // Fondo borroso
  
    // Crear el mensaje de Game Over
    const gameOverMessage = document.createElement('div');
    gameOverMessage.style.color = '#fff';
    gameOverMessage.style.textAlign = 'center';
    gameOverMessage.style.padding = '2em';
    gameOverMessage.style.borderRadius = '1em';
    
    const gameOverText = document.createElement('h1');
    gameOverText.innerText = '( Game Over )';
    
    const scoreText = document.createElement('p');
    scoreText.innerText = `Score: ${puntuacion} pts`;

    // Crear el botón de reinicio
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Reiniciar';
    restartButton.style.fontFamily = 'titulo';
    restartButton.style.marginTop = '20%';
    restartButton.style.padding = '1em';
    restartButton.style.fontSize = '2em';
    restartButton.style.cursor = 'pointer';
    restartButton.style.backgroundColor = '#ff0000';
    restartButton.style.color = '#000';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '1em';
    restartButton.onclick = function() {
        location.reload();
    };
  
    // Añadir el texto y el botón al mensaje
    gameOverMessage.appendChild(gameOverText);
    gameOverMessage.appendChild(scoreText);
    gameOverMessage.appendChild(restartButton);
  
    // Añadir el mensaje al contenedor
    gameOverContainer.appendChild(gameOverMessage);
  
    // Añadir el contenedor al cuerpo del documento
    document.body.appendChild(gameOverContainer);
}

  update() {
    if (this.gameOver) {
        return; // Salir de la función
  }

    this.updateHUD();

    if (this.stats) this.stats.update();

    // Se actualizan los elementos de la escena para cada frame

    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update();

    this.personaje.update(/*this.hijos*/);

    this.neumaticos.forEach(neumatico => neumatico.update());
    this.basicas.forEach(basica => basica.update());
    this.premium.update();
    this.punto_escudos.forEach(punto_escudo => punto_escudo.update());
    this.puntos_energia.forEach(punto_energia => punto_energia.update());

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render(this, this.getCamera());
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    // Limite de 144 fps
    //setTimeout(() =>
    requestAnimationFrame(() => this.update());
    // 1000 / 144);
  }
}
// FIN de la clase MyScene

// FUNCIONES AUXILIARES

var musicEnabled = true;

function alternarMusica() {
  // Seleccionar el botón y el audio
  var toggleButton = document.getElementById('toggleMusic');
  var audio = new Audio('../sound/main_theme.mp3');
  audio.loop = true; // Repetir la música
  audio.volume = 0.2; // Volumen inicial del audio

  if (musicEnabled) {
    audio.play(); // Reproducir la música si está activada
    toggleButton.textContent = 'Desactivar Música'; // Cambiar el texto del botón
  }

  toggleButton.addEventListener('click', () => {
    musicEnabled = !musicEnabled; // Alternar el estado de la música

    // Función para alternar la reproducción de la música
    if (!musicEnabled) {
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

// Función para mostrar la animación de carga
function mostrarCargando() {
  var cargandoDiv = document.createElement('div');
  cargandoDiv.id = 'cargando';
  cargandoDiv.innerHTML = '<p>Cargando...</p>';
  cargandoDiv.style.position = 'fixed';
  cargandoDiv.style.top = '50%';
  cargandoDiv.style.left = '50%';
  cargandoDiv.style.transform = 'translate(-50%, -50%)';
  cargandoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  cargandoDiv.style.padding = '20px';
  cargandoDiv.style.borderRadius = '10px';
  cargandoDiv.style.zIndex = '9999';

  // Crear un elemento <div> para la animación de la rueda giratoria
  var spinner = document.createElement('div');
  spinner.classList.add('spinner');
  cargandoDiv.appendChild(spinner);

  document.body.appendChild(cargandoDiv);
}

// Estilos CSS para la animación de la rueda giratoria
var styles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  border: 8px solid rgba(0, 0, 0, 0.3);
  border-top: 8px solid #333;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
`;

// Crear un elemento <style> para aplicar los estilos CSS
var styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);


// Función para ocultar la animación de carga
function ocultarCargando() {
  var cargandoDiv = document.getElementById('cargando');
  if (cargandoDiv) {
    cargandoDiv.parentNode.removeChild(cargandoDiv);
  }
}

function cargarEscena(scene){
  document.getElementById('startMenu').style.display = 'none';
  // Se muestran el div de la clase contenedor y el Output
  document.getElementsByClassName('contenedor')[0].style.display = 'block';
  document.getElementById('hud').style.display = 'block';
  // Pausamos el video de inicio y lo quitamos
  var video = document.getElementById('video');
  video.pause();
  video.style.display = 'none';
  video.currentTime = 0;

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  scene = new MyScene("#WebGL-output");
  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());
  // Que no se nos olvide, la primera visualización.
  scene.update();
}

// La función main
$(function () {
  alternarMusica(); // Alternar la música al cargar la página

  var scene; // Variable global para almacenar la escena

  var startButton = document.getElementById('startButton');
  startButton.addEventListener('click', () => {

    // Mostrar la animación de carga
    mostrarCargando();

    // Esperar medio segundo para cargar la escena
    setTimeout(() => {
      // Ocultar la animación de carga
      ocultarCargando();
      cargarEscena(scene);
    }, 500);
  });
});

