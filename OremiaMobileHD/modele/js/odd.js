/*	
	
    Oremia Dynamic Document
    Copyright (C) 2015
    
    */
    var values;
    var selectedIndex;
    var idPrat;
    var idPatient;
    var idDocument;
    var db;
    var user;
    var pw;
    var canvas
    var signaturePad
    var signatureSrc = ""
    var d = new Date();
    /*----------------------------------------------GETURLPARAMETER-------------------------------------------------*/
    /*----------------------------------------------Retourne le GET passé dans l'url------------------------------------------*/
    function getUrlParameter(sParam) {
    	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    	sURLVariables = sPageURL.split('&'),
    	sParameterName,
    	i;

    	for (i = 0; i < sURLVariables.length; i++) {
    		sParameterName = sURLVariables[i].split('=');

    		if (sParameterName[0] === sParam) {
    			return sParameterName[1] === undefined ? true : sParameterName[1];
    		}
    	}
    };
    (function($) {
    	$.fn.outerHTML = function() {
    		return $(this).clone().wrap('<div></div>').parent().html();
    	};
    })(jQuery);
    /*----------------------------------------------FINDMDVALUES-------------------------------------------------*/
    /*----------------------------------------------Trouve les balise mdinpu et mdlabel et créer un formulaire------------------------------------------*/
    (function($) {
    	$.fn.findMdValues = function() {
    		ElementInput = $(this).find('[mdinput]');
    		Label = $(this).find('[mdlabel]');
    		nbElement = ElementInput.length;
    		template = $('<div class="form-group"><label class="col-sm-4 control-label" for="" mdlabel >Name</label><div class="col-sm-6"><input type="text" class="form-control" id="exampleInputName2" placeholder="Rentrer une valeur" mdinput></div></div>')
		//template = $('<span class="input input--kaede"><input type="text" class=" input__field input__field--kaede" id placeholder="Rentrer une valeur" mdinput><label mdlabel for="" class="control-label input__label input__label--kaede "><span class="input__label-content input__label-content--kaede">First Name</span></label></span>');
		content = '<form class="form-horizontal mdform">';  		
		for (cpt = 0 ; cpt <= nbElement-1; cpt++){
			    		template = $('<div class="form-group"><label class="col-sm-4 control-label" for="" mdlabel >Name</label><div class="col-sm-6"><input type="text" class="form-control" id="exampleInputName2" placeholder="Rentrer une valeur" mdinput></div></div>')

			type = $(ElementInput[cpt]).attr("mdtype")
			if (type != undefined){
				switch(type) {
					case "checkbox":
					template.find('[mdinput]').attr("class","")
					template.find('[mdinput]').attr("type","checkbox")
					break;
					case "textarea":
					template = $('<div class="form-group"><label class="col-sm-4 control-label" for="" mdlabel >Name</label><div class="col-sm-6"><textarea class="form-control" id="exampleInputName2" placeholder="Rentrer une valeur" mdinput></textarea></div></div>')
					break;
					case "date":
					template.find('[mdinput]').attr("type","date")
					break;
					case "select":
					template = $('<div class="form-group"><label class="col-sm-4 control-label" for="" mdlabel >Name</label><div class="col-sm-6"><select class="form-control" id="exampleInputName2" mdinput></select></div></div>')
					fillSelect(template, ElementInput[cpt], this);
					break;
					case "option":
					template = $('')
					fillSelect(template, ElementInput[cpt], this);
					break;
				}
			} else {
				template = $('<div class="form-group"><label class="col-sm-4 control-label" for="" mdlabel >Name</label><div class="col-sm-6"><input type="text" class="form-control" id="exampleInputName2" placeholder="Rentrer une valeur" mdinput></div></div>')

			}
			fromdb = $(ElementInput[cpt]).attr("mdfromdb")
			if (fromdb != undefined){
				$(template).mdfromdb(fromdb)
			}
			if (type!="option"){
				template.find('[mdlabel] ').html($(Label[cpt]).attr('mdlabel'));
				template.find('[mdlabel]').attr("for", "input" + cpt);
				template.find('[mdinput]').attr("name", $(ElementInput[cpt]).attr("mdinput"));
				template.find('[mdinput]').attr("mdinput", $(ElementInput[cpt]).attr("mdinput"));
				template.find('[mdinput]').attr("id", "input" + cpt);


				content += template.outerHTML();
			}
		}
		if($(this).find('.signature').length > 0){
			content += "<p>Signature : </p> <button type='button' class='btn btn-success btn-clear'>Modifier signature</button><canvas width='658px' height='318px'></canvas><input type='text' style='display:none;' name='mdsignature' class='image'></input>"
		}
		content+= '<button type="button" class="btn btn-primary btn-lg btn-block btn-valid-form" href="#carousel-example-generic" data-slide="next">Valider</button></form>';
		$("#includedContent").html(content);
		$(".input__field--kaede").onInputChange();
		if($(this).find('.signature').length > 0){
			canvas = document.querySelector("canvas");
			signaturePad = new SignaturePad(canvas);
			$(".btn-clear").click(function(){
				signaturePad.clear();
			})
		}

	};
})(jQuery);



(function($) {
	$.fn.mdfromdb = function(fromdb) {
		var res = fromdb.split(":");
		query = "SELECT "+res[0]+" FROM "+res[1]+" WHERE id="+eval(res[2])+"";
		vdata={"dbname":db, "user":user, "pw":pw, "query": query};
		// Du nouveau formulaire dans la bdd
		var input = this
		$.ajax({
			type: "POST",
			url: '../index.php?type=11',
			data: vdata
		}).done(function(data){
			json = JSON.parse(data)
			input.find('[mdinput]').attr("value",json["results"][0][res[0]])
			inputText = input.find("[mdinput]").attr("id")
			$("#"+inputText).val(json["results"][0][res[0]])
		});
	};
})(jQuery);



/*---------------------------------------------REPLACEMDVALUE-------------------------------------------------*/
/*----------------------------------------------Remplace les valeurs saisies dans un formulaire et les replaces dans le document pointé en paramètre------------------------------------------*/
(function($) {
	$.fn.replaceMdValues = function(output) {
		ElementInput = $(this).find('[mdinput]');
		nbElement = ElementInput.length;
		ElementOutput = $(output).find('[mdinput]');
		i=0;
		for (cpt = nbElement-1; cpt >= 0; cpt--){
			i++;
			type = $(output).find("[mdinput='"+$(ElementInput[cpt]).attr("mdinput")+"']").attr("mdtype");
			if(type != undefined && type == "checkbox"){
				if($("[mdinput='"+$(ElementInput[cpt]).attr("mdinput")+"']").is(':checked')){
					$(output).find("[mdinput='"+$(ElementInput[cpt]).attr("mdinput")+"']").html("<i class='fa fa-check-square-o'></i>");
				} else {
					$(output).find("[mdinput='"+$(ElementInput[cpt]).attr("mdinput")+"']").html("<i class='fa fa-square-o'></i>");
				}
			}else
			if(type != undefined && type == "select"){
				fillSelectedOption(ElementInput[cpt], output);
			}else{
				$(output).find("[mdinput='"+$(ElementInput[cpt]).attr("mdinput")+"']").html($(ElementInput[cpt]).val());
				type = $(output).find("[mdinput='"+$(ElementInput[cpt]).attr("mdinput")+"']").attr("mdtype");
			}
		}
		
		if($(output).find('.signature').length > 0 && signatureSrc == ""){
			signatureSrc = signaturePad.toDataURL();
			$(output).find('.signature').parent().html("<img class='signature' src='' style='width:100%'/>")
			$(output).find('.signature').attr("src", signatureSrc);
			$(this).find('.image').val(signatureSrc);
		}
	};
})(jQuery);
/*----------------------------------------------LOADSELECT-------------------------------------------------*/
/*----------------------------------------------Prend en paramètre un json et charge une liste box------------------------------------------*/
(function($) {
	$.fn.loadSelect = function(data) {
		nbElement = data.length;
		template = $('<option value=""></option>');
		content = '<form><select class="form-control" id="mdselect">';  		
		for (cpt = 0; cpt <= nbElement-1; cpt++){
			template.html(data[cpt]['nomtype']);
			template.attr("value", data[cpt]['idtype']);
			content += template.outerHTML();
		}
		content+= '</select><button type="button" class="btn btn-primary btn-lg btn-block btn-valid-form" >Valider</button></form>';
		$("#includedContent").html(content);
	};
})(jQuery);
/*----------------------------------------------FILLFORM-------------------------------------------------*/
/*----------------------------------------------Prend en paramètre un stringify json et remplace les input du même nom------------------------------------------*/
(function($) {
	$.fn.fillForm = function(data, form) {
		parsedJson = JSON.parse(data); 
		nbElement = parsedJson.length;
		for (cpt = 0; cpt <= nbElement-1; cpt++){
			
			if(parsedJson[cpt]["name"] == "mdsignature"){
				signatureSrc =(parsedJson[cpt]["value"]).replace(/ /g , "+")
				signaturePad.fromDataURL(signatureSrc);
				$(this).find('.signature').attr("src", signatureSrc);
				$(form).find('.image').val(signatureSrc);
			} else {
				input = $(form + " [name=" + parsedJson[cpt]["name"]+ "]");
				input.val(parsedJson[cpt]["value"]);
				input.checkIfEmpty();
			}
			
		}

	};
})(jQuery);
/*---------------------------------------------ONINPUTCHANGE-------------------------------------------------*/
/*-----------------------------------vérifie lorsque l'input est rempli afin de le l'afficher------------------------------------------*/
(function($) {
	$.fn.onInputChange = function() {
		$(this).on('input',function(){
			$(this).checkIfEmpty();
		});
	};
})(jQuery);
/*---------------------------------------------CHECKIFEMPTY-------------------------------------------------*/
/*-----------------------------------vérifie lorsque l'input est vide afin de le l'afficher------------------------------------------*/
(function($) {
	$.fn.checkIfEmpty = function() {
		if($(this).val()!=""){
			$(this).parent().addClass('input--filled');
		} else {
			$(this).parent().removeClass('input--filled');
		}
	};
})(jQuery);
/*----------------------------------------------MORPHTOUPDATE-------------------------------------------------*/
/*----------------------------------------------Change l'objet pointé en boutton modifier------------------------------------------*/
(function($) {
	$.fn.morphToUpdate = function() {
		$(this).attr("data-slide","next");
		$(this).attr("href","#carousel-example-generic");
		$(this).attr("class", "btn btn-warning btn-lg btn-block btn-update-form");
		$(this).html("Modifier");
	};
})(jQuery);
Date.prototype.yyyymmdd = function() {         

	var yyyy = this.getFullYear().toString();                                    
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = this.getDate().toString();             

        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
    };  


    $(document).ready(function() {
    	idPrat=getUrlParameter("idPrat");
    	idPatient=getUrlParameter("idPatient");
    	idDocument=getUrlParameter("idDocument");
    	db=getUrlParameter("db");
    	user=getUrlParameter("login");
    	pw=getUrlParameter("pw");
    	switch(idDocument){
    		case(undefined): query="SELECT idtype, nomtype, nomfichier FROM typeDocument;";
    		break;
    		default :  query="SELECT * FROM modele_document m INNER JOIN typeDocument t ON t.idType = m.idType GROUP BY idDocument,t.idType HAVING idDocument ="+idDocument+";";
    	}
    	vdata={"dbname":db, "user":user, "pw":pw, "query": query};
    	$.ajax({
    		type: "POST",
    		url: '../index.php?type=11',
    		data: vdata
    	}).done(function( data ) {
    		data = JSON.parse(data);
    		values = data['results'];
    		switch(idDocument){
    			case(undefined): 
    			$("#documentContainer").loadSelect(values);
    			$(".btn-valid-form").click(function(){
				//chargement de l'index séléctionné'
				selectedIndex = $("#mdselect")[0].selectedIndex;
				$(".title").html(values[selectedIndex]['nomtype']); //maj titre
				$(".alert").show();
				//chargement css du document
				$("head").html($("head").html() + '<link rel="stylesheet" href="./documents/'+values[selectedIndex]['nomfichier']+'/base.min.css"/><link rel="stylesheet" href="./documents/'+values[selectedIndex]['nomfichier']+'/main.css"/>')
				//chargement du document
				$("#documentContainer").load("./documents/"+encodeURIComponent(values[selectedIndex]['nomfichier'].trim())+"/", function(){
					processNewDocument(this);
				});
			});
    			break;
    			default :  
    			values = values[0];
				//chargement de l'index séléctionné'
				$(".title").html(values['nomtype']); //maj titre
				//chargement css du document
				$("head").html($("head").html() + '<link rel="stylesheet" href="./documents/'+values['nomfichier']+'/base.min.css"/><link rel="stylesheet" href="./documents/'+values['nomfichier']+'/main.css"/>')
				//chargement du document
				$("#documentContainer").load("./documents/"+encodeURIComponent(values['nomfichier'].trim())+"/", function(){
					$(this).findMdValues(); // Chargement du formulaire 
					$(this).fillForm(unescape(values['datadoc']), "#includedContent"); // Remplissage des input du formulaire
					$("#includedContent").replaceMdValues("#documentContainer"); //  Remplacement des valeurs
					processUpdateDocument(this);
				});
			}
			$("#fixCSS").click(function(){
				window.location.reload(true);
			})
		});

		handleExport(db,user,pw);
		

});
function handleExport(db,user,pw){
	$("#exportPdf").click(function(e){
		$(".loaderContainer").show();
		e.preventDefault();
		var html = "<html><head></head><body><title></title>"+$("#documentContainer").html()+"</html>"
		vdata={"dbname":db, "user":user, "pw":pw, "html": html,"idPraticien": idPrat,"idPatient": idPatient};
		$.ajax({
	    		type: "POST",
	    		url: '../index.php?type=13',
	    		data: vdata
	    	}).done(function( data ) {
	    		alert("enregistré")
	    		$(".loaderContainer").hide();
			});
	})
	
}

function processNewDocument(document){
	$(document).hide();
	$(document).findMdValues(); // Chargement du formulaire 
	$(".btn-valid-form").click(function(){
		$(this).unbind( "click" );
		$("#includedContent").replaceMdValues("#documentContainer"); // Remplacement des valeurs
		$("#documentContainer").show();
		d = new Date();
		query="INSERT INTO modele_document(idDocument, idPrat, idPatient, dataDoc, idType, date)VALUES (DEFAULT, "+idPrat+", "+idPatient+", '"+escape(JSON.stringify($(".mdform").serializeArray()))+"', "+values[selectedIndex]['idtype']+", '"+d.yyyymmdd()+"') RETURNING iddocument;";

		vdata={"dbname":db, "user":user, "pw":pw, "query": query};
		// Du nouveau formulaire dans la bdd
		$.ajax({
			type: "POST",
			url: '../index.php?type=11',
			data: vdata
		}).done(function( data ) {
			data = JSON.parse(data);
			idDocument = data['results'][0]["iddocument"];
			processUpdateDocument(document);
			// toCanvas();
		});
		// vdata={"file":$("#documentContainer").outerHTML(), "idPatient":idPatient, "idPraticien":idPrat, "nom": $(".title").html()};
		// // Du nouveau formulaire dans la bdd
		// $.ajax({
		// 	type: "POST",
		// 	url: '../index.php?type=13',
		// 	data: vdata
		// }).done(function( data ) {
		// 	console.log(data);

		// });
	});
}

function toCanvas(){
	console.log(document.getElementById("page-container"));
	html2canvas(document.getElementById("page-container"), {
	  onrendered: function(canvas) {
	    document.getElementById("page-container").appendChild(canvas);
	  }
	});
}

function processUpdateDocument(document){
	$("#includedContent").prepend('<button type="button" class="btn btn-primary btn-lg btn-next " data-slide="next" href="#carousel-example-generic"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></button>');
	$(".btn-valid-form").morphToUpdate();
	$(".btn-update-form").click(function(){
		$(this).html('Modifier <span class="glyphicon glyphicon-refresh load" aria-hidden="true"></span>'  )
		$("#includedContent").replaceMdValues("#documentContainer"); // Remplacement des valeurs
		if (signaturePad!= undefined){
			signatureSrc = signaturePad.toDataURL();
			$("#documentContainer").find('.signature').attr("src", signatureSrc);
			$("#includedContent").find('.image').val(signatureSrc);
		}
		$("#documentContainer").show();
		query = "UPDATE  modele_document SET  dataDoc = '"+escape(JSON.stringify($(".mdform").serializeArray()))+"' WHERE  idDocument = "+idDocument+";";

		vdata={"dbname":db, "user":user, "pw":pw, "query": query};
		// Du nouveau formulaire dans la bdd
		$.ajax({
			type: "POST",
			url: '../index.php?type=11',
			data: vdata
		}).done(function(){
			$(".glyphicon-refresh.load").attr("class","glyphicon glyphicon-ok");
			$("#includedContent").scrollTop();

		});
	});
}
function fillSelect(template, element, container){
	for(i=0;i<=$(element).attr("mdcount");i++){

		template.find("select").append("<option value='"+$(container).find("[mdinput='option"+$(element).attr("mdinput").split("question")[1]+i+"']").attr("mdinput")+"'>"+$(container).find("[mdinput='option"+$(element).attr("mdinput").split("question")[1]+i+"']").attr("mdlabel")+"</option>")
	}
}
function fillSelectedOption(element, output){
	for(i=0;i<$(element).find("option").size();i++){
		$(output).find("[mdinput='option"+$(element).attr("name").split("question")[1]+i+"']").html("<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAQAAADY4iz3AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAARCQAAEQkAUBnxFQAAAAHdElNRQfgBQ0QBiSWZQaoAAAAfUlEQVQY063QsQnCUBhF4e8PD6v0OoRg8UYRnCILOEGGEUexE1whEEsrizwLNURIOm977oXDjbxzsvYUvilWOofIN2etWhlReDjaR77b6sRlRDkUG9f0aUc2WRWUJAwokxUMorKYv6OkqGYMq7ehGUMi6TVadf59o9HH8ocvjP0n2qopkf0AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTYtMDUtMTNUMTY6MDY6MzYtMDQ6MDAc/P87AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE2LTA1LTEzVDE2OjA2OjM2LTA0OjAwbaFHhwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII='></img>");
	}
	$(output).find("[mdinput='"+$(element).val()+"']").html("<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAQAAADY4iz3AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwABEJAAARCQAYms0rgAAAAHdElNRQfgBQ0QBxpOHypCAAAA6ElEQVQY0z3QvyuEcQDH8df3e89J11FSFKPRpGexmEzqysQ/YFFXFov8mKQuSga73d/gymCT1A1YzKJbjkJ47mt4js/+eX9+hHzOuQlfglJBVPVkNeQPzrWMSBICXn3atxLyrlnPwk0iL30HLtx6zCQBIYfMtzXbFi3rR0GBiiT4NuMIO95kcRD+oyLgxJhTbaOKKPowb1dSaGq4s4s+mWTIoQXDzrSwoYdEFPzY1LPlUt2xtmo5IirUXWvomdaxV8JE6a/hlSUd695FfSQh6mqqmXJvwb1J4ybUNHXD/4eZNIAlQ16s/gJ+OEiCd51kswAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNi0wNS0xM1QxNjowNzoyNi0wNDowMD+UlJsAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTYtMDUtMTNUMTY6MDc6MjYtMDQ6MDBOySwnAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg=='></img>");
}

function getDate() {
	var d = new Date();
	var n = d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()

	return n;
}
function escapeSpaces( str ) {
  return (str + '').replace(/([ /])/g, '\\$1');
}
