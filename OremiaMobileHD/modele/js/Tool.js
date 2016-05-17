/************************INIT**********************/
var i = 0;
var valeur;
var signature ="";
var option = 0;
$(document).ready(function(){
	// alert("lol")
	// window.location.replace("Tool.html?v=1.0");
	var screenHeight = $(document).height()
	var loaderHeigth = (screenHeight / 2) - ($(".loader").height())
	var titleHeight = (screenHeight / 2) - ($(".loadingTitle").height())
	console.log($(".loadingTitle").width());
	$(".loader").attr("style","top:"+loaderHeigth+"px;");
	$(".loadingTitle").attr("style","top:"+titleHeight+"px;");
	$(".loaderContainer").hide()
	displayDocFromDb();
	validerSauvegarde();
	$('input[type=file]').change(function () {
		if(this.files[0]["type"] == "text/html"){
      chargerFichierHTML(this.files);
    }else{
      chargerFichierDoc(this.files);
    }
  });
  $('#test').click(function(){
    $("#documentContainer").load("./test.html", function(){
      showNextCaroussel();
    })
  })
});

/************************On affiche les documents de la base********************************/
function displayDocFromDb(){
	$.ajax({
		type: "POST",
		url: '../index.php?type=11',
		data: {"query":"SELECT DISTINCT id, nom FROM documents where type ='DOC';","dbname":"zuma", "user":"zm500", "pw":"zuma"}
	}).done(function(data){
		var html = '<div>';
		var d = JSON.parse(data)
		var results = d.results;
		for(var i = 0; i < results.length; i++ ){
			html += '<div class="file col-md-3">';
			html += '<i class="fa fa-file-text fa-4 col-sm-2"></i>';
			html += results[i].nom;
			html += '<br><button class="btn btn-sm btn-success btn-file" id='+results[i].id+'>Choisir ce fichier</button>'
			html += '</div>';
		}
		html += '</div>';
		$("#includedContent").append(html);
		$('.btn-file').click(function(e){
			e.preventDefault()
			var id = $(this).attr("id");
			chargerFichierDocFromDb(id);
		})
	});
}

/************************Ajout de du listenner du click dans le document afin d'afficher la pop up de création de champs*****************************/
function addElement(){
	$("#page-container").click(function(e) {
		e.preventDefault()
		showElement(this,e, i);
	});
}
/***********************Affichage des de la pop up de création de champs***************************/
function showElement(h,e, m){
  $(h).unbind("click");
  showDiv(m,e,h);
  handleChangeType(h,e,m);
  handleValid(h,e,m);
  handleCancel();

}
/*******************Fixation de l'élement *******************/
function fixer(k){
	// $(".fixer").on("click",".fixer",function(event){
    event.preventDefault();
    $(this).unbind("mousedown");
    $("#question"+k).attr("class","question")
    console.log($("#question"+k))
    handleEdit(k);
    if($(".fixer").parent().find("img").attr("src")!=undefined){
    	$(".fixer").parent().html("<img class='signature' src='' style='width:100%'/><i class='fa fa-pencil-square-o'></i></i>")
    }else {
    	$(".fixer").parent().html("<i class='fa fa-pencil-square-o'></i></i>");
    }
    $("html").attr("style","");
    addElement();
  // });
  // $("#fixer").parent().mousedown(function(event){
  //   $(this).unbind("click");
  //   $("#question"+k).attr("class","question")
  //   console.log($("#question"+k))
  //   handleEdit(k);
  //   if($("#fixer").parent().find("img").attr("src")!=undefined){
  //     $("#fixer").parent().html("<img class='signature' src='' style='width:100%'/><i class='fa fa-pencil-square-o'></i></i>")
  //   }else {
  //     $("#fixer").parent().html("<i class='fa fa-pencil-square-o'></i></i>");
  //   }
  //   $("html").attr("style","");
  //   addElement();
  //   event.preventDefault();
  // });
}
function handleEdit(k){
  $("[mdinput='question"+k+"']").click(function(e){
		e.preventDefault()
      $(this).unbind("click")
      mdinput = $(this).attr("mdtype")
      console.log(mdinput)
      showElement("#page-container",e,k)
      $("[name='mdtype']").val($(this).attr("mdtype"));
      $("[name='mdlabel']").val($(this).attr("mdlabel"));
    })
  $("[mdinput='option"+k+"']").click(function(e){
      $(this).unbind("click")
      mdinput = $(this).attr("mdtype")
      console.log(mdinput)
      showElement("#page-container",e,k)
      $("[name='mdtype']").val($(this).attr("mdtype"));
      $("[name='mdlabel']").val($(this).attr("mdlabel"));
    })
}
function fixerOption(k, callback){
  $("#fixer").mousedown(function(event){
		event.preventDefault()
    $(this).unbind("click");
    $(k).attr("class","question")
        $("#fixer").parent().html("<i class='fa fa-pencil-square-o'></i></i>")

    $("#fixer").remove();
    $("html").attr("style","");
    callback();
    event.preventDefault();
  });
}
/*****************************Sauvegarde du nouveau modele******************************/
function validerSauvegarde(){
  $(".validSauvegarde").click(function(e) {
    $('[mdtype]').each(function(){
      var top = $(this).position().top 
      $("#documentContainer").find('script').remove()
      var left = $(this).position().left 
      $(this).attr("style","position: absolute;"+
        "top: "+top+"px;"+
        "left: "+left+"px;"+
        "background:white;"+
        "z-index: 100;")
    });
		e.preventDefault()
    query = "INSERT INTO typedocument(idtype, nomtype, nomfichier) VALUES (DEFAULT, '"+$('#titre').val().toLowerCase()+"', '"+$('#titre').val().toLowerCase()+"');";
    vdata={"dbname":"zuma", "user":"zm500", "pw":"zuma","nomfichier":$('#titre').val().toLowerCase(),"file":$("#documentContainer").html(), "query": query};
    // Du nouveau formulaire dans la bdd
    var input = this
    $.ajax({
      type: "POST",
      url: '../index.php?type=9',
      data: vdata
    }).done(function(data){
      $('#myModal').modal('hide');
      $('#myModal2').modal('show');
    });
  });
}
/*****************************Chargement du fichier HTML sélectionner********************/
function chargerFichierHTML(files){
  var nomFichier = files[0]["name"]
  var vdata = new FormData();
  vdata.append( 'file', files[0]);
  $.ajax({
   type: "POST",
   url: '../index.php?type=12',
   cache: false,
   processData: false,
   contentType: false,
   data: vdata
 }).done(function(data){
  $("#documentContainer").load("./uploads/"+encodeURIComponent(nomFichier), function(){
    showNextCaroussel();
    // $(".pc.pc1.w0.h0").append($('[mdtype]'))
    // $('.page-container > [mdtype]')
    
  });
});
}
/**************************Chargement du fichier doc ********************************/
function chargerFichierDoc(files){
  $(".loaderContainer").show()
  var vdata = new FormData();
  vdata.append( 'file', files[0]);
  $.ajax({
   type: "POST",
   url: '../index.php?type=10',
   cache: false,
   processData: false,
   contentType: false,
   data: vdata
 }).done(function(data){
   var url = JSON.parse(data)["url"]
   $("#documentContainer").load("https:"+url+"/input.html", function(){
    showNextCaroussel();
  });
 });
}
/**************************Chargement du fichier doc ********************************/
function chargerFichierDocFromDb(id){
  $(".loaderContainer").show()
  var vdata = new FormData();
  vdata.append( 'id', id);
  $.ajax({
   type: "POST",
   url: '../index.php?type=15',
   cache: false,
   processData: false,
   contentType: false,
   data: vdata
 }).done(function(data){
   var url = JSON.parse(data)["url"]
   $("#documentContainer").load("https:"+url+"/input.html", function(){
    showNextCaroussel();
  });
 });
}
/***********************Retourne un icone suivant lle type de champ*************************/
function choisirIcon(type){
  switch(type){
    case "checkbox":
    final = '<i class="fa fa-check-square-o"></i>'
    break;
    case "signature":
    final = '<i class="fa fa-quote-right"></i>'
    signature = "signature";
    break;
    default:
    final = '<i class="fa fa-quote-right"></i>'
    break;
  }
  return final;
}
/**********************Retourne l'element HTML draggable******************/
function returnHTMLElement(md, m, e, final, valeur){
  x = '<span '+md+' class="question draggable '+signature+' resize-drag" id="question'+m+'" mdinput="question'+m+'" style="background:white;position:absolute;top:'+(e.pageY - posY)+'px;min-width: 18px;left:'+(e.pageX - posX)+'px;z-index:100;">'+final+'Placer l\'élément puis cliquer:<button class="btn btn-sm btn-success fixer" id="fixer" onclick="fixer('+m+')"style="z-index:999;">Fixer</button></span> ';
  if(valeur[0]["value"] == "signature"){
    x = '<div  class="question draggable resize-drag"  id="question'+m+'" style="background:white;position:absolute;top:'+(e.pageY - posY)+'px;left:'+(e.pageX - posX)+'px;z-index:100;width:120px;box-sizing:border-box;" ><img class="'+signature+'" src="" style="width:100%"/>'+final+'Placer l\'emplacement de la signature puis cliquer:<button class="btn btn-sm btn-success fixer" id="fixer" onclick="fixer('+m+')" style="z-index:999;">Fixer</button></div> ';
  }
  if($("[name='mdtype']").val() == "select"){
    x = '<span '+md+' class="question draggable '+signature+' resize-drag" id="question'+m+'" mdinput="question'+m+'" mdcount="'+(option-1)+'" style="background:white;position:absolute;top:'+(e.pageY - posY)+'px;left:'+(e.pageX - posX)+'px;z-index:100; "></span> ';
    addElement();
  }
  if(valeur[0]["value"] == "mdfromdb"){
      x = '<span '+md+' class="question draggable '+signature+' resize-drag" id="question'+m+'" mdinput="question'+m+'" mdfromdb="'+$("#mdfromdb").val()+':patients:idPatient" style="background:white;position:absolute;top:'+(e.pageY - posY)+'px;min-width: 18px;left:'+(e.pageX - posX)+'px;z-index:100;">'+final+'Placer l\'élément puis cliquer:<button class="btn btn-sm btn-success fixer" id="fixer" onclick="fixer('+m+')" style="z-index:999;">Fixer</button></span> ';
  }
  return x
}
/******************Affiche l'element HTML de création de champs******************/
function showDiv(m,e,h){
  posX = $("#page-container").offset().left, posY = $("#page-container").offset().top;
  z = "<div class='nouvelElement' id='question"+m+"'style='position:absolute;top:"+(e.pageY - posY)+"px;left:"+(e.pageX - posX)+"px;z-index:100;'><div><form > <div class='form-group'>    <label for='inputEmail3' >Type de champ</label>  <select class='form-control'required name='mdtype'>  <option value='text'>Texte</option> <option value='mdfromdb'>Information base de données</option> <option value='checkbox'>Checkbox</option>  <option value='date'>Date</option> <option value='select'>Choix multiples</option> <option value='textarea'>Zone de texte</option>  <option value='signature'>Signature</option></select>     </div>  <div class='form-group'>    <label for='inputPassword3' >Quelle est la question ?</label>          <input type='text' class='form-control' name='mdlabel'id='inputPassword3' placeholder='Qui est votre médecin traitant?' required>     </div>      </div>    <div class='form-group'>    <div>      <button type='submit' class='btn btn-default' id='Valider' >Valider</button> <button  class='btn btn-warning annuler' >Annuler</button>    </div>  </div></form></div>";
  $(h).append(z);
}
/***************Remplie les champs avec la question pointé***************/
function setProperValue(m, valeur, final){
  $("[mdinput='question"+m+"']").attr("mdtype", valeur[0]["value"])
  $("[mdinput='question"+m+"']").attr("mdlabel", valeur[1]["value"])
  $("[mdinput='question"+m+"']").attr("class", 'question draggable '+signature)
  $("[mdinput='question"+m+"']").html(final+'Placer l\'élément puis cliquer:<button class="btn btn-sm btn-success fixer" id="fixer " onclick="fixer('+m+')" style="z-index:999;">Fixer</button>')
}
/***********Gere le boutton valider de la création de champs*************/
function handleValid(h,e,m){
  $("#Valider").parent().on("click","#Valider",function(event){
    event.preventDefault();
    i++;
    var md="";
    valeur = $( "form" ).serializeArray();
    $.each( valeur, function( key, value ) {
      md += value["name"]+'="'+value["value"]+'" '
    });
    final = choisirIcon(valeur[0]["value"]);
    x = returnHTMLElement(md, m, e, final, valeur );
    if($("[mdinput='question"+m+"']").html() != undefined){
      setProperValue(m, valeur, final);
    }else {
      $("#page-container div:nth-child(1)").first().append(x);
    }
    option = 0;
    setDrag();
    console.log("resize")
    $(".nouvelElement").remove();
    // fixer(m);
    
  });
}
/***********Gere le boutton annuler****************/
function handleCancel(){
  $(".annuler").mousedown(function(e) {
		e.preventDefault()
    $(this).unbind("click");
    $(".nouvelElement").remove();
    do{
      console.log($(".nouvelElement").html())
      if($(".nouvelElement").html() == undefined){
        addElement();
      }
    }while($(".nouvelElement").html() != undefined)
  });
}
function handleChangeType(h,e,m){
  $("[name='mdtype']").change(function(){
    if($(this).val()=="select"){
      $(".nouvelElement div").first().append('<div class="form-group"><button class="btn btn-default" id="option">Désigner une option</button></div><div class="listOption form-group"></div>')
      $("#option").click(function(e){
				e.preventDefault()
        newOption(h,e,m);
      })
    }else{
      if($("#option").html() != undefined){
        $("#option").parent().remove();
      }
    }
    if($(this).val()=="mdfromdb"){
      $(".nouvelElement div").first().append('<div class="form-group"><select name="mdb" id="mdfromdb" class="form-control"><option value="nir">Numéro de sécurité sociale</option><option value="nom">Nom du patient</option><option value="prenom">Prénom du patient</option><option value="adresse">Adresse du patient</option><option value="codepostal">Code postal</option><option value="ville">Ville du patient</option><option value="telephone1">Numéro de téléphone</option><option value="email">Email du patient</option><option value="naissance">Date de naissance</option><option value="creation">Date de création du dossier</option><option value="info">Informations complémentaires</option><option value="profession">Profession du patient</option></select></div>')
    }else{
      $("#mdfromdb").parent().remove();
    }

  })
}
function newOption(h, e, m){
  $(".nouvelElement").hide();
  z = "<div class='nouvelOption' id='option"+m+""+option+"'style='position:absolute;top:"+(e.pageY - posY)+"px;left:"+(e.pageX - posX)+"px;z-index:100;'><div><form > <div class='form-group'>     <div class='form-group'>    <label for='inputPassword3' >Nom de l'option</label>          <input type='text' class='form-control' name='mdlabel' id='inputPassword3' placeholder='Oui/non' required>     </div>      </div>    <div class='form-group'>      </div></form><div>      <div class='btn btn-default' id='ValiderOption'>Valider</div> <button  class='btn btn-warning annulerOption' >Annuler</button>    </div></div>";
  $(h).append(z);
  $("#ValiderOption").click(function(e){
		e.preventDefault()
    md=""
    valeur = $( ".nouvelOption form" ).serializeArray();
    $.each( valeur, function( key, value ) {
      md += value["name"]+'="'+value["value"]+'" '
    });
    x = '<span mdtype="option" '+md+' class="question draggable" id="option'+m+''+option+'" mdinput="option'+m+''+option+'" style="background:white;position:absolute;top:'+(e.pageY - posY)+'px;left:'+(e.pageX - posX)+'px;z-index:99; cursor:pointer;">Placer cette nouvel option puis cliquer :<button class="btn btn-sm btn-success fixer" id="fixer" onclick="fixer('+m+')" style="z-index:999;">Fixer</button></span> ';
    $(h).append(x);
    setDrag();
    $(".nouvelOption").remove();
    fixerOption('#option'+m+''+option+'', function(){
      $(".nouvelElement").show();
      $(".listOption").append("<p mdinput='option"+m+""+option+"'><span style='position:absolute;right:0;cursor:pointer;'>x</span>"+$("#option"+m+""+option).attr("mdlabel")+"</p>");
      $("[mdinput='option"+m+""+option+"'] span").click(function(e){
				e.preventDefault()
        $("[mdinput='"+$(this).parent().attr("mdinput")+"']").remove();
        console.log("[mdinput='"+$(this).parent().attr("mdinput")+"']")
      });
      option++;
    });
  })
}




/************************Boite à outil******************************/
(function($) {
  $.fn.outerHTML = function() {
    return $(this).clone().wrap('<div></div>').parent().html();
  };
})(jQuery);

function addslashes( str ) {
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function showNextCaroussel(){
  $('#carousel-example-generic').carousel('next');
  $(".t").attr("style","z-index:12;")
  addElement();
  $(".loaderContainer").hide()
}










/*****************************************************Functions pour le drag n drop des elements HTML***************************************/
function setDrag(){
// target elements with the "draggable" class
interact('.draggable')
.draggable({
    snap: {
      targets: [
        interact.createSnapGrid({ x: 5, y: 5 })
      ],
      range: Infinity,
      relativePoints: [ { x: 0, y: 0 } ]
    },
    inertia: true,
    // keep the element within the area of it's parent
    // restrict: {
    // 	restriction: "parent",
    // 	endOnly: true,
    // 	elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    // },
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: dragMoveListener,
    // call this function on every dragend event
    onend: function (event) {
    	var textEl = event.target.querySelector('p');

    	textEl && (textEl.textContent =
    		'moved a distance of '
    		+ (Math.sqrt(event.dx * event.dx +
    			event.dy * event.dy)|0) + 'px');
    }
  });

function dragMoveListener (event) {
	var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  // this is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;
}
// function resize(){
// 	interact('.resize-drag')
// 	.resizable({
// 		preserveAspectRatio: true,
// 		edges: { left: true, right: true, bottom: true, top: true }
// 	})
// 	.on('resizemove', function (event) {
// 		var target = event.target,
// 		x = (parseFloat(target.getAttribute('data-x')) || 0),
// 		y = (parseFloat(target.getAttribute('data-y')) || 0);
//
//     // update the element's style
//     target.style.width  = event.rect.width + 'px';
//     target.style.height = event.rect.height + 'px';
//
//     // translate when resizing from top or left edges
//     x += event.deltaRect.left;
//     y += event.deltaRect.top;
//
//     target.style.webkitTransform = target.style.transform =
//     'translate(' + x + 'px,' + y + 'px)';
//
//     target.setAttribute('data-x', x);
//     target.setAttribute('data-y', y);
//   });
//   $('.resize-drag').textfill();
// }
