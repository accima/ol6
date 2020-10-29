'use strict';

/*Object API*/
var IIIkel=false;
var TR3 = new Object();
TR3.imgOri = false;
TR3.imgDesty = false;
TR3.lock3d=false;
TR3.config = new Object();

if(IIIkel){
	TR3.config = IIIkel.config;
}else{
	TR3.config = {
		unic: false,
		src: false,
		flag3d: true,
		rotate: false,
		lookAt: false,
		magni: 'auto',
		spritesDskMvl: 1,
		zoomMapDskMvl: 0};
}


TR3.setLoader = function(src){
	TR3.config.src = src;
	if(!TR3.config.unic){
		/*load Principal*/
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/render.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/tools.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/zMesh.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/world.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/setclear.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/cursorkeys.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/explore.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/draw.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/measure.js'></script>");
		document.writeln("<script type='text/javascript' src='"+ src +"terrain/source/obj3d.js'></script>");
		
			/*load sub Libreries*/
			document.writeln("<script src='"+ src +"libs/three.min.js'></script>");
			document.writeln("<script src='"+ src +"libs/tween.min.js'></script>");
			document.writeln("<script src='"+ src +"libs/AnaglyphEffect.js'></script>");
			document.writeln("<script src='"+ src +"libs/OrbitControls.js'></script>");
			document.writeln("<script src='"+ src +"libs/Detector.js'></script>");
			document.writeln("<script src='"+ src +"libs/transCoord.js'></script>");
			document.writeln("<script src='"+ src +"libs/triangulation.js'></script>");
			document.writeln("<script src='"+ src +"libs/earcut.js'></script>");
			document.writeln("<script src='"+ src +"libs/libtess.min.js'></script>");
			document.writeln("<script src='"+ src +"libs/tessy.js'></script>");
			document.writeln("<script src='"+ src +"libs/TransformControls.js'></script>");
			document.writeln("<script src='"+ src +"libs/GLTFLoader.js'></script>");
			document.writeln("<script src='"+ src +"libs/GLTFExporter.js'></script>");
			document.writeln("<script src='"+ src +"libs/SkeletonUtils.js'></script>");

	}

}

/*PANEL*/
TR3.setPanel = function(){
	
	var panel =	'\
				<div id="3doptions" style="border: solid;margin: 5px; padding: 5px; display: none;float:left">\
					<label id="lblSroOpt" style="font-weight: bold;margin-bottom: 5px;border: solid 2px royalblue;text-align: center;color: royalblue;cursor: pointer">▲ Herramientas 3D ▲</label>\
					<div id="sroOpt" style="display:none">\
						<div id="magnificationSliderValue">Exageración: x</div>\
						<input type="button" class="magniStep" style="float:left" value="&nbsp;-&nbsp;"><div id="magnificationSlider" style="float:left;width:95px;margin:4px"></div><input type="button" class="magniStep" style="float:left" value="+">\
						<!--<label><input class="changeOpt" id="DTMcheck" type="checkbox"> DTM  alternativo WCS</label><br>-->\
						<label><input class="changeOpt" id="cursorCheck" type="checkbox"><span id="cursorCheck_spm">▲ 3D Cursor ▲</span></label><br>\
						<div id="cursorCheck_div" style="display:none;border: 1px dashed gray;padding: 1px;float: left;width: 100%">\
							<input id="newLine" style="float:left;" type="button" value=" Línea " class="">\
							<input id="newPolig" style="float:left;" type="button" value=" Polígono " class="">\
							<span><input id="metrics" type="checkbox" style="margin:3px 0 3px 3px">Medir</span><br>\
							<input id="PickDrawStereo" type="text" style="width: 50px;"; value="#ff6161">\
							<input id="del_vGeom" type="button" value="Borrar Todo" class="">\
							<span>Valor de Z: </span><input id="setZ" type="text" style="width: 50px;"; value=""><span id="helpSetZ" style="color:royalblue;text-decoration:underline;cursor:pointer">Ayuda</span>\
						</div>\
						<label><input class="changeOpt" id="anaglyphCheck" type="checkbox"><span id="anaglyphCheck_spm">▲ Stereo 3D ▲</span></label>\
						<div id="anaglyphType" style="display:none;border: 1px dashed gray;padding: 1px;float: left;width: 100%">\
							<span>&nbsp;- Modo: </span><select id="anaglyph-type" onchange="TR3.changeAnaglyphType()">\
								<option value="optimiced">Optimizado</option>\
								<option value="normal">Normal</option>\
								<option value="half">Intermedio</option>\
								<option value="gray">Gris</option>\
								<option value="interlaced">Entrelazado</option>\
							</select>\
							<div align="center"><input id="reloadStereo" type="button" value="Recalcular" class="margin:3px"><br>\
							<a target="_blank" href="'+ TR3.config.src +'docStereo.pdf">Gafas 3d</a></div>\
						</div>\
						<div style="float:left">\
							<input id="file_3d" type="file" accept=".glb" style="opacity: 0; position: absolute; width: 100px;">\
							<input id="file_3d_fake" style="color: gray; width: 100px;" value=" Explorar GLB... ">\
							<input id="loadFile3d" type="button" value=" Cargar ">\
							<input id="edit3dObj" type="button" value=" Editar ">\
							<input id="del3dObj" type="button" value=" Borrar ">\
							<input id="end3dObj" type="button" value=" Fijar ">\
							<span id="help3dObj" style="color:royalblue;text-decoration:underline;cursor:pointer"> Ayuda</span><br>\
							<span>&nbsp;- Exportar ⇩ </span><select id="exporter-type" onchange="TR3.changeExportType()">\
								<option value="null" style="background-color:#ccc" selected>tipo GLTF</option>\
								<option value="terrain">Terreno</option>\
								<option value="obj3d">Objetos</option>\
								<option value="items">Vectores</option>\
								<option value="scene">Todo</option>\
							</select>\
							<label id="size3dObj"></label>\
						</div>\
					</div>\
					<div id="orbitalMoves" style="width: 155px; text-align: center; box-shadow: rgb(136, 136, 136) 1px 1px 5px; border: medium outset #eee; float: left;">\
						<img id="imgOrbitalMoves" src="'+ TR3.config.src +'img/eartharrow.png" draggable="false" style="margin: 5px;cursor:pointer"><br>\
						<input id="makeScene" type="button" value=" Restablecer " style="margin-bottom:5px" class=""><br>\
						<input id="pWalking" type="button" value=" Caminar " style="" class="">\
						<input id="pFlying" type="button" value=" &nbsp;Volar&nbsp; " style="" class="">\
						<input id="orbitPoint" type="button" value=" Orbitar " style="" class="">\
						<div id="exploreDiv" style="display:none">\
							<div id="personFlySliderDiv" style="display:none">\
								<div id="heightSliderValue">Altitud: </div>\
								<div id="heightSlider" style="margin:5px"></div></div>\
							<input id="lessV" type="button" value="- Velocidad"><input id="moreV" type="button" value="+ Velocidad">\
							<label style="font-weight: bold; margin: 5px;color: brown;">Camina y Vuela con las flechas de teclado</label>\
						</div>\
						<div style="text-align: left; margin: 5px"><input id="autoRotate" type="checkbox" class="changeOpt"> Rotación <input id="malla" type="checkbox" class="changeOpt"> Malla</div>\
					</div>\
					<div id="slctScenes" style="display: none"><b><div align="center"><input id="viewScenes" type="checkbox" class="" checked> Acceso a Escenas:</div></b>\
						<div align="center" id="btnsScenes">\
							<input id="acc2scn" type="button" value=" Paisajes Increíbles " style="color:royalblue;" class="">\
						</div>\
					</div>\
				</div>\
				<img src onerror="TR3.setEvtPanel()">';
				//https://threejs.org/examples/?q=export#misc_exporter_gltf
				//https://gltf-viewer.donmccurdy.com/
	return panel;
};

TR3.setEvtPanel = function(){
	
	// Create a new jQuery UI Slider element
	// and set some default parameters.
	$( "#magnificationSlider" ).slider({
		min:1,
		max:15,
		slide: function( event, ui ) {
		
			// While sliding, update the value in the #amount div element
			var tPixMesh = TR3.formatMeasure(TR3.tPixMesh);
			$( "#magnificationSliderValue" ).html( 'Exageración: <b>x' + ui.value + '</b> (malla: ' + tPixMesh[0] + tPixMesh[1] + ')');
			TR3.setMagniValues(ui.value);
	
		}
	});
	
	$( "#heightSlider" ).slider({
		min:0,
		max:1000,
		slide: function( event, ui ) {
	
			// While sliding, update the value in the #amount div element
			$('#heightSlider').slider( "option", "max", Math.round( (TR3.zMax - TR3.zMed)*TR3.valuesSet.magnification ) );
			$('#heightSlider').slider( "option", "min", Math.round( (TR3.zMin - TR3.zMed)*TR3.valuesSet.magnification ) );
			TR3.changeHeight( ui.value, true, false);
			$( "#heightSliderValue" ).html( 'Altitud: ' + Math.round( (ui.value/TR3.valuesSet.magnification) + TR3.zMed ) + ' m' );
		}
	});
	
	$("#anaglyphCheck").on("change", function() {
		if (!this.checked) {
			document.getElementById('anaglyphType').style.display = 'none';
			document.getElementById('anaglyphCheck_spm').innerHTML = '▲ Stereo 3D ▲';
		}else{
			document.getElementById('anaglyphType').style.display = 'block';
			document.getElementById('anaglyphCheck_spm').innerHTML = '▼ Stereo 3D ▼';
		}
	});
	
	$("#viewScenes").on("change", function() {
		if (!this.checked) {
			document.getElementById('btnsScenes').style.display = 'none';
			TR3.viewScenes = false;
		}else{
			document.getElementById('btnsScenes').style.display = 'block';
			TR3.viewScenes = true;
		}
	});
	
	var optPick = {
		// animation speed
		animationSpeed: 50,
		// easing function
		animationEasing: 'swing',
		// defers the change event from firing while the user makes a selection
		change: null,
		changeDelay: 0,
		// hue, brightness, saturation, or wheel
		control: 'hue',
		// default color
		defaultValue: '',
		// hex or rgb
		format: 'rgb',
		// show/hide speed
		//show: null,
		showSpeed: 100,
		//hide: null,
		hideSpeed: 100,
		// is inline mode?
		inline: false,
		// a comma-separated list of keywords that the control should accept (e.g. inherit, transparent, initial). 
		keywords: '',
		// uppercase or lowercase
		letterCase: 'lowercase',
		// enables opacity slider
		opacity: false,
		// custom position
		position: 'bottom left',
		// additional theme class
		theme: 'default TR3PickColor',
		// an array of colors that will show up under the main color <a href="https://www.jqueryscript.net/tags.php?/grid/">grid</a>
		swatches: []
	}
	$('#PickDrawStereo').minicolors(optPick);
	//$('.TR3PickColor').css('display','none');
	
	var changeOpt = document.getElementsByClassName("changeOpt");
	for (var i = 0; i<changeOpt.length; i++) {
		changeOpt[i].addEventListener('click', TR3.changeOpt, false)
	}
	
	document.getElementById('makeScene').addEventListener("click", function(){
		TR3.lightBtn(this.id);
		TR3.setValuesSliderMagn("auto");
		TR3.moving = false;
		TR3.initPosCamera(true);
		TR3.cursor.helper.scale.set(1,1,1);
		document.getElementById('exploreDiv').style.display = 'none';
		document.getElementById('personFlySliderDiv').style.display = 'none';
		document.getElementById('autoRotate').checked = false;
		TR3.changeOpt();
	}, false);
	document.getElementById('orbitPoint').addEventListener("click", function(){
		TR3.lightBtn(this.id);
		TR3.moving = false;
		TR3.orbitalViewFn();
		document.getElementById('exploreDiv').style.display = 'none';
		document.getElementById('personFlySliderDiv').style.display = 'none';
		document.getElementById('autoRotate').checked = false;
		TR3.changeOpt();
	}, false);
	document.getElementById('pWalking').addEventListener("click", function(){
		TR3.lightBtn(this.id);
		TR3.moving = true;
		TR3.personViewFn();
		TR3.moveKey.walk = true;
		document.getElementById('imgOrbitalMoves').focus();
		document.getElementById('exploreDiv').style.display = 'block';
		document.getElementById('personFlySliderDiv').style.display = 'none';
		document.getElementById('autoRotate').checked = false;
		TR3.changeOpt();
	}, false);
	document.getElementById('pFlying').addEventListener("click", function(){
		TR3.lightBtn(this.id);
		TR3.moving = true;
		var hi = (TR3.zMax-TR3.zMin)/2*TR3.valuesSet.magnification;
		TR3.personViewFn(hi);
		TR3.setValuesSliderHeight(hi);
		TR3.moveKey.walk = false;
		document.getElementById('imgOrbitalMoves').focus();
		document.getElementById('exploreDiv').style.display = 'block';
		document.getElementById('personFlySliderDiv').style.display = 'block';
		document.getElementById('autoRotate').checked = false;
		TR3.changeOpt();
	}, false);
	
	document.getElementById('cursorCheck').addEventListener("click", function(){
		if(document.getElementById('cursorCheck').checked){
			document.getElementById('cursorCheck_div').style.display = 'block';
			document.getElementById('cursorCheck_spm').innerHTML = '▼ 3d cursor ▼';
			
			TR3.lock3d('cursor3d');
		}else{
			document.getElementById('cursorCheck_div').style.display = 'none';
			document.getElementById('cursorCheck_spm').innerHTML = '▲ 3d cursor ▲';
			document.getElementById('metrics').checked = false;
			TR3.vGeom.measure=false;
			TR3.endDraw();
			
			TR3.unlock3d('cursor3d');
		}
	}, false);
	
	document.getElementById('metrics').addEventListener("click", function(){
		if(document.getElementById('metrics').checked){
			TR3.vGeom.measure=true;
		}else{
			TR3.vGeom.measure=false;
		}
	}, false);
	
	document.getElementById('lblSroOpt').addEventListener("click", function(){
		var disp = document.getElementById('sroOpt').style.display;
		var sroOpt = document.getElementById('lblSroOpt');
		if(disp == 'none'){
			document.getElementById('sroOpt').style.display = 'block';
			sroOpt.innerHTML = '▼ Herramientas 3D ▼';
		}else{
			document.getElementById('sroOpt').style.display = 'none';
			sroOpt.innerHTML = '▲ Herramientas 3D ▲';
		}
	}, false);
	
	document.getElementById('reloadStereo').addEventListener("click", function(){
		var inter = TR3.getIntersect();
		if (inter.length > 0) {
			var cPos = TR3.camera.position;
			TR3.zeroParallax = cPos.distanceTo(inter[0].point);
		}
	}, false);
	
	var imgOrbitalMoves = document.getElementById('imgOrbitalMoves');
	imgOrbitalMoves.addEventListener("mouseover", function(){imgOrbitalMoves.src = TR3.config.src+'img/eartharrow_over.png';}, false);
	imgOrbitalMoves.addEventListener("mouseout", function(){imgOrbitalMoves.src = TR3.config.src+'img/eartharrow.png';}, false);
	imgOrbitalMoves.addEventListener("mousedown", function(){document.getElementById('autoRotate').checked=false;TR3.changeOpt();}, false);
	imgOrbitalMoves.addEventListener("touchstart", function(){document.getElementById('autoRotate').checked=false;TR3.changeOpt();}, false);
	imgOrbitalMoves.addEventListener("wheel", function(){document.getElementById('autoRotate').checked=false;TR3.changeOpt();}, false);
	document.getElementById('moreV').addEventListener("click", function(){document.getElementById('imgOrbitalMoves').focus();TR3.controls.keyPanSpeed=TR3.controls.keyPanSpeed*3;}, false);
	document.getElementById('lessV').addEventListener("click", function(){document.getElementById('imgOrbitalMoves').focus();TR3.controls.keyPanSpeed=TR3.controls.keyPanSpeed/3;}, false);
	
	document.getElementById('newLine').addEventListener("click", function(){TR3.vGeom.polig=false;TR3.newVgeom()}, false);
	document.getElementById('newPolig').addEventListener("click", function(){TR3.vGeom.polig=true;TR3.newVgeom()}, false);
	document.getElementById('del_vGeom').addEventListener("click", function(){TR3.del_vGeom();document.getElementById('metrics').checked = false}, false);
	document.getElementById('file_3d').addEventListener("change", function(evt){ TR3.handleFileSelect(evt); }, false);
	document.getElementById('loadFile3d').addEventListener("click", function(){TR3.loadFile(false,false,true,false,false,true,false)}, false);
	
	document.getElementById('edit3dObj').addEventListener("click", function(){TR3.edit3dObj()}, false);
	document.getElementById('del3dObj').addEventListener("click", function(){TR3.del3dObj()}, false);
	document.getElementById('end3dObj').addEventListener("click", function(){ TR3.transCtrlsEnabled(false); }, false);
	document.getElementById('help3dObj').addEventListener("click", function(){
		var text = '<div id="infohelp3dObj" style="padding:10px">\
						<div align="center"><u>Carga el modelo y Presiona la tecla:</u></div><br />\
						<b>"W"</b> Trasladar | <b>"E"</b> Rotar | <b>"R"</b> scale<br />\
						<b>"+"</b> Aumentar | <b>"-"</b> Disminuir<br />\
						<b>"Q"</b> Cambia world/local espacio <br />\
						<b>"X"</b> Cambia X | <b>"Y"</b> Cambia Y | <b>"Z"</b> Cambia Z<br />\
						<b>"Barra espaciadora"</b> activa/desactiva <br /><br />\
						<div align="center"><u>Hazlo tú mismo:</u></div>\
						<b>1) Modelos 3D:</b><a href="https://sketchfab.com/" target="_blank"> sketchfab</a><br />\
						<b>2) GLTF to GLB:</b><a href="https://glb-packer.glitch.me/" target="_blank"> glb-packer</a><br />\
						<b>3) ¡Úsalo aquí!</b><br />\
						Visor GLTF: <a href="https://gltf-viewer.donmccurdy.com/" target="_blank"> gltf viewer</a><br />\
					</div>';
		if( IIIkel ){
			IIIkel.container.ctxAlert.setBody(text);
			IIIkel.container.ctxAlert.show();
			IIIkel.container.ctxAlert.focus();
		}
	}, false);
	
	document.getElementById('helpSetZ').addEventListener("click", function(){
		var text = '<div id="infohelpSetZ" style="padding:10px">\
						<div align="center"><u>Introduce valor de Z y Presiona la tecla:</u></div><br />\
						<b>"Alt"</b> Cambia Z Terreno<br />\
						<b>"Shift"</b> Cambia Z Cursor<br />\
					</div>';
		if( IIIkel ){
			IIIkel.container.ctxAlert.setBody(text);
			IIIkel.container.ctxAlert.show();
			IIIkel.container.ctxAlert.focus();
		}
	}, false);
	
	var magniStep = document.getElementsByClassName("magniStep");
	for ( var i = 0; i < magniStep.length; i++ ) {
		magniStep[i].addEventListener("click", function(e) {
			var val = e.target.value;
			var magn = TR3.valuesSet.magnification
			if( val.indexOf('+') != -1 ){
				magn = magn+1
				if(magn>15){magn=15}
				TR3.setValuesSliderMagn(magn);
			}else{
				magn = magn-1;
				if(magn<1){magn=1}
				TR3.setValuesSliderMagn(magn);
			}
		});
	}
};

TR3.lightBtn = function(id){
	
	var drawPnl_bd = document.getElementsByClassName('btnDrawOn');
	for(var i = 0 ; i < drawPnl_bd.length ; i++){
		drawPnl_bd[i].className = '';
	}
	if(id == 'makeScene'){id='orbitPoint';}
	document.getElementById(id).className = 'btnDrawOn';
};

TR3.setStart = function(ori, desty, bbox, projCode, zone){
	
	TR3.imgOri = ori;
	if(typeof(TR3.imgOri) != 'object'){

		TR3.imgOri = document.getElementById(TR3.imgOri);
		if(!TR3.imgOri){
			alert("invalid Origin");
		}
	}
	
	TR3.imgDesty = desty;
	if(typeof(TR3.imgDesty) != 'object'){

		TR3.imgDesty = document.getElementById(TR3.imgDesty);
		if(!TR3.imgDesty){
			alert("invalid Destiny");
		}
	}
	
	var LyrFeat = TR3.getVectLyr();
	var options = TR3.getOptions();
	
	var magni = 'auto';
	if( typeof(Number(TR3.config.magni)) == 'number' &&  !isNaN(TR3.config.magni)){
		magni = eval(TR3.config.magni);
	}
	
	TR3.sprite = TR3.config.sprite || true;
	TR3.setMeshMap( TR3.imgOri, TR3.imgDesty, bbox, projCode, options, {magnification: magni, lookAt: TR3.config.lookAt}, zone, LyrFeat );
	TR3.config.lookAt = false;
	TR3.setValuesSliderMagn(magni);
	TR3.config.magni = 'auto';
	TR3.bbox = bbox;
	TR3.vGeom.measure=false;
	TR3.startAnimation();
	document.getElementById('metrics').checked = false;
	document.getElementById('exploreDiv').style.display = 'none';
	document.getElementById('personFlySliderDiv').style.display = 'none';
};

TR3.getOptions = function(){		
	var DTMopt, cursor3dOpt, anaglyphOpt, autoRotateOpt, wireframeMeshOpt;
	
	//if(document.getElementById('DTMcheck')){
	//	DTMopt = document.getElementById('DTMcheck').checked;
	//}else{
		DTMopt = false;
	//}
	
	if(document.getElementById('cursorCheck')){
		cursor3dOpt = document.getElementById('cursorCheck').checked;
	}else{
		cursor3dOpt = false;
	}

	if(document.getElementById('anaglyphCheck')){
		anaglyphOpt = document.getElementById('anaglyphCheck').checked;
	}else{
		anaglyphOpt = false;
	}
	
	if(document.getElementById('autoRotate')){
		autoRotateOpt = document.getElementById('autoRotate').checked;
	}else{
		autoRotateOpt = false;
	}
	if(TR3.config.rotate == 1){TR3.config.rotate = 0;autoRotateOpt = true;}//url start scn
	
	if(document.getElementById('malla')){
		wireframeMeshOpt = document.getElementById('malla').checked;
	}else{
		wireframeMeshOpt = false;
	}
	
	return {DTMasc: false, cursor3d: cursor3dOpt, anaglyph: anaglyphOpt, autoRotate: autoRotateOpt, wireframeMesh: wireframeMeshOpt}
};

TR3.changeOpt = function(){
	
	var options= TR3.getOptions();
	TR3.setMeshOptions(options.DTMasc, options.cursor3d, options.anaglyph, options.autoRotate, options.wireframeMesh);

};


TR3.changeAnaglyphType = function(){
	
	TR3.anaglyphType = document.getElementById('anaglyph-type').value;
	TR3.anaglyphRenderer.updateAnaglyphType( TR3.scene, TR3.camera );

};

TR3.changeExportType = function(){
	var type = document.getElementById('exporter-type').value
	if(type != 'null')
		TR3.exportGLTF( type );

};

TR3.setValuesSliderMagn = function(magn){
	if(magn && magn>0 && magn<51){
		TR3.setMagniValues(magn);
	}else if(magn == "auto"){
		magn = TR3.setMagniValues();
	}else{magn = TR3.valuesSet.magnification}
	//var range = 2;
	//$('#magnificationSlider').slider("option", "max", parseInt(TR3.valuesSet.magnification*range));
	//$('#magnificationSlider').slider("option", "min", parseInt(TR3.valuesSet.magnification - TR3.valuesSet.magnification*(range-1)));
	$( '#magnificationSlider' ).slider( "value", magn );
	var tPixMesh = TR3.formatMeasure(TR3.tPixMesh);
	$( "#magnificationSliderValue" ).html( 'Exageración: <b>x' + magn + '</b> (malla: ' + tPixMesh[0] + ' ' + tPixMesh[1] + ')');
};

TR3.setValuesSliderHeight = function(hi){
	
	$('#heightSlider').slider( "value", hi );
	$('#heightSlider').slider( "option", "max", Math.round( (TR3.zMax - TR3.zMed)*TR3.valuesSet.magnification ) );
	$('#heightSlider').slider( "option", "min", Math.round( (TR3.zMin - TR3.zMed)*TR3.valuesSet.magnification ) );
	$( "#heightSliderValue" ).html( 'Altitud: ' + Math.round( (hi/TR3.valuesSet.magnification) + TR3.zMed ) + ' m' );
};

TR3.getVectLyr = function(){
	var vectLyr = false
	if(IIIkel){ vectLyr = IIIkel.AFs.skinMap.getLayersByName('Draw_Markers')[0]; }
	return vectLyr;
};