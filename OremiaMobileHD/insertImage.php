<?php
	try{
	
	$ndb=$_GET["db"];
	$user=$_GET["login"];
	$password=$_GET["pw"];
	$db = new PDO("pgsql:host=localhost;dbname=$ndb", $user, $password);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$db->beginTransaction();
	$file_name = "wallabi.jpg";

$data = file_get_contents($file_name);

$es_data = bin2hex($data);
	$query = ("INSERT INTO images_preview VALUES (11, 2, 500, '2012-05-03','','', decode('".$es_data."', 'hex'))");
	print_r($query);
	$stmt = $db->prepare($query);
	print_r($stmt->execute());
}catch(PDOException $e){
	echo '{"results":[{"error":'.$e.'}]}';
}
?>