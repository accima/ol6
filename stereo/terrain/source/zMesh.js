	'use strict';
	TR3.assignZmesh = function(){
		
		var arrayZ = TR3.arrayZ;
		var zMin = arrayZ[0]; 
		var zMax = arrayZ[0];
		
		for(var i=0 ; i<arrayZ.length ; i++){
			if(arrayZ[i] < zMin){zMin = arrayZ[i];}
			if(arrayZ[i] > zMax){zMax = arrayZ[i];}
		}
		
		var zGreedH = TR3.reducMeshH+1;
		var zGreedW = TR3.reducMeshW+1;
		var posZ = Math.round(zGreedH/2)*zGreedW+Math.round(zGreedW/2);//F/2*C+C/2
		
		TR3.zMed = arrayZ[posZ];
		TR3.zMax = zMax;
		TR3.zMin = zMin;
		
		var pos = TR3.mesh.geometry.getAttribute("position");
		for(var i=0 ; i<arrayZ.length ; i++){
			//zTerr0 = arrayZ[i];
			//zPix[i] = TR3.GetGeo2pix(zTerr0);
			//TR3.mesh.geometry.vertices[i].z = arrayZ[i]*TR3.valuesSet.magnification - TR3.zMed*TR3.valuesSet.magnification;//zPix[i]*TR3.valuesSet.magnification;
			//TR3.mesh.geometry.verticesNeedUpdate = true;
			pos.setZ( i, (arrayZ[i] - TR3.zMed)*TR3.valuesSet.magnification ); //= (arrayZ[i] - TR3.zMed)*TR3.valuesSet.magnification
		}

		TR3.renderScene();

		pos.needsUpdate = true;
		TR3.mesh.geometry.computeVertexNormals();
		
		
		if(TR3.newMeshMap == 1){
			TR3.onCompleteMap();
		}else{
			TR3.loadingDiv.style.display = 'none';
		}
		
	};
	
	TR3.obtainZmeshWCS = function(widthDTM,heightDTM,bboxDTM0,bboxDTM1,bboxDTM2,bboxDTM3,srsDTM){
		if (TR3.requestDTMwcs) {
			TR3.requestDTMwcs.abort();
		}
		
		TR3.requestDTMwcs = new XMLHttpRequest();
		var tPixMesh = TR3.tPixMesh;
		var nameLayer = 1000;
		
		if(tPixMesh>1000){
		
		}else if(tPixMesh<1000 && tPixMesh>=500){
			var nameLayer = 1000;
		}else if(tPixMesh<500 && tPixMesh>=200){
			var nameLayer = 200;
		}else if(tPixMesh<200 && tPixMesh>=25){
			var nameLayer = 25;
		}else{
			var nameLayer = 5;
		}
		TR3.requestDTMwcs.open('GET', 'https://servicios.idee.es/wcs-inspire/mdt?SERVICE=WCS&REQUEST=GetCoverage&VERSION=1.0.0&FORMAT=ArcGrid&CRS='+srsDTM+'&BBOX='+bboxDTM0+','+bboxDTM1+','+bboxDTM2+','+bboxDTM3+'&WIDTH='+widthDTM+'&HEIGHT='+heightDTM+'&COVERAGE=Elevacion25830_'+nameLayer);
		TR3.requestDTMwcs.onload = function() {
			var txtDTMwcs = TR3.requestDTMwcs.responseText;
			var str = '\n ';
			if(txtDTMwcs.indexOf(str) != -1){
				var zConteint = txtDTMwcs.slice(txtDTMwcs.indexOf(str)+str.length);
			
				var sinSalto = zConteint.replace(/\r\n/g, " ");
				var sinFin = sinSalto.slice(0,sinSalto.length-1);
				var arrayZ = sinFin.split(" ");
				var lengthDTM = widthDTM*heightDTM; //vienen filas de más...
				var evalZ;
				if(arrayZ.length<100){
					//alert("WCS no load, trying DTM alternative");
					TR3.obtainZmeshRtr(widthDTM,heightDTM,bboxDTM0,bboxDTM1,bboxDTM2,bboxDTM3,srsDTM);
				}else{
					for(var i=0 ;i<lengthDTM; i++){
						TR3.arrayZ[i] = evalZ = eval(arrayZ[i]);
						if(evalZ < -1000 || evalZ > 4000){
							TR3.arrayZ[i] = 0;
						}
					}
					TR3.assignZmesh();
				}
			}else{
				if(TR3.loadingDiv.style.display == 'block'){//asincrono...
					alert("WCS no load, trying DTM alternative");
				}
			}
			TR3.requestDTMwcs = false;
		}
		
		TR3.requestDTMwcs.send();
	};
	
	TR3.obtainZmeshRtr = function(widthDTM,heightDTM,bboxDTM0,bboxDTM1,bboxDTM2,bboxDTM3,srsDTM){
		
		var imgDTMconteint = new Image();
		imgDTMconteint.onload = function() {
			var j = 0;
			
			var canvasDTMrtr = document.getElementById('canvasDTMrtr');
			if(!canvasDTMrtr){
				canvasDTMrtr = document.createElement('CANVAS');
				canvasDTMrtr.id = 'canvasDTMrtr';
			}
			
			canvasDTMrtr.setAttribute('width',widthDTM);
			canvasDTMrtr.setAttribute('height',heightDTM);
			
			//document.body.appendChild(canvasDTMrtr);
			//this.addObjToResize(canvas.id);
			var ctxDTMrtr = canvasDTMrtr.getContext("2d"); 
			ctxDTMrtr.drawImage(imgDTMconteint, 0, 0, widthDTM, heightDTM);
			
			var imageData = ctxDTMrtr.getImageData(0,0,widthDTM,heightDTM);
			var pixels = imageData.data;
			for (var i = 0, il = pixels.length; i < il; i+= 4) {
				//TR3.arrayZ[j] = (pixels[i+0]*1024 + pixels[i+1]*32 + pixels[i+2])*2/8;
				var arrayZ;
				TR3.arrayZ[j] = arrayZ = pixels[i+0]*256 + ((pixels[i+1])*(2047-31.875)/255 ) + pixels[i+2]/8;
				if(arrayZ < -1000 || arrayZ > 4000){
					TR3.arrayZ[j] = 0;
				}
				j++;
			}
			TR3.assignZmesh();

		};
		imgDTMconteint.crossOrigin="anonymus";
		
		//imgDTMconteint.src = 'http://sintetico.sigrid3d.com/SgdWms/SgdWms.dll/WMS?&VERSION=1.1.1&REQUEST=GetMap&LAYERS=DTM_espana_5m_etrs89&FORMAT=image/bmp&SRS='+srsDTM+'&BBOX='+bboxDTM0+','+bboxDTM1+','+bboxDTM2+','+bboxDTM3+'&EXCEPTIONS=application/vnd.ogc.se_inimage&WIDTH='+widthDTM+'&HEIGHT='+heightDTM;
		//imgDTMconteint.src = 'http://www.ign.es/3d-stereo/sintetico/SgdWms.dll/WMS?&VERSION=1.1.1&REQUEST=GetMap&LAYERS=DTM_espana_5m_etrs89&FORMAT=image/bmp&SRS='+srsDTM+'&BBOX='+bboxDTM0+','+bboxDTM1+','+bboxDTM2+','+bboxDTM3+'&EXCEPTIONS=application/vnd.ogc.se_inimage&WIDTH='+widthDTM+'&HEIGHT='+heightDTM;
		imgDTMconteint.src = 'http://www.ign.es/3d-stereo/sintetico/SgdWms.dll/WMS?&VERSION=1.1.1&REQUEST=GetMap&LAYERS=DTM_espana_5m_etrs89&FORMAT=image/bmp&SRS='+srsDTM+'&BBOX='+bboxDTM0+','+bboxDTM1+','+bboxDTM2+','+bboxDTM3+'&WIDTH='+widthDTM+'&HEIGHT='+heightDTM;
	};
	
	TR3.makeZmesh = function(){
	
		var arrZ;
		var widthDTM = TR3.reducMeshW + 1;
		var heightDTM = TR3.reducMeshH + 1;
		
		var bboxDTM0 = eval(TR3.bboxImgOri[0])-TR3.tPixMesh/2;
		var bboxDTM1 = eval(TR3.bboxImgOri[1])-TR3.tPixMesh/2;
		var bboxDTM2 = eval(TR3.bboxImgOri[2])+TR3.tPixMesh/2;
		var bboxDTM3 = eval(TR3.bboxImgOri[3])+TR3.tPixMesh/2;
		var srsDTM = TR3.srsImg;
		TR3.arrayZ = [];
		
		arrZ = TR3.obtainZmeshWCS(widthDTM,heightDTM,bboxDTM0,bboxDTM1,bboxDTM2,bboxDTM3,srsDTM);
	};
	
	TR3.setMagniValues = function(magn){
	
		var magniB4 = TR3.valuesSet.magnification;
		
		if(!isNaN(parseFloat(magn))){
			TR3.valuesSet.magnification = Math.round(magn);
		}else{
			var zoom = TR3.tPixMesh;
			var magni = Math.round(TR3.rectaValue(7000,11,5,1,zoom));
			
			var bigZ = Math.abs(TR3.zMax - TR3.zMin);
			var bigX = Math.abs(TR3.bboxImgOri[2] - TR3.bboxImgOri[0]);
			var bigY = Math.abs(TR3.bboxImgOri[3] - TR3.bboxImgOri[1]);
			var bigXY;
			
			if(bigX - bigY > 0){bigXY=bigX;
			}else{bigXY=bigY;}
			
			TR3.valuesSet.magnification = magni;
			if( bigXY/bigZ <= 25 ){TR3.valuesSet.magnification = magni/4;}
			if( zoom < 90 || TR3.valuesSet.magnification<1 ){TR3.valuesSet.magnification = 1;}
		}
		
		if(magniB4 != magn && TR3.newMeshMap == 0 && TR3.widthImg){
			//document.getElementById('loadingTerrain').style.display = 'block';
			TR3.assignZmesh();
			TR3.assignZgeometries();
			TR3.newDraw = -1;
		}
		
		return TR3.valuesSet.magnification;
	};