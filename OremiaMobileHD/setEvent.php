<?php
include_once 'db_functions.php';
require_once('./CalDav/SimpleCalDAVClient.php');
$client = new SimpleCalDAVClient();
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
try {
	/*
	 * To establish a connection and to choose a calendar on the server, use
	 * connect()
	 * findCalendars()
	 * setCalendar()
	 */
	 $idP = $_GET["idP"];
	 $db = (new DB_Functions())->useConnexion();
	 $infos = $db->getCalDAVInfos($idP);
	 // print_r($properUrl);
	 $client->connect('https://localhost:8443'.$infos[2], $infos[0], $infos[1]);

	$arrayOfCalendars = $client->findCalendars(); // Returns an array of all accessible calendars on the server.
	$calTitle = $_GET['TITLE'];
	foreach ($arrayOfCalendars as $cal) {
		if($cal->getDisplayName() == $calTitle){
			$client->setCalendar($arrayOfCalendars[$cal->getCalendarID()]);
		}
	}
    $UID = str_replace("@oremia.com", "", $_GET['UID']);

  $IPP = $_GET['IPP'];
  $statut = $_GET['STATUT'];
	$type = $_GET['TYPE'];
	$dtstart = "DTSTART:".$_GET['DTSTART'];
	$dtend = "DTEND:".$_GET['DTEND'];
	$summary = 'SUMMARY:'.$_GET['SUMMARY'];
	$note = $_GET['NOTES'];
  $ressources = "RESOURCES;X-ORE-IPP=%".$IPP."%";
  if(isset($statut)){
    $ressources .= ";X-ORE-STATUT=%".$statut."%";
  }
	if(isset($type)){
    $ressources .= ";X-ORE-TYPE=%".$type."%";
  }
	$ressources .= ":";


	$date = DateTime::createFromFormat("Y-m-d", $_GET['date']);
	$interval = new DateInterval("P1D"); // 4 months
	$dateDeb = date_format($date->sub($interval),"Ymd")."T000000Z";
	$interval = new DateInterval("P2D");
	$dateFin = date_format($date->add($interval),"Ymd")."T000000Z";
	$events = $client->getEvents($dateDeb, $dateFin); // Returns array($secondNewEventOnServer);

	// echo $events[0]->getData(); // Prints $secondNewEvent. See CalDAVObject.php

	// $client->delete($secondNewEventOnServer->getHref(), $secondNewEventOnServer->getEtag()); // Deletes the second new event from the server.

	// $client->getEvents('20140418T103000Z', '20140419T200000Z'); // Returns an empty array


	// echo '<pre>';
	// var_dump($events);
	// echo '</pre>';

    /*
     * You can create custom queries to the server via CalDAVFilter. See CalDAVFilter.php
     */

    $filter = new CalDAVFilter("VEVENT");
    $filter->mustIncludeMatchSubstr("UID", $UID, FALSE);
    $events = $client->getCustomReport($filter->toXML());
	// echo "<pre>";
	// print_r($events);
	// echo "</pre>";
	if (count($events) == 0){
		$evt = array($client->createEvent($UID,$dtstart,$dtend,$summary,$note,$ressources));

	}else {
	    $data = $events[0]->getData();
			$arraydata = explode("\n",$data);
			$data = "";
			$found = false;
			foreach ($arraydata as $key) {
				if(count(explode("RESOURCES",$key))>1){
					$found = true;
					$key = $ressources;
				}else if(count(explode("SUMMARY",$key))>1){
					if(!$found ){
						$key = $ressources."\n".$summary;
					}else {
						$key = $summary;
					}
				}else if(count(explode("DTSTART",$key))>1){
					$key = $dtstart;
				}else if(count(explode("DTEND",$key))>1){
					$key = $dtend;
				}
				$data .= $key."\n";
			}
			//  var_dump($data);
	    $evt = array($client->change($events[0]->getHref(),$data, $events[0]->getEtag()));
		}
		print_r( '{"results":['.$client->getClientEvents($evt).']}');
}

catch (Exception $e) {
	echo $e->__toString();
}

?>
