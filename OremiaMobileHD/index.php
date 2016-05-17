    <?php
    // ini_set('display_errors', 1);
    // ini_set('display_startup_errors', 1);
    // error_reporting(E_ALL);

    try{
    	include_once 'db_functions.php';
      // include autoloader
    	switch ($_GET['type']) {
         case 0:
         $db = (new DB_Functions())->defineConnexion($_POST["dbname"], $_POST["user"], $_POST["pw"], 1);
         print_r('{"results":[{"connexionBegin" : "kikou"}]}');
         break;
         case 1:
         $query = $_POST["query"];
         $db = (new DB_Functions())->useConnexion();
	        $query = str_replace("percent", "%", $query);
         print_r($db->selectInformation($query));
         break;
         case 17:
         $UID = $_POST["UID"];
         $arr = $_POST["arr"];
         $idPatient = $_POST["idPatient"];
         $idPraticien = $_POST["idPraticien"];
         $db = (new DB_Functions())->useConnexion();
         print_r($db->insertActes($idPatient, $idPraticien, $UID, $arr));
         break;
         case 2:
         $query = $_POST["query"];
         $db = (new DB_Functions())->defineConnexion($_POST["dbname"], $_POST["user"], $_POST["pw"], 1);
	 $query = str_replace("percent", "%", $query);
         print_r($db->selectInformation($query));
         break;
         case 3:
         $id = $_GET["id"];
         $db = (new DB_Functions())->useConnexion();
         header("Content-type: image/jpeg");
         print_r($db->selectImage($id));
         break;
         case 4:
         $id = $_GET["id"];
         $db = (new DB_Functions())->useConnexion();
         header("Content-type: image/jpeg");
         print_r($db->selectImagePreview($id));
         break;
         case 5:
         $id = $_GET["id"];
         $db = (new DB_Functions())->useConnexion();
         header("Content-type: image/jpeg");
         print_r($db->selectRadio($id));
         break;
         case 6:
        //  $id = $_GET["id"];
        //  $db = (new DB_Functions())->useConnexion();
        //  header("Content-type: application/pdf");
        //  print_r($db->selectDoc($id));
         $id = $_GET["id"];
         $db = (new DB_Functions())->useConnexion();
          $doc = $db->selectDoc($id);
          $filename = "./modele/uploads/".$doc[0]["nom"].".".$doc[0]["type"];
          $myfile = fopen($filename, "w");
          fwrite($myfile, $doc[1]);
          fclose($myfile);
          header("Cache-Control: no-store");
          header("Content-Type: application/octet-stream");
          header('Content-Disposition: attachment; filename="'. basename($filename) . '"');
          header('Content-Transfer-Encoding: binary');
          header('Content-Length: '. filesize($filename));
          ob_clean();
          flush();
          readfile($filename);
          exit();
         break;
         case 7:
         include_once('imageResize.php');
         $db = (new DB_Functions())->usePgConnexion();
            	//header("Content-type: image/jpeg");
         $_FILES['htdocs']['tmp_name'];
         print_r($db->insertImage($_FILES['htdocs']['tmp_name'], $_GET["idPatient"], $_GET["idPraticien"]));
         break;
         case 8:
         $db = (new DB_Functions())->useConnexion();
         for ($i=0; $i<100000; $i++){
            print_r($db->insertInformation("INSERT INTO patients(
                id, nir, genre, nom, prenom, adresse, codepostal, ville, telephone1,
                telephone2, email, naissance, creation, idpraticien, idphoto,
                info, autorise_sms, correspondant, ipp2, adresse2, patient_par,
                amc, amc_prefs, profession, correspondants, statut, famille,
                tel1_info, tel2_info)
            VALUES (DEFAULT, DEFAULT, 1, 'patient$i', DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT,
                DEFAULT, DEFAULT, '1993-03-12', '1993-03-12', 500, 6,
                '', DEFAULT, 1, DEFAULT, DEFAULT, DEFAULT,
                DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT,
                DEFAULT, DEFAULT);"));
        }
        break;
        case 9:
        $vretour = true;
        echo "kikou";
        $query = $_POST["query"];
        $db = (new DB_Functions())->defineConnexion($_POST["dbname"], $_POST["user"], $_POST["pw"], 1);
        if($db->insertInformationWithCallback($query)){
            if(!mkdir("modele/documents/".$_POST["nomfichier"]."/", 0777, true)){
                $vretour = false;
            } else {
                $file = fopen("modele/documents/".$_POST["nomfichier"]."/index.html","w");
                if(!fwrite($file,$_POST["file"])){
                    $vretour = false;
                }
                fclose($file);
            }
        }else{
            $vretour = false;
        }
        print_r($vretour);
        break;
        case 10:

        $error = false;
        $files = array();

        $uploaddir = './modele/uploads/';
        foreach($_FILES as $file)
        {
          chmod("./modele/uploads/", 0777);

            if(move_uploaded_file($file['tmp_name'], $uploaddir.basename($file['name'])))
            {
               print_r((new DB_Functions())->cloudConvert($uploaddir .$file['name']));
           }
           else
           {
            $error = true;
            echo $error;
        }
    }

    break;
    case 11:
    $query = $_POST["query"];
    $db = (new DB_Functions())->defineConnexion($_POST["dbname"], $_POST["user"], $_POST["pw"], 1);
    if(isset($_POST["type"])){
       print_r($db->insertUT8Information($query));
   }
  //  print_r($query);die;
   print_r($db->selectUT8Information($query));
   break;
   case 12:
   $error = false;
   $files = array();

   $uploaddir = './modele/uploads/';
   foreach($_FILES as $file)
   {
    if(move_uploaded_file($file['tmp_name'], $uploaddir .basename($file['name'])))
    {
       print_r($error);
   }
   else
   {
    $error = true;
    echo $error;
    }
    }
    break;
    case 13:
    $error = false;
    $files = array();
    $dbfct = (new DB_Functions())->usePgConnexion();
    $idPatient = $_POST["idPatient"];
    $idPraticien = $_POST["idPraticien"];
    $nom = "Questionnaire médical";
    $vretour = true;
    $file = fopen("./modele/uploads/input.html","w");
    if(!fwrite($file,$_POST["html"])){
        $vretour = false;
    }else {
        fclose($file);
        $url = $dbfct->cloudConvertPDF("./modele/uploads/input.html");
        $dbfct->insertPDF($url, $idPatient, $idPraticien, $nom);
    }
    echo $vretour;
    break;
    case 14:
      $db = (new DB_Functions())->useConnexion();
      // $query = "SELECT inifile FROM config WHERE nom='ccam_favoris'";
      $query = $_POST["query"];
      $vretour = $db->selectInifile($query);
      $array = array();
      foreach ($db->parse_ini_string_m($vretour[0]["inifile"]) as $key => $value) {
        $value["nom"]=$key;
        if($key != "Entete")
        $array[] = $value;
      }

      print_r( $db->createJSON($array));
    break;
    case 15:
      $id = $_POST["id"];
      $db = (new DB_Functions())->useConnexion();
     $doc = $db->selectDoc($id);
     $filename = "./modele/uploads/".$doc[0]["nom"].".".$doc[0]["type"];
     $myfile = fopen($filename, "w");
     fwrite($myfile, $doc[1]);
     fclose($myfile);
     print_r((new DB_Functions())->cloudConvert($filename));
    break;
    case 16:
      $db = new DB_Functions();
      $db->readWordFile();
    break;
}
    	// $query = str_replace("+", " ", $_GET["query"]);
    	// $ndb=$_GET["db"];
    	// $user=$_GET["login"];
    	// $password=$_GET["pw"];
    	// $db = new PDO("pgsql:host=localhost;dbname=$ndb", $user, $password);
    	// echo '{"results":'.json_encode($db->query($query)->fetchAll(PDO::FETCH_ASSOC)).'}';
}catch(PDOException $e){
 echo '{"results":[{"error":'.$e->getCode().'}]}';
}
?>
