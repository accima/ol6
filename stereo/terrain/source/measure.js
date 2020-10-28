	'use strict';
	TR3.getDist = function( x1, y1, z1, x2, y2, z2 ) {
		
		var dist3D, distTerr, distAlt, dist2D;

		var dAlt = z2-z1;
		TR3.distAlt += dAlt;
		distAlt = TR3.formatMeasure( TR3.distAlt );
		
		var d2D = TR3.getCoordsDistance([x1,y1],[x2,y2]);//Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)+Math.pow(0-0,2))
		TR3.dist2D += d2D
		dist2D = TR3.formatMeasure( TR3.dist2D );
		
		TR3.dist3D += Math.sqrt(Math.pow(d2D,2)+Math.pow(dAlt,2));
		dist3D = TR3.formatMeasure( TR3.dist3D );
		
		var segments = TR3.setSegmentsByTerr(x1,y1,z1,x2,y2,z2,3);
		var segMod = segments[1];
		
		var segGeom = new Array();
		for(var i=0; i<segMod.length; i++){
			segGeom.push(new THREE.Vector3( segMod[i][0],segMod[i][1],segMod[i][2] ));
		}
		
		var material = {color: 0x00ff00};
		var vItem = { reload: false };
		var Line = TR3.makeVectFeat(segGeom, 'Line', material, vItem);
		TR3.scene.add( Line );
		
		TR3.distTerr += segments[0];
		distTerr = TR3.formatMeasure( TR3.distTerr );
		
		dist3D = {name:'Dist.3D', val:dist3D[0], unit: dist3D[1]};
		distTerr = {name:'Dist.terr', val:distTerr[0], unit: distTerr[1]};
		dist2D = {name:'Dist.2D', val:dist2D[0], unit: dist2D[1]};
		distAlt = {name:'Dif.alt', val:distAlt[0], unit: distAlt[1]};
		
		return [dist2D, dist3D, distTerr, distAlt];
	};
	
	TR3.getSurf = function( coords, thisLine ) {
		coords.push(coords[0]);
		var perim3D = 0;
		var perim2D = 0;
		var perimTerr = 0;
		var segGeomPeriTerr3d = new THREE.Geometry();
		var segGeomPeriTerr2d = new THREE.Geometry();
		//var segGeomRad = new THREE.Geometry();
		
		var coordOriMod = [coords[0][3],coords[0][4],coords[0][5]];

		for(var i=0;i<coords.length-1;i++){
			var x1=coords[i][0];
			var y1=coords[i][1];
			var z1=coords[i][2];
			var x2=coords[i+1][0];
			var y2=coords[i+1][1];
			var z2=coords[i+1][2];
			
			var segmentsPeri = TR3.setSegmentsByTerr( x1, y1, z1, x2, y2, z2, 3 );
			for(var j=0; j<segmentsPeri[1].length-1; j++){
				segGeomPeriTerr3d.vertices.push(new THREE.Vector3( segmentsPeri[1][j][0], segmentsPeri[1][j][1], segmentsPeri[1][j][2] ));
				segGeomPeriTerr2d.vertices.push(new THREE.Vector2( segmentsPeri[1][j][0], segmentsPeri[1][j][2] ));
			}
			
			/*if(i==0 || i==coords.length-2){}else{
				for(var j=0; j<segmentsPeri[1].length; j++){
					var segmentsRad = TR3.setSegmentsByTerr(coordOriMod[0], coordOriMod[1], coordOriMod[2], segmentsPeri[1][j][0], segmentsPeri[1][j][1], segmentsPeri[1][j][2], 1, true);
					for(var k=1; k<segmentsRad[1].length-1; k++){
						segGeomRad.vertices.push(new THREE.Vector3( segmentsRad[1][k][0], segmentsRad[1][k][1], segmentsRad[1][k][2] ));
					}
					var material = new THREE.LineBasicMaterial({
						color: 0x0000ff
					});
					
					var line2 = new THREE.Line( segGeomRad, material );
					TR3.scene.add( line2 );
					line2.reload = true;
					line2.magni = TR3.valuesSet.magnification;
					TR3.vGeom.item.unshift(line2);
					segGeomRad = new THREE.Geometry();
				}
			}*/
			
			perimTerr += segmentsPeri[0];
			
			var dAlt = z2-z1;
			var d2D = TR3.getCoordsDistance([x1,y1],[x2,y2]);
			perim2D += d2D;
			perim3D += Math.sqrt(Math.pow(d2D,2)+Math.pow(dAlt,2));

		}
		
		/*var geoSurf = new THREE.Geometry();
		geoSurf.mergeMesh( new THREE.Mesh(segGeomPeriTerr) );
		geoSurf.mergeMesh( new THREE.Mesh(segGeomRad) );
		geoSurf.mergeVertices(); // optional/*/
		
		var triangles = THREE.ShapeUtils.triangulateShape( segGeomPeriTerr2d.vertices, [] );
		
		for( var i = 0; i < triangles.length; i++ ){
			segGeomPeriTerr3d.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
		}
		
		var style = { color: "#ffffff", side: THREE.DoubleSide, transparent: true, opacity: 0.75 };
		var vItem = { reload: true };
		var fillMesh = TR3.makeMeshFeat( segGeomPeriTerr3d, "Basic",  style, vItem );
		TR3.scene.add( fillMesh );
	
		var pos = thisLine.geometry.getAttribute("position");
		var vLine2d = new THREE.Geometry();
		var vLine2dTR = new THREE.Geometry();
		var vLine3dTR = new THREE.Geometry();
		for(var i=0 ; i<thisLine.nPoint; i++){
			var vTerr =	TR3.coordM2T( pos.getX( i ), pos.getY( i ), pos.getZ( i ) );
			vLine2d.vertices.push( new THREE.Vector2( vTerr[0], vTerr[1] ) );
			vLine2dTR.vertices.push( new THREE.Vector2( pos.getX( i ), pos.getZ( i ) ) );
			vLine3dTR.vertices.push( new THREE.Vector3( pos.getX( i ), pos.getY( i ), pos.getZ( i ) ) );
		}
		var areaSurf2d = TR3.formatMeasure(Math.abs(THREE.ShapeUtils.area( vLine2d.vertices )), "surf");

		var triangles = THREE.ShapeUtils.triangulateShape( vLine2dTR.vertices, [] );
		var area3d = 0;
		var areaTer = 0;
		var volTer = 0;
		for( var i = 0; i < triangles.length; i++ ){
			vLine3dTR.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
			var va = vLine3dTR.vertices[vLine3dTR.faces[i].a];
			var vb = vLine3dTR.vertices[vLine3dTR.faces[i].b];
			var vc = vLine3dTR.vertices[vLine3dTR.faces[i].c];
			var t = new THREE.Triangle(va,vb,vc);
			
			area3d += Math.abs( t.getArea() );
			var geomTriangles = TR3.makeSubTriangles( [t], 3 );
			var metricsVol = TR3.getVolum( geomTriangles, fillMesh.id );
			areaTer += metricsVol[0];
			volTer += metricsVol[1];
		}

		var areaSurf3d = TR3.formatMeasure( area3d, "surf" );
		var areaSurfTer = TR3.formatMeasure( areaTer, "surf" );
		var volSurfTer = TR3.formatMeasure( volTer, "vol" );
		
		perim2D = TR3.formatMeasure(perim2D);
		perim3D = TR3.formatMeasure(perim3D);
		perimTerr = TR3.formatMeasure(perimTerr);
		
		var per2D, per3D, perTer, surf2D, surf3D, surfTer, volTer;
		per2D = {name:'Per.2D', val:perim2D[0], unit: perim2D[1]};
		per3D = {name:'Per.3D', val:perim3D[0], unit: perim3D[1]};
		perTer = {name:'Per.terr', val:perimTerr[0], unit: perimTerr[1]};
		
		surf2D = {name:'Surf.2D', val:areaSurf2d[0], unit: areaSurf2d[1]};
		surf3D = {name:'Surf.3D', val:areaSurf3d[0], unit: areaSurf3d[1]};
		surfTer = {name:'Surf.terr', val:areaSurfTer[0], unit: areaSurfTer[1]};
		
		volTer = {name:'Vol.terr', val:volSurfTer[0], unit: volSurfTer[1]};
		
		return [per2D, per3D, perTer, surf2D, surf3D, surfTer, volTer];
	};
	
	TR3.makeSubTriangles = function( triangles, multi ){
		var multip = multi || 1;
		var areaTarget = (TR3.tPixMesh*TR3.tPixMesh/2)/multip;
		var i = 0;
		var trianglesArr = new Array();
					
		var singleGeom = new THREE.Geometry();
		for(var i=0; i<triangles.length; i++){
			var Tarr = triangles[i];
			var centroid = new THREE.Vector3( (Tarr.a.x+Tarr.b.x+Tarr.c.x)/3, (Tarr.a.y+Tarr.b.y+Tarr.c.y)/3, (Tarr.a.z+Tarr.b.z+Tarr.c.z)/3 );
			var vertices = new Array();
			vertices.push(Tarr.a,Tarr.b,Tarr.c,Tarr.a);
			
			for(var j=0;j<vertices.length-1;j++){
				var vCent = centroid;
				var va = vertices[j];
				var vb = vertices[j+1];
				var vAB = new THREE.Vector3( (va.x+vb.x)/2, (va.y+vb.y)/2, (va.z+vb.z)/2 );
				
				var t1 = new THREE.Triangle(vCent,vAB,va);
				trianglesArr.push(t1);
				var geom1 = new THREE.Geometry();
				geom1.vertices.push(vCent);
				geom1.vertices.push(vAB);
				geom1.vertices.push(va);
				geom1.faces.push( new THREE.Face3( 0, 1, 2 ) );
				geom1.computeFaceNormals();
				
				var geomMesh1 = new THREE.Mesh( geom1 );
				geomMesh1.updateMatrix();
				singleGeom.merge(geomMesh1.geometry, geomMesh1.matrix);
				
				var t2 = new THREE.Triangle(vCent,vAB,vb);
				trianglesArr.push(t2);
				var geom2 = new THREE.Geometry();
				geom2.vertices.push(vCent);
				geom2.vertices.push(vAB);
				geom2.vertices.push(vb);
				geom2.faces.push( new THREE.Face3( 0, 1, 2 ) );
				geom2.computeFaceNormals();
				
				var geomMesh2 = new THREE.Mesh( geom2 );
				geomMesh2.updateMatrix();
				singleGeom.merge(geomMesh2.geometry, geomMesh2.matrix);
			}
			
		}
		
		if( Math.abs(trianglesArr[0].getArea()) > areaTarget ){
			return TR3.makeSubTriangles( trianglesArr, multip );
		}else{
			return singleGeom;
		}
	};
	
	TR3.getVolum = function( geomVol, baseMesh ){
		
		var style = { color: "#00ff00", side: THREE.DoubleSide, transparent: true, opacity: 0.75, wireframe: true };
		var vItem = { reload: true };
		var fillMesh = TR3.makeMeshFeat( geomVol, "Basic",  style, vItem );
		TR3.scene.add( fillMesh );
			
		var vert = fillMesh.geometry.vertices;
		var vertTerr = fillMesh.geometry.clone();
		for(var j=0 ; j<vert.length ; j++){
			var coords = TR3.getCoordsByXYmod( vert[j].x, vert[j].z );
			vert[j].y = coords[4];
			vertTerr.vertices[j].y = coords[2];
		}
		fillMesh.geometry.verticesNeedUpdate = true;
			
		TR3.scene.add(fillMesh);
		
		var areaTer = 0;
		var volTer = 0;
		for( var j = 0; j < vertTerr.faces.length; j++ ){
			var va = vertTerr.vertices[vertTerr.faces[j].a];
			var vb = vertTerr.vertices[vertTerr.faces[j].b];
			var vc = vertTerr.vertices[vertTerr.faces[j].c];
			var t3d = new THREE.Triangle(va,vb,vc);
			var area3d = Math.abs( t3d.getArea() );
			areaTer += area3d;
			
			var t2d = new THREE.Triangle(new THREE.Vector3( va.x, 0, va.z),new THREE.Vector3( vb.x, 0, vb.z),new THREE.Vector3( vc.x, 0, vc.z));
			var area2d = (Math.abs( t2d.getArea() ) + area3d)/2;
			
			
			var centroid = new THREE.Vector3( (va.x+vb.x+vc.x)/3, (va.y+vb.y+vc.y)/3, (va.z+vb.z+vc.z)/3 );
			var Hsurf = centroid.y;
			var mesh = TR3.scene.getObjectById( baseMesh );
			var CoordPeri = TR3.getCoordsByXYmod( centroid.x, centroid.z, mesh );
			var Hdif = Hsurf - CoordPeri[2];
			volTer += area2d * Hdif;
		}

		
		return [areaTer,volTer];
		
	};
	
	TR3.setSegmentsByTerr = function(x1,y1,z1,x2,y2,z2,multi,inv){
		var vMod= new Array();
		var vTerr = new Array();
		var cp2;
		if(inv==true){
			var XYZ1 = TR3.coordM2T(x1,y1,z1);
			x1=XYZ1[0];
			y1=XYZ1[1];
			z1=XYZ1[2];
			var XYZ2 = TR3.coordM2T(x2,y2,z2);
			x2=XYZ2[0];
			y2=XYZ2[1];
			z2=XYZ2[2];
		};
		var nSegX =  Math.ceil( Math.abs( (x2-x1)/TR3.tPixMesh ) );
		var nSegY =  Math.ceil( Math.abs( (y2-y1)/TR3.tPixMesh ) );
		var nSeg = Math.max(nSegX, nSegY)*multi;  //multi=3 mejor ajuste
		var distTerr = 0;
		
		var sizeSegX = (x2-x1)/nSeg;
		var sizeSegY = (y2-y1)/nSeg;
		
		for(var j=0; j<nSeg; j++){
			
			var xp1 = x1 + sizeSegX*j;
			var yp1 = y1 + sizeSegY*j;
			var cp1 = TR3.getCoordsByXYmod(xp1,-yp1);
			
			vMod.push([cp1[3], cp1[4], cp1[5]]);
			vTerr.push([cp1[0], cp1[1], cp1[2]]);
			
			var xp2 = x1 + sizeSegX*(j+1);
			var yp2 = y1 + sizeSegY*(j+1);
			cp2 = TR3.getCoordsByXYmod(xp2,-yp2);
			
			var alt = cp2[2]-cp1[2];
			var dist = TR3.getCoordsDistance([cp1[0],cp1[1]],[cp2[0],cp2[1]]);

			distTerr += Math.sqrt(Math.pow(dist,2)+Math.pow(alt,2));

			//distTerr += Math.sqrt(Math.pow(cp2[0]-cp1[0],2)+Math.pow(cp2[1]-cp1[1],2)+Math.pow(cp2[2]-cp1[2],2));
		}
		
		if(cp2 != null){
			vMod.push([cp2[3], cp2[4], cp2[5]]);
			vTerr.push([cp2[0], cp2[1], cp2[2]]);
		}

		return [distTerr, vMod, vTerr];
	}
	
	TR3.getCoordsDistance = function(firstPoint, secondPoint, sourceProj, sphereProj) {
		var dist;
		if( ol ){
			var sphProj = sphereProj || 'EPSG:4326';
			var thisProj = sourceProj || TR3.srsImg;
		
			var c1 = ol.proj.transform(firstPoint, thisProj, sphProj);
			var c2 = ol.proj.transform(secondPoint, thisProj, sphProj);
		
			var dist = ol.sphere.getDistance(c1,c2);
		}else{ dist = Math.sqrt(Math.pow(cp2[0]-cp1[0],2)+Math.pow(cp2[1]-cp1[1],2)); }
		return dist;
	}
	
	TR3.formatMeasure = function(length,type) {
		var unit;
		var absLength
		if(type == "surf"){
			absLength=Math.abs(length);
			if (absLength > 1000000) {
				length = Math.round(length / 1000000 * 1000) / 1000;
				unit = 'km2'
			} else {
				length = Math.round(length * 100) / 100;
				unit = 'm2'
			}
		}else if(type == "vol"){
			absLength=Math.abs(length);
			if (absLength > 1000000000) {
				length = Math.round(length / 1000000000 * 1000) / 1000;
				unit = 'km3'
			} else {
				length = Math.round(length * 100) / 100;
				unit = 'm3'
			}
		}else{//dist
			absLength=Math.abs(length);
			if (absLength > 1000) {
				length = Math.round(length / 1000 * 1000) / 1000;
				unit = 'km'
			} else {
				length = Math.round(length * 100) / 100;
				unit = 'm'
			}
		}
		
		return [length,unit];
	}