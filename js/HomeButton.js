// Copyright 2002-2013, University of Colorado Boulder

/**
 * The Home button that appears in the navigation bar.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {number} navBarHeight
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Object} [options]
   * @constructor
   */
  function HomeButton( navBarHeight, navigationBarFillProperty, options ) {

    options = _.extend( {
      highlightExtensionWidth: 4,
      listener: null,
      textDescription: 'Home Screen: Button',
      tandem: null
    }, options );

    var homeIcon = new FontAwesomeNode( 'home' );
    // scale so that the icon is slightly taller than screen button icons, value determined empirically, see joist#127
    homeIcon.setScaleMagnitude( 0.66 * navBarHeight / homeIcon.height );

    // transparent background, size determined empirically so that highlight is the same size as highlight on screen buttons
    var background = new Rectangle( 0, 0, homeIcon.width + 12, navBarHeight );
    homeIcon.center = background.center;

    var content = new Node( { children: [ background, homeIcon ] } );

    JoistButton.call( this, content, navigationBarFillProperty, options );

    Property.multilink( [ this.interactionStateProperty, navigationBarFillProperty ], function( interactionState, navigationBarFill ) {
      if ( navigationBarFill === 'black' ) {
        homeIcon.fill = interactionState === 'pressed' ? 'gray' : 'white';
      }
      else {
        homeIcon.fill = interactionState === 'pressed' ? '#444' : '#222';
      }
    } );
  }

  return inherit( JoistButton, HomeButton );
} );