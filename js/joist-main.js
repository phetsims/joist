// Copyright 2015-2018, University of Colorado Boulder

/**
 * Main file for the Joist demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const DialogsScreenView = require( 'JOIST/demo/DialogsScreenView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  const joistTitleString = require( 'string!JOIST/joist.title' );

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
