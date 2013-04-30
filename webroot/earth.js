var Scene = new (function() {
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
        }
    };
    this.Camera = null;
    this.Scene = null;
    this.Renderer = null;
    this.Init = function() {
        Scene.Scene = new THREE.Scene(); // Initialize Scene
        Scene.Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, settings.distance.earth*1.5); // Initialize Camera
        Scene.Camera.position.x = settings.distance.earth * 0.997; // Behind Earth
        Scene.Camera.position.z = settings.distance.moon * 0.5; // Horizontally further than moon
        Scene.Camera.rotation.y = -1.4; // Rotated back to see all 3
        Scene.Scene.add(Scene.Camera); // Add to scene
        addLight(0, 0, 0, 0); // Sunlight
        addLight(settings.diameter.sun*3, 0, 0, 180); // Makes sun visible
        addSphere(settings.diameter.sun, 0, 0, 0xFFFF33); // Sun
        addEarth(settings.diameter.earth, settings.distance.earth, 0); // Earth
        addSphere(settings.diameter.moon, settings.distance.earth, settings.distance.moon, 0x333333); // Moon
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
    var addEarth = function(radius, posX, posZ) {
        radius = radius - (radius%2);
        var geometry = new THREE.SphereGeometry(radius, radius / 10, radius / 10);
        var material = new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture('lib/earth_mrdoob.jpg')});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = posX;
        sphere.position.z = posZ;
        Scene.Scene.add(sphere);
    };
    var addSphere = function(radius, posX, posZ, color) {
        var geometry = new THREE.SphereGeometry(radius);
        var material = new THREE.MeshLambertMaterial({color:color});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = posX;
        sphere.position.z = posZ;
        Scene.Scene.add(sphere);
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
        Scene.Renderer.render(Scene.Scene, Scene.Camera);
    };
    var updateCamera = function() {
        var speed = Scene.settings.diameter.earth;
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
    };
    var vectorX = function(direction) {
        return Math.sin(Math.PI * (direction / 180));
    };
    var vectorZ = function(direction) {
        return Math.cos(Math.PI * (direction / 180));
    };
    $(this.Init);
});
