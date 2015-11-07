// Copyright 2013-2015, University of Colorado Boulder

/**
 * Decorative frame around the selected node
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  /**
   * @param {Node} content
   * @param {Object} [options]
   * @constructor
   */
  function Frame( content, options ) {

    var thisNode = this;

    // default options
    options = _.extend( {
      xMargin1: 6,
      yMargin1: 6,
      cornerRadius: 0 // radius of the rounded corners on the background
    }, options );

    Node.call( thisNode );

    var width1 = content.width + 2 * options.xMargin1;
    var height1 = content.height + 2 * options.yMargin1;

    this.gradient = new LinearGradient( 0, 0, width1, 0 ).addColorStop( 0, '#fbff41' ).addColorStop( 118 / 800.0, '#fef98b' ).addColorStop( 372 / 800.0, '#feff40' ).addColorStop( 616 / 800, '#fffccd' ).addColorStop( 1, '#fbff41' );
    this.rectangle = new Rectangle( 0, 0, width1, height1, options.cornerRadius, options.cornerRadius, {
      stroke: this.gradient,
      lineWidth: 3,
      x: content.x - options.xMargin1,
      y: content.y - options.yMargin1
    } );
    this.addChild( this.rectangle );

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );
    this.width1 = width1;
    this.height1 = height1;
  }

  inherit( Node, Frame, {
    setHighlighted: function( highlighted ) {
      this.rectangle.lineWidth = highlighted ? 4.5 : 3;

      //Make the frame larger when highlighted, but only so that it expands out
      if ( highlighted ) {
        this.rectangle.setRect( -1.5 / 2, -1.5 / 2, this.width1 + 1.5, this.height1 + 1.5 );
      }
      else {
        this.rectangle.setRect( 0, 0, this.width1, this.height1 );
      }
    }
  } );

  return Frame;
} );