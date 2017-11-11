// Copyright 2017, University of Colorado Boulder

/**
 * Single location of all accessibility strings used in joist.  These
 * strings are not meant to be translatable yet.  Rosetta needs some work to
 * provide translators with context for these strings, and we want to receive
 * some community feedback before these strings are submitted for translation.
 *
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var joist = require( 'JOIST/joist' );

  var JoistA11yStrings = {

    // dialogs
    hotKeysAndHelpString: 'Keyboard Shortcuts',
    closeString: 'Close',

    // sections in a simulation
    sceneSummaryString: 'Scene Summary',
    playAreaString: 'Play Area',
    controlPanelString: 'Control Panel',

    // general for screens
    simScreensString: 'Sim Screens',
    simScreenString: 'Sim Screen',
    screenNumberPatternString: 'Screen {{number}}',
    screenNamePatternString: '{{name}} Screen',

    homeString: 'Home',
    homeScreenString: 'Home Screen',
    homeScreenDescriptionString: 'Go to Home Screen.',
    homeScreenDescriptionPatternString: 'Come explore with {{name}}. It has {{screens}} screens.',

    // navigation bar
    simScreensResourcesAndToolsString: 'Sim Screens, Resources, and Tools.',

    // PhET menu
    phetString: 'PhET Menu'
  };

  if ( phet.chipper.queryParameters.stringTest === 'xss' ) {
    for ( var key in JoistA11yStrings ) {
      JoistA11yStrings[ key ] += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
    }
  }

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( JoistA11yStrings ); }

  joist.register( 'JoistA11yStrings', JoistA11yStrings );

  return JoistA11yStrings;
} );