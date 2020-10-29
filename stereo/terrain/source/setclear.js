	'use strict';
	TR3.clearMeshMap = function( e ){
	
		var canvasDest = TR3.canvasDest;
		
		if( e == 'evtOl' ){
			TR3.setFeatToOL();
		}
		
		if (canvasDest && Detector.webgl) {
			var scene = TR3.scene;
			while(scene && scene.children.length > 0){ 
				scene.remove(scene.children[0]); 
			}
			
			for(var k in TR3){
				if(TR3[k] != null && TR3[k].dispose){
					TR3[k].dispose();
				}
			}
			
			var gl = canvasDest.getContext("webgl") || canvasDest.getContext("experimental-webgl");	// Initialize the GL context
			//gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
			gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
			gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
			gl.getExtension('WEBGL_lose_context').loseContext();
			
			TR3.canvasDest = null;
			canvasDest.remove();
			
		}else if (canvasDest && Detector.canvas){
			var ctx = canvasDest.getContext("2d");
			ctx.clearRect(0, 0, canvasDest.width, canvasDest.height);
			canvasDest.remove();
		}
		
		if(canvasDest){
			window.removeEventListener('resize', TR3.onWindowResize, false );
			TR3.desty.removeEventListener('mousemove', TR3.onIntersect, false);
			TR3.desty.removeEventListener('contextmenu', TR3.setCoods2clip, false);
			TR3.desty.removeEventListener('click', TR3.addPoint, false);
			window.removeEventListener('keydown', TR3.keyDown, false);
			window.removeEventListener('keyup',	TR3.keyUp, false);
			TR3.stopAnimation();
			TWEEN.removeAll();
		}
		
		TR3.del_vGeom();
	}
	
	TR3.setMeshMap = function(imgOri, desty, bboxImgOri, srsImg, optionsSet, valuesSet, zone, LyrFeatures){
		TR3.loadingDiv = document.getElementById('loadingTerrain');
		THREE.Triangulation.setLibrary('libtess');
		if(TR3.bboxImgOri && JSON.stringify(bboxImgOri) == JSON.stringify(TR3.bboxImgOri) && TR3.loadingDiv){
			TR3.setImageMesh(imgOri);
			document.getElementById('imgWaitSro').style.display = 'none';
			document.getElementById('3doptions').style.display = 'block';
		}else{
			/*setMeshMap New*/
			TR3.newMeshMap = 1;
			TR3.clearMeshMap();
			
			/*INI params*/
			TR3.desty = desty || 'contMeshMap';
			TR3.bboxImgOri = [eval(bboxImgOri[0]), eval(bboxImgOri[1]), eval(bboxImgOri[2]), eval(bboxImgOri[3])] || [585567,4778782,590139,4782399];
			TR3.srsImg = srsImg || 'EPSG:25830';
			TR3.datumImg = wmsMap.transCoord.getDatum(TR3.srsImg);
			if ( TR3.datumImg.proy == 'Lon-Lat' ){TR3.geo2UTM = 40000000/360;}else{TR3.geo2UTM = 1;}
			TR3.zone = [TR3.bboxImgOri[0]*TR3.geo2UTM,TR3.bboxImgOri[1]*TR3.geo2UTM,TR3.bboxImgOri[2]*TR3.geo2UTM,TR3.bboxImgOri[3]*TR3.geo2UTM];
			
			var DTMasc, cursor3d, anaglyph, magnification, autoRotate, wireframeMesh, lookAt;

			DTMasc = optionsSet.DTMasc; 
			cursor3d = optionsSet.cursor3d;
			anaglyph = optionsSet.anaglyph;
			autoRotate = optionsSet.autoRotate
			wireframeMesh = optionsSet.wireframeMesh
			magnification = valuesSet.magnification;
			TR3.lookAt = valuesSet.lookAt;
			/*Div container*/
			TR3.divContainer();
			
			/*Div loading*/
			TR3.divLoading();
			
			/*Set params*/
			TR3.setMagniValues(magnification);
			TR3.setMeshZone(zone);
			
			TR3.canvasDest = TR3.cvsDesty();
			/*Detector Renderer*/
			if(Detector.canvas){
				/*Get canvas Destiny*/
				if ( ! Detector.webgl ) {
					TR3.renderer = new THREE.CanvasRenderer({ canvas: TR3.canvasDest });
					if(!TR3.widthImg){//sólo al inicio para q no moleste
						var txtSupportWebgl = "Su navegador parece no soportar WebGl. Por favor, actualice su versión o pruebe algún otro.";
						alert(txtSupportWebgl);
						pSupportWebgl = document.createElement('p');
						pSupportWebgl.id = "pSupportWebgl";
						pSupportWebgl.style.color = "#ff0000";
						pSupportWebgl.innerHTML  = txtSupportWebgl;
						document.getElementById('initDialog').appendChild(pSupportWebgl);
						document.getElementById('anaglyphCheck').style.display = 'none';
						document.getElementById('anaglyphType').style.display = 'none';
					}
				}else{
					TR3.renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true, canvas: TR3.canvasDest, antialias: true });
				}
			}else{
				if(!TR3.widthImg){//sólo al inicio para q no moleste
						var txtSupportHTML5 = "Su navegador parece no soportar HTML5. Por favor, actualice su versión o pruebe algún otro.";
						alert(txtSupportHTML5);
						pSupportHTML5 = document.createElement('p');
						pSupportHTML5.id = "pSupportHTML5";
						pSupportHTML5.style.color = "#ff0000";
						pSupportHTML5.innerHTML  = txtSupportHTML5;
						document.getElementById('initDialog').appendChild(pSupportHTML5);
						document.getElementById('OptionsDialog').style.display = 'none';
				}
			};
			
			//TR3.renderer.gammaOutput = true; // if >r88, models are dark unless you activate gammaOutput
			//TR3.renderer.gammaFactor = 2.2; // def 1
			//TR3.renderer.setClearColor( 0xaaaaaa );
			//TR3.renderer.setPixelRatio( window.devicePixelRatio );
			TR3.renderer.physicallyCorrectLights = true; // This will be required for matching the glTF spec.
			//TR3.renderer.shadowMap.enabled = true;
			//TR3.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			TR3.renderer.setSize( TR3.canvasDestW, TR3.canvasDestH );
			//TR3.renderer.setClearColor( 0xbfd1e5 );
			
			/*Anaglyph*/
			TR3.anaglyphRenderer = new THREE.AnaglyphEffect( TR3.renderer, 0 );
			TR3.anaglyphRenderer.setSize( TR3.canvasDestW,  TR3.canvasDestH );
			
			/*Scene*/
			TR3.scene = new THREE.Scene();
			
			/*Clock*/
			TR3.clock = new THREE.Clock();
			
			/*Camera*/
			TR3.camera = new THREE.PerspectiveCamera(TR3.fov, TR3.canvasDestW / TR3.canvasDestH, 1, 5000000);
			//(fov ratio->zone next far ) --> makeScene update
			//TR3.camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 5000);
			
			// Lights
			var hemispheric = new THREE.HemisphereLight( 0xffffbb, 0x080820, 3 );
			TR3.scene.add(hemispheric);
			
			var ambient = new THREE.AmbientLight( 0xcccccc, 3 );
			TR3.scene.add( ambient );
			
			/*TR3.directionalLight = new THREE.SpotLight( 0xffffff, 5000000 );
			TR3.directionalLight.castShadow = true;
			TR3.scene.add( TR3.directionalLight );
			TR3.cameraHelper = new THREE.CameraHelper(TR3.directionalLight.shadow.camera);
			TR3.scene.add(TR3.cameraHelper);*/
			
			/*fonts*/
			var loader = new THREE.FontLoader();
			
			TR3.LyrFeatFromOri = LyrFeatures;
			
			/*Orbit Controls*/
			TR3.controls = new THREE.OrbitControls( TR3.camera, document.getElementById('imgOrbitalMoves') ); //orbitalmoves+canvasDest???
			//TR3.controls.minPolarAngle = - Infinity; // radians
			TR3.controls.maxPolarAngle = Math.PI/2;
			// How far you can orbit horizontally, upper and lower limits.
			// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
			//TR3.controls.minAzimuthAngle = - Infinity; // radians
			//TR3.controls.maxAzimuthAngle = Infinity; // radians
			TR3.controls.enableDamping = true;
			TR3.controls.dampingFactor = 0.19;
			
			/*Transform Controls*/
			TR3.transformControls = new THREE.TransformControls( TR3.camera, TR3.canvasDest );
			TR3.transformControls.enabled = false;
			TR3.scene.add( TR3.transformControls );
			//TR3.transformControls.addEventListener( 'change', TR3.renderer );
			/*TR3.transformControls.addEventListener( 'dragging-changed', function ( event ) {
				TR3.controls.enabled = ! event.value;
			} );*/
			
			/*Create Image-Mesh*/
			TR3.makeWorld( imgOri );
			TR3.persist2Scene();
			TR3.setMeshOptions(DTMasc, cursor3d, anaglyph, autoRotate, wireframeMesh);
		}

		/*Events*/
		window.addEventListener('resize', TR3.onWindowResize, false );
		TR3.desty.addEventListener('mousemove', TR3.onIntersect, false);
		TR3.desty.addEventListener('contextmenu', TR3.setCoods2clip, false);
		TR3.desty.addEventListener('click', TR3.addPoint, false);
		TR3.desty.addEventListener('click', TR3.click_Obj3d, false);
		TR3.desty.addEventListener('wheel', TR3.zCursor, false);
		window.addEventListener('keydown', TR3.keyDown, false);
		window.addEventListener('keyup', TR3.keyUp,false);
	};
	
	TR3.onWindowResize = function(){

		TR3.camera.aspect = TR3.canvasDestW / TR3.canvasDestH;
		TR3.renderer.setSize( TR3.canvasDestW, TR3.canvasDestH );
		TR3.camera.updateProjectionMatrix();
	};
	
	TR3.onCompleteMap = function(){
		if(TR3.lookAt){
			TR3.setLookAt(TR3.lookAt);}
		if(IIIkel){setTimeout(function(){ TR3.setObj3d();TR3.getFeatFromOL(); }, 2000 );} //tween oncomplete tools
		TR3.loadingDiv.style.display = 'none';
		document.getElementById('3doptions').style.display = 'block';
		document.getElementById('imgWaitSro').style.display = 'none';
		TR3.newMeshMap = 0;
	};
	
	TR3.persist2Scene = function(){
		if(TR3.vGeom.obj3d)
			for(var i=0;i<TR3.vGeom.obj3d.length;i++){
				var Obj3d;
				var obj3d2Exp = TR3.vGeom.obj3d[i];
				if(obj3d2Exp.type == 'Scene' || obj3d2Exp.type == 'Group'){
					Obj3d = obj3d2Exp;
				}else{
					Obj3d = obj3d2Exp.scene;
				}
				TR3.scene.add( Obj3d );
			}
	}
	
	TR3.lock3d = function(cause){
		TR3.cursor.causeLock += cause;
		TR3.canvasDest.style.zIndex = '9';
	};
	
	TR3.unlock3d = function(cause){
		if(TR3.cursor.causeLock.indexOf(cause)>-1){
			var splitCause = TR3.cursor.causeLock.split(cause);
			TR3.cursor.causeLock = splitCause.toString().replace(/,/g, '');
			if(TR3.cursor.causeLock == '')
				TR3.canvasDest.style.zIndex = '0';
		}
	};