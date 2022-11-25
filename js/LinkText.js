// Copyright 2015, University of Colorado Boulder

/**
 * Text that has a handler set up to open a link in a new window when clicked.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Text = require( 'SCENERY/nodes/Text' );

  function LinkText( text, url, options ) {

    // defaults
    options = _.extend( {
      handleEvent: false // whether the up in the click event should be handled, e.g. to prevent the About dialog closing.
    }, options );

    Text.call( this, text, _.extend( {
      fill: 'rgb(27,0,241)', // blue, like a typical hypertext link
      cursor: 'pointer',

      // a11y
      tagName: 'a',
      accessibleLabel: text
    }, options ) );

    this.addInputListener( new ButtonListener( {
      fire: function( event ) {
        options.handleEvent && event.handle();
        if ( !window.phet || !phet.chipper || !phet.chipper.queryParameters || phet.chipper.queryParameters.allowLinks ) {
          var newWindow = window.open( url, '_blank' ); // open in a new window/tab
          newWindow.focus();
        }
      }
    } ) );

    // a11y - open the link in the new tab when activated with a keyboard
    this.setAccessibleAttribute( 'href', url );
    this.setAccessibleAttribute( 'target', '_blank' );
  }

  joist.register( 'LinkText', LinkText );

  return inherit( Text, LinkText );
} );