<?php
include_once 'db_functions.php';
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
require_once('./CalDav/SimpleCalDAVClient.php');
$client = new SimpleCalDAVClient();
try {
	$idP = $_GET["idP"];
	$db = (new DB_Functions())->useConnexion();
	$infos = $db->getCalDAVInfos($idP);
	// print_r($properUrl);
	if(count($infos)==3){

		$client->connect('https://localhost:8443'.$infos[2], $infos[0], $infos[1]);
		$events = array();
		$date = DateTime::createFromFormat("Y-m-d", $_GET['date']);
		$interval = new DateInterval("P7D"); // 4 months
		$dateDeb = date_format($date->sub($interval),"Ymd")."T000000Z";
		$interval = new DateInterval("P14D");
		$dateFin = date_format($date->add($interval),"Ymd")."T000000Z";
		// echo '<pre>';
		// var_dump($dateDeb);
		// echo '</pre>';
		$arrayOfCalendars = $client->findCalendars(); // Returns an array of all accessible calendars on the server.
		foreach ($arrayOfCalendars as $cal) {
			// echo $cal->getCalendarID().'     ';
			$client->setCalendar($arrayOfCalendars[$cal->getCalendarID()]); // Here: Use the calendar ID of your choice. If you don't know which calendar ID to use, try config/listCalendars.php

			$events = array_merge($events,$client->getEvents($dateDeb,$dateFin)); // Returns array($secondNewEventOnServer);

			// if(isset($_GET['UID'])){
			// 	$filter = new CalDAVFilter("VEVENT");
			//     $filter->mustIncludeMatchSubstr("UID", "C1C37533-F69F-46B3-BA60-A17E3C3C18BD-12276@oremia.com", FALSE);
			//     $events = $client->getCustomReport($filter->toXML());
			// }
			// echo "<pre>";
			// print_r($events);
			// echo "</pre>";
		}
			print_r( '{"results":'.$client->getClientEvents($events).'}');
	}

}catch (Exception $e) {
	echo $e->__toString();
}

?>
