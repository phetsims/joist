// Copyright 2002-2013, University of Colorado Boulder

/**
 * Highlight node for navigation bar screen buttons, phet button, etc.
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var inherit = require( 'PHET_CORE/inherit' );

  function HighlightNode( width, height, options ) {

    var leftBar = new Path( Shape.lineSegment( 0, 0, 0, height ), { lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );
    var rightBar = new Path( Shape.lineSegment( width, 0, width, height ), {lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );

    options = _.extend( {
      children: [leftBar, rightBar]
    }, options );
    Node.call( this, options );
  }

  return inherit( Node, HighlightNode );
} );