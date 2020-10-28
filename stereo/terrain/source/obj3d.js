	'use strict';
	//https://www.3dcitydb.org/3dcitydb-web-map/1.7/3dwebclient/index.html?title=Berlin_Demo&batchSize=1&latitude=52.517479728958044&longitude=13.411141287558161&height=534.3099172951087&heading=345.2992773976952&pitch=-44.26228062802528&roll=359.933888621294&layer_0=url%3Dhttps%253A%252F%252Fwww.3dcitydb.org%252F3dcitydb%252Ffileadmin%252Fmydata%252FBerlin_Demo%252FBerlin_Buildings_rgbTexture_ScaleFactor_0.3%252FBerlin_Buildings_rgbTexture_collada_MasterJSON.json%26name%3DBrlin_Buildings_rgbTexture%26active%3Dtrue%26spreadsheetUrl%3Dhttps%253A%252F%252Fwww.google.com%252Ffusiontables%252FDataSource%253Fdocid%253D19cuclDgIHMqrRQyBwLEztMLeGzP83IBWfEtKQA3B%2526pli%253D1%2523rows%253Aid%253D1%26cityobjectsJsonUrl%3D%26minLodPixels%3D100%26maxLodPixels%3D1.7976931348623157e%252B308%26maxSizeOfCachedTiles%3D200%26maxCountOfVisibleTiles%3D200
	//https://gis.stackexchange.com/questions/13585/is-there-an-open-source-gis-to-view-and-edit-citygml-models
	//https://www.idee.es/resources/presentaciones/JIIDE13/miercoles/7_CityGML.pdf
	//http://www.citygmlwiki.org/index.php/Open_Source
	//http://www.citygmlwiki.org/index.php/Freeware
	TR3.setObj3d = function () {
		if( TR3.viewScenes == true && IIIkel ){
			var sMap = IIIkel.AFs.skinMap;
			var posMapZ = sMap.olMap.getView().getZoom();
			var posMapC = sMap.olMap.getView().getCenter();
			var bboxMap = sMap.olMap.getView().calculateExtent( [ TR3.canvasDestW, TR3.canvasDestH ] );
			var TR3Obj = JSON.parse(JSON.stringify(TR3.config));
			for(var k in TR3Obj){
				if(TR3Obj[k].obj){
					var dist = TR3.getCoordsDistance(posMapC,[TR3Obj[k].loc.pos.h,TR3Obj[k].loc.pos.v]);
					var zone = TR3Obj[k].zone || 1000;
					if( dist < zone || TR3Obj[k].URL == 'HTL-TEST' ){
						if( posMapZ >= 10 - TR3.config.zoomMapDskMvl || TR3Obj[k].URL == 'HTL-TEST' ){
							var objs = TR3Obj[k].obj;
							for(var i=0;i<objs.length;i++){
								var coords = objs[i][1];
								var pointObj = new ol.geom.Point( [coords[0], coords[1]] );
								if( isFinite(ol.extent.getIntersection( bboxMap, [coords[0], coords[1], coords[0], coords[1]] )[0]) ){
									objs[i].push(TR3Obj[k].URL)
									TR3.loadFile.apply(null, objs[i] );
								}
							}
							
						}
						if( posMapZ >= 6 ){
							var pins = TR3Obj[k].pin;
							for(var i=0;i<pins.length;i++){
								if( posMapZ == 6 ){
									pins[i][3][0]=10;
									pins[i][3][1]=10;
									pins[i][3][2]=10;
								}
								if( posMapZ == 7 ){
									pins[i][3][0]=5;
									pins[i][3][1]=5;
									pins[i][3][2]=5;
								}
								if( posMapZ == 8 ){
									pins[i][3][0]=2.5;
									pins[i][3][1]=2.5;
									pins[i][3][2]=2.5;
								}
								if( posMapZ >= 10 ){
									pins[i][3][0]=0.7;
									pins[i][3][1]=0.7;
									pins[i][3][2]=0.7;
								}
								pins[i].push(TR3Obj[k].URL)
								TR3.loadFile.apply(null, pins[i] );
							}
						}
						if( TR3.sprite != 11 && posMapZ >= 6 ){
							var spritey = TR3Obj[k].sprite;
							for(var i=0;i<spritey.length;i++){
								if( posMapZ == 6 ){
									spritey[i][2].z+=100;
									spritey[i][2].z+=100;
									spritey[i][2].z+=100;
								}
								if( posMapZ == 7 ){
									spritey[i][2].z+=60;
									spritey[i][2].z+=60;
									spritey[i][2].z+=60;
								}
								if( posMapZ == 8 ){
									spritey[i][2].z+=10;
									spritey[i][2].z+=10;
									spritey[i][2].z+=10;
								}
								if( posMapZ >= 10 ){
									spritey[i][2].z-=13;
									spritey[i][2].z-=13;
									spritey[i][2].z-=13;
								}
								TR3.scene.add( TR3.makeTextSprite.apply( null, spritey[i] ) );
							}
						}
					}
				}
			}
		}
	};
	
	TR3.makeApilator = function ( gltf, scale, n, animation ) {
		
		var obj3d = gltf.scene;
		var bboxObjGeom = new THREE.Vector3();
		new THREE.Box3().setFromObject( obj3d ).getSize( bboxObjGeom );
		var size = bboxObjGeom.y;
		var posObj3d = obj3d.position;
		
		if(n == 100){
			var nClon = 7;
			var R = 70;
			var ang = 2*Math.PI/(nClon+1);
			
			var xC = posObj3d.x;
			var yC = 1*posObj3d.z-70;
				
			for(i=0; i<=nClon; i++){
				if(i!=6){
					var pos = new THREE.Vector3( xC + (R*Math.cos(ang*i)), posObj3d.y, yC - (R*Math.sin(ang*i))  );
					var clon = TR3.makeClon( gltf, obj3d, pos, scale, animation )
					TR3.scene.add( clon );
				}
			}
			
		}else{
			for(var i=0;i<n-1;i++){
				var pos = new THREE.Vector3( posObj3d.x, posObj3d.y+size*(i+1), posObj3d.z  );
				var clon = TR3.makeClon( gltf, obj3d, pos, scale, animation )
				TR3.scene.add( clon );
			}
		}
		
	};
	
	TR3.makeMultiPos = function ( gltf, pos, scale, animation ) {
		var obj3d = gltf.scene;
		for(var i=1;i<pos.length;i++){
			var posi = pos[i];
			var scalei;
			if(typeof scale === "object"){scalei = scale[i];}else{scalei = scale;}
			var coordM = TR3.coordM2T(posi.point[0],posi.point[1],posi.point[2],true);
			var posObj3d = new THREE.Vector3();
			posObj3d.x = coordM[0];
			posObj3d.y = coordM[1];
			posObj3d.z = coordM[2];
			
			var clon = TR3.makeClon( gltf, obj3d, posObj3d, scalei, animation, posi );
			TR3.scene.add( clon );
		}
	};
	
	TR3.makeClon = function ( gltf, obj3d, posObj3d, scale, animation, looking ) {
		var clon = obj3d.clone();//clone?...
		var clonGltf = new Array();
		var clonGltfVal = Object.assign(clonGltf, gltf);
		
		clon.name = 'codeMade';
		clon.position.set( posObj3d.x, posObj3d.y, posObj3d.z ); // or any other coordinates
	
		if(scale){	
			if(typeof scale === "object"){ clon.scale.set( scale[0], scale[2], scale[1] ); clonGltf.scaleByCode=scale; }
		}
		if( clonGltf.animations.length>0 && animation ){
			clonGltf.mixer = new THREE.AnimationMixer( clon );
			var action = clonGltf.mixer.clipAction( clonGltf.animations[ 0 ] );
			action.play();
		}
		
		clonGltf.scene = clon;
		clonGltf.looking = looking;
		if(!TR3.vGeom.obj3d){
			TR3.vGeom.obj3d = new Array(0);
		}
		TR3.vGeom.obj3d.push( clonGltf );
		
		return clon;
	};
	
	TR3.handleFileSelect = function (evt,obj) {
		TR3.sourceFile = false;
		if(evt.target.files){
			var file = evt.target.files[0]; // FileList object
			
			var output = escape(file.name) + ' - ' + file.size + ' bytes';
				
			document.getElementById(evt.target.id+'_fake').value = output;
			
			TR3.sourceFile = (window.URL || window.webkitURL).createObjectURL(file);
			
			/*if(src && extens){
				obj.getFile4features(src,extens);
				obj.parent.tvectorDraw.imgWait.style.display = 'block';			}*/
		}else{
			alert("Acción no soportada por su navegador, actualicese o utilice algún otro");
		}
		
	};
	
	TR3.loadFile = function ( srcLoadObj, pos, animation, scale, aRotate, transform, apilator, urlRef, href ) {
		var srcLoad = srcLoadObj || TR3.sourceFile;
		var size3dObj = document.getElementById('size3dObj');
		size3dObj.innerHTML = '';
		var loader = new THREE.GLTFLoader();
		loader.setCrossOrigin( 'anonymous' );
		//https://threejs.org/examples/webgl_loader_gltf.html
		//https://redstapler.co/add-3d-model-to-website-threejs/
		
		if( srcLoad ){
			loader.load( srcLoad, function(gltf){
				var objGLTF = gltf.scene;
				
				if(!TR3.sourceFile){
					gltf.name = 'codeMade';
					TR3.sourceFile = '';
					document.getElementById('file_3d_fake').value = 'Explorar GLB... ';
				}
				
				//objGLTF.castShadow = true;
				//objGLTF.receiveShadow = false;
				if( gltf.animations.length>0 && animation ){
					gltf.mixer = new THREE.AnimationMixer( objGLTF );
					var action = gltf.mixer.clipAction( gltf.animations[ 0 ] );
					action.play();
				}
				
				var coord = new THREE.Vector3();
				if( typeof pos[0] === "object" ){
					var coordM = TR3.coordM2T(pos[0].point[0],pos[0].point[1],pos[0].point[2],true);
					coord.x = coordM[0];
					coord.y = coordM[1];
					coord.z = coordM[2];
					gltf.looking = pos[0];
				}else if( pos ){
					var coordM = TR3.coordM2T(pos[0],pos[1],pos[2],true);
					coord.x = coordM[0];
					coord.y = coordM[1];
					coord.z = coordM[2];
				}else{
					var intersects = TR3.getIntersect();
					if (intersects.length > 0) {
						var terr = intersects[0].point;
						
						coord.x = terr.x;
						coord.y = terr.y;
						coord.z = terr.z;
					}else{
						coord.x = TR3.mesh.position.x;
						coord.y = TR3.zMed + (TR3.zMax - TR3.zMin)/3;
						coord.z = TR3.mesh.position.z;
					}
				}
				if(scale){
					var scaleSet = new Array();
					if( typeof scale[0] === "object" ){
						scaleSet = scale[0];	 
					}else{
						scaleSet = scale;
					}
					objGLTF.scale.set( scaleSet[0], scaleSet[2], scaleSet[1] ); gltf.scaleByCode = scaleSet;
				}
				if(aRotate){ 
					if(typeof aRotate === "boolean"){ gltf.autoRotation = aRotate; }else{ objGLTF.rotation.y = aRotate; } 
				}
				if(href){ gltf.href = href; }
				if(urlRef){ gltf.urlRef = urlRef; }
				
				objGLTF.position.set( coord.x, coord.y, coord.z );
				var shadow = TR3.setShadowBase( objGLTF );
				TR3.scene.add(shadow);
				
				TR3.transCtrlsEnabled( transform );
				TR3.transformControls.attach( objGLTF.children[0] );
				
				if(!TR3.vGeom.obj3d){
					TR3.vGeom.obj3d = new Array(0);
				}
				TR3.vGeom.obj3d.push( gltf );
				
				TR3.scene.add( objGLTF );
				
				if( apilator && !isNaN(apilator)){ TR3.makeApilator( gltf, scale, apilator, animation ); }
				if( typeof(pos[0]) == "object" ){ TR3.makeMultiPos( gltf, pos, scale, animation ); }
				
			}, function ( xhr ) {
	
				size3dObj.innerHTML = ( xhr.loaded / xhr.total * 100 ) + '% loaded';
	
			}, function ( error ) {
				
				size3dObj.innerHTML =  'error: ' + error.message;
				console.log(error);
				TR3.unlock3d('obj3d');
			});
		}
		
	};
	
	TR3.edit3dObj = function(){
		
		var obj3dLast;
		if( TR3.vGeom && TR3.vGeom.obj3d ){
			var min = 0;
			var max = TR3.vGeom.obj3d.length;
			var random = Math.floor(Math.random() * (max - min)) + min;
			obj3dLast = TR3.vGeom.obj3d[ random ];
		}
		
		//if ( transformControls.object === undefined || transformControls.object !== object ) {
		if(obj3dLast){
			
			if(obj3dLast.type == 'Scene'){
				TR3.transformControls.attach( obj3dLast.children[0] );
			}else{
				TR3.transformControls.attach( obj3dLast.scene.children[0] );
			}
			TR3.transCtrlsEnabled( true );
		}else{
			TR3.transCtrlsEnabled( false );
		}
			//TR3.controls.enabled = false;
		//}
	};
	
	TR3.del3dObj = function(){
		
		TR3.transCtrlsEnabled( false );
		if( TR3.vGeom && TR3.vGeom.obj3d && TR3.vGeom.obj3d.length>0 ){
			var obj3d = TR3.vGeom.obj3d[TR3.vGeom.obj3d.length-1];
			if(obj3d.type == 'Scene'){
				TR3.scene.remove( obj3d );
			}else{
				TR3.scene.remove( obj3d.scene );
				
			}
			TR3.vGeom.obj3d.splice(TR3.vGeom.obj3d.length-1, 1);
		}
		
	};
	
	TR3.transCtrlsEnabled = function( boo ){
		
		if(boo){
			TR3.lock3d('obj3d');
		}else{
			TR3.unlock3d('obj3d');}
		
		TR3.transformControls.enabled = boo; 
		TR3.transformControls.showX = boo; 
		TR3.transformControls.showY = boo; 
		TR3.transformControls.showZ = boo;
		document.getElementById('size3dObj').innerHTML = "";
		
	};