	'use strict';
	TR3.getIntersect = function( event, objSlct ) {
		var raycaster = TR3.getRayCaster( event );
		var objSlcted = objSlct || TR3.mesh;
		var intersects = false;
		if(objSlcted.name == 'mesh3d'){
			var intersectsTry = raycaster.intersectObject( objSlcted );
			if(intersectsTry.length>0){ intersects = intersectsTry; }
		}else{
			var flag = true;
			for(i=0; i<objSlcted.length; i++){
				var oSlcti = objSlcted[i];
				var intersectsTry = raycaster.intersectObject( oSlcti.scene.children[0], true );
				var oriScale = oSlcti.scaleByCode;
				if(intersectsTry.length>0 && flag == true){
					intersects = oSlcti;
					oSlcti.scene.scale.x = oriScale[0]*1.3;
					if(oSlcti.scaleByCode[3] && oSlcti.scaleByCode[3] == true){
						oSlcti.scene.scale.y = oriScale[2]*1.3;}
					oSlcti.scene.scale.z = oriScale[1]*1.3;
					if(oSlcti.autoRotation == true){oSlcti.autoRotation = 0.00000000001;}
					flag=false;
				}else{
					oSlcti.scene.scale.x = oriScale[0];	
					oSlcti.scene.scale.y = oriScale[2];
					oSlcti.scene.scale.z = oriScale[1];
					if(oSlcti.autoRotation == 0.00000000001){oSlcti.autoRotation = true;}
				}
			}
		}
		return intersects;
	};
	
	TR3.getRayCaster = function( event ) {
			
		var contDiv = TR3.desty;
		var contTop = contDiv.offsetTop;
		var contLeft = contDiv.offsetLeft;
		while(contDiv.parentElement){
			contDiv = contDiv.parentElement;
			contTop += contDiv.offsetTop;
			contLeft += contDiv.offsetLeft;
		}
		
		//TR3.scene.add( TR3.cursor.helper );
		var evtX;
		var evtY;
		if( event && event.touches ){
			evtX = event.touches[0].clientX;
			evtY = event.touches[0].clientY;	
		}else if ( event ){
			evtX = event.clientX;
			evtY = event.clientY;
		}else{
			evtX = TR3.canvasDestW*0.5
			evtY = TR3.canvasDestH*0.5
			contLeft=0;
			contTop=0;
		}
		
		var mouseX = ( (evtX - contLeft) / TR3.canvasDestW ) * 2 - 1;
		var mouseY = -( (evtY - contTop) / TR3.canvasDestH ) * 2 + 1;
		
		var vector = new THREE.Vector3( mouseX, mouseY, TR3.camera.near );
		vector.unproject( TR3.camera );
		
		var cPos = TR3.camera.position;
		
		var raycaster = new THREE.Raycaster( cPos, vector.sub( cPos ).normalize() );

		return raycaster;
	};
	
	TR3.onIntersect = function( event ) {
		
		if ( TR3.optionsSet.cursor3d ) {
			
			var intersects = TR3.getIntersect(event);
			TR3.cursor.helper.hideShadowBase();
			// Toggle rotation bool for meshes that we clicked
			if (intersects.length > 0) {
				
				var interSct = intersects[0];
				var interSctPt = intersects[0].point;
				var face = interSct.face;
				var obj = interSct.object;
				var geom = TR3.mesh.geometry;
				var valZ = interSctPt.y;
				var valZ2 = false;
				var zTerr = TR3.cursor.setZterr;
				
				if( Number.isInteger(zTerr) && TR3.cursor.setkCde == 18 ){
					//-->Tool edit mesh
					// specify the desired face index
					var faceIndex = interSct.faceIndex; // [ 0 ... num_faces-1 ]
					var faces = 3;
					// specify which face vertex you want
					// [ 0 or/and 1 or/and 2 ] ==> i
					// compute the index where the data is stored
					
					valZ = TR3.zM2T( zTerr, true );
					
					for(var i=0;i<faces+1;i++){
						var index = geom.index.array[ faces * faceIndex + i ];
						
						geom.attributes.position.setZ( index, valZ );
						TR3.arrayZ[ index ] = valZ;
					}
					geom.attributes.position.needsUpdate = true;
					//<--Tool edit mesh
				}else if( Number.isInteger(zTerr) && TR3.cursor.setkCde == 16 ){
					valZ = TR3.zM2T( zTerr, true );
					valZ2 = valZ;
					TR3.cursor.helper.showShadowBase();
				}
				
				TR3.cursor.helper.position.set( interSctPt.x, valZ, interSctPt.z );
				TR3.redrawInfo( interSctPt.x, interSctPt.y, interSctPt.z, valZ2 );
				
				TR3.vGeom.drawVector = TR3.cursor.helper.position; //draw
			}
		}else{
			var selectables = TR3.getSelectableObj();
			if(selectables.length>0){
				var intersects = TR3.getIntersect( event, selectables );
			}
		}
	};
	
	TR3.getSelectableObj = function(){
	
		var objts = TR3.vGeom.obj3d;
		var selectable = new Array();
		for(var i=0;i<objts.length;i++){
			if(objts[i].name=="codeMade"){selectable.push(objts[i]);}
		}
		return selectable;
	};
	
	TR3.redrawInfo = function(X,Y,Z,Zcur){
		
		var mapCoor = TR3.getCoordsByXYmod(X,Z);
		
		var Xmap = mapCoor[0];
		var Ymap = mapCoor[1];
		var Zmap = mapCoor[2];
		var zInc = 0;
		
		var tPixMesh = TR3.formatMeasure(TR3.tPixMesh);
		if(Zcur){
			zInc = Zcur - Zmap;
		}
		
		TR3.XYZ2Clip = [Math.round(Xmap*1000)/1000,Math.round(Ymap*1000)/1000,Math.round(Zmap*100)/100];
		var info  = '<b>Project: ' + TR3.datumImg.proy + ' - Datum:' + TR3.datumImg.datum + '</b><br><b>X:</b> ' + TR3.XYZ2Clip[0] + '<br><b>Y:</b> ' +  TR3.XYZ2Clip[1] + '<br><b>Z:</b> ' + TR3.XYZ2Clip[2] + '&nbsp;&nbsp;&nbsp;<b>±Zcur:</b> ' + Math.round(zInc*100)/100 + ' m' + '&nbsp;&nbsp;&nbsp;<b>Malla:</b> ' + tPixMesh[0] + ' ' + tPixMesh[1];
		document.getElementById('infoGeo3d').innerHTML = info;
	};
	//<--Cursor
	
	//-->keys
	TR3.keyDown = function(evt){
		if(TR3.moving == true){TR3.moveKey.is = true;} 
		TR3.cursor.setkCde = evt.keyCode;
		var setZterr = eval(document.getElementById('setZ').value);
		if(Number.isInteger(setZterr) && evt.keyCode == 18){ TR3.cursor.setZterr = setZterr; } //Alt
		if(Number.isInteger(setZterr) && evt.keyCode == 16){ TR3.cursor.setZterr = setZterr; TR3.cursor.helper.showShadowBase(); } //Shift
		if(TR3.transformControls.enabled){
			switch ( evt.keyCode ) {
				case 81: // Q
					TR3.transformControls.setSpace( TR3.transformControls.space === "local" ? "world" : "local" );
					break;
				case 17: // Ctrl
					TR3.transformControls.setTranslationSnap( 100 );
					TR3.transformControls.setRotationSnap( THREE.Math.degToRad( 15 ) );
					break;
				case 87: // W
					TR3.transformControls.setMode( "translate" );
					break;
				case 69: // E
					TR3.transformControls.setMode( "rotate" );
					break;
				case 82: // R
					TR3.transformControls.setMode( "scale" );
					break;
				case 187:
				case 107: // +, =, num+
					TR3.transformControls.setSize( TR3.transformControls.size + 0.1 );
					break;
				case 189:
				case 109: // -, _, num-
					TR3.transformControls.setSize( Math.max( transformControls.size - 0.1, 0.1 ) );
					break;
				case 88: // X
					TR3.transformControls.showX = ! TR3.transformControls.showX;
					break;
				case 89: // Y
					TR3.transformControls.showY = ! TR3.transformControls.showY;
					break;
				case 90: // Z
					TR3.transformControls.showZ = ! TR3.transformControls.showZ;
					break;
				case 32: // Spacebar
					TR3.transformControls.enabled = ! TR3.transformControls.enabled;
					break;
			}
		}
	};
	
	TR3.keyUp = function(evt){
		TR3.moveKey.is = false; 
		if(evt.keyCode == 18){ TR3.cursor.setZterr = false; } //Alt
		if(evt.keyCode == 16){ TR3.cursor.setZterr = false; TR3.cursor.helper.hideShadowBase(); }
		if(TR3.transformControls.enabled){
			switch ( evt.keyCode ) {
				case 17: // Ctrl
					TR3.transformControls.setTranslationSnap( null );
					TR3.transformControls.setRotationSnap( null );
					break;
			}
		}
	};
	
	TR3.zCursor = function(evt){
		if ( TR3.cursor.helper.visible ) {
			var delta = Math.max(-1, Math.min(1, (-evt.wheelDelta || evt.detail || evt.deltaY)));
			var helpPos = TR3.cursor.helper.position;
			var helpPosY = TR3.zM2T(helpPos.y);
			var tPixMesh = delta*TR3.getSizePix();
			
			var valZterr = helpPosY+tPixMesh;
			var valZMod = TR3.zM2T( valZterr, true );
			
			helpPos.set( helpPos.x, valZMod, helpPos.z )
			TR3.redrawInfo( helpPos.x, helpPos.y, helpPos.z, valZterr );
			
			TR3.cursor.helper.showShadowBase();
					
			TR3.vGeom.drawVector = { x: helpPos.x, y: valZMod, z: helpPos.z }; //draw
			
			TR3.optionsSet.cursor3d = false;
			setTimeout(function(){
				TR3.optionsSet.cursor3d = true;
			},3000);
		}
	};
	
	TR3.click_Obj3d = function(evt){
		document.getElementById('autoRotate').checked=false;
		TR3.changeOpt();
		
		var sel3dObj = TR3.getSelectableObj();
		if(sel3dObj.length > 0){
			var intersect = TR3.getIntersect( evt, sel3dObj );
			var thisLooking= intersect.looking;
			if( thisLooking && JSON.stringify(TR3.idLooking) != JSON.stringify(thisLooking) ){
				TR3.goScenes( intersect.looking );
				TR3.idLooking = thisLooking;
			}else if( intersect.urlRef ){
				window.open(
					intersect.urlRef,
					'_blank' // <- This is what makes it open in a new window.
				);
			}else if( intersect ){
				var TR3Obj = TR3.config;
				for(var k in TR3Obj){
					if(TR3Obj[k].URL && intersect.href.indexOf( TR3Obj[k].URL )>-1){
						TR3.goScenes( TR3Obj[k].loc );
					}
				}
				TR3.idLooking = false;
			}else{
				//console.log('nop');
			}
		}
	};
	
	TR3.setCoods2clip = function(evt){ 
		evt.preventDefault();
		if(TR3.XYZ2Clip){
			var setZ = document.getElementById('setZ');
			setZ.value = TR3.XYZ2Clip.toString();
			setZ.select();
			document.execCommand("copy");
		}
	};
	