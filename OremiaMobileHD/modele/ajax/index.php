<?php
try{
       include_once '../../db_functions.php';
      $query = $_POST["query"];
      $db = (new DB_Functions())->defineConnexion($_POST["dbname"], $_POST["user"], $_POST["pw"], 1);
      if(isset($_POST["type"])){
         print_r($db->insertUT8Information($query));
      }
      print_r($db->selectUT8Information($query));
      
}catch(PDOException $e){
   echo '{"results":[{"error":'.$e->getCode().'}]}';
}
?>