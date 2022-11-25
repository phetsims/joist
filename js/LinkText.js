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
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var joist = require( 'JOIST/joist' );

  function LinkText( text, url, options ) {

    // defaults
    options = _.extend( {
      handleEvent: false, // whether the up in the click event should be handled, e.g. to prevent the About dialog closing.
      accessibleContent: {
        createPeer: function( accessibleInstance ) {

          /* We want the accessible peer to look like the following in the Parallel DOM.
           *
           * <a href=url tabindex='0' target="_blank">text></a>
           */
          var domElement = document.createElement( 'a' );
          domElement.tabIndex = '0'; // in tab order by default
          domElement.href = url; // define link address
          domElement.innerText = text; // inner description, read by screen readers
          domElement.setAttribute( 'target', '_blank' ); // open in a new window/tab

          return new AccessiblePeer( accessibleInstance, domElement );
        }
      }
    }, options );

    Text.call( this, text, _.extend( {
      fill: 'rgb(27,0,241)', // blue, like a typical hypertext link
      cursor: 'pointer'
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
  }

  joist.register( 'LinkText', LinkText );

  return inherit( Text, LinkText );
} );