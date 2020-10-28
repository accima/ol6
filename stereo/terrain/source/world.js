	'use strict';
	TR3.makeWorld = function( imgOri ){
		
		if(typeof(imgOri) == 'object'){
			TR3.makeObjects(imgOri);
		}else{
			var imgOriUper = imgOri.toUpperCase();
			if(imgOriUper.indexOf('HTTP://')==-1){
				TR3.obtainImageFromID(imgOri);
			}else{
				TR3.obtainImageFromPath(imgOri);
			}
		}
	};
	
	TR3.obtainImageFromPath = function(image){
	
		var imgConteint = new Image();
		var trying = 5;
		imgConteint.onload = function() {
		
			TR3.makeObjects(imgConteint);
		};
		
		imgConteint.onerror = function() {
			
			if(trying>=0){
				imgConteint.src = image;
				trying--;
			}else{
				alert("can not load image correctly");
				TR3.loadingDiv.style.display = 'none';
			}
		};
		imgConteint.crossOrigin="anonymus";
		imgConteint.src = image;
	};
	
	TR3.obtainImageFromID = function(image){
		
		//var imgConteint = new Image();
		var imgConteint = document.getElementById(image);
		//var context = canvas.getContext('2d');
		//imgConteint.src = canvas.toDataURL();
		TR3.makeObjects(imgConteint);
	};
	
	TR3.makeScene = function(){
	
		var radianFOV = TR3.fov*2*Math.PI/360;
		var zone = TR3.zone;
		TR3.controls.autoRotate = false;
		var zoom=TR3.tPixMesh;
		var val = TR3.rectaValue(7000,20000,55,150,zoom);
		if( val<50 ){ val=50 };
		TR3.controls.keyPanSpeed = val;
		TR3.controls.enableKeys = false;
		TR3.controls.maxPolarAngle = Math.PI/2;
		TR3.moveKey.walk = false;
		
		/*<--POSITIONS-->*/
		//x,y,z --> x,z,-y OrbitalMoves theta polar
		var cameraPositionFar = Math.cos(radianFOV/2)*(zone[3] - zone[1])/(2*Math.sin(radianFOV/2));
		/*if(cameraPositionY < TR3.zMax*TR3.valuesSet.magnification)
			cameraPositionY = TR3.zMax*TR3.valuesSet.magnification+100;*/
		var Xcenter = ( zone[2] + zone[0] )/2;
		var Ycenter = 0;
		var Zcenter = -( zone[3] + zone[1] )/2;
		
		TR3.camera.position.set( Xcenter, cameraPositionFar, Zcenter );
		TR3.startPos = {x:TR3.camera.position.x, y:TR3.camera.position.y, z:TR3.camera.position.z};
		
		/*TR3.directionalLight.position.set( Xcenter, cameraPositionFar, Zcenter );
		TR3.directionalLight.target.position.set( Xcenter, 0, Zcenter );
		TR3.directionalLight.distance = 2*cameraPositionFar;
		TR3.directionalLight.angle = 1;*/
		
		TR3.mesh.rotation.x = 3*Math.PI/2;
		TR3.mesh.position.set( Xcenter, Ycenter, Zcenter );
		
		TR3.starField.position.set( Xcenter, Ycenter, Zcenter );
				
		//TR3.sun.position.set( Xcenter, 200000, Zcenter );
		//TR3.moon.position.set( Xcenter, 100000, Zcenter );
		
		TR3.txtObject('N',"#888888",30000,[Xcenter, 200000, Zcenter-1300000],0);
		TR3.txtObject('S',"#888888",30000,[Xcenter, 200000, Zcenter+1300000],Math.PI);
		TR3.txtObject('E',"#888888",30000,[Xcenter+1300000, 200000, Zcenter],-Math.PI/2);
		TR3.txtObject('W',"#888888",30000,[Xcenter-1300000, 200000, Zcenter],Math.PI/2);
		
		/*Set Center Movements*/
		TR3.controls.target.set( Xcenter, 0, Zcenter);
		/*<--POSITIONS-->*/
		
		/*updateProjectionMatrix - PETA EL CURSOR*/
		TR3.camera.near = 1;//TR3.camera.position.y-zMax*TR3.valuesSet.magnification;
		TR3.camera.far = 5000000;//TR3.camera.position.y-zMin*TR3.valuesSet.magnification;
		TR3.camera.fov = TR3.fov;
		
		TR3.zeroParallax = cameraPositionFar;
		
		TR3.cursor.helper.scale.set(1,1,1);
		
		//TR3.controls.keyPanSpeed = 20000;
		
		/*function updateCamera() {
			// update the light target's matrixWorld because it's needed by the helper
			TR3.directionalLight.target.updateMatrixWorld();
			// update the light's shadow camera's projection matrix
			TR3.directionalLight.shadow.camera.updateProjectionMatrix();
			// and now update the camera helper we're using to show the light's shadow camera
			TR3.cameraHelper.update();
		}
		//updateCamera();
		setTimeout(updateCamera);*/
		
		TR3.renderScene();
	};
	
	TR3.makeObjects = function(imgConteint){
		
		TR3.widthImg = /*imgConteint.naturalWidth ||*/ imgConteint.width;
		TR3.heightImg = /*imgConteint.naturalHeight ||*/ imgConteint.height;
		
		var zone = TR3.zone;
		
		/*Texture-Material*/
		var texture = new THREE.Texture( imgConteint );
		texture.needsUpdate = true;
		texture.minFilter = THREE.LinearFilter;
		var material = new THREE.MeshBasicMaterial( { map: texture } );/*MeshPhongMaterial*/
		
		/*Reduction Mesh*/
		var pct = 89;
		do{
			pct += 1;
			TR3.reducMesh = 1-(pct/100);
			TR3.reducMeshW = Math.round( TR3.widthImg*TR3.reducMesh );
			TR3.reducMeshH = Math.round( TR3.heightImg*TR3.reducMesh );
		}while(TR3.getSizePix()/TR3.reducMesh<TR3.maxResolMesh);
		
		TR3.tPixImg = TR3.getSizePix();
		TR3.tPixMesh = TR3.tPixImg/TR3.reducMesh;
		
		/*Image-Mesh*/
		var geometry = new THREE.PlaneBufferGeometry( zone[2] - zone[0], zone[3] - zone[1], TR3.reducMeshW, TR3.reducMeshH );
		//geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
		TR3.mesh = new THREE.Mesh( geometry, material );
		//TR3.mesh.castShadow = true;
		//TR3.mesh.receiveShadow = true;
		TR3.mesh.geometry.dynamic = true;
		TR3.mesh.name = "mesh3d";
		TR3.scene.add(TR3.mesh);
		
		/*Planetary*/
		var moonMat = new THREE.MeshPhongMaterial({//http://threegraphs.com/charts/sample/world/
			//ambient : 0x444444,
			color : 0x777777,
			shininess : 40, 
			specular : 0x222222,
			flatShading : THREE.SmoothShading,
			side: THREE.DoubleSide,
			/*map:matDif,
			bumpMap:mapBump,
			bumpScale: 10*/
		});
		var moonGeometry = new THREE.IcosahedronGeometry(30000, 3);
		//var moonMaterial = new THREE.MeshBasicMaterial({color: "#ffffff"});
		var moon = new THREE.Mesh(moonGeometry, moonMat);
		TR3.scene.add(moon);
		TR3.moon = moon;

		var sunGeometry = new THREE.IcosahedronGeometry(100000, 3);
		var sunMaterial = new THREE.MeshPhongMaterial({//http://threegraphs.com/charts/sample/world/
			//ambient : 0x444444,
			color : 0xaaaa5d,
			shininess : 40, 
			specular : 0x222222,
			flatShading : THREE.SmoothShading,
			side: THREE.DoubleSide,
			/*map:matDif,
			bumpMap:mapBump,
			bumpScale: 10*/
		});
		var sun = new THREE.Mesh(sunGeometry, sunMaterial);
		TR3.scene.add(sun);
		TR3.sun = sun;
		
		var starsGeometry = new THREE.Geometry();//http://blog.cjgammon.com/threejs-geometry
		for ( var i = 0; i < 250; i ++ ) {
	
			var star = new THREE.Vector3();
			var radius = 1500000;
			var lon = THREE.Math.randFloat( 0, 2*Math.PI );
			var lat = THREE.Math.randFloat( -Math.PI/2, Math.PI/2 );
			
			star.x = radius*Math.sin(lon)*Math.cos(lat);
			star.y = radius*Math.sin(lon)*Math.sin(lat);
			star.z = radius*Math.cos(lon);
	
			starsGeometry.vertices.push( star );
		}
		
		var starsMaterial = new THREE.PointsMaterial( {/*map:texture*/ color: '#888888', size: 10000 } );
		TR3.starField = new THREE.Points( starsGeometry, starsMaterial );
		TR3.starField.rotation.x = Math.PI/2;
		TR3.scene.add( TR3.starField );
		
		/*Geometry Cursor3d*/
		var reducPointer = 50;
		var geometry = new THREE.CylinderGeometry( (zone[2] - zone[0])/(4*reducPointer), 0, (zone[2] - zone[0])/reducPointer, 3 );
		geometry.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, (zone[2] - zone[0])/(2*reducPointer), 0 ) );
		//geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
		TR3.cursor.helper = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
		TR3.cursor.helper.name = 'cursor';
		TR3.cursor.helper.visible = false;
		var shadowHelper = TR3.setShadowBase( TR3.cursor.helper );
		TR3.cursor.helper.hideShadowBase();
		
		TR3.scene.add( shadowHelper );
		TR3.scene.add( TR3.cursor.helper );
		
		TR3.quaternion = new THREE.Quaternion();
		
		TR3.makeScene();
		/*Add Z values to Mesh*/
		TR3.makeZmesh();
	};
	
	TR3.setMeshOptions = function(DTMopt, cursorOpt, anaglyphOpt, autoRotateOpt, wireframeMeshOpt){
		/*DTMopt*/
		var DTMoptB4 = TR3.optionsSet.DTMasc;
		
		/*Cursor3d*/
		var infoGeo3d = document.getElementById('infoGeo3d');
		
		if(!infoGeo3d){
			infoGeo3d = document.createElement('div');
			infoGeo3d.id = "infoGeo3d";
			infoGeo3d.style.position = "absolute";
			infoGeo3d.style.fontSize = "10px";
			infoGeo3d.style.margin = "25px";
			infoGeo3d.style.backgroundColor = "#fff";
			infoGeo3d.style.top = '10px';
			infoGeo3d.style.zIndex = '10';
			TR3.desty.appendChild(infoGeo3d);
		}
		
		if( cursorOpt == true ){
			infoGeo3d.style.display = 'block';
			TR3.desty.style.cursor = "none";
			TR3.cursor.helper.visible = true;
		}else{
			infoGeo3d.style.display = 'none';
			TR3.desty.style.cursor = "auto";
			TR3.cursor.helper.visible = false;
			TR3.cursor.helper.hideShadowBase();
		}

		if( wireframeMeshOpt == true ){
			TR3.mesh.material.wireframe = true;
		}else{
			TR3.mesh.material.wireframe = false;
		}
		

		if( autoRotateOpt == true ){
			TR3.controls.autoRotate = true;
		}else{
			TR3.controls.autoRotate = false;
		}
		
		if( anaglyphOpt == true ){
			var inter = TR3.getIntersect();
			if (inter.length > 0) {
				var cPos = TR3.camera.position;
				TR3.zeroParallax = cPos.distanceTo(inter[0].point);
			}
		}
		
		/*Anaglyph*/
		TR3.optionsSet = {DTMasc: DTMopt, cursor3d: cursorOpt, anaglyph: anaglyphOpt, autoRotate: autoRotateOpt, wireframeMesh: wireframeMeshOpt};
		
		if(DTMoptB4 != DTMopt && TR3.newMeshMap == 0 && TR3.widthImg){
			TR3.loadingDiv.style.display = 'block';
			TR3.makeZmesh();
		}else if(TR3.newMeshMap == 0 && TR3.widthImg){
			TR3.renderScene();//anaglyph
		}
	};
	
	TR3.cvsDesty = function(){
		var canvasDest = document.getElementById("canvasDest");
		if(canvasDest){canvasDest.remove();}
		
		var canvasDest = TR3.canvasDest;
		if(!canvasDest){
			canvasDest = document.createElement('CANVAS');
			canvasDest.id = 'canvasDest';
			//canvasDest.style.position = 'absolute';
			//canvasDest.style.top = '0px';
			//canvasDest.style.left = '0px';
			//canvasDest.setAttribute("width", TR3.canvasDestW);
			//canvasDest.setAttribute("height", TR3.canvasDestH);
	
			TR3.desty.insertAdjacentElement('afterbegin',canvasDest);
		}else{
			//canvasDest.style.width = '100%';
			//canvasDest.style.height = '100%';
		}
		
		return canvasDest;
	};
	
	TR3.divLoading = function(){
		
		var imgWaitSro = document.getElementById('imgWaitSro');
		if(!imgWaitSro){
			imgWaitSro = document.createElement('div');
			imgWaitSro.id = 'imgWaitSro';
			imgWaitSro.style.display = "none";
			
			TR3.desty.appendChild(imgWaitSro);
		}
		
		var loadingTerrain = document.getElementById('loadingTerrain');
		if(!loadingTerrain){
			loadingTerrain = document.createElement('div');
			loadingTerrain.id = 'loadingTerrain';
			//loadingTerrain.style.position = "absolute";
			loadingTerrain.style.top = TR3.canvasDestH/2.5 + "px";
			loadingTerrain.style.left = TR3.canvasDestW/2.5 + "px";
			loadingTerrain.style.fontSize = "15px";
			loadingTerrain.style.backgroundColor = "#bbb";
			loadingTerrain.style.border = 'solid';
			//loadingTerrain.style.zIndex = TR3.canvasDestZindex + 1;
			loadingTerrain.innerHTML  = 'Creating 3D maps, please wait...';

			TR3.desty.appendChild(loadingTerrain);
		}else{
			loadingTerrain.innerHTML  = 'Creating 3D maps, please wait...';
			loadingTerrain.style.display = 'block';
		}
		TR3.loadingDiv = loadingTerrain;
	};
	
	TR3.divContainer = function(){
	
		if(typeof(TR3.desty) != 'object'){
			TR3.desty = document.getElementById(TR3.desty);
		}
		
		TR3.canvasDestW = TR3.desty.clientWidth || parseInt(TR3.desty.style.width) || document.documentElement.offsetWidth;
		TR3.canvasDestH = TR3.desty.clientHeight || parseInt(TR3.desty.style.height) || document.documentElement.offsetHeight;
		//TR3.canvasDestZindex = 1000;
		//TR3.desty.style.position='relative';
	};
	
	TR3.setImageMesh = function( imgConteint ){
		
		var texture = new THREE.Texture( imgConteint );
		texture.needsUpdate = true;
		texture.minFilter = THREE.LinearFilter;
		
		TR3.mesh.material.map = texture;
	};
	
	TR3.setMeshZone = function(zone){
	
		if(TR3.newMeshMap == 0 && TR3.widthImg){
			TR3.loadingDiv.style.display = 'block';
			TR3.makeScene();
		}
	}