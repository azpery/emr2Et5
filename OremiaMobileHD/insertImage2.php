<?php

	$ndb=$_GET["db"];
	$user=$_GET["login"];
	$password=$_GET["pw"];
	$dbconn3 = pg_connect("host=localhost dbname=$ndb user=$user password=$password");
	$data = file_get_contents($_FILES['htdocs']['tmp_name']); 
	$es_data = pg_escape_bytea($data);
	$id = pg_query("INSERT INTO images VALUES (default, ".$_GET['idPatient'].", ".$_GET['ipPraticien'].", '2013-05-05','','', '{$es_data}')");
	$last_id_query = pg_query("SELECT currval('images_id_seq')");
	$last_id_results = pg_fetch_assoc($last_id_query);
	print_r($last_id_results);
	$last_id = $last_id_results['currval'];
	pg_query("UPDATE patients SET idphoto = $last_id  WHERE id = ".$_GET['idPatient']);
	pg_query("INSERT INTO images_preview VALUES ($last_id, ".$_GET['idPatient'].", ".$_GET['ipPraticien'].", '2013-05-05','','', '{$es_data}')");

?>