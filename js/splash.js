// Copyright 2016-2019, University of Colorado Boulder
/* eslint-disable bad-sim-text */

/**
 * Shows the splash screen and loading progress bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
( function() {
  'use strict';

  // Overall scale factor for the image + progress bar, matched empirically to desired size
  var SCALE_FACTOR = 1.0 / 4.0 * 1.042;
  var XML_NAMESPACE = 'http://www.w3.org/2000/svg';
  var SPLASH_CONTAINER_ID = 'splash-container';
  var PROGRESS_BAR_Y = 25; // {string} Vertical offset of progress bar from splash logo
  var POSITION_Y = 0.435; // Center the content above the middle of the screen because it looks better that way.

  // Store the initial width and height to use for layout in case it changes, see
  // https://github.com/phetsims/joist/issues/407
  var splashImageWidth = 0;
  var splashImageHeight = 0;

  /**
   * Scale and position the given div, using the dimensions of the image for sizing.
   * @param {Element} div - the div to position
   * @param {HTMLImageElement} splashImg - the image to use for determining scale factor.  Not as exact as using the full
   *                                     - container div, but that dimension is not available on startup.
   */
  function positionDiv( div, splashImg ) {
    if ( splashImageWidth === 0 && splashImageHeight === 0 ) {
      splashImageWidth = splashImg.width;
      splashImageHeight = splashImg.height;
    }
    var currentWidth = splashImageWidth;
    var currentHeight = splashImageHeight;

    var availableHeight = window.innerHeight;
    var availableWidth = window.innerWidth;

    var scaleX = availableWidth / currentWidth;
    var scaleY = availableHeight / currentHeight;

    var scale = Math.min( scaleX, scaleY ) * SCALE_FACTOR;

    // use Math.round because this is a preload
    var translationX = Math.round( ( availableWidth - currentWidth * scale ) / 2 );
    var translationY = Math.round( ( availableHeight - currentHeight * scale ) * POSITION_Y );

    // Position the div using CSS
    var transformString = 'translate(' + translationX + 'px, ' + translationY + 'px) ' + 'scale3d(' + scale + ', ' + scale + ', 1)';
    div.style[ '-webkit-transform' ] = transformString;
    div.style[ '-ms-transform' ] = transformString;
    div.style.transform = transformString;
  }

  // Create the main container div, which will hold the splash image and progress bar
  var div = document.createElement( 'div' );
  div.id = SPLASH_CONTAINER_ID;
  div.style.position = 'fixed';
  div.style.left = '0px';
  div.style.top = '0px';
  div.style[ '-webkit-transform-origin' ] = '0 0';
  div.style[ '-ms-transform-origin' ] = '0 0';
  div.style[ 'transform-origin' ] = '0 0';

  // Create the splash image, which is an SVG logo
  var splashImage = document.createElement( 'img' );
  splashImage.style.display = 'block';

  // alt tag required for accessibility purposes, see https://github.com/phetsims/joist/issues/490
  splashImage.alt = '';

  // Closure which binds the values to positionDiv, which can be used as a listener reference.
  var adjustPosition = function() {
    positionDiv( div, splashImage );
  };

  // Wait until the image has loaded so that everything appears at once.
  // Without this, the loading bar appears long before the splash image
  splashImage.onload = function() {

    // Center before showing so it appears at the correct location.
    adjustPosition();

    window.addEventListener( 'resize', adjustPosition );
    window.addEventListener( 'load', adjustPosition );

    // Make sure the body did not already have such a div (if Chrome=>save as iOS Reading Mode saved a copy of the DOM).
    var previousSplashContainer = document.getElementById( SPLASH_CONTAINER_ID );
    previousSplashContainer && previousSplashContainer.parentNode.removeChild( previousSplashContainer );

    // After creating and positioning the div, add it to the body.  This could show in the wrong position if the image
    // dimensions are 0x0, see https://github.com/phetsims/joist/issues/408
    document.body.appendChild( div );
  };

  // Create the progress bar
  var progressBarDiv = document.createElement( 'div' );
  progressBarDiv.setAttribute( 'style', 'width:273px;height:10px' );
  progressBarDiv.style.display = 'block';

  var svg = document.createElementNS( XML_NAMESPACE, 'svg' );
  svg.style[ 'margin-left' ] = '-1px'; // compensates for the offset of x=1
  var progressBarBackground = document.createElementNS( XML_NAMESPACE, 'rect' );
  progressBarBackground.setAttribute( 'id', 'progressBarBackground' );
  progressBarBackground.setAttribute( 'x', '1' ); // prevent clipping on the left side, see https://github.com/phetsims/joist/issues/400
  progressBarBackground.setAttribute( 'y', PROGRESS_BAR_Y + '' );
  progressBarBackground.setAttribute( 'width', '273' );
  progressBarBackground.setAttribute( 'height', '10' );
  progressBarBackground.setAttribute( 'rx', '3' );
  progressBarBackground.setAttribute( 'ry', '3' );
  progressBarBackground.setAttribute( 'style', 'stroke: white;stroke-width:1' );

  // The progress bar foreground begins with a width of 0 and grows to the right.  It is updated incrementally during
  // the startup sequence in Sim.js
  var progressBarForeground = document.createElementNS( XML_NAMESPACE, 'rect' );
  progressBarForeground.setAttribute( 'id', 'progressBarForeground' );
  progressBarForeground.setAttribute( 'x', '1' ); // prevent clipping on the left side, see https://github.com/phetsims/joist/issues/400
  progressBarForeground.setAttribute( 'y', PROGRESS_BAR_Y + '' );
  progressBarForeground.setAttribute( 'width', '0' );
  progressBarForeground.setAttribute( 'height', '10' );
  progressBarForeground.setAttribute( 'rx', '3' );
  progressBarForeground.setAttribute( 'ry', '3' );
  progressBarForeground.setAttribute( 'style', 'fill:#6acef5;' );

  svg.appendChild( progressBarBackground );
  svg.appendChild( progressBarForeground );

  // fade/glow the background of the loading bar
  var phetSplashScreenAnimationInterval = setInterval( function() {

    // use browser toFixed because this is a preload
    progressBarBackground.style[ 'stroke-width' ] = ( Math.sin( Date.now() / 1000 * 4 ) * 0.55 + 1 ).toFixed( 2 );
  }, 16 );

  // After download is complete, stop the animation of the background
  window.phetSplashScreenDownloadComplete = function() {
    clearInterval( phetSplashScreenAnimationInterval );

    // Grow the progress bar foreground to the right based on the progress so far.
    progressBarBackground.style[ 'stroke-width' ] = 1;
  };

  // Add elements
  div.appendChild( splashImage );
  div.appendChild( svg );

  // Load the splash screen image
  if ( window.PHET_SPLASH_DATA_URI ) {

    // For builds, this is substituted in the sim.html template.
    splashImage.src = window.PHET_SPLASH_DATA_URI;
  }
  else {

    // Identify the brand (assume generated brand if not provided with query parameters)
    var brandMatch = location.search.match( /brand=([^&]+)/ );
    var brand = brandMatch ? decodeURIComponent( brandMatch[ 1 ] ) : 'adapted-from-phet';
    splashImage.src = '../brand/' + brand + '/images/splash.svg';
  }

  window.phetSplashScreen = {

    /**
     * Dispose the splash screen and all its associated listeners.  Can only be called once.
     */
    dispose: function() {

      // For built versions, clean up the memory that stored the splash image.
      if ( window.PHET_SPLASH_DATA_URI ) {
        delete window.PHET_SPLASH_DATA_URI;
      }
      window.removeEventListener( 'resize', adjustPosition );
      window.removeEventListener( 'load', adjustPosition );
      document.body.removeChild( div );
      delete window.phetSplashScreen;
    }
  };
} )();