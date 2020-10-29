/**
 * @author mrdoob / http://mrdoob.com/
 * @author marklundin / http://mark-lundin.com/
 * @author alteredq / http://alteredqualia.com/
 */
'use strict';
THREE.AnaglyphEffect = function ( renderer, width, height ) {

	var eyeRight = new THREE.Matrix4();
	var eyeLeft = new THREE.Matrix4();
	var _zeroParallax = 200;
	var focalLength = 200;
	var _aspect, _near, _far, _fov;

	var _cameraL = new THREE.PerspectiveCamera();
	_cameraL.matrixAutoUpdate = false;

	var _cameraR = new THREE.PerspectiveCamera();
	_cameraR.matrixAutoUpdate = false;

	var _camera = new THREE.OrthographicCamera( -1, 1, 1, - 1, 0, 1 );

	var _scene = new THREE.Scene();

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	if ( width === undefined ) width = 512;
	if ( height === undefined ) height = 512;

	var _renderTargetL = new THREE.WebGLRenderTarget( width, height, _params );
	var _renderTargetR = new THREE.WebGLRenderTarget( width, height, _params );
	
	this.getAnaglyphColors = function() {
	
		var anaglyphType = '';
		if(TR3){anaglyphType = TR3.anaglyphType};
		//optimiced
		var AnaglyphColor = {
				lr1: "0.0", lg1: "0.7", lb1: "0.3",
				rr2: "0.0", rg2: "1.0", rb2: "0.0",
				rr3: "0.0", rg3: "0.0", rb3: "1.0"
		}
		
		switch (anaglyphType){
			case "normal":
				AnaglyphColor = {
					lr1: "1.0", lg1: "0.0", lb1: "0.0",
					rr2: "0.0", rg2: "1.0", rb2: "0.0",
					rr3: "0.0", rg3: "0.0", rb3: "1.0"
				}
			break;
			case "half":
				AnaglyphColor = {
					lr1: "0.299", lg1: "0.587", lb1: "0.114",
					rr2: "0.0", rg2: "1.0", rb2: "0.0",
					rr3: "0.0", rg3: "0.0", rb3: "1.0"
				}
			break;
			case "gray":
				AnaglyphColor = {
					lr1: "0.299", lg1: "0.587", lb1: "0.114",
					rr2: "0.299", rg2: "0.587", rb2: "0.114",
					rr3: "0.299", rg3: "0.587", rb3: "0.114"
				}
			break;
		}
		
		return(AnaglyphColor);
	}
	
	//var anaglyphColor = this.getAnaglyphColors();
	
	this.getFragmentShader = function() {
		var anaglyphColor = this.getAnaglyphColors();
		var _fragmentShader = [

			"uniform sampler2D mapLeft;",
			"uniform sampler2D mapRight;",
			"varying vec2 vUv;",

			"void main() {",

			"	vec4 colorL, colorR;",
			"	vec2 uv = vUv;",

			"	colorL = texture2D( mapLeft, uv );",
			"	colorR = texture2D( mapRight, uv );",

				// http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx

			"	gl_FragColor = vec4( colorL.r * "+ anaglyphColor.lr1 +" + colorL.g * "+ anaglyphColor.lg1 +" + colorL.b * "+ anaglyphColor.lb1 +", colorR.r * "+ anaglyphColor.rr2 +" + colorR.g * "+ anaglyphColor.rg2 +" + colorR.b * "+ anaglyphColor.rb2 +", colorR.r * "+ anaglyphColor.rr3 +" + colorR.g * "+ anaglyphColor.rg3 +" + colorR.b * "+ anaglyphColor.rb3 +", colorL.a + colorR.a ) * 1.1;",

			"}"

		].join("\n");
		
		if( TR3 && TR3.anaglyphType == "interlaced" ) {
		
			_fragmentShader = [

				"uniform sampler2D mapLeft;",
				"uniform sampler2D mapRight;",
				"varying vec2 vUv;",

				"void main() {",


				"	vec2 uv = vUv;",

				"	if ( ( mod( gl_FragCoord.y, 2.0 ) ) < 1.00 ) {",

				"		gl_FragColor = texture2D( mapRight, uv );",

				"	} else {",



				"		gl_FragColor = texture2D( mapLeft, uv );",


				"	}",


				"}"

			].join("\n")
		
		} else if( TR3 && TR3.anaglyphType == "interlaced swap" ){
		
			_fragmentShader = [

				"uniform sampler2D mapLeft;",
				"uniform sampler2D mapRight;",
				"varying vec2 vUv;",

				"void main() {",


				"	vec2 uv = vUv;",

				"	if ( ( mod( gl_FragCoord.y, 2.0 ) ) < 1.00 ) {",

				"		gl_FragColor = texture2D( mapLeft, uv );",

				"	} else {",



				"		gl_FragColor = texture2D( mapRight, uv );",


				"	}",


				"}"

			].join("\n")
		
		}
		
		return _fragmentShader;
	}
	
	var _material = new THREE.ShaderMaterial( {

		uniforms: {

			"mapLeft": { type: "t", value: _renderTargetL },
			"mapRight": { type: "t", value: _renderTargetR }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = vec2( uv.x, uv.y );",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: this.getFragmentShader()/*[

			"uniform sampler2D mapLeft;",
			"uniform sampler2D mapRight;",
			"varying vec2 vUv;",

			"void main() {",

			"	vec4 colorL, colorR;",
			"	vec2 uv = vUv;",

			"	colorL = texture2D( mapLeft, uv );",
			"	colorR = texture2D( mapRight, uv );",

				// http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx

			"	gl_FragColor = vec4( colorL.r * "+ anaglyphColor.lr1 +" + colorL.g * "+ anaglyphColor.lg1 +" + colorL.b * "+ anaglyphColor.lb1 +", colorR.r * "+ anaglyphColor.rr2 +" + colorR.g * "+ anaglyphColor.rg2 +" + colorR.b * "+ anaglyphColor.rb2 +", colorR.r * "+ anaglyphColor.rr3 +" + colorR.g * "+ anaglyphColor.rg3 +" + colorR.b * "+ anaglyphColor.rb3 +", colorL.a + colorR.a ) * 1.1;",

			"}"

		].join("\n")*/
	} );

	var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), _material );
	_scene.add( mesh );

	this.setSize = function ( width, height ) {

		if ( _renderTargetL ) _renderTargetL.dispose();
		if ( _renderTargetR ) _renderTargetR.dispose();
		_renderTargetL = new THREE.WebGLRenderTarget( width, height, _params );
		_renderTargetR = new THREE.WebGLRenderTarget( width, height, _params );

		_material.uniforms[ "mapLeft" ].value = _renderTargetL;
		_material.uniforms[ "mapRight" ].value = _renderTargetR;

		renderer.setSize( width, height );

	};

	/*
	 * Renderer now uses an asymmetric perspective projection
	 * (http://paulbourke.net/miscellaneous/stereographics/stereorender/).
	 *
	 * Each camera is offset by the eye seperation and its projection matrix is
	 * also skewed asymetrically back to converge on the same projection plane.
	 * Added a focal length parameter to, this is where the parallax is equal to 0.
	 */

	this.render = function ( scene, camera, zeroParallax ) {

		var currentRenderTarget = renderer.getRenderTarget();

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		var hasCameraChanged = ( _aspect !== camera.aspect ) || ( _near !== camera.near ) || ( _far !== camera.far ) || ( _fov !== camera.fov ) ||
                            	( _zeroParallax !== zeroParallax );

		if ( hasCameraChanged ) {

			_aspect = camera.aspect;
			_near = camera.near;
			_far = camera.far;
			_fov = camera.fov;
			_zeroParallax = zeroParallax;
			focalLength = _zeroParallax;

			var projectionMatrix = camera.projectionMatrix.clone();
			var eyeSep = focalLength / 30 * 0.5;
			var eyeSepOnProjection = eyeSep * _near / focalLength;
			var ymax = _near * Math.tan( THREE.Math.degToRad( _fov * 0.5 ) );
			var xmin, xmax;

			// translate xOffset

			eyeRight.elements[12] = eyeSep;
			eyeLeft.elements[12] = -eyeSep;

			// for left eye

			xmin = -ymax * _aspect + eyeSepOnProjection;
			xmax = ymax * _aspect + eyeSepOnProjection;

			projectionMatrix.elements[0] = 2 * _near / ( xmax - xmin );
			projectionMatrix.elements[8] = ( xmax + xmin ) / ( xmax - xmin );

			_cameraL.projectionMatrix.copy( projectionMatrix );

			// for right eye

			xmin = -ymax * _aspect - eyeSepOnProjection;
			xmax = ymax * _aspect - eyeSepOnProjection;

			projectionMatrix.elements[0] = 2 * _near / ( xmax - xmin );
			projectionMatrix.elements[8] = ( xmax + xmin ) / ( xmax - xmin );

			_cameraR.projectionMatrix.copy( projectionMatrix );
			
		}
		//My updates-->
		_cameraL.matrixWorld.copy( camera.matrixWorld ).multiply( eyeLeft );
		_cameraL.position.copy( camera.position );
		_cameraL.near = camera.near;
		_cameraL.far = camera.far;
		
		renderer.setRenderTarget( _renderTargetL );
		renderer.clear();
		renderer.render( scene, _cameraL);

		_cameraR.matrixWorld.copy( camera.matrixWorld ).multiply( eyeRight );
		_cameraR.position.copy( camera.position );
		_cameraR.near = camera.near;
		_cameraR.far = camera.far;
		
		renderer.setRenderTarget( _renderTargetR );
		renderer.clear();
		renderer.render( scene, _cameraR);

		renderer.setRenderTarget( null );
		renderer.render( _scene, _camera );
		renderer.setRenderTarget( currentRenderTarget );
		//<--
	};

	this.dispose = function() {
	
		if ( _renderTargetL ) _renderTargetL.dispose();
		if ( _renderTargetR ) _renderTargetR.dispose();
	}
	
	//Modifica los colores del Anaglifo
	this.updateAnaglyphType = function( scene, camera ) {
		
		var anaglyphColor = this.getAnaglyphColors();

		_material.fragmentShader = this.getFragmentShader();/*[
			"uniform sampler2D mapLeft;",
			"uniform sampler2D mapRight;",
			"varying vec2 vUv;",
			
			"void main() {",

			"	vec4 colorL, colorR;",
			"	vec2 uv = vUv;",
			"	colorL = texture2D( mapLeft, uv );",
			"	colorR = texture2D( mapRight, uv );",
	
			"	gl_FragColor = vec4( colorL.r * "+ anaglyphColor.lr1 +" + colorL.g * "+ anaglyphColor.lg1 +" + colorL.b * "+ anaglyphColor.lb1 +", colorR.r * "+ anaglyphColor.rr2 +" + colorR.g * "+ anaglyphColor.rg2 +" + colorR.b * "+ anaglyphColor.rb2 +", colorR.r * "+ anaglyphColor.rr3 +" + colorR.g * "+ anaglyphColor.rg3 +" + colorR.b * "+ anaglyphColor.rb3 +", colorL.a + colorR.a ) * 1.1;",
									
			"}"
		].join("\n")*/	
			
		_material.needsUpdate = true;
		
		this.render( scene, camera, _zeroParallax );
	
	};
	
};
