
function recuprythmeenote(){
		document.getElementById("prependedInput").value = chiffre_lettrine.firstChild.nodeValue;
}

function ecrirenoteryhtme(){
	chiffre_lettrine.firstChild.nodeValue=document.getElementById("prependedInput").value;
}

function ecrirepartition(e){
		document.getElementById("hymngabc").value = document.getElementById("hymngabc").value+ e;
		$('#hymngabc').keyup();
	
}
function visible(){
	$('#twoBoxes').css('overflow','visible');
}

function recuppolice(){
	document.getElementById("policeInput").value = $('.goudy').css('fontFamily');
}

function ecrirepolice(){
	$('.goudy').css('fontFamily',document.getElementById("policeInput").value);
	$('#alert_popup').css('visibility','visible');
	$('#alert_popup').css('height','38px');
	
}

function recuptaillepolice(){
	document.getElementById("tailleInput").value = $('.goudy').css('fontSize');
}

function recuptaillepolicepart(){
	document.getElementById("tailleInputPartition").value = $('#chant-parent').css('width');
}


function ecriretaillepolice(){
	$('.goudy').css('fontSize',document.getElementById("tailleInput").value );
}


function ecriretaillepartition(){
	$('#chant-parent').css('width',document.getElementById("tailleInputPartition").value );
}

function donwloadPDF(){
	window.print();
}




