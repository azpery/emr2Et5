<?php
require 'phar://cloudconvert-php.phar/vendor/autoload.php';
require_once './vendor/autoload.php';
use \CloudConvert\Api;
    // ini_set('display_errors', 1);
    // ini_set('display_startup_errors', 1);
    // error_reporting(E_ALL);
class DB_Functions {

    private $db;

    //put your code here
    // constructor
    function __construct() {
    }
    function useConnexion() {
        include_once './db_connect.php';
        $instance = new self();
        // connecting to database
        $pdo= (new DB_Connect())->useConnexion();
        $instance->db = $pdo->connect();
        return $instance;
    }
    function usePgConnexion() {
        include_once './db_connect.php';
        $instance = new self();
        // connecting to database
        $pdo= (new DB_Connect())->useConnexion();
        $instance->db = $pdo->pg_connect();
        return $instance;
    }
    function defineConnexion($dbname, $user, $pw, $type) {
        include_once 'db_connect.php';
        $pdo= (new DB_Connect())->defineConnexion($dbname, $user, $pw);
        $instance = new self();
        if($type == 1){
            // connecting to database
            $instance->db = $pdo->connect();
        }else{
            $instance->db = $pdo->pg_connect();
        }
        return $instance;
    }
    function resizeImage($filename, $newwidth, $newheight){
        list($width, $height) = getimagesize(file_get_contents($filename));
        if($width > $height && $newheight < $height){
            $newheight = $height / ($width / $newwidth);
        } else if ($width < $height && $newwidth < $width) {
            $newwidth = $width / ($height / $newheight);
        } else {
            $newwidth = $width;
            $newheight = $height;
        }
        $thumb = imagecreatetruecolor($newwidth, $newheight);
        $source = imagecreatefromjpeg($filename);
        imagecopyresized($thumb, $source, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);
        file_put_contents('test.jpeg', file_get_contents($filename));
    }

    function readWordFile($fileName = "./modele/uploads/test.docx"){
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($fileName);

        // $sections = $phpWord->getSections();
        // $section = $sections[0]; // le document ne contient qu'une section
        // $arrays = $section->getElements();
        // // var_dump($arrays);die;
        // foreach ($arrays as $key) {
        //     if($key instanceof PhpOffice\PhpWord\Element\Text){
        //         // print_r($key->getText());
                
        //     }
            
        // }
        // $section->addImage('signature.png', array('width'=>210, 'height'=>210));
        // $section->addTextBreak(2);
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save('Image.docx');
    }

    // destructor
    function __destruct() {

    }
    public function createJSON($array) {
        $result = '{"results":'.json_encode($array).'}';
        return $result;
    }
    public function createUTF8JSON($array) {
      // print_r(json_encode($this->utf8ze($array)));die;
        $result = '{"results":'.json_encode($this->utf8ze($array)).'}';
        return $result;
    }
    public function createJSONError($array) {
        $result = '{"results":[{"error":'.$code .'}]}';
        return $result;
    }
    public function replacePlus($string){
        return str_replace("+", " ", $string);
    }
    public function selectInformation($query){
        $requetePrep = $this->db->prepare($this->replacePlus($query));
        $requetePrep->execute();

        return $this->createJSON($requetePrep->fetchAll(PDO::FETCH_ASSOC));
    }
    public function selectInifile($query){
        $requetePrep = $this->db->prepare($query);
        $requetePrep->execute();
        return $requetePrep->fetchAll();
    }
    public function selectUT8Information($query){
        $requetePrep = $this->db->prepare($query);
        $requetePrep->execute();
        // print_r($requetePrep->fetchAll(PDO::FETCH_ASSOC));die;
        return $this->createUTF8JSON($requetePrep->fetchAll(PDO::FETCH_ASSOC));
    }
    public function insertInformation($query){
        $requetePrep = $this->db->prepare($this->replacePlus($this->utf8ze($query)));
        $requetePrep->execute();
        return $this->createJSON($this->db->lastInsertId());
    }
    public function insertInformationWithCallback($query){
        $requetePrep = $this->db->prepare($this->replacePlus($this->utf8ze($query)));
        return $requetePrep->execute();
    }
    public function insertActes($idPatient, $idPraticien, $UID, $arr){

        $arr = $this->stdClassToArray(json_decode($arr));
        $new_value["Entete"] = $arr["Entete"];
        unset($arr["Entete"]);
        $arr = $new_value + $arr;
        // print_r($arr);die;
        $ini = $this->arr2ini($arr);
// var_dump($ini);die;
        $query = "WITH new_values (idpatient, idpraticien, uuid, inifile) as (
                      values 
                         ($idPatient, $idPraticien, '$UID', '$ini')

                    ),
                    upsert as
                    ( 
                        update fses f 
                            set idpatient = nv.idpatient,
                                idpraticien = nv.idpraticien,
                                uuid = nv.uuid,
                                inifile = nv.inifile
                        FROM new_values nv
                        WHERE f.idpatient = nv.idpatient 
                        AND f.idpraticien = nv.idpraticien
                        RETURNING f.*
                    )
                    INSERT INTO fses (idpatient, idpraticien, uuid, inifile)
                    SELECT idpatient, idpraticien, uuid, inifile
                    FROM new_values
                    WHERE NOT EXISTS (SELECT 1 
                    FROM upsert up 
                    WHERE up.idpatient = new_values.idpatient 
                    AND up.idpraticien = new_values.idpraticien);";
        // print_r($query);die;
        $requetePrep = $this->db->prepare($query);
        // $requetePrep->execute();
        return $this->createUTF8JSON('{"results":["'.$requetePrep->execute().'"]}');
    }
    public function utf8ze($d) {
        if (is_array($d)) {
            foreach ($d as $k => $v) {
                $d[$k] = $this->utf8ze($v);
            }
        } else if (is_string ($d)) {
            return utf8_encode($d);
        }
        return $d;
    }


    public function selectOID($query){
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->beginTransaction();
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stmt->bindColumn('image', $oid, PDO::PARAM_STR);
        $stmt->fetch(PDO::FETCH_BOUND);
        return $oid;
    }
    public function selectOIDAndName($query){
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->beginTransaction();
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stmt->bindColumn('image', $oid, PDO::PARAM_STR);
        // $stmt->fetch(PDO::FETCH_BOUND);
        return array($stmt->fetch(), $oid);
    }
    public function selectImage($idImg){
        $query = "SELECT image FROM images WHERE id=$idImg";
        return $this->selectOID($query);
    }
    public function selectImagePreview($idImg){
        $query = "SELECT image FROM images WHERE id=$idImg";
        return $this->selectOID($query);
    }
    public function selectDoc($idDoc){
        $query = "SELECT id, nom,type, document as image FROM documents WHERE id=$idDoc";
        return $this->selectOIDAndName($query);
    }
    public function selectRadio($idRadio){
        $query = "SELECT radio as image FROM radios WHERE id=$idRadio";
        return $this->selectOID($query);
    }
    public function cloudConvert($path){

        $api = new Api("lWBxRuEJG007vQ5TrswnKgXoxgp07TtBbO3mze4ZLMSqfhVgGpbsrIiScobuTylWdPNixJWYU47OPx_OReUKjQ");

        return json_encode($api->convert([
            "input" => "upload",
            "inputformat" => "doc",
            "save" => "true",
            "filename" => "input.doc",
            "outputformat" => "html",
            "file" => fopen($path, 'r'),
            ])
        ->wait()
        ->download()->output);
    }
    public function getCalDAVInfos($idP){
      $query = "select inifile from config where titre = 'calendarsForUsers' AND idpraticien = $idP OR titre = 'agendaCalDAVIdentifiers' and idpraticien = $idP";
      $settings = json_decode($this->selectInformation($query));

   	  $url = explode("/",json_decode($settings->results[1]->inifile,true)[$idP]);
      if(count($url) == 1){
        $url = explode("/",json_decode($settings->results[0]->inifile,true)[$idP]);
      }
   	  $usepw = explode("\n", $settings->results[0]->inifile);
      $usepw[] = "/calendars/users/".$usepw[0]."/";
      // var_dump($usepw);die;
      return $usepw;
    }
    public function cloudConvertPDF($path){

        $api = new Api("lWBxRuEJG007vQ5TrswnKgXoxgp07TtBbO3mze4ZLMSqfhVgGpbsrIiScobuTylWdPNixJWYU47OPx_OReUKjQ");
        $return =  $api->convert([
            "input" => "upload",
            "inputformat" => "html",
            "save" => "true",
            "filename" => "input.html",
            "converteroptions" => [
                "no_background" => true,
                "page_size" => "A3",
                "margin_left" => 0,
                "margin_right" => 0,
            ],
            "outputformat" => "pdf",
            "file" => fopen($path, 'r'),
            ])
        ->wait()
        ->download()->output;
         return $return->url;
    }
    public function insertImage($image,$idPatient,$ipPraticien){
        include_once('imageResize.php');
        $data = file_get_contents($image);
        $es_data = pg_escape_bytea($data);
        $id = pg_query("INSERT INTO images VALUES (default, ".$idPatient.", ".$ipPraticien.", '".$this->getDate()."','','', '{$es_data}')");
        $last_id_query = pg_query("SELECT currval('images_id_seq')");
        $last_id_results = pg_fetch_assoc($last_id_query);
        print_r($this->createJSON($last_id_results));
        $image = new ImageResize($image);
        $image->resizeToHeight(200);
        $image->save($_FILES['htdocs']['tmp_name']);
        $data = file_get_contents($_FILES['htdocs']['tmp_name']);
        $es_data = pg_escape_bytea($data);
        $last_id = $last_id_results['currval'];
        pg_query("UPDATE patients SET idphoto = $last_id  WHERE id = ".$idPatient);
        pg_query("INSERT INTO images_preview VALUES ($last_id, ".$idPatient.", ".$ipPraticien.", '".$this->getDate()."','','', '{$es_data}')");
    }
        public function insertPDF($file,$idPatient,$ipPraticien, $nom){
        include_once('imageResize.php');
        $data = file_get_contents("https:".$file."/input.pdf");
        $es_data = pg_escape_bytea($data);
        $id = pg_query("INSERT INTO documents VALUES (default, ".$idPatient.", ".$ipPraticien.", '".$this->getDate()."','PDF','".$nom."-".$this->getDate()."', '{$es_data}','')");
    }
    public function getDate(){
        $now = time();
        $num = date("w");
        if ($num == 0)
            { $sub = 6; }
        else { $sub = ($num-1); }
        $WeekMon  = mktime(0, 0, 0, date("m", $now)  , date("d", $now)-$sub, date("Y", $now));    //monday week begin calculation
        $todayh = getdate($WeekMon); //monday week begin reconvert
        $d = $todayh["mday"];
        $m = $todayh["mon"];
        $y = $todayh["year"];
        return "$y-$m-$d"; //getdate converted day
    }
    function parse_ini_string_m($str) {

    if(empty($str)) return false;

    $lines = explode("\n", $str);
    $ret = Array();
    $inside_section = false;

    foreach($lines as $line) {

        $line = trim($line);

        if(!$line || $line[0] == "#" || $line[0] == ";") ;

        if($line[0] == "[" && $endIdx = strpos($line, "]")){
            $inside_section = substr($line, 1, $endIdx-1);
            continue;
        }

        if(!strpos($line, '=')) continue;

        $tmp = explode("=", $line, 2);

        if($inside_section) {

            $key = rtrim($tmp[0]);
            $value = ltrim($tmp[1]);

            if(preg_match("/^\".*\"$/", $value) || preg_match("/^'.*'$/", $value)) {
                $value = mb_substr($value, 1, mb_strlen($value) - 2);
            }

            $t = preg_match("^\[(.*?)\]^", $key, $matches);
            if(!empty($matches) && isset($matches[0])) {

                $arr_name = preg_replace('#\[(.*?)\]#is', '', $key);

                if(!isset($ret[$inside_section][$arr_name]) || !is_array($ret[$inside_section][$arr_name])) {
                    $ret[$inside_section][$arr_name] = array();
                }

                if(isset($matches[1]) && !empty($matches[1])) {
                    $ret[$inside_section][$arr_name][$matches[1]] = $value;
                } else {
                    $ret[$inside_section][$arr_name][] = $value;
                }

            } else {
                $ret[$inside_section][trim($tmp[0])] = $value;
            }

        } else {

            $ret[trim($tmp[0])] = ltrim($tmp[1]);

        }
    }
    return $ret;
}

function arr2ini(array $a, array $parent = array())
{
    $out = '';
    foreach ($a as $k => $v)
    {
        if (is_array($v))
        {
            //subsection case
            //merge all the sections into one array...
            $sec = array_merge((array) $parent, (array) $k);
            //add section information to the output
            $out .= '[' . join('.', $sec) . ']' . PHP_EOL;
            //recursively traverse deeper
            $out .= $this->arr2ini($v, $sec);
        }
        else
        {
            //plain key->value case
            $out .= "$k=".pg_escape_string ($v) . PHP_EOL;
        }
    }
    return $out;
}
function stdClassToArray($array){
    foreach ($array as $key => $oObject) {
        $arr[$key] = json_decode(json_encode($oObject),true);
    }
    return $arr;
}
         function _format_json($json, $html = false) {
		$tabcount = 0;
		$result = '';
		$inquote = false;
		$ignorenext = false;
		if ($html) {
		    $tab = "&nbsp;&nbsp;&nbsp;";
		    $newline = "<br/>";
		} else {
		    $tab = "\t";
		    $newline = "\n";
		}
		for($i = 0; $i < strlen($json); $i++) {
		    $char = $json[$i];
		    if ($ignorenext) {
		        $result .= $char;
		        $ignorenext = false;
		    } else {
		        switch($char) {
		            case '{':
		                $tabcount++;
		                $result .= $char . $newline . str_repeat($tab, $tabcount);
		                break;
		            case '}':
		                $tabcount--;
		                $result = trim($result) . $newline . str_repeat($tab, $tabcount) . $char;
		                break;
		            case ',':
		                $result .= $char . $newline . str_repeat($tab, $tabcount);
		                break;
		            case '"':
		                $inquote = !$inquote;
		                $result .= $char;
		                break;
		            case '\\':
		                if ($inquote) $ignorenext = true;
		                $result .= $char;
		                break;
		            default:
		                $result .= $char;
		        }
		    }
		}
		return $result;
	}
}
?>
