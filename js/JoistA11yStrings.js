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
    hotKeysAndHelpString: {
      value: 'Keyboard Shortcuts'
    },
    closeString: {
      value: 'Close'
    },

    // sections in a simulation
    sceneSummary: {
      value: 'Scene Summary'
    },
    playAreaString: {
      value: 'Play Area'
    },
    controlPanelString: {
      value: 'Control Panel'
    },

    // general for screens
    simScreensString: {
      value: 'Sim Screens'
    },
    simScreenString: {
      value: 'Sim Screen'
    },
    screenNumberPatternString: {
      value: 'Screen {{number}}'
    },
    screenNamePatternString: {
      value: '{{name}} Screen'
    },
    homeString: {
      value: 'Home'
    },
    homeScreenString: {
      value: 'Home Screen'
    },
    homeScreenDescriptionString: {
      value: 'Go to Home Screen.'
    },
    homeScreenDescriptionPatternString: {
      value: 'Come explore with {{name}}. It has {{screens}} screens.'
    },

    // navigation bar
    simResourcesAndToolsString: {
      value: 'Sim Resources', // used for single screen sim 
    },
    simScreensResourcesAndToolsString: {
      value: 'Sim Screens, Resources, and Tools'
    },

    // hint to look at keyboard help dialog
    checkOutShortcuts: {
      value: 'If needed, checkout keyboard shortcuts under Sim Resources.'
    },

    // PhET menu
    phetString: {
      value: 'PhET Menu'
    },
  };

  if ( phet.chipper.queryParameters.stringTest === 'xss') {
    for ( var key in JoistA11yStrings ) {
      JoistA11yStrings[ key ].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
    }
  }

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( JoistA11yStrings ); }

  joist.register( 'JoistA11yStrings', JoistA11yStrings );

  return JoistA11yStrings;
} );