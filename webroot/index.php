<!DOCTYPE HTML>
<html lang="en">
<head>
    <title>Earth</title>
    <meta charset="utf-8">
    <meta name="author" content="Jason Chavannes <jason.chavannes@gmail.com>" />
    <meta name="date" content="5/4/2013" />
    <link rel="stylesheet" href="style.css" />
    <script type="text/javascript" src="lib/jquery.min.js"></script>
    <script type="text/javascript" src="lib/three.min.js"></script>
    <script type="text/javascript" src="earth.js"></script>
</head>
<body>
    <table class="description" border="1">
        <tr><th></th><th>Real Time</th><th>Demo Time</th></tr>
        <tr><td>Earth Rotation</td><td>24 hours</td><td>24 seconds</td></tr>
        <tr><td>Moon Orbit</td><td>27.21 days</td><td>653 seconds</td></tr>
    </table>
    <div class="controls">
        <input type="button" onclick="Controls.reset();" value="Reset" />
    </div>
</body>
</html>
