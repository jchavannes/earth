var Scene = new (function() {
    this.Obj = {};
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
            earth: 23.934,
            moon:  653
        },
        orbit: {
            earth: 365.26,
            moon:  27.21
        },
        timeMultiplier: 1, // 1 = real-time, 60 = 1 minute/sec, 3600 = 1 hour/sec
        moveObjects: true,
        lockCameraToEarth: true,
        needsCameraReset: true,
        secondsInYear: 60 * 60 * 24 * 365 * 1000,
        yearsSinceEpoch: 43,
        pixelsPerKm: pixelsPerKm
    };
    var Init = function() {
        Scene.Scene = new THREE.Scene();
        Scene.Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, settings.distance.earth * 1.5);
        Scene.Scene.add(Scene.Camera);

        Scene.Obj.earth   = addEarth(settings.diameter.earth / 2, 0, settings.distance.earth, "res/earth_mrdoob.jpg");
        Scene.Obj.moon    = addMoon(settings.diameter.moon / 2, settings.distance.earth, settings.distance.moon);
        Scene.Obj.sun     = addSun(settings.diameter.sun / 2, 0, 0, 0xFFFF33);

        Scene.Obj.tropics = addEarth(settings.diameter.earth / 2, 0, settings.distance.earth, "res/tropics.png");
        Scene.Obj.earth.overlays = [Scene.Obj.tropics];
        Scene.Obj.tropics.material.opacity = 0;

        LS.loadCamera();
        LS.loadCameraLock();

        Scene.Scene.add(new THREE.PointLight(0xffffff, 1.15)); // Sunlight
        Scene.Scene.add(new THREE.AmbientLight(0x111111)); // Ambient

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
    };
    var addEarth = function(radius, posX, posZ, img) {
        var geometry = new THREE.SphereGeometry(radius, 50, 50);
        var material = new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture(img), transparent:true});
        var sphere = addSphere(geometry, material, posX, posZ);
        sphere.rotation.x = 23.4 / 180 * Math.PI;
        return sphere;
    };
    var addMoon = function(radius, posX, posZ) {
        var geometry = new THREE.SphereGeometry(radius, 50, 50);
        var material = new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture('res/moon_mrdoob.jpg')});
        return addSphere(geometry, material, posX, posZ);
    };
    var addSun = function(radius, posX, posZ, color) {
        var geometry = new THREE.SphereGeometry(radius, 50, 50);
        var material = new THREE.MeshBasicMaterial({color:color});
        return addSphere(geometry, material, posX, posZ);
    };
    var addSphere = function(geometry, material, posX, posZ) {
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = posX;
        sphere.position.z = posZ;
        Scene.Scene.add(sphere);
        return sphere;
    };
    $(Init);
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
        LS.clearAll();
        location.href = window.location.href;
    };
    this.timeToggle = function() {
        switch (Scene.settings.timeMultiplier) {
            case 1:
                Scene.settings.timeMultiplier = 3600;
                break;
            case 3600:
                Scene.settings.timeMultiplier = 86400;
                break;
            default:
                Scene.settings.timeMultiplier = 1;
        }
        setButtonStatuses();
    };
    this.playPause = function() {
        Scene.settings.moveObjects = !Scene.settings.moveObjects;
        setButtonStatuses();
    };
    this.earthLock = function() {
        Scene.settings.lockCameraToEarth = !Scene.settings.lockCameraToEarth;
        LS.saveCameraLock();
        setButtonStatuses();
    };
    this.backToEarth = function() {
        Scene.settings.needsCameraReset = true;
        Scene.settings.lockCameraToEarth = true;
        LS.saveCameraLock();
        setButtonStatuses();
    };
    this.visitTheSun = function() {
        Scene.Camera.position.x = -Scene.settings.diameter.sun;
        Scene.Camera.position.z = Scene.settings.diameter.sun;
        Scene.Camera.rotation.y = 5.54;
        Scene.settings.lockCameraToEarth = false;
        LS.saveCameraLock();
        setButtonStatuses();
    };
    this.highlightTropics = function() {
        Scene.Obj.tropics.material.opacity = Scene.Obj.tropics.material.opacity == 0 ? 1 : 0;
        setButtonStatuses();
    };
    var $lockButton
      , $playButton
      , $speedButton
      , $topicsButton
    ;
    var Init = function() {
        $lockButton = $('#lockButton');
        $playButton = $('#playButton');
        $speedButton = $('#speedButton');
        $topicsButton = $('#tropicsButton');
    };
    $(Init);
    var setButtonStatuses = this.setButtonStatuses = function() {
        $lockButton.val("Lock to Earth: " + (Scene.settings.lockCameraToEarth ? "On" : "Off"));
        $playButton.val("Move Objects: " + (Scene.settings.moveObjects ? "On" : "Off"));
        $speedButton.val("Speed: " + (Scene.settings.timeMultiplier == 1 ? "Real-time" : (Scene.settings.timeMultiplier == 3600 ? "1 sec = 1 hour" : "1 sec = 1 day")));
        $topicsButton.val("Highlight Tropics: " + (Scene.Obj.tropics.material.opacity == 1 ? "On" : "Off"));
    };
});
var Animate = new (function() {
    var updateInterval
      , moonOrbit
      , earthOrbit
      , $earthIcon
      , $cameraIcon
    ;
    var Init = function() {
        $earthIcon = $('.orbit .earth');
        $cameraIcon = $('.orbit .camera');
        var orbits = LS.loadOrbits();
        if (orbits != false) {
            moonOrbit = orbits.moon;
            earthOrbit = orbits.earth;
        }
        else {
            Animate.setEarthOrbit();
        }
        Scene.Obj.earth.position.x = Scene.settings.distance.earth * vectorX(earthOrbit);
        Scene.Obj.earth.position.z = Scene.settings.distance.earth * vectorZ(earthOrbit);
        updateInterval = setInterval(update, 1000 / 30);
        Controls.setButtonStatuses();
    };
    this.clearInterval = function() {
        clearInterval(updateInterval);
    };
    var update = function() {
        if (Scene.settings.moveObjects) updateObjects();
        updateCamera();
        setOrbitIcons();
        Scene.Renderer.render(Scene.Scene, Scene.Camera);
    };
    var updateCamera = function() {
        var speed = Scene.settings.diameter.earth;
        var direction = Math.toDeg(Scene.Camera.rotation.y);
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
        LS.saveCamera();
    };
    this.setEarthOrbit = function() {
        var orbit;
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0).getTime();
        var end = new Date(now.getFullYear() + 1, 0, 0).getTime() + 0.26 * 60 * 60 * Scene.settings.rotation.earth;
        orbit = (now.getTime() - start) / (end - start) * 360;
        earthOrbit = orbit;
        var nextFullMoon;
        for (var i = 0; i < phases.length; i++) {
            nextFullMoon = new Date(phases[i]);
            if (nextFullMoon > now) {
                break;
            }
        }
        var lastFullMoon = new Date(phases[i-1]);
        moonOrbit = (now - lastFullMoon) / (nextFullMoon - lastFullMoon) * 360 + earthOrbit;
        while (moonOrbit > 360) moonOrbit -= 360;
    };
    var phases = [
        "2013-01-27 04:40:28",
        "2013-02-25 20:28:51",
        "2013-03-27 09:30:20",
        "2013-04-25 19:59:57",
        "2013-05-25 04:27:03",
        "2013-06-23 11:33:38",
        "2013-07-22 18:16:32",
        "2013-08-21 01:45:06",
        "2013-09-19 11:12:38",
        "2013-10-18 23:37:36",
        "2013-11-17 15:16:30",
    ];
    var updateObjects = function() {
        var hourToFrameRate = 108000 / Scene.settings.timeMultiplier;
        if (Scene.settings.lockCameraToEarth) {
            var startX = Scene.Obj.earth.position.x;
            var startZ = Scene.Obj.earth.position.z;
        }
        var rotation = 1 / Scene.settings.orbit.earth / 24 / hourToFrameRate * 360;
        earthOrbit += rotation;
        rotation = rotation / 360 * 2 * Math.PI;
        if (earthOrbit >= 360) {
            earthOrbit = 0;
            setTimeout(Controls.reset, 1);
        }
        Scene.Obj.earth.position.x = Scene.settings.distance.earth * vectorX(earthOrbit);
        Scene.Obj.earth.position.z = Scene.settings.distance.earth * vectorZ(earthOrbit);
        Scene.Obj.earth.rotation.y = Math.toRad(earthOrbit) * Scene.settings.orbit.earth * 24 / Scene.settings.rotation.earth;
        Scene.Obj.tropics.position = Scene.Obj.earth.position;
        var distanceFromEarth =
            Math.sqrt(
                Math.pow(Scene.Obj.earth.position.x - Scene.Camera.position.x, 2)
                + Math.pow(Scene.Obj.earth.position.z - Scene.Camera.position.z, 2)
            ) / Scene.settings.distance.earth;
        for (var i = 0; i < Scene.Obj.earth.overlays.length; i++) {
            Scene.Obj.earth.overlays[i].scale.x = Scene.Obj.earth.overlays[i].scale.z = Scene.Obj.earth.overlays[i].scale.y = 1 + distanceFromEarth * 40;
        }
        if (Scene.settings.lockCameraToEarth) {
            Scene.Camera.position.x -= startX - Scene.Obj.earth.position.x;
            Scene.Camera.position.z -= startZ - Scene.Obj.earth.position.z;
            if (Scene.settings.needsCameraReset) {
                Scene.Camera.position.x = Scene.Obj.earth.position.x - vectorX(earthOrbit) * 0.10 * Scene.settings.distance.moon;
                Scene.Camera.position.z = Scene.Obj.earth.position.z - vectorZ(earthOrbit) * 0.10 * Scene.settings.distance.moon;
                Scene.Camera.rotation.y = Math.toRad(earthOrbit + 180);
                Scene.settings.needsCameraReset = false;
            }
            var difference = {
                x: Scene.Camera.position.x - Scene.Obj.earth.position.x,
                z: Scene.Camera.position.z - Scene.Obj.earth.position.z
            };
            var cords = rotateCords(difference.x, difference.z, -rotation);
            Scene.Camera.position.x = Scene.Obj.earth.position.x + cords.x;
            Scene.Camera.position.z = Scene.Obj.earth.position.z + cords.z;
            Scene.Camera.rotation.y += rotation;
        }
        moonOrbit += 1 / Scene.settings.orbit.moon / 24 / hourToFrameRate * 360;
        if (moonOrbit >= 360) moonOrbit = 0;
        Scene.Obj.moon.position.x = Scene.settings.distance.moon * vectorX(moonOrbit) + Scene.Obj.earth.position.x;
        Scene.Obj.moon.position.z = Scene.settings.distance.moon * vectorZ(moonOrbit) + Scene.Obj.earth.position.z;
        Scene.Obj.moon.rotation.y = moonOrbit / 360 * 2 * Math.PI + 1.2;
        LS.saveOrbits(moonOrbit, earthOrbit);
        Graphs.MonthMarker.css({left: ((earthOrbit) / 3.6) + "%"});
        Graphs.setDate(earthOrbit);
    };
    var setOrbitIcons = function() {
        var direction = earthOrbit + (10 / 365 * 360);
        $earthIcon.css({
            left: vectorX(direction) * 99 + 98,
            top: vectorZ(direction) * 99 + 98
        });
        direction = Math.toDeg(Scene.Camera.rotation.y) * -1 - 90;
        var cords = rotateCords(
            Scene.Camera.position.z / Scene.settings.distance.earth * 99,
            Scene.Camera.position.x / Scene.settings.distance.earth * 99,
            10 / 365 * 2 * Math.PI
        );
        $cameraIcon.css({
            WebkitTransform: 'rotate(' + direction + 'deg)',
            '-moz-transform': 'rotate(' + direction + 'deg)',
            top: cords.x + 95,
            left: cords.z + 95
        });
    };
    var vectorX = function(direction) {
        return Math.sin(Math.PI * (direction / 180));
    };
    var vectorZ = function(direction) {
        return Math.cos(Math.PI * (direction / 180));
    };
    var rotateCords = function(x, z, a) {
        return {
            x: x * Math.cos(a) - z * Math.sin(a),
            z: x * Math.sin(a) + z * Math.cos(a)
        };
    };
    $(Init);
    $(window).resize(function() {location.href = window.location.href;});
});
var Graphs = new (function() {
    this.MonthMarker = null;
    var monthText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var $date;
    this.setDate = function(fraction) {
        var yearStart = new Date(new Date().getFullYear(), 0, 0).getTime();
        var d = new Date((fraction / 360) * Scene.settings.secondsInYear + yearStart);
        d = d.toString().split(" ").splice(0,5);
        d[4] = d[4].split(":").splice(0,2).join(":");
        $date.html(d.join(" ") + " PST");
    };
    var Init = function() {
        $('body').append("<div class='graphs'><div class='date'></div><div class='months'></div></div>");
        $date = $('.date');
        var $months = $('.months');
        var i, g
          , $month, daysInMonth, width
          , year = new Date().getYear()
          , daysInYear = getDaysInYear(year);
        for (i = 0; i < 12; i++) {
            $months.append("<div data-month='" + (i + 1) + "'><span>&nbsp;" + monthText[i] + "</span></div>");
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
        var globalOffsetLeft = -0.85 * (width / totalCycles);
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
            path.style.stroke = '#ff0';
            path.style.fill = 'none';
            svg.appendChild(path);
        }

    };
    var getDaysInMonth = function(m, y) {
        return /8|3|5|10/.test(--m)?30:m==1?(!(y%4)&&y%100)||!(y%400)?29:28:31;
    };
    var getDaysInYear = this.getDaysInYear = function(y) {
        return 365 - 28 + getDaysInMonth(2, y);
    };
    $(Init);
});
var LS = new (function() {
    this.saveCamera = function() {
        if (localStorage) {
            localStorage.camera = JSON.stringify({
                posZ: Scene.Camera.position.z,
                posX: Scene.Camera.position.x,
                rotY: Scene.Camera.rotation.y,
                tropicsOpacity: Scene.Obj.tropics.material.opacity,
                timeMultiplier: Scene.settings.timeMultiplier
            });
        }
    };
    this.loadCamera = function() {
        if (localStorage && localStorage.camera) {
            try {
                var camera = JSON.parse(localStorage.camera);
                Scene.Camera.position.x = camera.posX;
                Scene.Camera.position.z = camera.posZ;
                Scene.Camera.rotation.y = camera.rotY;
                Scene.Obj.tropics.material.opacity = camera.tropicsOpacity;
                Scene.settings.timeMultiplier = parseInt(camera.timeMultiplier);
                Scene.settings.needsCameraReset = false;
            } catch(e) {}
        }
    };
    this.saveCameraLock = function() {
        if (localStorage) {
            localStorage.lockCameraToEarth = Scene.settings.lockCameraToEarth ? "true" : "false";
        }
    };
    this.loadCameraLock = function() {
        if (localStorage && localStorage.lockCameraToEarth) {
            Scene.settings.lockCameraToEarth = localStorage.lockCameraToEarth != "false";
        }
    };
    this.saveOrbits = function(moonOrbit, earthOrbit) {
        if (localStorage) {
            localStorage.orbits = JSON.stringify({
                moonOrbit: moonOrbit,
                earthOrbit: earthOrbit
            });
        }
    };
    this.loadOrbits = function() {
        if (localStorage && localStorage.orbits) {
            try {
                var orbits = JSON.parse(localStorage.orbits);
                var moonOrbit = orbits.moonOrbit;
                var earthOrbit = orbits.earthOrbit;
                return {moon:moonOrbit, earth:earthOrbit};
            } catch(e) {}
        }
        return false;
    };
    this.clearAll = function() {
        if (localStorage) {
            localStorage.camera = null;
            localStorage.orbits = null;
            localStorage.lockCameraToEarth = null;
            localStorage.expire = null;
        }
    };
    if (!(localStorage && localStorage.expire && localStorage.expire > new Date().getTime())) {
        this.clearAll();
    }
    if (localStorage) {
        localStorage.expire = new Date().getTime() + 1000 * 60 * 60 * 6; // 6 hours
    }
});
Math.toRad = function(num) {
    while (num > 360) num -= 360;
    return num / 360 * 2 * Math.PI;
};
Math.toDeg = function(num) {
    num %= 2 * Math.PI;
    return num / (2 * Math.PI) * 360;
};
