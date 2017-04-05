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

    // navigation bar
    simResourcesAndToolsString: 'Sim Resources and Tools',

    // PhET menu ('menu' label added by aria role)
    phetString: 'PhET'
  };

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( JoistA11yStrings ); }

  joist.register( 'JoistA11yStrings', JoistA11yStrings );

  return JoistA11yStrings;
} );