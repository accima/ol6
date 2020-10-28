/** 
 * @fileoverview Clase que realiza transformaciones entre sistemas de coordenadas
 * Basado en la librer&iacute;a jscoord.js de Jonathan Stott
 */
'use strict';
/**
 * 
 */
var wmsMap = new Object();
wmsMap.transCoord = function() {
	;
};

/**
 * Datum
 */
var  Datum_axis = { ED50: [6378388.000,  6356911.946 ],    // International 1924 - Hayford
                    WGS84: [6378137.000,  6356752.314 ],   // WGS84
                    ETRS89: [6378137.000,  6356752.314 ],  // GRS 1980
                    WGS72: [6378135.000,  6356750.520 ],   // WGS72
                    OSGB36: [6377563.396,  6356256.909 ]   // OSGB36
};

/**
 * Parametros de transformacion entre sistemas de referencia.
 */
var datToDat = {
	ETRS89toED50Pen: {tx:131.032,ty:100.251,tz:163.354,s:-0.00000939, rx:-0.0003455,ry:-0.0000054166,rz:-0.0003176666},
	ED50toETRS89Pen: {tx:-131.032,ty:-100.251,tz:-163.354,s:0.00000939, rx:0.0003455,ry:0.0000054166,rz:0.0003176666},
	ETRS89toED50Bal: {tx:181.4609,ty:90.2931,tz:187.1902,s:-0.00001757, rx:0.000039861,ry:0.000136722,rz:-0.000109306},
	ED50toETRS89Bal: {tx:-181.4609,ty:-90.2931,tz:-187.1902,s:0.00001757, rx:-0.000039861,ry:-0.000136722,rz:0.000109306},
	ETRS89toED50NWP: {tx:178.383,ty:83.172,tz:221.293,s:-0.0000212, rx:0.000150028,ry:-0.000147750,rz:-0.000035083},
	ED50toETRS89NWP: {tx:-178.383,ty:-83.172,tz:-221.293,s:0.0000212, rx:-0.000150028,ry:0.000147750,rz:0.000035083},
	WGS84toED50: {tx:89.5,ty:93.8,tz:123.1,s:-0.0000012, rx:0,ry:0,rz:-0.0000433},
	ED50toWGS84: {tx:-89.5,ty:-93.8,tz:-123.1,s:0.0000012, rx:0,ry:0,rz:0.0000433},
  OSGB36toWGS84: {tx:446.448,ty:-124.157,tz:542.060,s:-0.0000204894, rx:0.00004172222,ry:0.00006861111,rz:0.00023391666}
};
 
/**
 * Devuelve los parametros del elipsoide correspondiente al Datum indicado.
 * @param {Object} datum
 */
wmsMap.transCoord.getElipsoide = function(datum){
	var a = Datum_axis[datum][0];
	var b = Datum_axis[datum][1];
	var e2 = (a*a-b*b)/(a*a);
	
	return {a:a , b: b,  e2:e2};
};

/**
 * Transforma unas coordenadas entre diferentes sistemas de referencia.
 * @param {Object} c1 Coordenadas 'x' o longitud de entrada.
 * @param {Object} c2 Coordenada 'y' o latitud de entrada
 * @param {String} srsIn Sistema de referencia de entrada 'EPSG:xxx'.
 * @param {String} srsOut Sistema de referencia de salida 'EPSG:xxx'.
 */
wmsMap.transCoord.srsChange = function(c1,c2,srsIn, srsOut){

	var datum1 = this.getDatum(srsIn);
	var datum2 = this.getDatum(srsOut);
	
	//no hay cambio de datum
	if(datum1.datum == datum2.datum ){
		//No hay cambio de huso
		if(datum1.huso == datum2.huso){
			return {c1:c1,c2:c2};
		}
		//datum1 -> coordenadas geograficas
		else if(datum1.huso == ""){
			var coord = this.geoToUTM(c1, c2, datum1.datum, datum2.huso);
			return {c1:coord.x, c2:coord.y};
		}
		//datum2 -> Coordenadas geograficas
		else if(datum2.huso == ""){
			var coord = this.utmToGeo(c1, c2, datum1.datum, datum1.huso);
			return {c1:coord.lon, c2:coord.lat};
		}
		else{
			var latLon = this.utmToGeo(c1, c2, datum1.datum, datum1.huso);
			var coord = this.geoToUTM(latLon.lon, latLon.lat, datum1.datum, datum2.huso);
			return {c1:coord.x, c2:coord.y};
		}
	}
	//Hay cambio de datum
	else{
		//datum1 = coordenadas geograficas; datum2 = coordenadas geograficas; 
		if(datum1.huso == "" && datum2.huso == ""){
			var coord = this.changeDatum(c1, c2, datum1.datum, datum2.datum);
			return {c1:coord.lon, c2:coord.lat};
		}
		//datum1 = coordenadas geograficas; datum2 = coordenadas utm;
		else if(datum1.huso == "" && datum2.huso != ""){
			var coord = this.changeDatum (c1, c2, datum1.datum, datum2.datum);
			var coord1 = this.geoToUTM(coord.lon, coord.lat, datum2.datum, datum2.huso);
			return {c1:coord1.x, c2:coord1.y};
		}
		//datum1 = coordenadas utm; datum2 = coordenadas geograficas;
		else if(datum1.huso != "" && datum2.huso == ""){
			var coord = this.utmToGeo(c1, c2, datum1.datum, datum1.huso);
			var coord1 = this.changeDatum (coord.lon, coord.lat, datum1.datum, datum2.datum);
			return {c1:coord1.lon, c2:coord1.lat};
		}
		//datum1 = coordenadas utm; datum2 = coordenadas utm;
		else{
			var coord = this.utmToGeo(c1, c2, datum1.datum, datum1.huso);
			var coord1 = this.changeDatum (coord.lon, coord.lat, datum1.datum, datum2.datum);
			var coord2 = this.geoToUTM(coord1.lon, coord1.lat, datum2.datum, datum2.huso);
			return {c1:coord2.x, c2:coord2.y};
		}
	}
};

/**
 * Devuelve el nombre del datum y el huso si es utm.
 * @param {Object} srs Sistema de referencia 'EPSG:xxx'.
 */
wmsMap.transCoord.getDatum = function(srs){
	var n = srs.length;
	var datum="";
	var huso="";
	
	if (n==10){
		var proy = 'UTM';
		var code = srs.slice(5,8);

		if(code==326){
			datum='WGS84';
		}
		else if(code==230){
			datum='ED50';
		}
		else if(code==258){
			datum='ETRS89';
		}

		huso=srs.slice(-2);
	}
	else if(n==9){
		var proy = 'Lon-Lat';
		var code =srs.slice(5,9);
		if(code==4326){
			datum='WGS84';
		}
		else if(code==4230){
			datum='ED50';
		}
		else if(code==4258){
			datum='ETRS89';
		}
	}
	
	//if (datum == 'WGS84')datum='ETRS89';
	
	return { datum: datum, huso: huso, proy: proy};
};

/**
 * Devuelve el EPSG del sistema.
 * @param {Object} proy, datum, huso del Sistema de referencia.
 */
wmsMap.transCoord.getEPSG = function(proy,datum,huso){
	var EPSG;
	var refProy;
	var refDatum;
	var refHuso = huso;
	
	if(proy == 'UTM'){
		refProy = "";
	}else if(proy == 'Lon-Lat'){
		refProy = "4";
		refHuso = "";
	}
	if(datum == 'ETRS89'){
		refDatum = "258";
	}else if(datum == 'ED50'){
		refDatum = "230";
	}else if(datum == 'WGS84'){
		refDatum = "326";
	}
	EPSG = "EPSG:" + refProy + refDatum + refHuso;
	
	return{EPSG: EPSG}
}

wmsMap.transCoord.isGeo = function(srs) {

	var datum = wmsMap.transCoord.getDatum(srs);
	if ( datum.proy == 'Lon-Lat' ) return true;
	else return false;
		
};

wmsMap.transCoord.isUTM = function(srs) {

	var datum = wmsMap.transCoord.getDatum(srs);
	if ( datum.proy == 'UTM' ) return true;
	else return false;
		
};

/**
 * Transforma las coordenadas geograficas a UTM.
 * @param {Object} lon Longitud del punto
 * @param {Object} lat Latitud del punto
 * @param {String} datum Datum de la proyeccion
 * @param {Single} huso si se quiere obtener las coordenadas expandidas en 
 * otro huso se debe indicar este parametro. Si se omite se toma el huso correspondiente.
 * @return Coordenadas UTM
 */
wmsMap.transCoord.geoToUTM = function(lon, lat, datum, huso) {
  
	var UTM_F0   = 0.9996;
	var elipsoide = this.getElipsoide(datum);
	var a = elipsoide.a;
	var e2 = elipsoide.e2;
  
	var longitude = lon;
	var latitude = lat;
	
	var latitudeRad = latitude * (Math.PI / 180.0);
	var longitudeRad = longitude * (Math.PI / 180.0);
	if(huso){
		var longitudeZone = huso;
	}
	else{
		var longitudeZone = Math.floor((longitude + 180.0) / 6.0) + 1;
	}

	// Special zone for Norway
	if (latitude >= 56.0
		&& latitude < 64.0
		&& longitude >= 3.0
		&& longitude < 12.0) {
		longitudeZone = 32;
	}

	// Special zones for Svalbard
	if (latitude >= 72.0 && latitude < 84.0) {
		if (longitude >= 0.0 && longitude < 9.0) {
			longitudeZone = 31;
		} else if (longitude >= 9.0 && longitude < 21.0) {
			longitudeZone = 33;
		} else if (longitude >= 21.0 && longitude < 33.0) {
			longitudeZone = 35;
		} else if (longitude >= 33.0 && longitude < 42.0) {
			longitudeZone = 37;
		}
	}

	var longitudeOrigin = (longitudeZone - 1) * 6 - 180 + 3;
	var longitudeOriginRad = longitudeOrigin * (Math.PI / 180.0);

	ePrimeSquared = (e2) / (1 - e2);

	var n = a / Math.sqrt(1 - e2 * Math.sin(latitudeRad) * Math.sin(latitudeRad));
	var t = Math.tan(latitudeRad) * Math.tan(latitudeRad);
	var c = ePrimeSquared * Math.cos(latitudeRad) * Math.cos(latitudeRad);
	var A = Math.cos(latitudeRad) * (longitudeRad - longitudeOriginRad);

	var M = a * (  (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latitudeRad
               - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latitudeRad)
               + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latitudeRad)
               - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latitudeRad));

  var UTMEasting = (UTM_F0 * n * (A + (1 - t + c) * Math.pow(A, 3.0) / 6
        				 + (5 - 18 * t + t * t + 72 * c - 58 * ePrimeSquared) 
        				 * Math.pow(A, 5.0) / 120) + 500000.0);

  var UTMNorthing = (UTM_F0 * (M + n * Math.tan(latitudeRad)
          * (A * A / 2 + (5 - t + (9 * c) + (4 * c * c)) * Math.pow(A, 4.0) / 24
            + (61 - (58 * t) + (t * t) + (600 * c) - (330 * ePrimeSquared))
              * Math.pow(A, 6.0) / 720)));

	// Adjust for the southern hemisphere
	if (latitude < 0) {
		UTMNorthing += 10000000.0;
	}
	
	return {x: UTMEasting, y: UTMNorthing};
};

/**
 * Transforma las coordenadas UTM a geograficas.
 * @param {Object} x Coordenada x del punto
 * @param {Object} y Coordenada y del punto
 * @param {String} datum Datum de la proyeccion
 * @param {Single} huso si se quiere obtener las coordenadas expandidas en 
 * otro huso se debe indicar este parametro. Si se omite se toma el huso correspondiente.
 * @return Coordenadas Geograficas (latitud y longitud)
 */
wmsMap.transCoord.utmToGeo = function(x, y, datum, huso) {
	var UTM_F0   = 0.9996;
	var elipsoide = this.getElipsoide(datum);
	var a = elipsoide.a;
	var e2 = elipsoide.e2;
  
	var ePrimeSquared = e2 / (1.0 - e2);
	var e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
	var x = x - 500000.0;;
	var y = y;
	var zoneNumber = huso;

	var longitudeOrigin = (zoneNumber - 1.0) * 6.0 - 180.0 + 3.0;

	var m = y / UTM_F0;
	var mu = m / (a * (1.0 - e2 / 4.0 - 3.0 * e2 * e2 / 64.0 - 5.0 * Math.pow(e2, 3.0) / 256.0));

	var phi1Rad =
    mu
      + (3.0 * e1 / 2.0 - 27.0 * Math.pow(e1, 3.0) / 32.0) * Math.sin(2.0 * mu)
      + (21.0 * e1 * e1 / 16.0 - 55.0 * Math.pow(e1, 4.0) / 32.0)
        * Math.sin(4.0 * mu)
      + (151.0 * Math.pow(e1, 3.0) / 96.0) * Math.sin(6.0 * mu);

	var n =
    a
      / Math.sqrt(1.0 - e2 * Math.sin(phi1Rad) * Math.sin(phi1Rad));
	var t = Math.tan(phi1Rad) * Math.tan(phi1Rad);
	var c = ePrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
	var r =
    a
      * (1.0 - e2)
      / Math.pow(
        1.0 - e2 * Math.sin(phi1Rad) * Math.sin(phi1Rad),
        1.5);
	var d = x / (n * UTM_F0);

	var latitude = (
    phi1Rad
      - (n * Math.tan(phi1Rad) / r)
        * (d * d / 2.0
          - (5.0
            + (3.0 * t)
            + (10.0 * c)
            - (4.0 * c * c)
            - (9.0 * ePrimeSquared))
            * Math.pow(d, 4.0)
            / 24.0
          + (61.0
            + (90.0 * t)
            + (298.0 * c)
            + (45.0 * t * t)
            - (252.0 * ePrimeSquared)
            - (3.0 * c * c))
            * Math.pow(d, 6.0)
            / 720.0)) * (180.0 / Math.PI);

	var longitude = longitudeOrigin + (
    (d
      - (1.0 + 2.0 * t + c) * Math.pow(d, 3.0) / 6.0
      + (5.0
        - (2.0 * c)
        + (28.0 * t)
        - (3.0 * c * c)
        + (8.0 * ePrimeSquared)
        + (24.0 * t * t))
        * Math.pow(d, 5.0)
        / 120.0)
      / Math.cos(phi1Rad)) * (180.0 / Math.PI);
	  
	return {lon: longitude, lat: latitude };
};

/**
 * Transformación de coordenadas geodesicas a geoc&eacute;ntricas.
 * @param {Object} lon Longitud del punto
 * @param {Object} lat Latitud del punto
 * @param {Object} datumIn Datum de entrada
 * return Coordenadas geocentricas {z: x,y: y, z: z};
 */
wmsMap.transCoord.GeoToGeocentric = function(lon, lat, datumIn) {
	
		var elipsoide = this.getElipsoide(datumIn);
		var a = elipsoide.a;
		var b = elipsoide.b;
		var e2 = elipsoide.e2;
		
		var phi = wmsMap.oper.degToRad(lat);
		var lambda = wmsMap.oper.degToRad(lon);
		var v = a / (Math.sqrt(1 - e2 * wmsMap.oper.sin2(phi)));
		var H = 0; // Altura elipsoidal
		
		//Coordenadas geocentricas en el datum de partida:
		var x = (v + H) * Math.cos(phi) * Math.cos(lambda);
		var y = (v + H) * Math.cos(phi) * Math.sin(lambda);
		var z = ((1 - e2) * v + H) * Math.sin(phi);	
		return {x: x, y: y, z: z};
};

/**
 * Transformación de coordenadas geocentricas a geodésicas.
 * @param {Object} x Coodenada X en el datum origen
 * @param {Object} y Coodenada Y en el datum origen
 * @param {Object} z Coodenada Z en el datum origen
 * @param {Object} datumIn Datum de salida
 * return Coordenadas geodésicas en el datum de salida {lon: lambdaB,lat: phiB}
 */
wmsMap.transCoord.GeocentricToGeo = function(x, y, z, datumOut) {
		
		elipsoide = this.getElipsoide(datumOut);
		a = elipsoide.a;
		b = elipsoide.b;
		excen = elipsoide.e2;
		
		var lambdaB = wmsMap.oper.radToDeg(Math.atan(y / x));
		var p = Math.sqrt((x * x) + (y * y));
		var phiN = Math.atan(z / (p * (1 - excen)));
		for (var i = 1; i < 10; i++) {
			v = a / (Math.sqrt(1 - excen * wmsMap.oper.sin2(phiN)));
			phiN1 = Math.atan((z + (excen * v * Math.sin(phiN))) / p);
			phiN = phiN1;
		}
		
		var phiB = wmsMap.oper.radToDeg(phiN);
		
		return {lon: lambdaB,lat: phiB};		
};

/**
 * Transformación bursaWolf. Transformación entre dos sistemas de referencia
 * @param {Object} x Coodenada X en el datum origen
 * @param {Object} y Coodenada Y en el datum origen
 * @param {Object} z Coodenada Z en el datum origen
 * @param {Object} param Parametros de transformación entre los dos sistemas de referencia.
 		               param = { tx:tx[m], ty:ty[m], tz:tz[m], s:s, rx:rx[grados], ry:ry[grados], rz:rz[grados] };
 * return Coordenadas geocentricas en el datum de salida { x: xB, y: yB, z: zB}
 */
wmsMap.transCoord.bursaWolf = function(x, y, z, param) {
			
		var tx = param.tx;
		var ty = param.ty;
		var tz = param.tz;
		var s = param.s;
		var rx = wmsMap.oper.degToRad(param.rx);
		var ry = wmsMap.oper.degToRad(param.ry);
		var rz = wmsMap.oper.degToRad(param.rz);

	  var sin_f = Math.sin(ry);
	  var cos_f = Math.cos(ry);
	  var sin_w = Math.sin(rx);
	  var cos_w = Math.cos(rx);
	  var sin_k = Math.sin(rz);
	  var cos_k = Math.cos(rz);   
	  var m = 1 + s;
	  var r=[[],[],[]];
	  r[0][0] = m * (cos_f * cos_k);
	  r[1][0] = m * (-cos_f * sin_k);
	  r[2][0] = m * sin_f;
	  r[0][1] = m * (sin_w * sin_f * cos_k + cos_w * sin_k);
	  r[1][1] = m * (-sin_w * sin_f * sin_k + cos_w * cos_k);
	  r[2][1] = m * (-sin_w * cos_f);
	  r[0][2] = m * (-cos_w * sin_f * cos_k + sin_w * sin_k);
	  r[1][2] = m * (cos_w * sin_f * sin_k + sin_w * cos_k);
	  r[2][2] = m * (cos_w * cos_f);
  
		var xB = r[0][0]*x + r[0][1]*y + r[0][2]*z + tx;
		var yB = r[1][0]*x + r[1][1]*y + r[1][2]*z + ty;
		var zB = r[2][0]*x + r[2][1]*y + r[2][2]*z + tz;
		
		return { x: xB, y: yB, z: zB};
};

/**
 * Cambio de Datum.
 * @param {Object} lon Longitud del punto
 * @param {Object} lat Latitud del punto
 * @param {Object} datumIn Datum de entrada
 * @param {Object} datumOut Datum de salida
 */
wmsMap.transCoord.changeDatum = function(lon, lat, datumIn, datumOut) {
	
	// trata igual los 
	if ((datumIn == "ETRS89" && datumOut == "WGS84") || (datumOut == "ETRS89" && datumIn == "WGS84")) {
		return {lon: lon,lat: lat};
	}
	else {
		
		// Coordenadas geocentricas en el datum de partida
		gcIn = wmsMap.transCoord.GeoToGeocentric(lon, lat, datumIn);

		// Parametros de transformacion entre datums		
		var param = this.getParam(datumIn, datumOut,lon,lat);
		
		// Calculo de las coordenadas geocentricas en el nuevo datum
		gcOut = wmsMap.transCoord.bursaWolf(gcIn.x, gcIn.y, gcIn.z, param);	

		// Coordenadas geodesicas en el datum de salida
		gOut = wmsMap.transCoord.GeocentricToGeo(gcOut.x, gcOut.y, gcOut.z, datumOut);		
		
		return {lon: gOut.lon ,lat: gOut.lat };
	}
};

/**
 * Devuelve los parametros de transformacion seg&uacute;n el datum de entrada y de salida.
 * @param {Object} datumIn
 * @param {Object} datumOut
 */
wmsMap.transCoord.getParam = function(datumIn, datumOut,lon,lat){
	
	// Zonas para el cambio de ETRS89 a ED50
	// Noroeste Peninsula
	var xMinNWP = -9.416;
	var xMaxNWP = -4.5;
	var yMinNWP = 41.5;
	var yMaxNWP = 43.833;
	// Baleares
	var xMinBal = 1;
	var xMaxBal = 4.5;
	var yMinBal = 38.5;
	var yMaxBal = 40.3;
	//Resto peninsula
	var xMinPen = -10;
	var xMaxPen = 3.833;
	var yMinPen = 35.5;
	var yMaxPen = 44.833;
  var ETRS89toED50;
  var ED50toETRS89;
  
  if ( lon > xMinNWP && lon < xMaxNWP && lat > yMinNWP && lat < yMaxNWP ) {
  	// Noroeste Peninsula
    ETRS89toED50 = datToDat.ETRS89toED50NWP;
    ED50toETRS89 = datToDat.ED50toETRS89NWP; 
  } else if ( lon > xMinBal && lon < xMaxBal && lat > yMinBal && lat < yMaxBal ) {
    // Baleares
    ETRS89toED50 = datToDat.ETRS89toED50Bal;
    ED50toETRS89 = datToDat.ED50toETRS89Bal;
  } else if ( lon > xMinPen && lon < xMaxPen && lat > yMinPen && lat < yMaxPen ) {
    // Resto peninsular
    ETRS89toED50 = datToDat.ETRS89toED50Pen;
    ED50toETRS89 = datToDat.ED50toETRS89Pen;
  } else {
    // Resto mundo
    // Se utilizan los parametros de WGS84 a ED50
    ETRS89toED50 = datToDat.WGS84toED50;
    ED50toETRS89 = datToDat.ED50toWGS84;
  }
  
	if (datumIn=='ETRS89' && datumOut=='ED50')
		return ETRS89toED50;
	else if (datumIn=='ED50' && datumOut=='ETRS89')
		return ED50toETRS89;
	else if (datumIn=='WGS84' && datumOut=='ED50')
		return datToDat.WGS84toED50;
	else if (datumIn=='ED50' && datumOut=='WGS84')
		return datToDat.ED50toWGS84;
	else if(datumIn=='OSGB36' && datumOut=='WGS84')
		return datToDat.OSGB36toWGS84;
};

/**
 * Devuelve la latitud y la longitud de un punto en grados, minutos y segundos
 * @param {Object} longitud
 * @param {Object} latitud
 */
wmsMap.transCoord.getGradMinSeg = function(lon, lat){
	var lonMin = (Math.floor(lon)-lon)*60;
	var latMin = (Math.floor(lat)-lat)*60;
	var lonSeg = Math.floor((lonMin-Math.floor(lonMin))*60);
	var latSeg = Math.floor((latMin-Math.floor(latMin))*60);
	if (lon >= 0) {
		var longitud = Math.floor(lon) + '&ordm;' + Math.floor(Math.abs(lonMin)) + '\'' + Math.abs(lonSeg-59) + '\'\'';
		//var latitud = Math.floor(lat) + '&ordm;' + Math.floor(Math.abs(latMin)) + '\'' + Math.abs(latSeg-59) + '\'\'';
	}
	else{
		var longitud = '-' + Math.abs(Math.ceil(lon)) + '&ordm;' + Math.floor(lonMin+60) + '\'' + lonSeg + '\'\'';
		//var latitud = Math.ceil(lat) + '&ordm;' + Math.floor(latMin) + '\'' + latSeg + '\'\'';
	}
	var latitud = Math.floor(lat) + '&ordm;' + Math.floor(Math.abs(latMin)) + '\'' + Math.abs(latSeg-59) + '\'\'';
	return {lon:longitud,lat:latitud};
};

/**
 * Devuelve la latitud o la longitud de un punto en grados decimales
 * @param {Object} grados
 * @param {Object} minutos
 * @param {Object} segundos
 */
wmsMap.transCoord.getGradDeci = function(grad, min, seg){
	if(!grad){
		grad = 0
	}
	if(!min){
		min = 0
	}
	if(!seg){
		seg = 0
	}
	var grados = grad;
	var minutos = min;
	var segundos = seg;
	var gDeci = grados + minutos/60 + segundos/3600;
	return gDeci;
};

/**
 * Devuelve el area de un pol&iacute;gono.<br>
 * El &uacute;ltimo punto de la matriz puede ser coincidente con el primero o no. Para el c&aacute;lculo si no 
 * coinciden el punto inicial y final se duplica el primer punto para el c&aacute;lculo y se inserta al
 * final de la matriz.
 * @param {Array} matrixAux Matriz con las cordenadas del pol&iacute;gono.
 * @return superf Superficie.
 */
wmsMap.transCoord.getSuperficie = function(matrix,datum){
	var c;
	var vect=[];
	var matrixAux = [];
	
	//Se convierten las coordenadas geograficas a UTM.
	for(var i=0; i<matrix.length; i++){
		c = wmsMap.transCoord.geoToUTM(eval(matrix[i][0]),eval(matrix[i][1]),datum,30);
		var vect=[];
		vect[0]=c.x;
		vect[1]=c.y;
		matrixAux.push(vect); 
	}
	
	var superf=0;
	var n = matrixAux.length;

	if (matrixAux[0][0]==matrixAux[n-1][0] && matrixAux[0][1]==matrixAux[n-1][1] ){
		for(var j=0;j<n-1;j++){
    		superf +=((-matrixAux[j][0] * matrixAux[j + 1][1]) + (matrixAux[j + 1][0] * matrixAux[j][1]));
    	}
    	return	superf=Math.abs(superf/2);
	}
	else{
		for(var j=0;j<n-1;j++){
    	superf +=((-matrixAux[j][0] * matrixAux[j + 1][1]) + (matrixAux[j + 1][0] * matrixAux[j][1]));
    }
	
    superf +=((-matrixAux[n-1][0] * matrixAux[0][1]) + (matrixAux[0][0] * matrixAux[n-1][1]));
    return	superf=Math.abs(superf/2);
	}
};

/**
 * normalizeDegress devuelve las coordenadas entre +-90&ordm; y +-180&ordm;
 *
 * @param {Array} Vector que contiene las coordenadas de los bordes del mapa.
 * @return Vector con las coordenadas normalizadas.
 * @type Array
 */
wmsMap.transCoord.normalizeDegrees = function(arr){

	var max = [360,180];

	if(arr[0]<-max[0]){
		arr[0]+=max[0];
		arr[2]+=max[0];
	}
	if(arr[2]>max[0]){
		arr[2]-=max[0];
		arr[0]-=max[0];
	}
	if(arr[1]<-max[1]){
		arr[1]+=max[1];
		arr[3]+=max[1];
	}
	if(arr[3]>max[1]){
		arr[3]-=max[1];
		arr[1]-=max[1];
	}

	return arr;
};

/**
 * Retorna el huso del punto.
 * @param {Object} c1 Longitud o x del punto
 * @param {Object} c2 Latitud o y del punto
 * @param {String} srsIn srs
 * @return huso
 */
wmsMap.transCoord.geoZone = function(c1, c2, srsIn ) {
  var datum = this.getDatum(srsIn);
  
  if( datum.proy == 'UTM') {
  	var geo = this.srsChange(c1,c2,srsIn, "EPSG:4258");	
  } else {
  	var geo = {c1:c1, c2:c2};
  }
	var longitudeZone = Math.floor((geo.c1 + 180.0) / 6.0) + 1;
	return longitudeZone;
};

/**
 * Transformación mundo a pixel de canvas.
 * @param x, y, z Coordenadas 'x', 'y' y 'z' del punto en el terreno (metros).
 * @param {Array} coef Coeficientes de la transformación.
 * @param {int} ph foto izquierda(0) o derecha (1)
 * @return coordendas x,y en pantalla.
 * @type object
 */
wmsMap.transCoord.tw2c = function( x, y, z, coef, ph){
	var xcur,ycur;
	var pto = {};
	var ptc = {};
	if (coef.x00){
	  var dx = x - parseFloat(coef['x0'+ph]);
	  var dy = y - parseFloat(coef['y0'+ph]);
	  var dz = z - parseFloat(coef['z0'+ph]);
	  
	  daux = -parseFloat(coef['df'+ph]) / ( parseFloat(coef['r'+ph][2]) * dx + parseFloat(coef['r'+ph][5]) * dy + parseFloat(coef['r'+ph][8]) * dz );
	  
	  pto.x = ( parseFloat(coef['r'+ph][0]) * dx + parseFloat(coef['r'+ph][3]) * dy + parseFloat(coef['r'+ph][6]) * dz ) * daux;
	  pto.y = ( parseFloat(coef['r'+ph][1]) * dx + parseFloat(coef['r'+ph][4]) * dy + parseFloat(coef['r'+ph][7]) * dz ) * daux;
	  
	  ptc = wmsMap.tAfinDirect(pto,coef['tx'+ph],coef['ty'+ph],coef['r']);

	  var hMap = YAHOO.util.Dom.getStyle('contIzq','height');
	  if (hMap) ptc.y = parseInt(hMap) - ptc.y;
	}
	else{
		ptc.x = (coef[0+8*ph]*x*100+coef[1+8*ph])/(z*100+coef[2+8*ph])+coef[3+8*ph];
		ptc.y = (coef[4+8*ph]*y*100+coef[5+8*ph])/(z*100+coef[6+8*ph])+coef[7+8*ph];
	}	
	return ptc;
};

/**
 * Transformaci&oacute;n afin. 
 * Ejecuta la transformación directa
 * @param {object} pto Coordenadas x, y  de entrada.
 * @param {Int} tx Translaci&oacute;n en x
 * @param {Int} ty Translaci&oacute;n en y. 
 * @param {Array} vector con los componentes de la matriz de rotaci&oacute;n. En lugar
 *                de ser una matriz es un vector con todos los elementos consecutivos. 
 * @return coordendas x,y salida.
 * @type object
 */
wmsMap.tAfinDirect = function( pto, tx, ty, r ){
	var ptt={};
  ptt.x = parseFloat(r[0]) * pto.x + parseFloat(r[1]) * pto.y + parseFloat(tx);
  ptt.y = parseFloat(r[2]) * pto.x + parseFloat(r[3]) * pto.y + parseFloat(ty);
  
  return ptt;
};

 
/**
 * Transformaci&oacute;n afin. 
 * Ejecuta la transformación inversa
 * @param {object} pto Coordenadas x, y  de entrada.
 * @param {Int} tx Traslaci&oacute;n en x
 * @param {Int} ty Traslaci&oacute;n en y. 
 * @param {Array} vector con los componentes de la matriz de rotaci&oacute;n. En lugar
 *                de ser una matriz es un vector con todos los elementos consecutivos. 
 * @return coordendas x,y salida.
 * @type object
 */
wmsMap.tAfinInver = function( pto, tx, ty, r ){
  var x = pto.x;
  var y = pto.y;
  var ptt={};
  var det = r[0] * r[3] - r[2] * r[1];
  if ( det ) {
    ptt.x = (  parseFloat(r[3]) * x - parseFloat(r[1]) * y - parseFloat(r[3]) * tx + parseFloat(r[1]) * ty ) / det;
    ptt.y = ( -parseFloat(r[2]) * x + parseFloat(r[0]) * y - parseFloat(r[0]) * ty + parseFloat(r[2]) * tx ) / det;
  }
  return ptt;
};
