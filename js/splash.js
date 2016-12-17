// Copyright 2016, University of Colorado Boulder
/**
 <!--
 Subtract off half the image width and height to center it.
 Additionally, move the entire image up by a bit.  This is done by changing the top margin to be lower than 50%

 The logo dimensions are given in splash.svg, currently at width='273.172px' height='130.05px'
 -->
 <div id='splash-container' class='hidden'>
 <img id='splash'>
 <div id='progressBar' style='width:273px;height:10px'>
 <svg>
 <rect id='progressBarBackground' x='0' y='10' width='273' height='10' rx='3' ry='3'
 style='stroke: white;stroke-width:1'></rect>
 <rect id='progressBarForeground' x='0' y='10' width='0' height='10' rx='3' ry='3' style='fill:#6acef5;'></rect>
 </svg>
 </div>
 </div>
 **/

(function() {
  'use strict';

  function centerDiv( div, splashImg ) {
    var currentWidth = splashImg.width;
    var currentHeight = splashImg.height;

    var availableHeight = window.innerHeight;
    var availableWidth = window.innerWidth;

    var scaleX = availableWidth / currentWidth;
    var scaleY = availableHeight / currentHeight;

    var scale = Math.min( scaleX, scaleY );
    scaleX = scale / 5.5;
    scaleY = scale / 5.5;

    var translationX = Math.round( (availableWidth - currentWidth * scaleX) / 2 );
    var translationY = Math.round( (availableHeight - currentHeight * scaleY) / 2 );

    div.style.position = 'fixed';
    div.style.left = '0px';
    div.style.top = '0px';
    div.style[ '-webkit-transform' ] = 'translate(' + translationX + 'px, ' + translationY + 'px) ' + 'scale3d(' + scaleX + ', ' + scaleY + ', 1)';
    div.style[ '-webkit-transform-origin' ] = '0 0';

    div.style[ '-ms-transform' ] = 'translate(' + translationX + 'px, ' + translationY + 'px) ' + 'scale3d(' + scaleX + ', ' + scaleY + ', 1)';
    div.style[ '-ms-transform-origin' ] = '0 0';

    div.style[ 'transform' ] = 'translate(' + translationX + 'px, ' + translationY + 'px) ' + 'scale3d(' + scaleX + ', ' + scaleY + ', 1)';
    div.style[ 'transform-origin' ] = '0 0';
  }

  function initialize() {

    var xmlns = 'http://www.w3.org/2000/svg';

    var div = document.createElement( 'div' );

    var splashImage = document.createElement( 'img' );
    splashImage.style.display = 'block';
    splashImage.setAttribute( 'id', 'splash' );

    window.hellothere = splashImage;

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

    var svg = document.createElementNS( xmlns, 'svg' );
    var progressBarBackground = document.createElementNS( xmlns, 'rect' );
    progressBarBackground.setAttribute( 'id', 'progressBarBackground' );
    progressBarBackground.setAttribute( 'x', '0' );
    progressBarBackground.setAttribute( 'y', '10' );
    progressBarBackground.setAttribute( 'width', '273' );
    progressBarBackground.setAttribute( 'height', '10' );
    progressBarBackground.setAttribute( 'rx', '3' );
    progressBarBackground.setAttribute( 'ry', '3' );
    progressBarBackground.setAttribute( 'style', 'stroke: white;stroke-width:1' );

    var progressBarForeground = document.createElementNS( xmlns, 'rect' );
    progressBarForeground.setAttribute( 'id', 'progressBarForeground' );
    progressBarForeground.setAttribute( 'x', '0' );
    progressBarForeground.setAttribute( 'y', '10' );
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

  }

  initialize();

})();