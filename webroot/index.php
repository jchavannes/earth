<!DOCTYPE HTML>
<html lang="en">
<head>
    <title>The Earth</title>
    <meta charset="utf-8">
    <meta name="author" content="Jason Chavannes <jason.chavannes@gmail.com>" />
    <meta name="date" content="5/4/2013" />
    <link rel="stylesheet" href="style.css" />
    <script type="text/javascript" src="lib/jquery.min.js"></script>
    <script type="text/javascript" src="lib/three.min.js"></script>
    <script type="text/javascript" src="earth.js"></script>
</head>
<body>
    <div class="controls">
        <h2>Controls</h2>
        Use W, A, S, D & Arrow Keys<br/>
        <br/>
        <h2>Info</h2>
        Arrow Key Movement Speed:<br/>
        30 x Diameter of Earth / sec = 382,260 km / sec<br/>
        <br/>
        Time to sun:<br/>
        Distance to Sun / 382,260 km / sec = 6 minutes 31 seconds
        <br/>
        <br/>
        Graph:<br/>
        <span class="lineLegend"></span> = Lunar Cycles<br/>
        <br/>
        <input type="button" id="playButton" onclick="Controls.playPause();" value="Move Objects" /><br/>
        <input type="button" id="lockButton" onclick="Controls.earthLock();" value="Lock to Earth" /><br/>
        <input type="button" id="earthButton" onclick="Controls.backToEarth();" value="Back to Earth" /><br/>
        <input type="button" id="sunButton" onclick="Controls.visitTheSun();" value="Visit the Sun" /><br/>
        <input type="button" id="resetButton" onclick="Controls.reset();" value="Reset" /><br/>
    </div>
    <div class="stats">
        <h2>To Scale</h2>
        <table class="description" border="1">
            <tr><th></th><th>Real Time</th><th>Demo Time</th></tr>
            <tr><td>Earth Rotation</td><td>24 hours</td><td>24 seconds</td></tr>
            <tr><td>Moon Orbit</td><td>27.21 days</td><td>10 minutes 53 seconds</td></tr>
            <tr><td>Earth Orbit</td><td>365.26 days</td><td>2 hours 26 minutes 6 seconds</td></tr>
        </table><br/>
        <table class="description" border="1">
            <tr><td>Distance to Sun</td><td>149,597,871 km</td></tr>
            <tr><td>Distance to Moon</td><td>384,400 km</td></tr>
        </table><br/>
        <table class="description" border="1">
            <tr><td>Diameter of Earth</td><td>12,742 km</td></tr>
            <tr><td>Diameter of Sun</td><td>1,391,000 km</td></tr>
            <tr><td>Diameter of Moon</td><td>3,474 km</td></tr>
        </table>
    </div>
    <div class='orbit'>
        <span class='jun'>Summer</span>
        <span class='sept'>Fall</span>
        <span class='dec'>Winter</span>
        <span class='mar'>Spring</span>
        <span class='earth'></span>
        <span class='camera'></span>
    </div>
</body>
</html>
