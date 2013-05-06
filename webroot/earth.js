var Scene = new (function() {
    this.Obj = {
        earth: null,
        sun:   null,
        moon:  null
    };
    var pixelsPerKm = 0.05;
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
            moon:  653
        },
        orbit: {
            earth: 8766, // 365.26
            moon:  653 // 27.21
        },
        timeMultiplier: 3600, // 3600 = 1 hour/sec, 60 = 1 minute/sec, 1 = real-time
        moveObjects: true,
        lockCameraToEarth: false,
        needsCameraReset: true,
        pixelsPerKm: pixelsPerKm
    };
    this.Camera = null;
    this.Scene = null;
    this.Renderer = null;
    this.Init = function() {
        Scene.Scene = new THREE.Scene(); // Initialize Scene
        Scene.Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, settings.distance.earth * 1.5); // Initialize Camera
        Scene.Camera.rotation.y = -1.1; // Rotated back to see moon and earth
        Scene.Scene.add(Scene.Camera); // Add to scene

        Scene.Obj.earth = addEarth(settings.diameter.earth, 0, settings.distance.earth); // Earth
        Scene.Obj.moon  = addMoon(settings.diameter.moon, settings.distance.earth, settings.distance.moon); // Moon
        Scene.Obj.sun   = addSun(settings.diameter.sun, 0, 0, 0xFFFF33); // Sun

        if (localStorage && localStorage.camera) {
            try {
                var camera = JSON.parse(localStorage.camera);
                Scene.Camera.position.x = camera.posX;
                Scene.Camera.position.z = camera.posZ;
                Scene.Camera.rotation.y = camera.rotY;
                Scene.settings.needsCameraReset = false;
            } catch(e) {}
        }

        addLight(0, 0, 0); // Sunlight

        // Stars
        var stars = new THREE.Geometry();
        for (var i = 0; i < 1e4; i++) {
            var factor = 1e8 * settings.pixelsPerKm;
            stars.vertices.push(new THREE.Vector3(
                Scene.Camera.position.x + (1e3 * Math.random() - 5e2) * factor,
                Scene.Camera.position.y + (1e3 * Math.random() - 5e2) * factor,
                Scene.Camera.position.z + (1e3 * Math.random() - 5e2) * factor
            ));
        }
        var material = new THREE.ParticleBasicMaterial();
        Scene.Scene.add(new THREE.ParticleSystem(stars, material));

        Scene.Renderer = new THREE.WebGLRenderer();
        Scene.Renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(Scene.Renderer.domElement);
        setTimeout(function() {
            Scene.settings.lockCameraToEarth = true;
            if (localStorage && localStorage.lockCameraToEarth) {
                Scene.settings.lockCameraToEarth = localStorage.lockCameraToEarth != "false";
            }
            $('#lockButton').val("Lock to Earth: " + (Scene.settings.lockCameraToEarth ? "On" : "Off"));
        }, 100);
    };
    var addLight = function(posX, posY, posZ) {
        var light = new THREE.PointLight(0xffffff, 2);
        light.position.x = posX;
        light.position.y = posY;
        light.position.z = posZ;
        Scene.Scene.add(light);
    };
    var addEarth = function(diameter, posX, posZ) {
        var radius = diameter / 2;
        var geometry = new THREE.SphereGeometry(radius, 50, 50);
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
    var addMoon = function(diameter, posX, posZ) {
        var radius = diameter / 2;
        var geometry = new THREE.SphereGeometry(radius, 50, 50);
        var material = new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture('lib/moon_mrdoob.jpg')});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = posX;
        sphere.position.z = posZ;
        Scene.Scene.add(sphere);
        return sphere;
    };
    var addSun = function(diameter, posX, posZ, color) {
        var radius = diameter / 2;
        var geometry = new THREE.SphereGeometry(radius, 50, 50);
        var material = new THREE.MeshBasicMaterial({color:color});
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
    this.reset = function() {
        Animate.clearInterval();
        if (localStorage) {
            localStorage.camera = null;
            localStorage.orbits = null;
            localStorage.lockCameraToEarth = null;
        }
        location.reload();
    };
    this.playPause = function() {
        Scene.settings.moveObjects = !Scene.settings.moveObjects;
        $('#playButton').val("Move Objects: " + (Scene.settings.moveObjects ? "On" : "Off"));
    };
    this.earthLock = function() {
        Scene.settings.lockCameraToEarth = !Scene.settings.lockCameraToEarth;
        if (localStorage) {
            localStorage.lockCameraToEarth = Scene.settings.lockCameraToEarth ? "true" : "false";
        }
        $('#lockButton').val("Lock to Earth: " + (Scene.settings.lockCameraToEarth ? "On" : "Off"));
    };
    this.backToEarth = function() {
        Scene.settings.needsCameraReset = true;
    };
});
var Animate = new (function() {
    var interval;
    this.Init = function() {
        interval = setInterval(update, 1000 / 30);
    };
    this.clearInterval = function() {
        clearInterval(interval);
    };
    var update = function() {
        if (Scene.settings.moveObjects) updateObjects();
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
        if (localStorage) {
            localStorage.camera = JSON.stringify({
                posZ: Scene.Camera.position.z,
                posX: Scene.Camera.position.x,
                rotY: Scene.Camera.rotation.y
            });
        }
    };
    var moonOrbit = 113.34
      , earthOrbit = 113.34;
    (function() {
        if (localStorage && localStorage.orbits) {
            try {
                var orbits = JSON.parse(localStorage.orbits);
                moonOrbit = orbits.moonOrbit;
                earthOrbit = orbits.earthOrbit;
            } catch(e) {}
        }
    })();
    var hourToFrameRate = 108000 / Scene.settings.timeMultiplier;
    var updateObjects = function() {
        if (Scene.settings.lockCameraToEarth) {
            var startX = Scene.Obj.earth.position.x;
            var startZ = Scene.Obj.earth.position.z;
        }
        earthOrbit += 1 / Scene.settings.orbit.earth / hourToFrameRate * 360;
        if (earthOrbit >= 360) earthOrbit = 0;
        Scene.Obj.earth.position.x = Scene.settings.distance.earth * vectorX(earthOrbit);
        Scene.Obj.earth.position.z = Scene.settings.distance.earth * vectorZ(earthOrbit);
        Scene.Obj.earth.rotation.y += 1 / Scene.settings.rotation.earth / hourToFrameRate * 2 * Math.PI;
        if (Scene.settings.lockCameraToEarth) {
            if (Scene.settings.needsCameraReset) {
                Scene.Camera.position.x = Scene.Obj.earth.position.x - Scene.settings.distance.moon * vectorX(earthOrbit + 45) * 0.15;
                Scene.Camera.position.z = Scene.Obj.earth.position.z - Scene.settings.distance.moon * vectorZ(earthOrbit + 45) * 0.15;
                Scene.Camera.rotation.y = (earthOrbit / 180 + 1) * Math.PI + 0.5;
                Scene.settings.needsCameraReset = false;
            }
            Scene.Camera.position.x -= startX - Scene.Obj.earth.position.x;
            Scene.Camera.position.z -= startZ - Scene.Obj.earth.position.z;
        }
        moonOrbit += 1 / Scene.settings.orbit.moon / hourToFrameRate * 360;
        if (moonOrbit >= 360) moonOrbit = 0;
        Scene.Obj.moon.position.x = Scene.settings.distance.moon * vectorX(moonOrbit) + Scene.Obj.earth.position.x;
        Scene.Obj.moon.position.z = Scene.settings.distance.moon * vectorZ(moonOrbit) + Scene.Obj.earth.position.z;
        Scene.Obj.moon.rotation.y = moonOrbit / 360 * 2 * Math.PI + 1.2;
        if (localStorage) {
            localStorage.orbits = JSON.stringify({
                moonOrbit: moonOrbit,
                earthOrbit: earthOrbit
            });
        }
        Graphs.MonthMarker.css({left: (earthOrbit / 3.6) + "%"});
    };
    var vectorX = function(direction) {
        return Math.sin(Math.PI * (direction / 180));
    };
    var vectorZ = function(direction) {
        return Math.cos(Math.PI * (direction / 180));
    };
    $(this.Init);
    $(window).resize(function() {location.reload();});
});
var Graphs = new (function() {
    this.MonthMarker = null;
    var monthText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var Init = function() {
        $('body').append("<div class='graphs'><div class='months'></div></div>");
        var $months = $('.months');
        var i, g
          , $month, daysInMonth, width
          , year = new Date().getYear()
          , daysInYear = getDaysInYear(year);
        for (i = 0; i < 12; i++) {
            $months.append("<div data-month='" + (i + 1) + "'><span>" + monthText[i] + "</span></div>");
            $month = $("[data-month=" + (i + 1) + "]");
            daysInMonth = getDaysInMonth(i + 1, year);
            $month.css({width: (daysInMonth / daysInYear * 100) + "%"});
            for (g = 0; g < daysInMonth; g++) {
                $month.append("<p></p>");
            }
            width = 100 / daysInMonth;
            $month.find('p').css({width: width + "%"});
        }
        $months.append("<svg id='sineWave' width='100%' height='120'></svg><div class='marker'></div>");
        addSineOverlay();
        Graphs.MonthMarker = $('.marker');
    };
    var addSineOverlay = function() {
        var svg = document.getElementById('sineWave');
        var width = parseInt($(window).width());
        var totalCycles = 365.26 / 29.53;
        var maxX = width / totalCycles;
        var maxY = 20;
        var globalOffsetLeft = -0.808 * (width / totalCycles);
        var cycles, paths, angle, i, x, y, path, offsetLeft;
        for (cycles = 1; cycles <= totalCycles + 2; cycles++) {
            paths = [];
            offsetLeft = globalOffsetLeft + maxX * (cycles - 1);
            for (i = 0; i <= maxX; i++) {
                angle = (i / maxX) * Math.PI * 2;
                x = offsetLeft + angle * maxX / (Math.PI * 2);
                y = Math.sin(angle) * (maxY / 2) + (maxY / 2);
                paths.push((i == 0 ? 'M' : 'L') + x + ',' + y);
            }
            path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', paths.join(' ') );
            path.style.stroke = '#0f0';
            path.style.fill = 'none';
            svg.appendChild(path);
        }

    };
    var getDaysInMonth = function(m, y) {
        return /8|3|5|10/.test(--m)?30:m==1?(!(y%4)&&y%100)||!(y%400)?29:28:31;
    };
    var getDaysInYear = function(y) {
        return 365 - 28 + getDaysInMonth(2, y);
    };
    $(Init);
});
