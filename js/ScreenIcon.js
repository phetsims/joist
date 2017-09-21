// Copyright 2015-2017, University of Colorado Boulder

/**
 * An icon suitable for one of the screen-selection buttons on the home screen or navigation bar.
 * By default, the size is optimized for the home screen.
 * To optimize for the navigation bar, use options.size: Screen.MINIMUM_NAVBAR_ICON_SIZE
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );

  /**
   * @param {Node} iconNode
   * @param options
   * @constructor
   */
  function ScreenIcon( iconNode, options ) {

    options = _.extend( {
      size: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE, // {Dimension2} size of the background
      maxIconWidthProportion: 0.85, // max proportion of the background width occupied by iconNode, (0,1]
      maxIconHeightProportion: 0.85, // max proportion of the background height occupied by iconNode, (0,1]
      fill: 'white', // {Color|string} background fill
      stroke: null // {Color|string} background stroke
    }, options );

    assert && assert( options.maxIconWidthProportion > 0 && options.maxIconWidthProportion <= 1 );
    assert && assert( options.maxIconHeightProportion > 0 && options.maxIconHeightProportion <= 1 );

    var background = new Rectangle( 0, 0, options.size.width, options.size.height, {
      fill: options.fill,
      stroke: options.stroke
    } );

    iconNode.setScaleMagnitude( Math.min( options.maxIconWidthProportion * background.width / iconNode.width, options.maxIconHeightProportion * background.height / iconNode.height ) );
    iconNode.center = background.center;
    iconNode.pickable = false;

    options.children = [ background, iconNode ];
    Node.call( this, options );
  }

  joist.register( 'ScreenIcon', ScreenIcon );

  return inherit( Node, ScreenIcon );
} );