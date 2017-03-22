// Copyright 2015, University of Colorado Boulder

/**
 * Text that has a handler set up to open a link in a new window when clicked.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var joist = require( 'JOIST/joist' );

  function LinkText( text, url, options ) {

    // defaults
    options = _.extend( {
      handleEvent: false // whether the up in the click event should be handled, e.g. to prevent the About dialog closing.
    }, options );

    Text.call( this, text, _.extend( {
      fill: 'rgb(27,0,241)', // blue, like a typical hypertext link
      cursor: 'pointer'
    }, options ) );

    this.addInputListener( new ButtonListener( {
      fire: function( event ) {
        options.handleEvent && event.handle();
        var newWindow = window.open( url, '_blank' ); // open in a new window/tab
        newWindow.focus();
      }
    } ) );
  }

  joist.register( 'LinkText', LinkText );

  return inherit( Text, LinkText );
} );