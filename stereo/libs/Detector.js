/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */
'use strict';
 /*function OperSystem() {
	var OS = true;
	
	/*if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OS=//"Windows 8";
	if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OS=//"Windows 7";
	if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OS=//"Windows Vista";
	if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OS=//"Windows XP";
	if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OS=//"Windows 2000";
	if (window.navigator.userAgent.indexOf("Mac")!=-1) OS="Mac/iOS";
	if (window.navigator.userAgent.indexOf("X11")!=-1) OS="UNIX";
	if (window.navigator.userAgent.indexOf("Linux")!=-1) OS="Linux";*/
	
	/*if (window.navigator.userAgent.indexOf("Windows NT 5") != -1) OS = false;
	
	return OS;

}*/

function isIE () {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : 100;
}

var Detector = {

	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () {
					if (window.navigator.userAgent.indexOf("Windows NT 5") != -1 || isIE () < 10){
						return false; 
					}else{
						try {
							var canvas = document.createElement( 'canvas' );
							return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
						} catch( e ) {
							return false;
						}
					}
				}
			)(),
	
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage: function () {

		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		if ( ! this.webgl ) {

			element.innerHTML = window.WebGLRenderingContext ? [
				'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join( '\n' ) : [
				'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join( '\n' );

		}

		return element;

	},

	addGetWebGLMessage: function ( parameters ) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = Detector.getWebGLErrorMessage();
		element.id = id;

		parent.appendChild( element );

	}

};