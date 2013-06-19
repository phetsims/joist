// Copyright 2002-2013, University of Colorado

/**
 * Decorative frame around the selected node
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  /**
   * @param {Node} content
   * @param {object} options
   * @constructor
   */
  function Frame( content, options ) {

    var thisNode = this;

    // default options
    options = _.extend( {
      xMargin1: 3,
      yMargin1: 3,
      xMargin2: 3,
      yMargin2: 3,
      xMargin3: 3,
      yMargin3: 3,
      cornerRadius: 10 // radius of the rounded corners on the background
    }, options );

    Node.call( thisNode );
    var width = content.width;
    var height = content.height;

    var width1 = content.width + 2 * options.xMargin1;
    var height1 = content.height + 2 * options.yMargin1;

    var gradient1 = new LinearGradient( 0, 0, width1, height1 ).addColorStop( 0, '#7a90a6' ).addColorStop( 0.6, '#dfe3e8' ).addColorStop( 1, '#acc3d7' );

    var width2 = width1 + options.xMargin2 * 2;
    var height2 = height1 + options.yMargin2 * 2;
    var gradient2 = new LinearGradient( 0, 0, 0, height2 ).addColorStop( 0, '#d5dce5' ).addColorStop( 1, '#496886' );

    var width3 = width2 + options.xMargin3 * 2;
    var height3 = height2 + options.yMargin3 * 2;
    var gradient3 = new LinearGradient( 0, 0, 0, height3 ).addColorStop( 0, '#3d7186' ).addColorStop( 0.5, '#dde2e8' ).addColorStop( 1, '#3a5c7c' );

    this.addChild( new Rectangle( 0, 0, width3, height3, options.cornerRadius, options.cornerRadius, {fill: gradient3, x: content.x - options.xMargin1 - options.xMargin2 - options.xMargin3, y: content.y - options.yMargin1 - options.yMargin2 - options.yMargin3} ) );
    this.addChild( new Rectangle( 0, 0, width2, height2, options.cornerRadius, options.cornerRadius, {fill: gradient2, x: content.x - options.xMargin1 - options.xMargin2, y: content.y - options.yMargin1 - options.yMargin2} ) );
    this.addChild( new Rectangle( 0, 0, width1, height1, options.cornerRadius, options.cornerRadius, {fill: gradient1, x: content.x - options.xMargin1, y: content.y - options.yMargin1} ) );

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    if ( options ) {
      this.mutate( options );
    }
  }

  inherit( Node, Frame );

  return Frame;
} );