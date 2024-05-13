import * as THREE from '../libs/three.module.js'

class Circuito extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();
        // Se crea la parte de la interfaz que corresponde a la caja
        // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
        //this.createGUI(gui, titleGui);

        var vertices = [
            new THREE.Vector3(3.513597, 0.000000, 9.059264),
            new THREE.Vector3(-36.441284, 0.000000, 8.497508),
            new THREE.Vector3(-38.001717, 0.000000, 7.473474),
            new THREE.Vector3(-38.440590, 0.000000, 5.815515),
            new THREE.Vector3(-38.148010, 0.000000, 4.108791),
            new THREE.Vector3(-37.611610, 0.000000, 1.621852),
            new THREE.Vector3(-38.489353, 0.000000, 0.207710),
            new THREE.Vector3(-40.391132, 0.000000, -0.962615),
            new THREE.Vector3(-43.749268, 0.000000, -2.288937),
            new THREE.Vector3(-46.514790, 0.000000, -3.982115),
            new THREE.Vector3(-47.220280, 0.000000, -6.409003),
            new THREE.Vector3(-45.414223, 0.000000, -9.880017),
            new THREE.Vector3(-42.225403, 0.000000, -12.843079),
            new THREE.Vector3(-38.839046, 0.000000, -14.479817),
            new THREE.Vector3(-35.001179, 0.000000, -15.439284),
            new THREE.Vector3(-30.203842, 0.000000, -15.269966),
            new THREE.Vector3(-27.692295, -1.269883, -15.269966),
            new THREE.Vector3(-14.975266, -1.269883, -14.968580),
            new THREE.Vector3(-13.336812, -1.269883, -12.276834),
            new THREE.Vector3(-15.560429, -1.269883, -9.116957),
            new THREE.Vector3(-18.632532, -1.269883, -7.946632),
            new THREE.Vector3(-21.314526, -1.269883, -7.654051),
            new THREE.Vector3(-25.166845, -1.269883, -7.751578),
            new THREE.Vector3(-31.701159, -1.269883, -7.751578),
            new THREE.Vector3(-34.236862, -1.269883, -7.654051),
            new THREE.Vector3(-35.651005, -1.269883, -7.020125),
            new THREE.Vector3(-36.187405, -1.269883, -5.703509),
            new THREE.Vector3(-35.943588, -1.269883, -4.435658),
            new THREE.Vector3(-34.285629, -1.269883, -3.362860),
            new THREE.Vector3(-32.140034, -1.269883, -1.656136),
            new THREE.Vector3(-27.946369, -1.269883, 1.367203),
            new THREE.Vector3(-26.727282, -1.269883, 2.049893),
            new THREE.Vector3(-24.045288, -1.269883, 2.488765),
            new THREE.Vector3(-19.217697, -1.269883, 2.781346),
            new THREE.Vector3(-15.316614, -1.269883, 2.830109),
            new THREE.Vector3(-13.463600, -1.269883, 2.440001),
            new THREE.Vector3(-12.195748, -1.269883, 1.074622),
            new THREE.Vector3(-11.610586, -1.269883, -0.924683),
            new THREE.Vector3(-11.220478, -1.269883, -2.777697),
            new THREE.Vector3(-9.123646, -1.269883, -4.777002),
            new THREE.Vector3(-3.125731, -1.269883, -11.652660),
            new THREE.Vector3(-1.614061, -1.269883, -12.725458),
            new THREE.Vector3(0.629061, -1.269883, -13.554439),
            new THREE.Vector3(2.920947, -1.269883, -13.505675),
            new THREE.Vector3(5.017779, -1.269883, -12.579168),
            new THREE.Vector3(7.797301, -1.269883, -11.018735),
            new THREE.Vector3(9.561905, -0.455748, -9.819190),
            new THREE.Vector3(12.453892, 1.076957, -8.042780),
            new THREE.Vector3(15.816593, 2.607752, -5.997511),
            new THREE.Vector3(16.034950, 6.998048, -5.722469),
            new THREE.Vector3(15.940174, 11.545180, -6.629787),
            new THREE.Vector3(13.166657, 13.674579, -9.397227),
            new THREE.Vector3(11.386075, 12.364849, -12.720405),
            new THREE.Vector3(10.950070, 8.772722, -13.938166),
            new THREE.Vector3(12.286346, 4.622997, -13.792552),
            new THREE.Vector3(15.308601, 2.491031, -12.534615),
            new THREE.Vector3(18.544872, -0.326171, -9.108269),
            new THREE.Vector3(21.578669, -4.506540, -7.270603),
            new THREE.Vector3(24.086605, -6.142334, -5.795387),
            new THREE.Vector3(27.774334, -8.141637, -3.635996),
            new THREE.Vector3(30.822056, -8.141637, -0.303821),
            new THREE.Vector3(33.666595, -8.141637, 1.199722),
            new THREE.Vector3(36.389225, -8.141637, 2.256265),
            new THREE.Vector3(37.974041, -8.141637, 1.971811),
            new THREE.Vector3(38.624222, -8.141637, 0.386996),
            new THREE.Vector3(37.323860, -8.141637, -1.848000),
            new THREE.Vector3(35.576500, -8.141637, -4.529994),
            new THREE.Vector3(34.316776, -8.141637, -5.830355),
            new THREE.Vector3(32.406872, -8.141637, -6.561808),
            new THREE.Vector3(29.562332, -8.141637, -7.658988),
            new THREE.Vector3(27.164791, -8.141637, -9.162531),
            new THREE.Vector3(26.473974, -8.141637, -10.869255),
            new THREE.Vector3(27.327335, -8.141637, -12.697887),
            new THREE.Vector3(29.196604, -8.141637, -12.697887),
            new THREE.Vector3(31.837963, -8.141637, -11.925798),
            new THREE.Vector3(35.373322, -8.141637, -10.787983),
            new THREE.Vector3(38.339771, -8.141637, -9.853349),
            new THREE.Vector3(40.087132, -8.141637, -8.715532),
            new THREE.Vector3(41.306221, -8.141637, -5.870993),
            new THREE.Vector3(41.915764, -8.141637, -2.823272),
            new THREE.Vector3(43.053581, -8.141637, -1.604183),
            new THREE.Vector3(44.597759, -8.141637, -0.994639),
            new THREE.Vector3(46.101303, -8.913727, -0.425731),
            new THREE.Vector3(47.686115, -8.141637, 2.174991),
            new THREE.Vector3(48.255024, -8.141637, 5.588439),
            new THREE.Vector3(47.523571, -8.751181, 7.498344),
            new THREE.Vector3(43.947578, -9.482635, 9.205069),
            new THREE.Vector3(40.371586, -10.051542, 9.733340),
            new THREE.Vector3(29.843863, -7.694638, 9.733340),
            new THREE.Vector3(15.867579, -4.841321, 9.733340),
            new THREE.Vector3(12.875489, -3.630991, 9.430302),
            new THREE.Vector3(9.690588, -2.420661, 9.196302),
            new THREE.Vector3(6.505686, -1.210331, 8.962302),
            new THREE.Vector3(5.0096415, -0.6051655, 8.962302)

        ];
        // Crear una curva a partir de los vértices
        var curve = new THREE.CatmullRomCurve3(vertices);

        // Parámetros del tubo
        var radius = 1.5;
        var segments = 1000;

        // Crear la geometría del tubo
        this.tubeGeometry = new THREE.TubeGeometry(curve, segments, radius, 40, true);

        // Material para el tubo
        var textura = new THREE.TextureLoader().load('../imgs/carretera1.jpg');
        var normal = new THREE.TextureLoader().load('../imgs/normalcarretera.png');
        textura.wrapS = THREE.RepeatWrapping;
        textura.wrapT = THREE.RepeatWrapping;
        textura.repeat.set(10, 1); // Ajusta el factor de repetición según tus necesidades
        normal.wrapS = THREE.RepeatWrapping;
        normal.wrapT = THREE.RepeatWrapping;
        normal.repeat.set(100, 2); // Ajusta el factor de repetición según tus necesidades

        var material = new THREE.MeshStandardMaterial({ map: textura, normalMap: normal, normalScale: new THREE.Vector2(0.1, 0.1) });

        // Crear el mesh del tubo y agregarlo al circuito
        this.tubeMesh = new THREE.Mesh(this.tubeGeometry, material);
        this.add(this.tubeMesh);
    }

    createGUI(gui, titleGui) {
        // Controles para el tamaño, la orientación y la posición de la caja
        this.guiControls = {
            sizeX: 1.0,
            sizeY: 1.0,
            sizeZ: 1.0,

            rotX: 0.0,
            rotY: 0.0,
            rotZ: 0.0,

            posX: 0.0,
            posY: 0.0,
            posZ: 0.0,

            anim: false,
            // Un botón para dejarlo todo en su posición inicial
            // Cuando se pulse se ejecutará esta función.
            reset: () => {
                this.guiControls.sizeX = 1.0;
                this.guiControls.sizeY = 1.0;
                this.guiControls.sizeZ = 1.0;

                this.guiControls.rotX = 0.0;
                this.guiControls.rotY = 0.0;
                this.guiControls.rotZ = 0.0;

                this.guiControls.posX = 0.0;
                this.guiControls.posY = 0.0;
                this.guiControls.posZ = 0.0;
                this.guiControls.anim = false;
            }
        };

        // Se crea una sección para los controles de la caja
        var folder = gui.addFolder(titleGui);
        // Estas lineas son las que añaden los componentes de la interfaz
        // Las tres cifras indican un valor mínimo, un máximo y el incremento
        // El método   listen()   permite que si se cambia el valor de la variable en código, el deslizador de la interfaz se actualice
        folder.add(this.guiControls, 'sizeX', 0.1, 5.0, 0.01).name('Tamaño X : ').listen();
        folder.add(this.guiControls, 'sizeY', 0.1, 5.0, 0.01).name('Tamaño Y : ').listen();
        folder.add(this.guiControls, 'sizeZ', 0.1, 5.0, 0.01).name('Tamaño Z : ').listen();

        folder.add(this.guiControls, 'rotX', 0.0, Math.PI / 2, 0.01).name('Rotación X : ').listen();
        folder.add(this.guiControls, 'rotY', 0.0, Math.PI / 2, 0.01).name('Rotación Y : ').listen();
        folder.add(this.guiControls, 'rotZ', 0.0, Math.PI / 2, 0.01).name('Rotación Z : ').listen();

        folder.add(this.guiControls, 'posX', -20.0, 20.0, 0.01).name('Posición X : ').listen();
        folder.add(this.guiControls, 'posY', 0.0, 10.0, 0.01).name('Posición Y : ').listen();
        folder.add(this.guiControls, 'posZ', -20.0, 20.0, 0.01).name('Posición Z : ').listen();
        folder.add(this.guiControls, 'anim').name('Girar: ').listen();
        folder.add(this.guiControls, 'reset').name('[ Reset ]');
    }
    
    update() {
        this.position.set(this.guiControls.posX, this.guiControls.posY, this.guiControls.posZ);
        if (this.guiControls.anim) {
            this.rot = (this.rot + 0.01) % (Math.PI * 2);
            this.rotation.set(this.guiControls.rotX, this.rot, this.guiControls.rotZ);
        } else {
            this.rotation.set(this.guiControls.rotX, this.guiControls.rotY, this.guiControls.rotZ);
        }
        this.scale.set(this.guiControls.sizeX, this.guiControls.sizeY, this.guiControls.sizeZ);
    }
}

export { Circuito };