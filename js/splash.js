// Copyright 2016-2022, University of Colorado Boulder

/**
 * Shows the splash screen and loading progress bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
( function() {


  // Overall scale factor for the image + progress bar, matched empirically to desired size
  const SCALE_FACTOR = 1.0 / 4.0 * 1.042;
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';
  const SPLASH_CONTAINER_ID = 'splash-container';
  const PROGRESS_BAR_Y = 25; // {string} Vertical offset of progress bar from splash logo
  const POSITION_Y = 0.435; // Center the content above the middle of the screen because it looks better that way.

  // Store the initial width and height to use for layout in case it changes, see
  // https://github.com/phetsims/joist/issues/407
  let splashImageWidth = 0;
  let splashImageHeight = 0;

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
    const currentWidth = splashImageWidth;
    const currentHeight = splashImageHeight;

    const availableHeight = window.innerHeight; // eslint-disable-line bad-sim-text
    const availableWidth = window.innerWidth; // eslint-disable-line bad-sim-text

    const scaleX = availableWidth / currentWidth;
    const scaleY = availableHeight / currentHeight;

    const scale = Math.min( scaleX, scaleY ) * SCALE_FACTOR;

    // use Math.round because this is a preload
    const translationX = Math.round( ( availableWidth - currentWidth * scale ) / 2 ); // eslint-disable-line bad-sim-text
    const translationY = Math.round( ( availableHeight - currentHeight * scale ) * POSITION_Y ); // eslint-disable-line bad-sim-text

    // Position the div using CSS
    const transformString = `translate(${translationX}px, ${translationY}px) scale3d(${scale}, ${scale}, 1)`;
    div.style[ '-webkit-transform' ] = transformString;
    div.style[ '-ms-transform' ] = transformString;
    div.style.transform = transformString;
  }

  // The main overlay for the whole screen, which will hide anything going on behind it.
  const splashBackgroundDiv = document.createElement( 'div' );
  splashBackgroundDiv.style.position = 'fixed';
  splashBackgroundDiv.style.left = '0px';
  splashBackgroundDiv.style.top = '0px';
  splashBackgroundDiv.style.width = '100%';
  splashBackgroundDiv.style.height = '100%';
  splashBackgroundDiv.style.backgroundColor = 'black';
  splashBackgroundDiv.style.zIndex = 10000;
  splashBackgroundDiv.style[ '-webkit-transform-origin' ] = '0 0';
  splashBackgroundDiv.style[ '-ms-transform-origin' ] = '0 0';
  splashBackgroundDiv.style[ 'transform-origin' ] = '0 0';

  // Create the container div which will hold the splash image and progress bar
  const centerLogoAndProgressDiv = document.createElement( 'div' );
  centerLogoAndProgressDiv.id = SPLASH_CONTAINER_ID;
  centerLogoAndProgressDiv.style.position = 'fixed';
  centerLogoAndProgressDiv.style.left = '0px';
  centerLogoAndProgressDiv.style.top = '0px';
  centerLogoAndProgressDiv.style[ '-webkit-transform-origin' ] = '0 0';
  centerLogoAndProgressDiv.style[ '-ms-transform-origin' ] = '0 0';
  centerLogoAndProgressDiv.style[ 'transform-origin' ] = '0 0';

  // Create the splash image, which is an SVG logo
  const splashImage = document.createElement( 'img' );
  splashImage.style.display = 'block';

  // alt tag required for accessibility purposes, see https://github.com/phetsims/joist/issues/490
  splashImage.alt = '';

  // Closure which binds the values to positionDiv, which can be used as a listener reference.
  const adjustPosition = function() {
    positionDiv( centerLogoAndProgressDiv, splashImage );
  };

  // Wait until the image has loaded so that everything appears at once.
  // Without this, the loading bar appears long before the splash image
  splashImage.onload = function() {

    // Center before showing so it appears at the correct position.
    adjustPosition();

    window.addEventListener( 'resize', adjustPosition );
    window.addEventListener( 'load', adjustPosition );

    // Make sure the body did not already have such a div (if Chrome=>save as iOS Reading Mode saved a copy of the DOM).
    const previousSplashContainer = document.getElementById( SPLASH_CONTAINER_ID );
    previousSplashContainer && previousSplashContainer.parentNode.removeChild( previousSplashContainer );

    // After creating and positioning the div, add it to the body.  This could show in the wrong position if the image
    // dimensions are 0x0, see https://github.com/phetsims/joist/issues/408
    splashBackgroundDiv.appendChild( centerLogoAndProgressDiv );
    document.body.appendChild( splashBackgroundDiv );
  };

  // Create the progress bar
  const progressBarDiv = document.createElement( 'div' );
  progressBarDiv.setAttribute( 'style', 'width:273px;height:10px' );
  progressBarDiv.style.display = 'block';

  const svg = document.createElementNS( XML_NAMESPACE, 'svg' );
  svg.style[ 'margin-left' ] = '-1px'; // compensates for the offset of x=1
  const progressBarBackground = document.createElementNS( XML_NAMESPACE, 'rect' );
  progressBarBackground.setAttribute( 'id', 'progressBarBackground' );
  progressBarBackground.setAttribute( 'x', '1' ); // prevent clipping on the left side, see https://github.com/phetsims/joist/issues/400
  progressBarBackground.setAttribute( 'y', `${PROGRESS_BAR_Y}` );
  progressBarBackground.setAttribute( 'width', '273' );
  progressBarBackground.setAttribute( 'height', '10' );
  progressBarBackground.setAttribute( 'rx', '3' );
  progressBarBackground.setAttribute( 'ry', '3' );
  progressBarBackground.setAttribute( 'style', 'stroke: white;stroke-width:1' );

  // The progress bar foreground begins with a width of 0 and grows to the right.  It is updated incrementally during
  // the startup sequence in Sim.js
  const progressBarForeground = document.createElementNS( XML_NAMESPACE, 'rect' );
  progressBarForeground.setAttribute( 'id', 'progressBarForeground' );
  progressBarForeground.setAttribute( 'x', '1' ); // prevent clipping on the left side, see https://github.com/phetsims/joist/issues/400
  progressBarForeground.setAttribute( 'y', `${PROGRESS_BAR_Y}` );
  progressBarForeground.setAttribute( 'width', '0' );
  progressBarForeground.setAttribute( 'height', '10' );
  progressBarForeground.setAttribute( 'rx', '3' );
  progressBarForeground.setAttribute( 'ry', '3' );
  progressBarForeground.setAttribute( 'style', 'fill:#6acef5;' );

  svg.appendChild( progressBarBackground );
  svg.appendChild( progressBarForeground );

  // fade/glow the background of the loading bar
  const phetSplashScreenAnimationInterval = setInterval( () => { // eslint-disable-line bad-sim-text

    // use browser toFixed because this is a preload
    progressBarBackground.style[ 'stroke-width' ] = ( Math.sin( Date.now() / 1000 * 4 ) * 0.55 + 1 ).toFixed( 2 ); // eslint-disable-line bad-sim-text
  }, 16 );

  // After download is complete, stop the animation of the background
  window.phetSplashScreenDownloadComplete = function() {
    clearInterval( phetSplashScreenAnimationInterval );

    // Grow the progress bar foreground to the right based on the progress so far.
    progressBarBackground.style[ 'stroke-width' ] = 1;
  };

  // Add elements
  centerLogoAndProgressDiv.appendChild( splashImage );
  centerLogoAndProgressDiv.appendChild( svg );

  // Load the splash screen image
  if ( window.PHET_SPLASH_DATA_URI ) {

    // For builds, this is substituted in the sim.html template.
    splashImage.src = window.PHET_SPLASH_DATA_URI;
  }
  else {

    // Identify the brand (assume generated brand if not provided with query parameters)
    const brandMatch = location.search.match( /brand=([^&]+)/ );
    const brand = brandMatch ? decodeURIComponent( brandMatch[ 1 ] ) : 'adapted-from-phet';
    splashImage.src = `../brand/${brand}/images/splash.svg`;
  }

  // Do not allow zoom from input on the splash screen.
  const preventZoom = event => event.preventDefault();

  // List of events that may initiate native zoom. `wheel` and `touchstart` prevent all mouse touchscreen zooming.
  // `gesturestart` is non-standard and specific to Apple, but prevents trackpad zooming gestures. Keyboard events are
  // OK because they will trigger 'resize' events and the splash screen/sim will adjust.
  const zoomEvents = [ 'wheel', 'touchstart', 'gesturestart' ];
  zoomEvents.forEach( zoomEvent => window.addEventListener( zoomEvent, preventZoom, {
    passive: false // non-passive to allow event.preventDefault()
  } ) );

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

      zoomEvents.forEach( zoomEvent => window.removeEventListener( zoomEvent, preventZoom ) );

      document.body.removeChild( splashBackgroundDiv );
      delete window.phetSplashScreen;
    }
  };
} )();