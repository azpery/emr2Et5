<?php
class DB_Connect {
    private $dbname;
    private $user;
    private $pw;
    function defineConnexion($dbname, $user, $pw) {
        $instance = new self();
        $instance->dbname = $dbname;
        $instance->user = $user;
        $instance->pw = $pw;
        setcookie('connectionString', '{"dbname": "'.$dbname.'","user":"'.$user.'", "pw":"'.$pw.'"}');
        return $instance;
    }
    // constructor
    function __construct() {
    }

    function useConnexion() {
        $instance = new self();
        // $connectionString = json_decode($_COOKIE["connectionString"]);
        $instance->dbname = "zuma";
        $instance->user = "zm500";
        $instance->pw = "zuma";
        return $instance;
    }

    // function useConnexion() {
    //     $instance = new self();
    //     $connectionString = json_decode($_COOKIE["connectionString"]);
    //     $instance->dbname = $connectionString->{'dbname'};
    //     $instance->user = $connectionString->{'user'};
    //     $instance->pw = $connectionString->{'pw'};
    //     return $instance;
    // }

    // destructor
    function __destruct() {
        //$this->close();
    }

    // Connecting to database
    public function connect() {
        //require_once 'config.php';
        // connecting to pgsql
        $con = new PDO('pgsql:host=localhost;dbname='.$this->dbname , $this->user, $this->pw);
        // return database handler
        return $con;
    }
    public function pg_connect() {
        require_once 'config.php';
        // connecting to pgsql
        $con = pg_connect("host=localhost dbname=$this->dbname user=$this->user password=$this->pw");
        // return database handler
        return $con;
    }
}
?>
