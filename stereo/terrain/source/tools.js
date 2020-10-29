	'use strict';
	TR3.rectaValue = function( x1 ,y1 ,x2 ,y2 ,valx ){
	
		var y = (valx-x1)/(x2-x1)*(y2-y1)+y1;
		return y;
	}
	
	TR3.getGeo2pix = function( geo ){
	
		var pix = geo*1/(TR3.tPixImg*TR3.geo2UTM);
		return pix;
	}
	
	TR3.getPix2geo = function( pix ){
	
		var geo = pix*(TR3.tPixImg*TR3.geo2UTM);
		return geo;
	}
	
	TR3.setAzAngle = function( oriAzAng ){
		
		var auxAzAng = TR3.controls.getAzimuthalAngle();
		var oriRight;
		var auxRight;
		
		if(oriAzAng<=0){oriRight = -oriAzAng;}else{oriRight = 2*Math.PI-oriAzAng;}
		if(auxAzAng<=0){auxRight = -auxAzAng;}else{auxRight = 2*Math.PI-auxAzAng;}
		
		if(oriRight>2*Math.PI){oriRight = oriRight-2*Math.PI;}
		if(auxRight>2*Math.PI){auxRight = auxRight-2*Math.PI;}
		
		var rightAng = auxRight - oriRight;
		if(rightAng>0){rightAng = 2*Math.PI-rightAng}else{rightAng = Math.abs(rightAng)};
		
		TR3.controls.rotateLeft(rightAng);//+-?
		
	}
	
	TR3.setShadowBase = function( objShadow ){
		
		var bboxOri = new THREE.Vector3();
		new THREE.Box3().setFromObject( objShadow ).getSize( bboxOri );
		objShadow.bboxOri = bboxOri;
		var size = (( bboxOri.x + bboxOri.y + bboxOri.z )/3)/10;
		var coord = objShadow.position;
		
		var markerMaterial = {color: 0xAAAAAA, side: THREE.DoubleSide, transparent: true, opacity: 0.3 };
		var shadow = TR3.makeMeshFeat(new THREE.Vector4( coord.x, coord.y, coord.z, size ), 'Circle', markerMaterial);
		shadow.name = 'ShadowBase';
		var size3dObj = document.getElementById('size3dObj');
		
		objShadow.children.push( shadow );
		
		objShadow.updateShadowBase = function(flag){
			
			var shadow = this.children[this.children.length-1];
			
			if(shadow.visible == true){
				
				var coorShadow = new THREE.Vector3();
				var coorObj = this.position;
				var objGeom = this.children[0];
	
				
				if(this.children.length-1 == 0){ //shadow only child
					coorShadow.x = coorObj.x;
					coorShadow.y = null;
					coorShadow.z = coorObj.z;
				}else{
					coorShadow.x = coorObj.x + objGeom.position.x;
					coorShadow.y = null;
					coorShadow.z = coorObj.z + objGeom.position.z;
				}
				
				if(this.name != 'cursor'){
					var bboxObjGeom = new THREE.Vector3();
					new THREE.Box3().setFromObject( objGeom ).getSize( bboxObjGeom );
					var X = TR3.formatMeasure(bboxObjGeom.x);
					var Y = TR3.formatMeasure(bboxObjGeom.y);
					var Z = TR3.formatMeasure(bboxObjGeom.z);
					
					size3dObj.innerHTML = '<b>X:</b>' +X[0]+''+X[1]+ ' <b>Y:</b>' +Z[0]+''+Z[1]+ ' <b>Z:</b>' +Y[0]+''+Y[1];
					
					var bboxOri = this.bboxOri;
					var scaleObjGeom = ( bboxObjGeom.x + bboxObjGeom.y + bboxObjGeom.z )/3;
					var scaleObjGeomOri= ( bboxOri.x + bboxOri.y + bboxOri.z )/3;
					var scale = scaleObjGeom/scaleObjGeomOri;
					
					shadow.scale.x = scale;
					shadow.scale.y = scale;
					shadow.scale.z = scale;
				}else{
					size3dObj.innerHTML = '';
				}
				
				var coorShadowY = TR3.getCoordsByXYmod(coorShadow.x,coorShadow.z) || 0;
				shadow.position.x = coorShadow.x;
				shadow.position.y = coorShadowY[4];
				shadow.position.z = coorShadow.z;
				
				if(this.name != 'cursor' || this.once == true){ //too busy...
					var pos = shadow.geometry.getAttribute("position");
					for(var j=0 ; j<pos.count; j++){
						var z = TR3.getCoordsByXYmod(shadow.position.x + pos.getX( j ),shadow.position.z + pos.getY( j )) || 0;
						pos.setZ( j, shadow.position.y - z[4] - 0.005 );
					}
					pos.needsUpdate = true;
					this.once=false;
				}else if(typeof(this.once) === 'undefined'){this.once=true;}
			}
		};
		
		objShadow.showShadowBase = function(){
			var shadow = this.children[this.children.length-1];
			shadow.visible = true;
			objShadow.updateShadowBase();
		};
		
		objShadow.hideShadowBase = function(){
			var shadow = this.children[this.children.length-1];
			shadow.visible = false;
		};
		
		return shadow;
	}
	
	TR3.getOptModCoordCam = function(){
		
		var cPos = TR3.camera.position;
		var heigtH;
		

		var coordNormalCamera = new Array();
		var offset = TR3.getSizePix()*2;
		
		heigtH=-10000000;
			
		coordNormalCamera[0] =	TR3.getCoordsByXYmod(cPos.x+offset,cPos.z+offset);
		coordNormalCamera[1] =	TR3.getCoordsByXYmod(cPos.x-offset,cPos.z+offset);
		coordNormalCamera[2] =	TR3.getCoordsByXYmod(cPos.x+offset,cPos.z-offset);
		coordNormalCamera[3] =	TR3.getCoordsByXYmod(cPos.x-offset,cPos.z-offset);
		if(coordNormalCamera && coordNormalCamera[0] && coordNormalCamera[0][4]){
			for(var i=0; i<coordNormalCamera.length; i++){
				if(heigtH < coordNormalCamera[i][4])
					heigtH = coordNormalCamera[i][4];
			}
		}
		
		return [cPos.x,heigtH,cPos.z];
		
	}
	
	TR3.getCoordsByXYmod = function( X, Y, mesh ){
		//var cPos = TR3.camera.position;
		var zUp = 1000000;
		var zDown = -1000000;
		var meshObj = mesh || TR3.mesh;
		
		var start = new THREE.Vector3( X, zUp, Y );
		var end = new THREE.Vector3( X, zDown, Y );
		
		var directionVector = end.sub( start );
		var raycasterLineMesh = new THREE.Raycaster( start, directionVector.clone().normalize() );
		
		var intersectsNormalMesh = raycasterLineMesh.intersectObject( meshObj );
		if (intersectsNormalMesh[0]) {
			//console.log(intersectsNormalMesh);
			 //visualize the ray for debugging
			/*var material = new THREE.LineBasicMaterial({
				color: 0xff0000
			});
			var geometry = new THREE.Geometry();
			geometry.vertices.push(cPos);
			geometry.vertices.push(intersectsNormalMesh[0].point);
			var line = new THREE.Line(geometry, material);
			TR3.scene.add( line );*/
			
			var point = intersectsNormalMesh[0].point;
			
			var Xterr, Yterr, Zterr, Xmod, Ymod, Zmod;

			Xterr= point.x;
			Yterr= -point.z;
			Zterr= TR3.zM2T(point.y,false);

			Xmod= point.x;
			Ymod= point.y;
			Zmod= point.z;

		
			return [Xterr, Yterr, Zterr, Xmod, Ymod, Zmod];
		}
	};
	
	TR3.coordM2T = function( X, Y, Z, inv ){
		var x, y, z;
		if (inv) {
		
			x = X;
			y = TR3.zM2T(Z,inv);
			z = -Y;
			
		}else{
			
			x = X;
			y = -Z;
			z = TR3.zM2T(Y,inv);
			
		}
		
		return [x, y, z];
	};
	
	TR3.zM2T = function( Z, inv ){
		var z;
		if (inv) {
			z = (Z - TR3.zMed)*TR3.valuesSet.magnification;
		}else{
			z = Z/TR3.valuesSet.magnification + TR3.zMed;
		}
		
		return z;
	};
	
	TR3.getSizePix = function(){
		//sizeMeters??
		var tPixW = (TR3.bboxImgOri[2]-TR3.bboxImgOri[0])/TR3.widthImg;
		var tPixH = (TR3.bboxImgOri[3]-TR3.bboxImgOri[1])/TR3.heightImg;
		var tPix = (tPixW+tPixH)/2;
		return tPix;
	};
	
	TR3.makeVectFeat = function( coords, type, style, vItem ){  //BufferGeometries!!!! ExporterGTLF
		var geomFeat = new THREE.Geometry();
		var feat;
		
		var sColor = new THREE.Color( 0xffffff );
		sColor.setHex( Math.random() * 0xffffff );
		
		var thisStyle = new Array;
		thisStyle.color =  style.color || sColor;
		thisStyle.side = style.side || THREE.DoubleSide ;
		thisStyle.transparent = style.transparent || false;
		thisStyle.wireframe = style.wireframe || false; 
		thisStyle.opacity = style.opacity || 1;
		
		if(type == "Circle"){

			var geomCirc = new THREE.CircleGeometry( coords.w, 20 );
			geomCirc.rotateX(Math.PI/2);
			
			var pos = geomCirc.vertices;
			for(var j=0 ; j<pos.length; j++){
				pos[j].x = coords.x + pos[j].x;
				pos[j].z = coords.z + pos[j].z;
				var z = TR3.getCoordsByXYmod(pos[j].x, pos[j].z);
				
				if(z){pos[j].y = z[4];}
				else if(coords.y){pos[j].y = coords.y;}
				else{pos[j].y = TR3.zMed;}
			}
			pos.push(pos[1]);
			pos.shift();
			
            geomFeat.vertices = pos;
			
			var material = new THREE.LineBasicMaterial({
				color: thisStyle.color
			});
			
			feat = new THREE.LineLoop( geomFeat, material );
		}else if(type == "Point"){
			geomFeat.vertices[0] = coords;
			var sizeP = TR3.getSizePix()*50;

			var material = new THREE.PointsMaterial( {/*map:texture*/ 
				color: thisStyle.color, 
				size: sizeP
			} );

			feat = new THREE.Points( geomFeat, material );
		}else if(type == 'Poligon'){
			geomFeat.vertices = coords;
			var material = new THREE.LineBasicMaterial({
				color: thisStyle.color
			});
			
			feat = new THREE.LineLoop( geomFeat, material );
		}else{
			geomFeat.vertices = coords;
			var material = new THREE.LineBasicMaterial({
				color: thisStyle.color
			});
			
			feat = new THREE.Line( geomFeat, material );
		}
		
		if(vItem){
			feat.reload = vItem.reload || false; //borrar y redibujar
			feat.magni = TR3.valuesSet.magnification;
			TR3.vGeom.item.unshift(feat);
		}
		
		return feat;
	};
	
	TR3.makeMeshFeat = function( coords, type, style, vItem ){
		var geomFeat = new THREE.Geometry();
		var feat;
		
		var sColor = new THREE.Color( 0xffffff );
		sColor.setHex( Math.random() * 0xffffff );
		
		var thisStyle = new Array;
		thisStyle.color =  style.color || sColor;
		thisStyle.side = style.side || THREE.DoubleSide ;
		thisStyle.transparent = style.transparent || false;
		thisStyle.wireframe = style.wireframe || false;
		thisStyle.opacity = style.opacity || 1;
		
		var material = new THREE.MeshBasicMaterial( {/*map:texture*/ 
			color: thisStyle.color, 
			side: thisStyle.side,
			transparent: thisStyle.transparent,
			wireframe: thisStyle.wireframe,
			opacity: thisStyle.opacity
		} );
		
		if(type == "Circle"){

			geomFeat = new THREE.CircleBufferGeometry( coords.w, 20 );
			feat = new THREE.Mesh( geomFeat, material );
			
			var y = TR3.getCoordsByXYmod(coords.x,coords.z) || 0;
			feat.position.x = coords.x;
			feat.position.y = coords.y || y[4];
			feat.position.z = coords.z;
			feat.rotation.x = Math.PI/2;
			
			var pos = feat.geometry.getAttribute("position");
			for(var j=0 ; j<pos.count; j++){
				var z = TR3.getCoordsByXYmod(feat.position.x + pos.getX( j ),feat.position.z + pos.getY( j )) || 0;
				var z4 = coords.y || z[4];
				pos.setZ( j, feat.position.y - z4 );
			}
			pos.needsUpdate = true;
		}else if(type == 'Basic'){
			
			geomFeat = coords;
			feat = new THREE.Mesh( geomFeat, material );
		}
		
		if(vItem){
			feat.reload = vItem.reload || false; //borrar y redibujar
			feat.magni = TR3.valuesSet.magnification;
			TR3.vGeom.item.unshift(feat);
		}
		
		return feat;
	};
	
	TR3.getLookAt = function(){
		
		var TGT = TR3.getIntersect()[0].point;
		var CPS = TR3.camera.position.clone();
		 
		return [TGT.x,TGT.y,TGT.z,CPS.x,CPS.y,CPS.z];
	}
	
	TR3.setLookAt = function(lookAt, newMap){
		var destiPos = { x:eval(lookAt[3]), y:eval(lookAt[4]), z:eval(lookAt[5]) };
		
		/*TR3.camera.position.set ( TR3.CPS.x, TR3.CPS.y, TR3.CPS.z );
		TR3.controls.target.set( TR3.TGT.x, TR3.TGT.y, TR3.TGT.z );*/
		
		new TWEEN.Tween( TR3.camera.position ) //https://github.com/tweenjs/es6-tween
				.to( destiPos , 2000 )
				.easing( TWEEN.Easing.Linear )
				.on('start', function(){
					TR3.controls.target.set( eval(lookAt[0]), eval(lookAt[1]), eval(lookAt[2]) );
					TR3.controls.update();
					TR3.lookAt = false;
				})
				.on('complete', function(){
					TR3.mesh.rotation.z = 0;
					if( newMap && IIIkel ){
						IIIkel.AFs.skinMap.setCenterMap( newMap.pos ); 
						if(newMap.lyr)
							IIIkel.AFs.skinMap.setVisibleLayer( IIIkel.AFs.skinMap.getLayersByName( newMap.lyr )[0], true );
					}
				})
				.start();
	}
	
	TR3.goScenes = function( SCN ){
		var scn = SCN || TR3.config.actual.loc;
		/*IIIkel.AFs.skinMap.setCenterMap( scn.pos ); 
		if(scn.lyr)
			IIIkel.AFs.skinMap.setVisibleLayer( IIIkel.AFs.skinMap.getLayersByName( scn.lyr )[0], true );*/
		TR3.config.lookAt = scn.look;
		TR3.setLookAt( TR3.config.lookAt, scn );
		document.getElementById('autoRotate').checked=true;
		TR3.changeOpt();
	};
	
	/*TR3.progress = function() {
		var interval = setInterval(function() {
			
			//loadingTerrain.innerHTML = 'Loading features: '+TR3.prog.countFull+'/'+TR3.prog.index+' '+TR3.prog.index*100/TR3.prog.countFull+'%';

			if (TR3.prog.index == TR3.prog.countFull-1)
				clearInterval(interval);
		}, 3000);
	};*/