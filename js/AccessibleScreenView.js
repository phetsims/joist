// Copyright 2018, University of Colorado Boulder

/**
 * A screen view with children that can act as sections for accessible content. Nodes can be added to these as children
 * or content can be structured under these Nodes in the Parallel DOM with setAccessibleOrder.
 *
 * NOTE: Do not use in a simulation yet! This is a proposal for what might be used more generally to structure
 * accessible sections in a simulation. See https://github.com/phetsims/scenery-phet/issues/381
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var ControlAreaNode = require( 'SCENERY_PHET/accessibility/nodes/ControlAreaNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var PlayAreaNode = require( 'SCENERY_PHET/accessibility/nodes/PlayAreaNode' );
  var ScreenSummaryNode = require( 'SCENERY_PHET/accessibility/nodes/ScreenSummaryNode' );
  var ScreenView = require( 'JOIST/ScreenView' );

  /**
   * @constructor
   * @param {Object} [options]
   */
  function AccessibleScreenView( options ) {

    options = _.extend( {

      // a11y - whether you want include section nodes in the screen view that will act as contains in the PDOM.
      a11yUseScreenSummary: true,
      a11yUseControlArea: true,
      a11yUsePlayArea: true
    }, options );

    ScreenView.call( this, options );

    // @public (a11y) {Node|null} - Nodes attached to the Display which can be used to specify an accessible order.
    // Nodes can be added directly as children to these Nodes OR you may structure accessible content under these
    // in the PDOM with accessibleOrder.
    this.screenSummaryNode = null;
    this.playAreaNode = null;
    this.controlAreaNode = null;

    // create and attach the necessary nodes to the Display for use
    if ( options.a11yUseScreenSummary ) {
      this.screenSummaryNode = new ScreenSummaryNode();
      this.addChild( this.screenSummaryNode );
    }
    if ( options.a11yUsePlayArea ) {
      this.playAreaNode = new PlayAreaNode();
      this.addChild( this.playAreaNode );
    }
    if ( options.a11yUseControlArea ) {
      this.controlAreaNode = new ControlAreaNode();
      this.addChild( this.controlAreaNode );
    }

    this.accessibleOrder = [ this.screenSummaryNode, this.playAreaNode, this.controlAreaNode ];
  }

  joist.register( 'AccessibleScreenView', AccessibleScreenView );

  return inherit( ScreenView, AccessibleScreenView );
} );
