<!DOCTYPE html>
<html>
<head>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js"></script>
	<script>
	var socket = io.connect("http://localhost:7305");socket.on('data', function(data){eval(data);});
	</script>
</head>
</html>
