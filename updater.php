<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
set_time_limit(0);

$src = checkVersion();

if($src){
if (is_writable("./")) {
    full_copy($src, $dst = './');
	exec ("find /path/to/folder -type d -exec chmod 0777 {} +");
	exec ("find /path/to/folder -type f -exec chmod 0777 {} +");
} else {
    if (is_dir('OremiaMobileHD')) {
        if (!deletedir('OremiaMobileHD')){
          echo '{"results":"3"}'; die;
        }else{
			 full_copy($src, $dst = './');
			 exec ("find /path/to/folder -type d -exec chmod 0777 {} +");
			 exec ("find /path/to/folder -type f -exec chmod 0777 {} +");
		}
    }
}

} else {
  echo '{"results":"AJ"}'; die;
}

function recurse_copy($src,$dst) {

  $dir = opendir($src);
  @mkdir($dst);
  while(false !== ( $file = readdir($dir)) ) {
      if (( $file != '.' ) && ( $file != '..' )) {
          if ( is_dir($src . '/' . $file) ) {
              recurse_copy($src . '/' . $file,$dst . '/' . $file);
          }
          else {
              copy($src . '/' . $file,$dst . '/' . $file);
          }
      }
  }
  closedir($dir);
  echo '{"results":"success"}'; die;
}

function full_copy( $source, $target ) {
    if ( is_dir( $source ) ) {
        @mkdir( $target );
        $d = dir( $source );
        while ( FALSE !== ( $entry = $d->read() ) ) {
            if ( $entry == '.' || $entry == '..' ) {
                continue;
            }
            $Entry = $source . '/' . $entry;
            if ( is_dir( $Entry ) ) {
                full_copy( $Entry, $target . '/' . $entry );
                continue;
            }
            copy( $Entry, $target . '/' . $entry );
        }

        $d->close();
    }else {
        copy( $source, $target );
    }
}

function checkVersion(){
  $src = './OremiaMobileHD/';
  if(file_exists($src."version.txt")){
    $myfile = fopen($src."version.txt", "r") or false;
    $versionLocal = fread($myfile,filesize($src."version.txt")) or "0.0";
    fclose($myfile);
  }else {
    $versionLocal = "0.0";
  }


  $ftp_server = "ftp-rdelaporte.alwaysdata.net";
  $ftp_user = "rdelaporte";
  $ftp_pass = "squateur";

  // Mise en place d'une connexion basique
  $conn_id = ftp_connect($ftp_server) or die("Couldn't connect to $ftp_server");
  $conn_id = ftp_connect($ftp_server) or die("Couldn't connect to $ftp_server");

  // Tentative d'identification
  if (@ftp_login($conn_id, $ftp_user, $ftp_pass)) {

    $src = 'ftp://rdelaporte:squateur@ftp-rdelaporte.alwaysdata.net/www/lesson/OM/file_updater/';
    $myfile = fopen($src."version.txt", "r") or "0.0";
    $versionServeur = fread($myfile,filesize($src."version.txt")) or "0.0";
    fclose($myfile);


    if(str_replace("\n","", $versionLocal )!= str_replace("\n","", $versionServeur)){
      return $src = str_replace("\n","", $src.$versionServeur);
    }else {
      return false;
    }
  } else {
    echo "{\"results\":Connexion impossible en tant que $ftp_user\n}";
    return false;
  }

}
function deletedir($dir)
    {
        if (is_dir($dir))
        {
            $files = scandir($dir);
            foreach ($files as $file)
            {
                if ($file != "." && $file != "..")
                {
                    if (filetype($dir."/".$file) == "dir")
                    {
                        deletedir($dir."/".$file);
                    }
                    else
                    {
                        unlink($dir."/".$file);
                    }
                }
            }
            reset($objects);
            if(rmdir($dir))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
?>
