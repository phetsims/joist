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
    hotKeysAndHelp: {
      value: 'Keyboard Shortcuts'
    },
    tabToGetStarted: {
      value: 'Tab to get started'
    },

    // sections in a simulation
    sceneSummary: {
      value: 'Scene Summary'
    },
    playArea: {
      value: 'Play Area'
    },
    controlPanel: {
      value: 'Control Panel'
    },

    // general for screens
    simScreens: {
      value: 'Sim Screens'
    },
    simScreen: {
      value: 'Sim Screen'
    },
    screenNumberPattern: {
      value: 'Screen {{number}}'
    },
    screenNamePattern: {
      value: '{{name}} Screen'
    },
    screenSimPattern: {
      value: '{{screenName}}, {{simName}}'
    },
    home: {
      value: 'Home'
    },
    homeScreen: {
      value: 'Home Screen'
    },
    homeScreenDescription: {
      value: 'Go to Home Screen.'
    },
    homeScreenDescriptionPattern: {
      value: 'Come explore with {{name}}. It has {{screens}} screens.'
    },

    // navigation bar
    simResourcesAndTools: {
      value: 'Sim Resources' // used for single screen sim
    },
    simScreensResourcesAndTools: {
      value: 'Sim Screens, Resources, and Tools'
    },
    soundOnOffButton: {
      value: 'Sound on off button'
    },

    // hint to look at keyboard help dialog
    checkOutShortcuts: {
      value: 'If needed, checkout keyboard shortcuts under Sim Resources.'
    },


    // scene summary intro for a multiscreen sim (not sim specific),
    // extra space at end for string concat with rest of the scene summary
    sceneSummaryMultiScreenIntro: {
      value: 'This is an interactive sim. It changes as you play with it. Each screen has a Play Area and Control Panel. '
    },

    // scene summary intro for a single screen sim (not sim specific),
    // extra space at end for string concat with rest of the scene summary
    sceneSummarySingleScreenIntroPattern: {
      value: '{{Sim}} is an interactive sim. It changes as you play with it.'
    },


    // PhET menu
    phet: {
      value: 'PhET Menu'
    }
  };

  if ( phet.chipper.queryParameters.stringTest === 'xss' ) {
    for ( var key in JoistA11yStrings ) {
      JoistA11yStrings[ key ].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
    }
  }

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( JoistA11yStrings ); }

  joist.register( 'JoistA11yStrings', JoistA11yStrings );

  return JoistA11yStrings;
} );