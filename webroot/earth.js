(function() {
    var Init = function() {
        if (!window.WebGLRenderingContext) {
            alert('Your browser does not support WebGL');
        }
    };
    $(Init);
})();

var Scene = new (function() {
    this.Obj = {};
    var pixelsPerKm = 0.05;
    var measure = this.measure = {
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
        secondsInYear: 60 * 60 * 24 * 365 * 1000,
        speedOfLight: pixelsPerKm * 299792
    };
    var options = this.options = {
        timeMultiplier: {
            realTime: 1,
            oneHour: 3600,
            oneDay: 86400
        },
        cameraSpeed: {
            diameterEarth: measure.diameter.earth,
            speedOfLight: measure.speedOfLight
        }
    };
    var settings = this.settings = {
        timeMultiplier: options.timeMultiplier.realTime,
        moveObjects: true,
        showStats: false,
        showKeys: true,
        lockCameraToEarth: false,
        cameraSpeed: options.cameraSpeed.diameterEarth,
        needsCameraReset: true,
        pixelsPerKm: pixelsPerKm
    };
    var Init = function() {
        Scene.Scene = new THREE.Scene();
        Scene.Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, measure.distance.earth * 1.5);
        Scene.Scene.add(Scene.Camera);

        Scene.Obj.earth = addEarth(measure.diameter.earth / 2, 0, measure.distance.earth, "res/earth_mrdoob.jpg");
        Scene.Obj.moon = addMoon(measure.diameter.moon / 2, measure.distance.earth, measure.distance.moon);
        Scene.Obj.sun = addSun(measure.diameter.sun / 2, 0, 0, 0xFFFF33);

        Scene.Obj.tropics = addEarth(measure.diameter.earth / 2, 0, measure.distance.earth, "res/tropics.png");
        Scene.Obj.earth.overlays = [Scene.Obj.tropics];
        Scene.Obj.tropics.material.opacity = 0;

        LS.loadCamera();
        LS.loadCameraLock();
        LS.loadDisplay();

        Scene.Scene.add(new THREE.PointLight(0xffffff, 1.5)); // Sunlight
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
        $('body').prepend(Scene.Renderer.domElement);
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
             if (e.keyCode == 37) { Controls.keyDown.left  = false; }
        else if (e.keyCode == 38) { Controls.keyDown.up    = false; }
        else if (e.keyCode == 39) { Controls.keyDown.right = false; }
        else if (e.keyCode == 40) { Controls.keyDown.down  = false; }
        else if (e.keyCode == 87) { Controls.keyDown.keyW  = false; }
        else if (e.keyCode == 65) { Controls.keyDown.keyA  = false; }
        else if (e.keyCode == 83) { Controls.keyDown.keyS  = false; }
        else if (e.keyCode == 68) { Controls.keyDown.keyD  = false; }
    });
    this.reset = function() {
        Animate.clearInterval();
        LS.clearAll();
        location.href = window.location.href;
    };
    this.timeToggle = function() {
        switch (Scene.settings.timeMultiplier) {
            case Scene.options.timeMultiplier.realTime:
                Scene.settings.timeMultiplier = Scene.options.timeMultiplier.oneHour;
                break;
            case Scene.options.timeMultiplier.oneHour:
                Scene.settings.timeMultiplier = Scene.options.timeMultiplier.oneDay;
                break;
            case Scene.options.timeMultiplier.oneDay:
                Scene.settings.timeMultiplier = Scene.options.timeMultiplier.realTime;
        }
        setButtonStatuses();
    };
    this.playPause = function() {
        Scene.settings.moveObjects = !Scene.settings.moveObjects;
        LS.saveCamera();
        setButtonStatuses();
    };
    this.earthLock = function() {
        Scene.settings.lockCameraToEarth = !Scene.settings.lockCameraToEarth;
        LS.saveCameraLock();
        setButtonStatuses();
    };
    this.toggleCameraSpeed = function() {
        switch (Scene.settings.cameraSpeed) {
            case Scene.options.cameraSpeed.diameterEarth:
                Scene.settings.cameraSpeed = Scene.options.cameraSpeed.speedOfLight;
                break;
            case Scene.options.cameraSpeed.speedOfLight:
                Scene.settings.cameraSpeed = Scene.options.cameraSpeed.diameterEarth;
        }
        LS.saveCamera();
        setButtonStatuses();
    };
    this.backToEarth = function() {
        Scene.settings.needsCameraReset = true;
        LS.saveCameraLock();
        setButtonStatuses();
        Animate.update(true);
    };
    this.visitTheSun = function() {
        var earthOrbit = Animate.getEarthOrbit();
        Scene.Camera.position.z = Scene.measure.diameter.sun * Animate.vectorZ(earthOrbit) * -1.5;
        Scene.Camera.position.x = Scene.measure.diameter.sun * Animate.vectorX(earthOrbit) * -1.5;
        Scene.Camera.rotation.y = Math.toRad(earthOrbit - 180);
        LS.saveCameraLock();
        setButtonStatuses();
    };
    this.highlightTropics = function() {
        Scene.Obj.tropics.material.opacity = Scene.Obj.tropics.material.opacity == 0 ? 1 : 0;
        setButtonStatuses();
    };
    this.toggleStats = function() {
        Scene.settings.showStats = !Scene.settings.showStats;
        Controls.checkDisplay();
        LS.saveDisplay();
        setButtonStatuses();
    };
    this.toggleKeys = function() {
        Scene.settings.showKeys = !Scene.settings.showKeys;
        Controls.checkDisplay();
        LS.saveDisplay();
        setButtonStatuses();
    };
    this.checkDisplay = function() {
        $('.stats').css({display:Scene.settings.showStats ? "block" : "none"});
        $('.keys').css({display:Scene.settings.showKeys ? "block" : "none"});
    };
    var $lockButton
      , $playButton
      , $speedButton
      , $topicsButton
      , $statsButton
      , $keysButton
      , $cameraButton
    ;
    var Init = function() {
        $lockButton = $('#lockButton');
        $playButton = $('#playButton');
        $speedButton = $('#speedButton');
        $topicsButton = $('#tropicsButton');
        $statsButton = $('#statsButton');
        $keysButton = $('#keysButton');
        $cameraButton = $('#cameraButton');
    };
    $(Init);
    var setButtonStatuses = this.setButtonStatuses = function() {
        $lockButton.val("Lock to Earth: " + (Scene.settings.lockCameraToEarth ? "On" : "Off"));
        $playButton.val("Time: " + (Scene.settings.moveObjects ? "On" : "Off"));
        $speedButton.val("Speed: " + (Scene.settings.timeMultiplier == Scene.options.timeMultiplier.realTime ? "Real-time" : (Scene.settings.timeMultiplier == Scene.options.timeMultiplier.oneHour ? "1 sec = 1 hour" : "1 sec = 1 day")));
        $cameraButton.val("Camera Speed: " + (Scene.settings.cameraSpeed == Scene.options.cameraSpeed.diameterEarth ? "Diameter Earth" : (Scene.settings.cameraSpeed == Scene.options.cameraSpeed.distanceMoon ? "Distance To Moon" : "Speed of Light")));
        $topicsButton.val("Highlight Tropics: " + (Scene.Obj.tropics.material.opacity == 1 ? "On" : "Off"));
        $statsButton.val("Show Info: " + (Scene.settings.showStats ? "On" : "Off"));
        $keysButton.val("Show Controls: " + (Scene.settings.showKeys ? "On" : "Off"));
    };
});
var Animate = new (function() {
    var updateInterval
      , moonOrbit
      , earthOrbit
      , $earthIcon
      , $cameraIcon
      , $cameraFromEarth
    ;
    var framesPerSecond = 30;
    var Init = function() {
        $earthIcon = $('.orbit .earth');
        $cameraIcon = $('.orbit .camera');
        $cameraFromEarth = $('#cameraFromEarth');
        var orbits = LS.loadOrbits();
        if (orbits != false) {
            moonOrbit = orbits.moon;
            earthOrbit = orbits.earth;
        }
        else {
            Animate.setEarthOrbit();
        }
        Scene.Obj.earth.position.x = Scene.measure.distance.earth * vectorX(earthOrbit);
        Scene.Obj.earth.position.z = Scene.measure.distance.earth * vectorZ(earthOrbit);
        updateInterval = setInterval(update, 1000 / framesPerSecond);
        Controls.setButtonStatuses();
    };
    this.clearInterval = function() {
        clearInterval(updateInterval);
    };
    this.getEarthOrbit = function() {
        return earthOrbit;
    };
    var update = this.update = function(override) {
        if (Scene.settings.moveObjects || override) updateObjects();
        updateCamera();
        setOrbitIcons();
        Scene.Renderer.render(Scene.Scene, Scene.Camera);
    };
    var updateCamera = function() {
        var speed = Scene.settings.cameraSpeed / framesPerSecond;
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
        $cameraFromEarth.html(getCameraDistanceFromEarth());
    };
    this.setEarthOrbit = function() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0).getTime();
        var end = new Date(now.getFullYear() + 1, 0, 0).getTime() + 0.26 * 60 * 60 * Scene.measure.rotation.earth;
        earthOrbit = (now.getTime() - start) / (end - start) * 360;
        var nextFullMoon;
        for (var i = 0; i < phases.length; i++) {
            nextFullMoon = new Date(phases[i]);
            if (nextFullMoon > now) {
                break;
            }
        }
        var lastFullMoon = new Date(phases[i-1]);
        moonOrbit = (now - lastFullMoon) / (nextFullMoon - lastFullMoon) * 360 + earthOrbit;
        if (moonOrbit == Infinity) {
            moonOrbit = 0;
        }
        else {
            while (moonOrbit > 360) moonOrbit -= 360;
        }
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
        "2013-11-17 15:16:30"
    ];
    var updateObjects = function() {
        var hourToFrameRate = 108000 / Scene.settings.timeMultiplier;
        if (Scene.settings.lockCameraToEarth) {
            var startX = Scene.Obj.earth.position.x;
            var startZ = Scene.Obj.earth.position.z;
        }
        var rotation;
        if (Graphs.Drag.active) {
            var distanceLeft = Graphs.Drag.newEarthOrbit - earthOrbit;
            rotation = distanceLeft / Graphs.Drag.stepsLeft;
            if (--Graphs.Drag.stepsLeft <= 0) {
                Graphs.Drag.active = false;
            }
            if (Graphs.Drag.immediate) {
                rotation = distanceLeft;
                Graphs.Drag.stepsLeft = 0;
                Graphs.Drag.active = false;
            }
        }
        else {
            rotation = 1 / Scene.measure.orbit.earth / 24 / hourToFrameRate * 360;
        }
        earthOrbit += rotation;
        if (earthOrbit >= 360) {
            earthOrbit = 0;
            setTimeout(Controls.reset, 1);
        }
        Scene.Obj.earth.position.x = Scene.measure.distance.earth * vectorX(earthOrbit);
        Scene.Obj.earth.position.z = Scene.measure.distance.earth * vectorZ(earthOrbit);
        Scene.Obj.earth.rotation.y = Math.toRad(earthOrbit) * Scene.measure.orbit.earth * 24 / Scene.measure.rotation.earth;
        Scene.Obj.tropics.position.x = Scene.Obj.earth.position.x;
        Scene.Obj.tropics.position.z = Scene.Obj.earth.position.z;
        Scene.Obj.tropics.rotation.y = Scene.Obj.earth.rotation.y;

        if (Scene.settings.lockCameraToEarth) {
            Scene.Camera.position.x -= startX - Scene.Obj.earth.position.x;
            Scene.Camera.position.z -= startZ - Scene.Obj.earth.position.z;
            var difference = {
                x: Scene.Camera.position.x - Scene.Obj.earth.position.x,
                z: Scene.Camera.position.z - Scene.Obj.earth.position.z
            };
            var cords = rotateCords(difference.x, difference.z, -Math.toRad(rotation));
            Scene.Camera.position.x = Scene.Obj.earth.position.x + cords.x;
            Scene.Camera.position.z = Scene.Obj.earth.position.z + cords.z;
            Scene.Camera.rotation.y += Math.toRad(rotation);
        }
        if (Scene.settings.needsCameraReset) {
            Scene.Camera.position.x = Scene.Obj.earth.position.x - vectorX(earthOrbit) * 0.05 * Scene.measure.distance.moon;
            Scene.Camera.position.z = Scene.Obj.earth.position.z - vectorZ(earthOrbit) * 0.05 * Scene.measure.distance.moon;
            Scene.Camera.rotation.y = Math.toRad(earthOrbit + 180);
            Scene.settings.needsCameraReset = false;
        }
        var distanceFromEarth =
            Math.sqrt(
                Math.pow(Scene.Obj.earth.position.x - Scene.Camera.position.x, 2)
                    + Math.pow(Scene.Obj.earth.position.z - Scene.Camera.position.z, 2)
            ) / Scene.measure.distance.earth;
        for (var i = 0; i < Scene.Obj.earth.overlays.length; i++) {
            Scene.Obj.earth.overlays[i].scale.x = Scene.Obj.earth.overlays[i].scale.z = Scene.Obj.earth.overlays[i].scale.y = 1 + distanceFromEarth * 40;
        }
        moonOrbit += rotation * Scene.measure.orbit.earth / Scene.measure.orbit.moon;
        if (moonOrbit >= 360) moonOrbit = 0;
        Scene.Obj.moon.position.x = Scene.measure.distance.moon * vectorX(moonOrbit) + Scene.Obj.earth.position.x;
        Scene.Obj.moon.position.z = Scene.measure.distance.moon * vectorZ(moonOrbit) + Scene.Obj.earth.position.z;
        Scene.Obj.moon.rotation.y = moonOrbit / 360 * 2 * Math.PI + 1.2;
        LS.saveOrbits(moonOrbit, earthOrbit);
        if (!Graphs.$monthMarker.hasClass('draggable') && !Graphs.Drag.active) {
            Graphs.$monthMarker.css({left: (earthOrbit / 3.6) + "%"});
        }
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
            Scene.Camera.position.z / Scene.measure.distance.earth * 99,
            Scene.Camera.position.x / Scene.measure.distance.earth * 99,
            10 / 365 * 2 * Math.PI
        );
        $cameraIcon.css({
            WebkitTransform: 'rotate(' + direction + 'deg)',
            '-moz-transform': 'rotate(' + direction + 'deg)',
            top: cords.x + 95,
            left: cords.z + 95
        });
    };
    var getCameraDistanceFromEarth = function() {
        return Graphs.formatKm((Math.sqrt(
            Math.pow(
                Math.abs(Scene.Camera.position.z - Scene.Obj.earth.position.z),
            2) +
            Math.pow(
                Math.abs(Scene.Camera.position.x - Scene.Obj.earth.position.x),
            2)
        ) - 0.5 * Scene.measure.diameter.earth) / Scene.settings.pixelsPerKm);
    };
    var vectorX = this.vectorX = function(direction) {
        return Math.sin(Math.PI * (direction / 180));
    };
    var vectorZ = this.vectorZ = function(direction) {
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
    this.$monthMarker = null;
    var monthText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var $date;
    this.setDate = function(fraction) {
        var yearStart = new Date(new Date().getFullYear(), 0, 0).getTime();
        var d = new Date((fraction / 360) * Scene.measure.secondsInYear + yearStart);
        d = d.toString().split(" ").splice(0,5);
        $date.html(d.join(" ") + " PST");
    };
    var Init = function() {
        var $body = $('body');
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
        addSineOverlay();
        Graphs.$monthMarker = $('.marker');
        var $handle = Graphs.$monthMarker.find('.handle');
        var startEarthOrbit;
        var finishDrag = function(immediate) {
            var newEarthOrbit = parseInt(Graphs.$monthMarker.css('left')) / parseInt($(window).width()) * 360;
            var distance = Math.abs(startEarthOrbit - newEarthOrbit);
            var minDistance = 45;
            var maxDistance = 180;
            var minTime = 30;
            var maxTime = 120;
            Graphs.Drag.newEarthOrbit = newEarthOrbit;
            Graphs.Drag.active = true;
            if (!Scene.settings.moveObjects || immediate) {
                Graphs.Drag.immediate = true;
                Animate.update(true);
                return;
            }
            Graphs.Drag.immediate = false;
            if (distance < minDistance) {
                Graphs.Drag.stepsLeft = minTime;
            }
            else if (distance > maxDistance) {
                Graphs.Drag.stepsLeft = maxTime;
            }
            else {
                Graphs.Drag.stepsLeft = (distance - minDistance) / (maxDistance - minDistance) * (maxTime - minTime) + minTime;
            }
        };
        $handle.bind('mousedown', function() {
            startEarthOrbit = Animate.getEarthOrbit();
            Graphs.$monthMarker.addClass('draggable');
        });
        $body.bind('mouseup', function() {
            if (!Graphs.$monthMarker.hasClass('draggable')) return;
            finishDrag();
            Graphs.$monthMarker.removeClass('draggable');
        });
        $body.bind('mousemove', function(e) {
            if (!Graphs.$monthMarker.hasClass('draggable')) return;
            Graphs.$monthMarker.css({left: e.pageX});
            if (e.which === 1) {
                finishDrag(true);
            }
        });
    };
    this.Drag = {
        active: false,
        newEarthOrbit: 0,
        stepsLeft: 0,
        immediate: true
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
    this.formatKm = function(km) {
        return parseInt(km).withCommas() + " km";
    };
    $(Init);
});
var LS;
(function() {
    function saveCamera() {
        if (localStorage) {
            localStorage.camera = JSON.stringify({
                posZ: Scene.Camera.position.z,
                posX: Scene.Camera.position.x,
                rotY: Scene.Camera.rotation.y,
                speed: Scene.settings.cameraSpeed,
                tropicsOpacity: Scene.Obj.tropics.material.opacity,
                timeMultiplier: Scene.settings.timeMultiplier,
                moveObjects: Scene.settings.moveObjects
            });
        }
    }
    function loadCamera() {
        if (localStorage && localStorage.camera) {
            try {
                var camera = JSON.parse(localStorage.camera);
                Scene.Camera.position.x = camera.posX;
                Scene.Camera.position.z = camera.posZ;
                Scene.Camera.rotation.y = camera.rotY;
                Scene.settings.cameraSpeed = camera.speed;
                Scene.Obj.tropics.material.opacity = camera.tropicsOpacity;
                Scene.settings.timeMultiplier = parseInt(camera.timeMultiplier);
                Scene.settings.needsCameraReset = false;
                Scene.settings.moveObjects = camera.moveObjects;
            } catch(e) {}
        }
    }
    function saveCameraLock() {
        if (localStorage) {
            localStorage.lockCameraToEarth = Scene.settings.lockCameraToEarth ? "true" : "false";
        }
    }
    function loadCameraLock() {
        if (localStorage && localStorage.lockCameraToEarth) {
            Scene.settings.lockCameraToEarth = localStorage.lockCameraToEarth == "true";
        }
    }
    function saveDisplay() {
        if (localStorage) {
            localStorage.showStats = Scene.settings.showStats ? "true" : "false";
            localStorage.showKeys = Scene.settings.showKeys ? "true" : "false";
        }
    }
    function loadDisplay() {
        if (localStorage && localStorage.showStats) {
            Scene.settings.showStats = localStorage.showStats == "true";
            Scene.settings.showKeys = localStorage.showKeys !== "false";
        }
        Controls.checkDisplay();
    }
    function saveOrbits(moonOrbit, earthOrbit) {
        if (localStorage) {
            localStorage.orbits = JSON.stringify({
                moonOrbit: moonOrbit,
                earthOrbit: earthOrbit
            });
        }
    }
    function loadOrbits() {
        if (localStorage && localStorage.orbits) {
            try {
                var orbits = JSON.parse(localStorage.orbits);
                var moonOrbit = orbits.moonOrbit;
                var earthOrbit = orbits.earthOrbit;
                return {moon:moonOrbit, earth:earthOrbit};
            } catch(e) {}
        }
        return false;
    }
    function clearAll() {
        if (localStorage) {
            localStorage.camera = null;
            localStorage.orbits = null;
            localStorage.lockCameraToEarth = null;
            localStorage.expire = null;
            localStorage.showStats = null;
            localStorage.showKeys = null;
        }
    }
    LS = {
        clearAll:       clearAll,
        saveCamera:     saveCamera,
        loadCamera:     loadCamera,
        saveCameraLock: saveCameraLock,
        loadCameraLock: loadCameraLock,
        saveDisplay:    saveDisplay,
        loadDisplay:    loadDisplay,
        saveOrbits:     saveOrbits,
        loadOrbits:     loadOrbits
    };
    if (!(localStorage && localStorage.expire && localStorage.expire > new Date().getTime())) {
        clearAll();
    }
    if (localStorage) {
        localStorage.expire = new Date().getTime() + 1000 * 60 * 60 * 6; // 6 hours
    }
})();
Math.toRad = function(deg) {
    while (deg > 360) deg -= 360;
    return deg / 360 * 2 * Math.PI;
};
Math.toDeg = function(rad) {
    rad %= 2 * Math.PI;
    return rad / (2 * Math.PI) * 360;
};
Number.prototype.withCommas = function() {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
