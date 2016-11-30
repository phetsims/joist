// Copyright 2015, University of Colorado Boulder

/**
 * Main file for the Joist demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var DialogsDemoView = require( 'JOIST/demo/DialogsDemoView' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

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
        function( model ) { return new DialogsDemoView(); },
        {
          name: 'Dialogs 1',
          backgroundColorProperty: new Property( Color.toColor( 'white' ) )
        }
      ),
      new Screen(
        function() { return {}; },
        function( model ) { return new DialogsDemoView(); },
        {
          name: 'Dialogs 2',
          backgroundColorProperty: new Property( Color.toColor( 'white' ) )
        }
      )
    ];

    new Sim( joistTitleString, screens, simOptions ).start();
  } );
} );
