var Scene = new (function() {
    this.Camera = null;
    this.Scene = null;
    this.Renderer = null;
    this.Init = function() {

        // Create scene object
        Scene.Scene = new THREE.Scene();

        // Add camera
        Scene.Camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 5000);
        Scene.Camera.position.x = 1020;
        Scene.Camera.position.z = 45;
        Scene.Camera.rotation.y = 1.2;
        Scene.Scene.add(Scene.Camera);

        // Add light
        addLight(0, 0, 0, 0);
        addLight(150, 0, 0, -180);


        addSphere(50, 0, 0, 0xFFFF33); // Sun
        addSphere(10, 1000, 0, 0xFFFFFF); // Earth
        addSphere(4, 1000, 20, 0xFFFFFF); // Moon

        // Create renderer object and append to DOM
        Scene.Renderer = new THREE.WebGLRenderer();
        Scene.Renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(Scene.Renderer.domElement);
    };
    var addLight = function(posX, posY, posZ, rotX) {
        var light = new THREE.PointLight(0xffffff, 2);
        light.position.x = posX;
        light.position.y = posY;
        light.position.z = posZ;
        light.rotation.x -= rotX;
        Scene.Scene.add(light);
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
        left: false,
        right: false,
        up: false,
        down: false,
        keyW: false,
        keyA: false,
        keyS: false,
        keyD: false
    };
    $(document).keydown(function(e) {
        if (e.keyCode == 37) { Controls.keyDown.left = true; }
        else if (e.keyCode == 38) { Controls.keyDown.up = true; }
        else if (e.keyCode == 39) { Controls.keyDown.right = true; }
        else if (e.keyCode == 40) { Controls.keyDown.down = true; }
        else if (e.keyCode == 87) { Controls.keyDown.keyW = true; }
        else if (e.keyCode == 65) { Controls.keyDown.keyA = true; }
        else if (e.keyCode == 83) { Controls.keyDown.keyS = true; }
        else if (e.keyCode == 68) { Controls.keyDown.keyD = true; }
        else { return; }
        e.preventDefault();
    }).keyup(function(e) {
        if(e.keyCode == 37) { Controls.keyDown.left = false; }
        else if(e.keyCode == 38) { Controls.keyDown.up = false; }
        else if(e.keyCode == 39) { Controls.keyDown.right = false; }
        else if(e.keyCode == 40) { Controls.keyDown.down = false; }
        else if(e.keyCode == 87) { Controls.keyDown.keyW = false; }
        else if(e.keyCode == 65) { Controls.keyDown.keyA = false; }
        else if(e.keyCode == 83) { Controls.keyDown.keyS = false; }
        else if(e.keyCode == 68) { Controls.keyDown.keyD = false; }
    });
});
var Animate = new (function() {
    $(window).resize(function() {window.location.href = "";});
    this.Init = function() {
        setInterval(update, 1000/30);
    };
    var update = function() {
        updateCamera();
        Scene.Renderer.render(Scene.Scene, Scene.Camera);
    };
    var updateCamera = function() {
        var direction = (Scene.Camera.rotation.y % (2*Math.PI)) / (2*Math.PI) * 360;
        if (Controls.keyDown.up || Controls.keyDown.keyW) {
            Scene.Camera.position.z -= 5*vectorZ(direction);
            Scene.Camera.position.x -= 5*vectorX(direction);
        }
        if (Controls.keyDown.down || Controls.keyDown.keyS) {
            Scene.Camera.position.z += 5*vectorZ(direction);
            Scene.Camera.position.x += 5*vectorX(direction);
        }
        if (Controls.keyDown.keyA) {
            Scene.Camera.position.z += 5*vectorZ(direction-90);
            Scene.Camera.position.x += 5*vectorX(direction-90);
        }
        if (Controls.keyDown.keyD) {
            Scene.Camera.position.z += 5*vectorZ(direction+90);
            Scene.Camera.position.x += 5*vectorX(direction+90);
        }
        if (Controls.keyDown.left) {
            Scene.Camera.rotation.y += 0.1;
        }
        if (Controls.keyDown.right) {
            Scene.Camera.rotation.y -= 0.1;
        }
    };
    var vectorX = function(direction) {
        return Math.sin(Math.PI * (direction/180));
    };
    var vectorZ = function(direction) {
        return Math.cos(Math.PI * (direction/180));
    };
    $(this.Init);
});
