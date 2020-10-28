	'use strict';
	/*DRAW-->*/
	// update line
	TR3.updateVgeom = function() {
		var mouse = TR3.vGeom.drawVector;
		var thisLine = TR3.vGeom.item[TR3.vGeom.item.length-1];
		var nPoint = thisLine.nPoint;
		var positions = TR3.vGeom.positions;
		
		positions[nPoint * 3 - 3] = mouse.x;
		positions[nPoint * 3 - 2] = mouse.y;
		positions[nPoint * 3 - 1] = mouse.z;
		thisLine.geometry.attributes.position.needsUpdate = true;
		
		if(nPoint>1 && TR3.vGeom.measure){
			var txtMetric = TR3.getMetrics(thisLine);
			for(var i=0; i<txtMetric.length; i++){
				var posSprite = txtMetric[i][1] || mouse;
				var spritey = TR3.makeTextSprite( txtMetric[i][0], '', posSprite );
				TR3.scene.add( spritey );
			}
		}
		
	}
	
	// mouse down handler
	TR3.addPoint = function() {
		if ( TR3.cursor.helper.visible && TR3.vGeom.positions && TR3.newDraw!=-1 ) {
			var mouse = TR3.vGeom.drawVector;
			var thisLine = TR3.vGeom.item[TR3.vGeom.item.length-1];
			var nPoint = thisLine.nPoint;
			var positions = TR3.vGeom.positions;
		
			positions[nPoint * 3 + 0] = mouse.x;
			positions[nPoint * 3 + 1] = mouse.y;
			positions[nPoint * 3 + 2] = mouse.z;
			thisLine.nPoint++;
			thisLine.geometry.setDrawRange(0, thisLine.nPoint);
			TR3.updateVgeom();
		}
	}
	
	// mouse down handler
	TR3.newVgeom = function(evt) {
		TR3.newDraw++;
		// geometry
		var geometry = new THREE.BufferGeometry();
		var MAX_POINTS = 150;
		var positions = new Float32Array(MAX_POINTS * 3);
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		TR3.vGeom.positions = positions;
		
		// material
		var material = new THREE.LineBasicMaterial({
			color: new THREE.Color($( "#PickDrawStereo" ).val())
			//https://stackoverflow.com/questions/11638883/thickness-of-lines-using-three-linebasicmaterial
		});
		
		// line
		var line;
		if(TR3.vGeom.polig == true){
			line = new THREE.LineLoop(geometry, material); //LineLoop Surface!!!
		}else{
			TR3.distAlt = 0;
			TR3.dist2D = 0;
			TR3.dist3D = 0;
			TR3.distTerr = 0;
			line = new THREE.Line(geometry, material);
		}
			
		line.frustumCulled = false;
		line.nPoint = 0;
		line.magni = TR3.valuesSet.magnification;
		line.name = 'handMade';
		//line.geometry.computeBoundingSphere();
		TR3.scene.add(line);
		
		if(TR3.vGeom.sprites && TR3.vGeom.sprites.length){
			for(var i=0; i<TR3.vGeom.sprites.length; i++){
				if(TR3.vGeom.sprites[i].reload == true){
					TR3.vGeom.sprites[i].reload = false;
				}
			}
		}
		
		if(TR3.vGeom.item && TR3.vGeom.item.length){
			for(var i=0; i<TR3.vGeom.item.length; i++){
				if(TR3.vGeom.item[i].reload == true){
					TR3.vGeom.item[i].reload = false;
				}
			}
		}

		if(!TR3.vGeom.item){
			TR3.vGeom.item = new Array(0);
		}
		TR3.vGeom.item.push( line );
		TR3.vGeom.item[0].reload = false;

	}
	
	TR3.endDraw = function(evt) {
		TR3.newDraw = -1;
	}
	
	TR3.getMetrics = function(thisLine) {
		var pos;
		var metric = new Array();
		metric.length = 0;
		
		if(TR3.vGeom.sprites && TR3.vGeom.sprites.length){
			for(var i=0; i<TR3.vGeom.sprites.length; i++){
				if(TR3.vGeom.sprites[i].reload == true){
					TR3.scene.remove( TR3.vGeom.sprites[i] );
					TR3.vGeom.sprites.splice(i, 1);
					i--;
				}
			}
		}
		
		if(TR3.vGeom.item && TR3.vGeom.item.length){
			for(var i=0; i<TR3.vGeom.item.length; i++){
				if(TR3.vGeom.item[i].reload == true){
					TR3.scene.remove( TR3.vGeom.item[i] );
					TR3.vGeom.item.splice(i, 1);
					i--;
				}
			}
		}
		
		
		if(TR3.vGeom.polig == true && thisLine.nPoint > 2){
			pos = thisLine.geometry.getAttribute("position");
			var coords = new Array();
			for(var i=thisLine.nPoint-1; i>-1; i--){
				var coorPos = TR3.getCoordsByXYmod( pos.getX( i ), pos.getZ( i ) );
				coords.unshift(coorPos);
			}
			
			var getSurf = TR3.getSurf( coords, thisLine );
			metric.push( [TR3.txtMetric( [getSurf[0], getSurf[1], getSurf[2]] ), new THREE.Vector3( pos.getX( 0 ), pos.getY(0), pos.getZ( 0 ) )] );
			metric.push( [TR3.txtMetric( [getSurf[6]] ), new THREE.Vector3( pos.getX( 1 ), pos.getY(1), pos.getZ( 1 ) )] );
			metric.push( [TR3.txtMetric( [getSurf[3], getSurf[4], getSurf[5]] ),] );
		}
		if(!TR3.vGeom.polig || TR3.vGeom.polig == false){
			pos = thisLine.geometry.getAttribute("position");
			var last = TR3.getCoordsByXYmod( pos.getX( thisLine.nPoint-1 ), pos.getZ( thisLine.nPoint-1 ) );
			var first = TR3.getCoordsByXYmod( pos.getX( thisLine.nPoint-2 ), pos.getZ( thisLine.nPoint-2 ) );
			
			var getDist = TR3.getDist(first[0] ,first[1] ,first[2] ,last[0] , last[1] , last[2] )
			metric.push( [TR3.txtMetric( getDist ),] );
		}
		
		return metric;
	}
	
	TR3.txtMetric = function( metric ){
		var txtMetric = '';
		for(var i=0;i<metric.length;i++){
			if(metric[i]){
				txtMetric += ' '+metric[i].name+': '+metric[i].val+' '+metric[i].unit+'\n';
			}else{metric.splice(i, 1);i--;}
		}
		return txtMetric;
	}
	/*<--DRAW*/
	
	TR3.assignZgeometries = function(){

		for(var i=0;i<TR3.vGeom.item.length;i++){
			var item = TR3.vGeom.item[ i ];
			if(item.geometry.vertices){
				var vert = item.geometry.vertices
				for(var j=0 ; j<vert.length ; j++){
					vert[j].y=vert[j].y/TR3.vGeom.item[ i ].magni*TR3.valuesSet.magnification;
				}
				item.geometry.verticesNeedUpdate = true;
			}else{
				var pos = item.geometry.getAttribute("position");
				for(var j=0 ; j<=TR3.vGeom.item[ i ].nPoint ; j++){
					pos.setY( j, pos.getY( j )/TR3.vGeom.item[ i ].magni*TR3.valuesSet.magnification );
				}
				pos.needsUpdate = true;
			}
			item.magni = TR3.valuesSet.magnification;
			item.geometry.computeVertexNormals();
		}
	};

	/*TEXT Marker-->*/
	TR3.makeTextSprite = function( message, parameters, posSprite, text_Width, center ){
		if ( parameters === undefined ) parameters = {};

		var fontface = parameters.hasOwnProperty("fontface") ? 
			parameters["fontface"] : "Arial";
		
		var fontsize = parameters.hasOwnProperty("fontsize") ? 
			parameters["fontsize"] : 24;
		
		var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
			parameters["borderThickness"] : 4;
		
		var borderColor = parameters.hasOwnProperty("borderColor") ?
			parameters["borderColor"] : { r:255, g:0, b:0, a:1.0 };
		
		var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
			parameters["backgroundColor"] : { r:255, g:100, b:100, a:0.8 };
			
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		context.font = "Bold " + fontsize + "px " + fontface;
		
		// background color
		context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
									+ backgroundColor.b + "," + backgroundColor.a + ")";
		// border color
		context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
									+ borderColor.b + "," + borderColor.a + ")";
		if(message == null){message=''};
		var lines = message.split("\n");
		var lineLength = lines.length-1;
		var heightTxt = fontsize + borderThickness
		
		// get size data (height depends only on font size)
		var metrics = context.measureText( message );
		var textWidth = text_Width || metrics.width/lineLength*1.2;
		
		context.lineWidth = borderThickness;
		TR3.roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, (fontsize * 1.2 + borderThickness)*lineLength, 6);
		// 1.2 is extra height factor for text below baseline: g,j,p,q.
		
		// text color
		context.fillStyle = "rgba(0, 0, 0, 1.0)";
		
		for (var i = 0; i < lineLength; ++i) {
			//context.fillText(lines[i], x, y);
			context.fillText( lines[i], borderThickness, heightTxt*(i+1));
		}
		
		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas) 
		texture.needsUpdate = true;
	
		var spriteMaterial = new THREE.SpriteMaterial( 
			{ map: texture/*, depthTest: false*/ } );
		
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.reload = true;
		
		var coord = new THREE.Vector3();
		if(posSprite.inv){
			var coordM = TR3.coordM2T(posSprite.x,posSprite.y,posSprite.z,posSprite.inv);
			coord.x = coordM[0];
			coord.y = coordM[1];
			coord.z = coordM[2];
		}else{
			coord.x = posSprite.x;
			coord.y = posSprite.y;
			coord.z = posSprite.z;
		}
		sprite.position.set( coord.x, coord.y, coord.z );
		var sDskMvl = TR3.config.spritesDskMvl;
		sprite.scale.set(100*TR3.getSizePix()*sDskMvl,100/2*TR3.getSizePix()*sDskMvl,1);
				
		var val = TR3.rectaValue(1,0.7,4,0.05,lineLength);
		if(!center){sprite.center.set(0,val);}
		
		
		if(!TR3.vGeom.sprites){
			TR3.vGeom.sprites = new THREE.Group();
		}
		TR3.vGeom.sprites.add( sprite );
		
		return sprite;	
	};
	
	TR3.del_vGeom = function() {
		
		if(TR3.vGeom.sprites && TR3.vGeom.sprites.length)
			for(var i=0; i<TR3.vGeom.sprites.length; i++){
				TR3.scene.remove( TR3.vGeom.sprites[i] );
			}
		if(TR3.vGeom.item && TR3.vGeom.item.length)
			for(var i=0; i<TR3.vGeom.item.length; i++){
				TR3.scene.remove( TR3.vGeom.item[i] );
			}
		if(TR3.vGeom.obj3d && TR3.vGeom.obj3d.length)
			for(var i=0; i<TR3.vGeom.obj3d.length; i++){
				if( TR3.vGeom.obj3d[i].name == 'codeMade' ){
					TR3.scene.remove( TR3.vGeom.obj3d[i] );
					TR3.vGeom.obj3d.splice(i, 1);
					i--;
				}
			}
		
		TR3.newDraw = -1;
		TR3.vGeom.item = [];
		TR3.vGeom.sprites = false;
		TR3.vGeom.item.magni;
		TR3.vGeom.item.nPoint = 0;
	}
	
	// function for drawing rounded rectangles
	TR3.roundRect = function(ctx, x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.lineTo(x+w-r, y);
		ctx.quadraticCurveTo(x+w, y, x+w, y+r);
		ctx.lineTo(x+w, y+h-r);
		ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
		ctx.lineTo(x+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(x, y+r);
		ctx.quadraticCurveTo(x, y, x+r, y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();   
	};
	/*<--TEXT Marker*/
	
	TR3.txtObject = function(txt, color, size, pos, rot) {
		
		var loader = new THREE.FontLoader();
		loader.load( TR3.config.src+'helvetiker_regular.typeface.json', function ( font ) {
		
			var textGeo = new THREE.TextGeometry( txt, {
		
				font: font,
		
				size: size,
				/*height: 50,
				curveSegments: 12,
		
				bevelThickness: 2,
				bevelSize: 5,
				bevelEnabled: true*/
		
			} );
		
			var textMaterial = new THREE.MeshPhongMaterial( { color: color } );
		
			var mesh = new THREE.Mesh( textGeo, textMaterial );
			mesh.position.set( pos[0], pos[1], pos[2] );
			mesh.rotation.y = rot;
			TR3.scene.add( mesh );
		
		} );
	}
	
	TR3.getFeatFromOL = function(){
		var feat = TR3.LyrFeatFromOri.getSource().getFeatures();
		TR3.loadingDiv.style.display = 'block';
		/*TR3.prog.countFull = feat.length;
		TR3.progress();*/
		for(var i=0 ; i<feat.length; i++){
			
			//TR3.prog.index = i;
			var geometry = feat[i].getGeometry();//getSimplifyGeometry(0)
			var nAxis = geometry.layout;
			
			var typeGeom = geometry.getType();
			var typeSoport = ['Point','Line','LineString','Polygon','Circle'];
			var type;
			for(var m=0 ; m<typeSoport.length ; m++){
				if(typeGeom.indexOf(typeSoport[m])!=-1){
					type = typeSoport[m];
				}
			}
			
			if(nAxis && type){
				var nAxisL = nAxis.length;
				var coord = new Array();
				var coord3d = new Array();
				
				if(type == "Circle"){//nAxisL?
					var coordOri = geometry.getCenter();
					var radOri = geometry.getRadius();
					
					coord3d = TR3.getCoordsByXYmod( coordOri[0],  -coordOri[1] );
					if(coord3d)
						coord = new THREE.Vector4( coord3d[3], coord3d[4], coord3d[5], radOri );
					else
						coord = new THREE.Vector4( coordOri[0], TR3.zMed, -coordOri[1], radOri );
				}else if(type == "Point"){//nAxisL?
					var coordOri = geometry.getCoordinates();
					
					coord3d = TR3.getCoordsByXYmod( coordOri[0],  -coordOri[1] );
					if(coord3d)
						coord = new THREE.Vector3( coord3d[3], coord3d[4], coord3d[5] );
					else
						coord = new THREE.Vector3( coordOri[0], TR3.zMed, -coordOri[1] );
				}else{
					if(geometry.layout){
						var coordOri = geometry.getCoordinates().toString().split(','); //cubes.forEach https://stackoverflow.com/questions/10021847/for-loop-in-multidimensional-javascript-array

						for( var j=0 ; j<coordOri.length; j+=nAxisL){
							
							if( nAxisL==2 ){
								var coord3d6 = TR3.getCoordsByXYmod(coordOri[j], -coordOri[j+1]);
								if(coord3d6){
									coord3d = [coord3d6[3], coord3d6[4], coord3d6[5]];
								}else{
								coord3d = [coordOri[j], TR3.zMed, -coordOri[j+1]];}
							}else{
								if(coordOri[j+2] == 0){
									var coord3d6 = TR3.getCoordsByXYmod(coordOri[j], -coordOri[j+1]);
									if(coord3d6){
										coord3d = [coord3d6[3], coord3d6[4], coord3d6[5]];
									}else{
										coord3d = [coordOri[j], TR3.zMed, -coordOri[j+1]];}
								}else{
									var zM = TR3.zM2T(coordOri[j+2],true);
									coord3d = [coordOri[j], zM, -coordOri[j+1]];
								}
							}
							
							coord.push(new THREE.Vector3( coord3d[0], coord3d[1], coord3d[2] ));
						}
						
					}
				}
				
				var styleFeat = feat[i].getStyle();//https://stackoverflow.com/questions/42376516/is-it-possible-to-extract-style-information-from-geojson-for-an-openlayers-javas
				var sColor = null;
				if(styleFeat && styleFeat.stroke_){//color de la capa
					var color = styleFeat.getStroke().getColor();
					sColor = new THREE.Color( color[0]/255, color[1]/255, color[2]/255 );
				}
				var style = { color: sColor };
				var vItem = { reload: false };
				var feat3d = TR3.makeVectFeat(coord, type, style, vItem);
				TR3.scene.add( feat3d );
			}
		}
		TR3.loadingDiv.style.display = 'none';
		loadingTerrain.innerHTML  = 'Creating 3D maps, please wait...';
	};
	
	TR3.setFeatToOL = function(){
		//printFeature('Polygon',poligonCoords);
		var LyrFeatsOri = TR3.LyrFeatFromOri;
		var features = new Array();
		
		if(TR3.scene){
			for(var i=0; i<TR3.vGeom.item.length; i++){
				
				var object = TR3.vGeom.item[i];
				if (object.name == "handMade"){
					var feat;
					var coordinates = new Array();
					var pos = object.geometry.getAttribute("position");
					var featLength = object.nPoint || pos.version
					for(var j=0; j<featLength; j++){
						coordinates.push([pos.getX( j ), -pos.getZ( j ), TR3.zM2T(pos.getY( j ))]);
					}
					
					if(object.type == 'LineLoop'){	feat = 'Polygon';
													coordinates.push([pos.getX( 0 ), -pos.getZ( 0 ), TR3.zM2T(pos.getY( 0 ))]);
													coordinates = [coordinates]}
					else if(object.type == 'Point'){feat = 'Point';}
					else{feat = 'LineString';}
					
					var TR3Color = object.material.color;
					var TR3Style = new ol.style.Style({
						fill: new ol.style.Fill({
							color: 'rgba(100, 100, 100, 0.2)'
						}),
						stroke: new ol.style.Stroke({
							color: [TR3Color.r*255, TR3Color.g*255, TR3Color.b*255, 1],
							width: 2
						})
					});
					
					var olFeat = new ol.Feature({
						geometry: new ol.geom[feat](coordinates)
					});
					olFeat.setStyle(TR3Style);
					LyrFeatsOri.getSource().addFeature(olFeat);
				}
				
			};
		}
	};