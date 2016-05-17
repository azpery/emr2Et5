<?php
	try{
	$query = str_replace("+", " ", $_GET["query"]);
	$ndb=$_GET["db"];
	$user=$_GET["login"];
	$password=$_GET["pw"];
	$db = new PDO("pgsql:host=localhost;dbname=$ndb", $user, $password);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$db->beginTransaction();
	$stmt = $db->prepare($query);
	$stmt->execute();
	$stmt->bindColumn('image', $oid, PDO::PARAM_STR);
	$stmt->fetch(PDO::FETCH_BOUND);
	header("Content-type: image/jpeg"); 
	print_r($oid);
	// $stream = $db->pgsqlLOBOpen($oid, 'r');
	
	// fpassthru($stream);
}catch(PDOException $e){
	echo '{"results":[{"error":'.$e->getCode().'}]}';
}
?>