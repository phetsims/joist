// Copyright 2013-2015, University of Colorado Boulder

/**
 * Decorative frame around the selected node
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var joist = require( 'JOIST/joist' );

  /**
   * @param {Node} content
   * @param {Object} [options]
   * @constructor
   */
  function Frame( content, options ) {

    // default options
    options = _.extend( {
      xMargin1: 6,
      yMargin1: 6,
      cornerRadius: 0 // radius of the rounded corners on the background
    }, options );

    Node.call( this );

    var frameWidth = content.width + 2 * options.xMargin1;
    var frameHeight = content.height + 2 * options.yMargin1;

    // @private
    this.gradient = new LinearGradient( 0, 0, frameWidth, 0 ).addColorStop( 0, '#fbff41' ).addColorStop( 118 / 800.0, '#fef98b' ).addColorStop( 372 / 800.0, '#feff40' ).addColorStop( 616 / 800, '#fffccd' ).addColorStop( 1, '#fbff41' );

    // @private
    this.rectangle = new Rectangle( 0, 0, frameWidth, frameHeight, options.cornerRadius, options.cornerRadius, {
      stroke: this.gradient,
      lineWidth: 3,
      x: content.x - options.xMargin1,
      y: content.y - options.yMargin1
    } );
    this.addChild( this.rectangle );

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );

    // @private
    this.frameWidth = frameWidth;

    // @private
    this.frameHeight = frameHeight;
  }

  joist.register( 'Frame', Frame );

  inherit( Node, Frame, {

    // @public
    setHighlighted: function( highlighted ) {
      this.rectangle.lineWidth = highlighted ? 4.5 : 3;

      //Make the frame larger when highlighted, but only so that it expands out
      if ( highlighted ) {
        this.rectangle.setRect( -1.5 / 2, -1.5 / 2, this.frameWidth + 1.5, this.frameHeight + 1.5 );
      }
      else {
        this.rectangle.setRect( 0, 0, this.frameWidth, this.frameHeight );
      }
    }
  } );

  return Frame;
} );