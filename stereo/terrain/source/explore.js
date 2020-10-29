	'use strict';
	TR3.personViewFn = function(height){
		
		var heightVal = height || TR3.moveKey.size;
		
		TR3.controls.enableDamping = false;
		
		TR3.controls.maxPolarAngle = Infinity;
		
		TR3.controls.enableKeys = false;

		var coordCenterCamera =	TR3.getOptModCoordCam();//TR3.getCoordsByXYmod(intersects[0].point.x,intersects[0].point.z,true)
		if (coordCenterCamera && coordCenterCamera[1] != -10000000 ) {
			
			//TR3.setMarker(coordCenterCamera);
			
			TR3.changeHeight(coordCenterCamera[1] + heightVal, true, true);

			TR3.cursor.helper.scale.set(0.05,0.05,0.05);
		}else{
			TR3.initPosCamera(true);
			setTimeout(function(){ TR3.personViewFn(heightVal); }, 1500);
		}
		
	};
	
	TR3.orbitalViewFn = function(){
		
		TR3.moveKey.walk = false;
		TR3.controls.enableKeys = false;
		TR3.controls.maxPolarAngle = Math.PI/2;
		
		var intersects = TR3.getIntersect();

		if (intersects[0]) {
			var coordInter = TR3.getCoordsByXYmod(intersects[0].point.x,intersects[0].point.z);//TR3.getCoordsByXYmod(intersects[0].point.x,intersects[0].point.z,true)
			if(coordInter && coordInter[2]){
				/*cPos.x = intersects[0].point.x;
				cPos.z = intersects[0].point.z;*/
				TR3.controls.target.set( coordInter[3], coordInter[4], coordInter[5] );
				
				//TR3.setMarker( [coordInter[3], coordInter[4], coordInter[5]] );
				
			}
			TR3.cursor.helper.scale.set(0.5,0.5,0.5);
		}else{
			TR3.initPosCamera(true);
			setTimeout(function(){ TR3.orbitalViewFn(); }, 1500);
		}
		
	};
	
	TR3.initPosCamera = function( tween ){
		TR3.moveKey.walk = false;
		
		if(tween==true){
			new TWEEN.Tween( TR3.camera.position ) //https://github.com/tweenjs/es6-tween
					.to( TR3.startPos , 1000 )
					.easing( TWEEN.Easing.Linear )
					.on('update', function( coords ){
						TR3.mesh.rotation.z += 0.007;
					})
					.on('complete', function( coords ){
						TR3.mesh.rotation.z = 0;
						TR3.controls.target.set(coords.x, 0, coords.z);
						TR3.controls.update();
					})
					.start();
		}else{
			TR3.camera.position.copy(TR3.camera.position.initPos);
			TR3.controls.update();
		}
		
	};
	
	TR3.changeHeight = function(height,controls,tween){	
		
		TR3.zeroParallax = height;
		TR3.moveKey.azOriAng = TR3.controls.getAzimuthalAngle();
		
		if(tween==true){
			new TWEEN.Tween( TR3.camera.position ) //https://github.com/tweenjs/es6-tween
					.to({y : height}, 1000)
					.easing( TWEEN.Easing.Linear )
					.on('complete', function( coords ){
						TR3.controls.target.set(coords.x+1, coords.y, coords.z+1);
						TR3.controls.update();
						TR3.setAzAngle(TR3.moveKey.azOriAng);
						TR3.controls.enableKeys = true;
						TR3.controls.enableDamping = true;
					})
					.start();
		}else{
			TR3.camera.position.y = height;
		}

		if(controls == true){
			TR3.controls.target.y = height;
			TR3.controls.update();
		}
		//TR3.camera.position.distanceTo(TR3.mesh.position);
	};
	
	TR3.moveKeyFn = function(height){
		if( TR3.moveKey.walk == true ){
		
			var heightVal = height || TR3.moveKey.size;
		
			var heigtH = TR3.getOptModCoordCam();
				
			TR3.changeHeight(heigtH[1] + heightVal, true, false);
		}

	};