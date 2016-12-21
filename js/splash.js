// Copyright 2016, University of Colorado Boulder

/**
 * Shows the splash screen and loading progress bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
(function() {
  'use strict';

  // Overall scale factor for the image + progress bar, matched empirically to desired size
  var SCALE_FACTOR = 1.0 / 4.0 * 1.042;
  var XML_NAMESPACE = 'http://www.w3.org/2000/svg';

  function centerDiv( div, splashImg ) {
    var currentWidth = splashImg.width;
    var currentHeight = splashImg.height;

    var availableHeight = window.innerHeight;
    var availableWidth = window.innerWidth;

    var scaleX = availableWidth / currentWidth;
    var scaleY = availableHeight / currentHeight;

    var scale = Math.min( scaleX, scaleY ) * SCALE_FACTOR;

    var translationX = Math.round( (availableWidth - currentWidth * scale) / 2 );
    var translationY = Math.round( (availableHeight - currentHeight * scale) / 2 );

    div.style.position = 'fixed';
    div.style.left = '0px';
    div.style.top = '0px';
    div.style[ '-webkit-transform' ] = 'translate(' + translationX + 'px, ' + translationY + 'px) ' + 'scale3d(' + scale + ', ' + scale + ', 1)';
    div.style[ '-webkit-transform-origin' ] = '0 0';

    div.style[ '-ms-transform' ] = 'translate(' + translationX + 'px, ' + translationY + 'px) ' + 'scale3d(' + scale + ', ' + scale + ', 1)';
    div.style[ '-ms-transform-origin' ] = '0 0';

    div.style[ 'transform' ] = 'translate(' + translationX + 'px, ' + translationY + 'px) ' + 'scale3d(' + scale + ', ' + scale + ', 1)';
    div.style[ 'transform-origin' ] = '0 0';
  }

  var div = document.createElement( 'div' );

  var splashImage = document.createElement( 'img' );
  splashImage.style.display = 'block';
  splashImage.setAttribute( 'id', 'splash' );

  // Identify the brand (assume generated brand if not provided with query parameters)
  var brandMatch = location.search.match( /brand=([^&]+)/ );
  var brand = brandMatch ? decodeURIComponent( brandMatch[ 1 ] ) : 'adapted-from-phet';

  // Wait until the image has loaded so that everything appears at once.
  // Without this, the loading bar appears long before the splash image
  splashImage.onload = function() {

    centerDiv( div, splashImage );

    // TODO: make sure the body did not already have such a div (if stored from Chrome=>save as or iOS Reading Mode).
    document.body.appendChild( div );

    window.addEventListener( 'resize', function() {
      centerDiv( div, splashImage );
    } );

    window.addEventListener( 'load', function() {
      centerDiv( div, splashImage );
    } );
  };

  var progressBarDiv = document.createElement( 'div' );
  progressBarDiv.setAttribute( 'id', 'progressBar' );
  progressBarDiv.setAttribute( 'style', 'width:273px;height:10px' );
  progressBarDiv.style.display = 'block';

  var progressBarY = '25';

  var svg = document.createElementNS( XML_NAMESPACE, 'svg' );
  var progressBarBackground = document.createElementNS( XML_NAMESPACE, 'rect' );
  progressBarBackground.setAttribute( 'id', 'progressBarBackground' );
  progressBarBackground.setAttribute( 'x', '0' );
  progressBarBackground.setAttribute( 'y', progressBarY );
  progressBarBackground.setAttribute( 'width', '273' );
  progressBarBackground.setAttribute( 'height', '10' );
  progressBarBackground.setAttribute( 'rx', '3' );
  progressBarBackground.setAttribute( 'ry', '3' );
  progressBarBackground.setAttribute( 'style', 'stroke: white;stroke-width:1' );

  var progressBarForeground = document.createElementNS( XML_NAMESPACE, 'rect' );
  progressBarForeground.setAttribute( 'id', 'progressBarForeground' );
  progressBarForeground.setAttribute( 'x', '0' );
  progressBarForeground.setAttribute( 'y', progressBarY );
  progressBarForeground.setAttribute( 'width', '0' );
  progressBarForeground.setAttribute( 'height', '10' );
  progressBarForeground.setAttribute( 'rx', '3' );
  progressBarForeground.setAttribute( 'ry', '3' );
  progressBarForeground.setAttribute( 'style', 'fill:#6acef5;' );

  svg.appendChild( progressBarBackground );
  svg.appendChild( progressBarForeground );
  div.appendChild( splashImage );
  div.appendChild( svg );

  // Load the desired splash screen image
  splashImage.src = '../brand/' + brand + '/images/splash.svg';
})();