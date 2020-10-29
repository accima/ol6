	'use strict';
	/*
	http://pierfrancescosoffritti.github.io/doodles/
	
	https://www.arcgis.com/home/webscene/viewer.html?
	https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
	https://maps3d.io/
	https://wwwhatsnew.com/2017/01/28/mapas-3d-de-cualquier-parte-del-mundo/
	http://graemefulton.com/writings/post/first-person-navigation-with-threejs
	
	https://stackoverflow.com/questions/26071490/openlayers-3-how-to-calculate-distance-between-2-points
	
	https://visor.grafcan.es/visorweb/
	
	https://nagix.github.io/mini-tokyo-3d/#14/35.6814/139.767/0/60
	*/
	/*Object API*/
	//var TR3 = new Object();
	
	TR3.requestDTMwcs = false;
	
	/*Scene Container*/
	TR3.scene; TR3.renderer; TR3.camera; TR3.controls; TR3.mesh; TR3.fov = 30;
	TR3.sourceFile = false;
	TR3.starField;
	
	/*Maps Params*/
	TR3.geo2UTM;
	TR3.bboxImgOri = []; TR3.srsImg; TR3.widthImg; TR3.heightImg; TR3.tPixImg; TR3.texture; TR3.maxResolMesh = 5;
	TR3.zMin; TR3.zMed; TR3.zMax;
	TR3.arrayZ = [];
	TR3.zone = [];
	TR3.reducMeshW; TR3.reducMeshH;
	
	/*Terrain Container*/
	TR3.desty; TR3.canvasDest; TR3.loadingDiv;
	TR3.canvasDestW; TR3.canvasDestH;//TR3.canvasDestZindex;
	TR3.optionsSet = {DTMasc: false, cursor3d: false, anaglyph: false, autoRotate: false, wireframeMesh: false};
	TR3.valuesSet = {magnification: 'auto', height: 0};
	
	/*Cursor3d*/
	TR3.cursor = {helper: false, setZterr: false, setkCde: false, causeLock: ""};
	
	TR3.newMeshMap = 1;
	TR3.idAnimation = -1;
	TR3.zeroParallax;
	
	/*observer*/
	TR3.moveKey = {is: false, size: 2, walk: false, azOriAng: 0};
	TR3.startPos;
	TR3.lookAt;
	TR3.viewScenes = true;
	TR3.idLooking = false;
	/*prrgress count*/
	//TR3.prog = {index: 0, countFull: 0};
	
	/*Draw*/
	TR3.newDraw = -1;
	TR3.vGeom = [];
	TR3.vGeom.drawVector;
	TR3.vGeom.positions;
	TR3.vGeom.sprites = [];
	TR3.vGeom.measure = false;
	TR3.vGeom.polig = false;
	TR3.vGeom.item = [];
	TR3.vGeom.item.magni;
	TR3.vGeom.item.nPoint = 0;
	TR3.vGeom.obj3d = false;
	TR3.sprite = true;
	TR3.featFromOri;
	
	/*SINTETC STEREO*/
	TR3.animate = function(){

		//request new frame
		TR3.idAnimation = requestAnimationFrame( TR3.animate );
		TR3.controls.update();
		TR3.renderScene();
		if( TR3.moveKey.is == true ){
			TR3.moveKeyFn();
		}
		TR3.starField.rotation.y += 0.0005;
	
		var delta = TR3.clock.getDelta();
		if( TR3.vGeom && TR3.vGeom.obj3d ){
			var flag = false;
			for( var i = 0; i < TR3.vGeom.obj3d.length; i++ ){
				if ( TR3.vGeom.obj3d[i].mixer ) { TR3.vGeom.obj3d[i].mixer.update( delta ) };
				
				var aRotate = TR3.vGeom.obj3d[i].autoRotation;
				if(aRotate){ if(typeof aRotate === "boolean"){TR3.vGeom.obj3d[i].scene.rotation.y += 0.01;}else{TR3.vGeom.obj3d[i].scene.rotation.y += aRotate;} }
				
				flag = true;
			}
			var Tc = TR3.transformControls;
			if( Tc.enabled && flag ){
				var coord = new THREE.Vector3();
				var obj3d = Tc.object;
				if(obj3d.parent && obj3d.parent.updateShadowBase)
					obj3d.parent.updateShadowBase();
			}else{ /*TR3.transCtrlsEnabled( false );*/ }
		}
		
		/*TR3.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), 0.005);
		if(TR3.moon)
			TR3.moon.position.applyQuaternion(TR3.quaternion);*/
		var orbitRadius = 1500000;
		var date = TR3.starField.rotation.y; //Date.now() * 0.00001//TR3.clock.getElapsedTime() * 0.01;
		var zone = TR3.zone;
		if( TR3.moon && TR3.sun ){
			TR3.moon.position.set(
					Math.cos(date) * orbitRadius + ( zone[2] + zone[0] )/2,
					-Math.sin(date) * 700000 - 200000,
					-Math.sin(date) * orbitRadius + -( zone[3] + zone[1] )/2
			);
			TR3.sun.position.set(
					Math.cos(date) * orbitRadius + ( zone[2] + zone[0] )/2,
					Math.sin(date) * 700000 - 200000,
					Math.sin(date) * orbitRadius + -( zone[3] + zone[1] )/2
			);
			
		}
		
	};
	
	TR3.startAnimation = function(e){
		
		TR3.idAnimation = window.requestAnimationFrame( TR3.animate );
	}
	
	TR3.stopAnimation = function(e){
		
		window.cancelAnimationFrame( TR3.idAnimation );
	}
	
	TR3.renderScene = function(){
		TWEEN.update();
		if(TR3.optionsSet.anaglyph && Detector.webgl){
			TR3.anaglyphRenderer.render(TR3.scene, TR3.camera, TR3.zeroParallax);
		}else{
			TR3.renderer.render(TR3.scene, TR3.camera);
		}
	};
	
	TR3.exportGLTF = function( type ){
		var exporter = new Array();
		if( type == 'scene' ){
			if(TR3.vGeom.item && TR3.vGeom.item.length>0)
				for(i=0;i<TR3.vGeom.item.length;i++){
					var item = TR3.vGeom.item[i]
					if(item.geometry.type == 'BufferGeometry')
						exporter.push(TR3.vGeom.item[i]);
				}
			if(TR3.vGeom.obj3d && TR3.vGeom.obj3d.length>0)
				for(i=0;i<TR3.vGeom.obj3d.length;i++){
					//var Obj3d = TR3.vGeom.obj3d[i].scene.children[0].clone();//https://github.com/mrdoob/three.js/issues/11574
					exporter.push( exportObjItem( TR3.vGeom.obj3d[i] ) );
				}
			/*if(TR3.vGeom.sprites && TR3.vGeom.sprites.length>0) SPRITES!!??
				for(i=0;i<TR3.vGeom.sprites.length;i++){
					//var Obj3d = new THREE.Mesh( TR3.vGeom.sprites[0].geometry, TR3.vGeom.sprites[0].material );
					exporter.push( TR3.vGeom.sprites[i].scale.set(150*TR3.getSizePix(),150/2*TR3.getSizePix(),1.0) );
				}*/
			exporter.push(TR3.mesh);
		}else if(type == 'obj3d'){
			if(TR3.vGeom.obj3d && TR3.vGeom.obj3d.length>0)
				for(i=0;i<TR3.vGeom.obj3d.length;i++){
					//var Obj3d = TR3.vGeom.obj3d[i].scene.children[0].clone();//https://github.com/mrdoob/three.js/issues/11574
					exporter.push( exportObjItem( TR3.vGeom.obj3d[i] ) );
				}
		}else if( type == 'items' && IIIkel ){
			IIIkel.util.vectorDraw.prototype.exportLyr(TR3.LyrFeatFromOri.getSource().getFeatures());
			if(TR3.vGeom.item && TR3.vGeom.item.length>0)
				for(i=0;i<TR3.vGeom.item.length;i++){
					var item = TR3.vGeom.item[i]
					if(item.geometry.type == 'BufferGeometry')
						exporter.push(TR3.vGeom.item[i]);
				}
		}else{
			exporter = TR3.mesh;
		}
		
		var gltfExporter = new THREE.GLTFExporter();

		var options = {
			/*trs: document.getElementById( 'option_trs' ).checked,
			onlyVisible: document.getElementById( 'option_visible' ).checked,
			truncateDrawRange: document.getElementById( 'option_drawrange' ).checked,
			binary: document.getElementById( 'option_binary' ).checked,
			forceIndices: document.getElementById( 'option_forceindices' ).checked,
			forcePowerOfTwoTextures: document.getElementById( 'option_forcepot' ).checked,
			maxTextureSize: Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value*/
		};
		
		//if(exporter.length > 0 || exporter.type == "Mesh")
		gltfExporter.parse( exporter, function ( result ) {

			if ( result instanceof ArrayBuffer ) {

				saveArrayBuffer( result, 'scene.glb' );

			} else {

				var output = JSON.stringify( result, null, 2 );
				//console.log( output );
				saveString( output, 't3scene.gltf' );

			}

		}, options );
		
		var link = document.createElement( 'a' );
		link.style.display = 'none';
		document.body.appendChild( link ); // Firefox workaround, see #6594

		
		
		function save( blob, filename ) {

			link.href = URL.createObjectURL( blob );
			link.download = filename;
			link.click();

			// URL.revokeObjectURL( url ); breaks Firefox...

		}

		function saveString( text, filename ) {

			save( new Blob( [ text ], { type: 'text/plain' } ), filename );

		}


		function saveArrayBuffer( buffer, filename ) {

			save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

		}
		
		function exportObjItem( obj3d2Exp ) {
			var Obj3d;
			if(obj3d2Exp.type == 'Scene' || obj3d2Exp.type == 'Group'){
				Obj3d = obj3d2Exp;
			}else{
				Obj3d = obj3d2Exp.scene;
			}
			
			var Obj3dCero = Obj3d.children[0];
			var Obj3dChild = THREE.SkeletonUtils.clone( Obj3dCero );//https://github.com/mrdoob/three.js/issues/11574
			
			if(obj3d2Exp.scaleByCode){
				Obj3dChild.scale.x *= obj3d2Exp.scaleByCode[0];
				Obj3dChild.scale.y *= obj3d2Exp.scaleByCode[0];
				Obj3dChild.scale.z *= obj3d2Exp.scaleByCode[0];
			}else{
				var bboxObj = new THREE.Vector3();
				new THREE.Box3().setFromObject( Obj3dCero ).getSize( bboxObj );
									
				var bboxObjChild = new THREE.Vector3();
				new THREE.Box3().setFromObject( Obj3dChild ).getSize( bboxObjChild );
				
				var scaleObjGeom = ( bboxObj.x + bboxObj.y + bboxObj.z )/3;
				
				Obj3dChild.scale.x = bboxObj.x/bboxObjChild.x;
				Obj3dChild.scale.y = bboxObj.y/bboxObjChild.y;
				Obj3dChild.scale.z = bboxObj.z/bboxObjChild.z;
			}
			
			var posObj = Obj3d.position.clone();
			var posObjChild = Obj3dChild.position.clone();
			Obj3dChild.position.set( posObj.x + posObjChild.x, posObj.y + posObjChild.y, posObj.z + posObjChild.z );
			
			return Obj3dChild;

		}
		
	}