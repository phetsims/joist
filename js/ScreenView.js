// Copyright 2013-2018, University of Colorado Boulder

/**
 * The view portion of a Screen, specifies the layout strategy.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ScreenSummaryNode = require( 'SCENERY_PHET/accessibility/nodes/ScreenSummaryNode' );
  var Tandem = require( 'TANDEM/Tandem' );

  /*
   * Default width and height for iPad2, iPad3, iPad4 running Safari with default tabs and decorations
   * These bounds were added in Sep 2014 and are based on a screenshot from a non-Retina iPad, in Safari, iOS7.
   * It therefore accounts for the nav bar on the bottom and the space consumed by the browser on the top.
   * As of this writing, this is the resolution being used by PhET's sim designers for their mockups.
   * For more information see https://github.com/phetsims/joist/issues/126
   */
  var DEFAULT_LAYOUT_BOUNDS = new Bounds2( 0, 0, 1024, 618 );

  function ScreenView( options ) {

    options = _.extend( {
      layoutBounds: DEFAULT_LAYOUT_BOUNDS.copy(),

      // a11y - TEMP option. to opt in rather than fix every sim structure right now, https://github.com/phetsims/joist/issues/509
      // This option is a placeholder right now as we convert old nodes to use this new screen summary structure,
      addScreenSummaryNode: false
    }, options );
    this.layoutBounds = options.layoutBounds;

    Node.call( this, _.extend( {
      layerSplit: true, // so we're not in the same layer as the navbar, etc.
      excludeInvisible: true, // so we don't keep invisible screens in the SVG tree
      tandem: Tandem.optional,

      // a11y options
      containerTagName: 'article',
      tagName: 'div',
      labelTagName: 'h1'
    }, options ) );

    // The visible bounds of the ScreenView in ScreenView coordinates.  This includes top/bottom or left/right margins
    // depending on the aspect ratio of the screen.
    // Initialize to defaults, then update as soon as layout() is called, which is before the ScreenView is displayed
    // @public (read-only)
    this.visibleBoundsProperty = new Property( options.layoutBounds );

    // a11y - {Node|null}
    //  This node is used to add an overview to the PDOM directly below the H1 (sim/screen name)
    // only set to type {Node} if `includeScreenOverviewNode` is true.
    // NOTE: DO NOT SET accessibleOrder ON THIS NODE
    // @public (read-only) - you can add children to it
    this.screenSummaryNode = null;

    if ( options.addScreenSummaryNode ) {

      this.screenSummaryNode = new ScreenSummaryNode();
      this.addChild( this.screenSummaryNode );
    }
  }

  joist.register( 'ScreenView', ScreenView );

  return inherit( Node, ScreenView, {

      /**
       * Get the scale to use for laying out the sim components and the navigation bar, so its size will track
       * with the sim size
       * @param {number} width
       * @param {number} height
       * @returns {number}
       * @public (joist-internal)
       */
      getLayoutScale: function( width, height ) {
        return Math.min( width / this.layoutBounds.width, height / this.layoutBounds.height );
      },

      /**
       * Default layout function uses the layoutWidth and layoutHeight to scale the content (based on whichever is more limiting: width or height)
       * and centers the content in the screen vertically and horizontally
       * This function can be replaced by subclasses that wish to perform their own custom layout.
       * @param {number} width
       * @param {number} height
       * @public (joist-internal)
       */
      layout: function( width, height ) {
        this.resetTransform();

        var scale = this.getLayoutScale( width, height );
        this.setScaleMagnitude( scale );

        var dx = 0;
        var dy = 0;

        //center vertically
        if ( scale === width / this.layoutBounds.width ) {
          dy = ( height / scale - this.layoutBounds.height ) / 2;
        }

        //center horizontally
        else if ( scale === height / this.layoutBounds.height ) {
          dx = ( width / scale - this.layoutBounds.width ) / 2;
        }

        this.translate( dx, dy );

        this.visibleBoundsProperty.set( new Bounds2( -dx, -dy, width / scale - dx, height / scale - dy ) );
      },

      /**
       * Make screen view eligible for garbage collection.
       * @public
       */
      dispose: function() {
        Node.prototype.dispose.call( this );
        this.disposeScreenView();
      }
    },

    //statics
    {
      // @public
      DEFAULT_LAYOUT_BOUNDS: DEFAULT_LAYOUT_BOUNDS
    }
  );
} )
;