// Copyright 2015-2018, University of Colorado Boulder

/**
 * Main file for the Joist demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var DialogsScreenView = require( 'JOIST/demo/DialogsScreenView' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var joistTitleString = require( 'string!JOIST/joist.title' );

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  SimLauncher.launch( function() {

    var screens = [
      new Screen(
        function() { return {}; },
        function( model ) { return new DialogsScreenView(); },
        {
          name: 'Dialogs',
          backgroundColorProperty: new Property( 'white' )
        }
      )
    ];

    new Sim( joistTitleString, screens, simOptions ).start();
  } );
} );
