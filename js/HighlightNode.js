// Copyright 2002-2013, University of Colorado Boulder

/**
 * Highlight node for navigation bar screen buttons, phet button, etc.
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var inherit = require( 'PHET_CORE/inherit' );

  function HighlightNode( width, height, options ) {
    options = _.extend( {
      whiteHighlight: true
    }, options );

    var outerColor = options.whiteHighlight ? 'black' : 'white';
    var innerColor = options.whiteHighlight ? 'white' : 'black';
    var leftBar = new Rectangle( -0.5, 0, 1, height, 0, 0, {
      fill: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, outerColor ).addColorStop( 0.5, innerColor ).addColorStop( 1, outerColor )
    } );
    var rightBar = new Rectangle( width - 0.5, 0, 1, height, 0, 0, {
      fill: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, outerColor ).addColorStop( 0.5, innerColor ).addColorStop( 1, outerColor )
    } );

    options = _.extend( { children: [leftBar, rightBar], pickable: false}, options );
    Node.call( this, options );
  }

  return inherit( Node, HighlightNode );
} );
