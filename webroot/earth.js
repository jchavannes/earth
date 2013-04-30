var Scene = new (function() {
    this.Obj = {
        earth: null,
        sun:   null,
        moon:  null
    };
    var pixelsPerKm = 0.1;
    var settings = this.settings = {
        diameter: {
            sun:   pixelsPerKm * 1391000,
            earth: pixelsPerKm * 12742,
            moon:  pixelsPerKm * 3474
        },
        distance: {
            earth: pixelsPerKm * 149597871,
            moon:  pixelsPerKm * 384400
        },
        rotation: {
            earth: 24,
            moon: 653
        },
        orbit: {
            earth: 8766,
            moon: 653
        }
    };
    this.Camera = null;
    this.Scene = null;
    this.Renderer = null;
    this.Init = function() {
        Scene.Scene = new THREE.Scene(); // Initialize Scene
        Scene.Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, settings.distance.earth * 1.5); // Initialize Camera
        Scene.Camera.position.x = settings.distance.earth * 0.997; // Behind Earth
        Scene.Camera.position.z = settings.distance.moon * 0.5; // Slightly off center
        Scene.Camera.rotation.y = -1.4; // Rotated back to see moon and earth
        Scene.Scene.add(Scene.Camera); // Add to scene

        if (localStorage && localStorage.camera && false) {
            try {
                var camera = JSON.parse(localStorage.camera);
                Scene.Camera.position.x = camera.posX;
                Scene.Camera.position.z = camera.posZ;
                Scene.Camera.rotation.y = camera.rotY;
            } catch(e) {}
        }

        Scene.Obj.sun   = addSphere(settings.diameter.sun, 0, 0, 0xFFFF33); // Sun
        Scene.Obj.earth = addEarth(settings.diameter.earth, settings.distance.earth, 0); // Earth
        Scene.Obj.moon  = addMoon(settings.diameter.moon, settings.distance.earth, settings.distance.moon, 0x333333); // Moon

        addLight(0, 0, 0, 0); // Sunlight
        addLight(settings.diameter.sun*3, 0, 0, 180); // Makes sun visible
        Scene.Renderer = new THREE.WebGLRenderer();
        Scene.Renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(Scene.Renderer.domElement);
    };
    var addLight = function(posX, posY, posZ, rotX) {
        var light = new THREE.PointLight(0xffffff, 2);
        light.position.x = posX;
        light.position.y = posY;
        light.position.z = posZ;
        light.rotation.x = rotX;
        Scene.Scene.add(light);
    };
    var addEarth = function(diameter, posX, posZ) {
        var radius = diameter / 2;
        var geometry = new THREE.SphereGeometry(radius, radius / 10, radius / 10);
        var material = new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture('lib/earth_mrdoob.jpg')});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = posX;
        sphere.position.z = posZ;
        var d = new Date();
        var time = (d.getMinutes() + 60 * d.getHours()) / (24 * 60);
        time += 8 / 24;
        sphere.rotation.y = time * 2 * Math.PI;
        sphere.rotation.x = 23.4 / 180 * Math.PI;
        Scene.Scene.add(sphere);
        return sphere;
    };
    var addMoon = function(diameter, posX, posZ, color) {
        var radius = diameter / 2;
        var geometry = new THREE.SphereGeometry(radius, radius / 10, radius / 10);
        var material = new THREE.MeshLambertMaterial({color:color});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = posX;
        sphere.position.z = posZ;
        Scene.Scene.add(sphere);
        return sphere;
    };
    var addSphere = function(diameter, posX, posZ, color) {
        var radius = diameter / 2;
        var geometry = new THREE.SphereGeometry(radius);
        var material = new THREE.MeshLambertMaterial({color:color});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = posX;
        sphere.position.z = posZ;
        Scene.Scene.add(sphere);
        return sphere;
    };
    $(this.Init);
});
var Controls = new (function() {
    this.keyDown = {
        left:  false,
        right: false,
        up:    false,
        down:  false,
        keyW:  false,
        keyA:  false,
        keyS:  false,
        keyD:  false
    };
    $(document).keydown(function(e) {
             if (e.keyCode == 37) { Controls.keyDown.left  = true; }
        else if (e.keyCode == 38) { Controls.keyDown.up    = true; }
        else if (e.keyCode == 39) { Controls.keyDown.right = true; }
        else if (e.keyCode == 40) { Controls.keyDown.down  = true; }
        else if (e.keyCode == 87) { Controls.keyDown.keyW  = true; }
        else if (e.keyCode == 65) { Controls.keyDown.keyA  = true; }
        else if (e.keyCode == 83) { Controls.keyDown.keyS  = true; }
        else if (e.keyCode == 68) { Controls.keyDown.keyD  = true; }
        else { return; }
        e.preventDefault();
    }).keyup(function(e) {
             if(e.keyCode == 37) { Controls.keyDown.left  = false; }
        else if(e.keyCode == 38) { Controls.keyDown.up    = false; }
        else if(e.keyCode == 39) { Controls.keyDown.right = false; }
        else if(e.keyCode == 40) { Controls.keyDown.down  = false; }
        else if(e.keyCode == 87) { Controls.keyDown.keyW  = false; }
        else if(e.keyCode == 65) { Controls.keyDown.keyA  = false; }
        else if(e.keyCode == 83) { Controls.keyDown.keyS  = false; }
        else if(e.keyCode == 68) { Controls.keyDown.keyD  = false; }
    });
});
var Animate = new (function() {
    $(window).resize(function() {window.location.href = "";});
    this.Init = function() {
        setInterval(update, 1000 / 30);
    };
    var update = function() {
        updateCamera();
        updateObjects();
        Scene.Renderer.render(Scene.Scene, Scene.Camera);
    };
    var updateCamera = function() {
        var speed = Scene.settings.diameter.moon;
        var direction = (Scene.Camera.rotation.y % (2 * Math.PI)) / (2 * Math.PI) * 360;
        if (Controls.keyDown.up || Controls.keyDown.keyW) {
            Scene.Camera.position.z -= speed * vectorZ(direction);
            Scene.Camera.position.x -= speed * vectorX(direction);
        }
        if (Controls.keyDown.down || Controls.keyDown.keyS) {
            Scene.Camera.position.z += speed * vectorZ(direction);
            Scene.Camera.position.x += speed * vectorX(direction);
        }
        if (Controls.keyDown.keyA) {
            Scene.Camera.position.z += speed * vectorZ(direction - 90);
            Scene.Camera.position.x += speed * vectorX(direction - 90);
        }
        if (Controls.keyDown.keyD) {
            Scene.Camera.position.z += speed * vectorZ(direction + 90);
            Scene.Camera.position.x += speed * vectorX(direction + 90);
        }
        if (Controls.keyDown.left) {
            Scene.Camera.rotation.y += 0.1;
        }
        if (Controls.keyDown.right) {
            Scene.Camera.rotation.y -= 0.1;
        }
        if (localStorage) {
            var camera = {
                posZ: Scene.Camera.position.z,
                posX: Scene.Camera.position.x,
                rotY: Scene.Camera.rotation.y
            };
            localStorage.camera = JSON.stringify(camera);
        }
    };
    var moonOrbit = 0;
    var timeMultiplier = 3600; // 1 = realtime, 5 = 5x time, etc
    var hourToFrameRate = 108000 / timeMultiplier;
    var updateObjects = function() {
        Scene.Obj.earth.rotation.y += 1 / Scene.settings.rotation.earth / hourToFrameRate * 2 * Math.PI;
        moonOrbit += 1 / Scene.settings.orbit.moon / hourToFrameRate * 360;
        if (moonOrbit >= 360) moonOrbit = 0;
        Scene.Obj.moon.position.x = Scene.settings.distance.earth + Scene.settings.distance.moon * vectorX(moonOrbit);
        Scene.Obj.moon.position.z = Scene.settings.distance.moon * vectorZ(moonOrbit);
    };
    var vectorX = function(direction) {
        return Math.sin(Math.PI * (direction / 180));
    };
    var vectorZ = function(direction) {
        return Math.cos(Math.PI * (direction / 180));
    };
    $(this.Init);
});
