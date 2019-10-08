// Copyright 2013-2019, University of Colorado Boulder

/**
 * The view portion of a Screen, specifies the layout strategy for the visual view.
 *
 * For the PDOM view, this type creates  the three organizing elements associated with each screen:
 * - The `ScreenSummaryNode` is introductory description that outlines the screen and sets the scene for the user.
 * - The `PlayAreaNode` holds content that is considered the main interaction and pedigogy to be learned from the screen.
 * - The `ControlAreaNode` houses controls and other content that is secondary to the main interaction. Ideally the user
 *       would encounter this after exploring the PlayAreaNode.
 * The screenSummaryNode instance is not available on the ScreenView, instead content can be added to it via a constructor
 * option or `ScreenView.setScreenSummaryContent`. This is because some accessible descriptions in the screen summary
 * are the same throughout all simulations. The playAreaNode and controlAreaNode instances are public, read-only Nodes
 * that are meant to have their accessibleOrder and children set to achieve the proper PDOM structure. Do not set
 * `accessibleOrder` directly on the ScreenView, as ScreenView set's its own accessibleOrder
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const ControlAreaNode = require( 'SCENERY_PHET/accessibility/nodes/ControlAreaNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PlayAreaNode = require( 'SCENERY_PHET/accessibility/nodes/PlayAreaNode' );
  const Property = require( 'AXON/Property' );
  const ScreenSummaryNode = require( 'SCENERY_PHET/accessibility/nodes/ScreenSummaryNode' );
  const Tandem = require( 'TANDEM/Tandem' );

  /*
   * Default width and height for iPad2, iPad3, iPad4 running Safari with default tabs and decorations
   * These bounds were added in Sep 2014 and are based on a screenshot from a non-Retina iPad, in Safari, iOS7.
   * It therefore accounts for the nav bar on the bottom and the space consumed by the browser on the top.
   * As of this writing, this is the resolution being used by PhET's sim designers for their mockups.
   * For more information see https://github.com/phetsims/joist/issues/126
   */
  const DEFAULT_LAYOUT_BOUNDS = new Bounds2( 0, 0, 1024, 618 );

  function ScreenView( options ) {

    options = _.extend( {

      // {Bounds2} the bounds that are safe to draw in on all supported platforms
      layoutBounds: DEFAULT_LAYOUT_BOUNDS.copy(),

      // Node options
      layerSplit: true, // so we're not in the same layer as the navbar, etc.
      excludeInvisible: true, // so we don't keep invisible screens in the SVG tree

      // phet-io options
      tandem: Tandem.optional,

      // a11y options
      containerTagName: 'article',
      tagName: 'div',
      labelTagName: 'h1',

      // {Node|null} the Node with screen summary content to be added to the ScreenSummaryNode, and into PDOM above
      // the Play Area. This Node is added as a child to the ScreenSummaryNode.
      screenSummaryContent: null

    }, options );

    // @public (read-only) {Bounds2} - the bounds the confine the layout of the view.
    assert && assert( options.layoutBounds instanceof Bounds2, 'invalid layoutBounds' );
    this.layoutBounds = options.layoutBounds;

    Node.call( this, options );

    // The visible bounds of the ScreenView in ScreenView coordinates.  This includes top/bottom or left/right margins
    // depending on the aspect ratio of the screen.
    // Initialize to defaults, then update as soon as layout() is called, which is before the ScreenView is displayed
    // @public (read-only)
    this.visibleBoundsProperty = new Property( options.layoutBounds );

    // @private
    // a11y - this Node is suffixed "container" because it is added to with sim specific screen summary content, often
    // called {Sim}ScreenSummaryNode. This container has the intro "{sim} is an interactive sim, it changes as you . . ."
    this._screenSummaryNode = new ScreenSummaryNode();
    this.addChild( this._screenSummaryNode );

    // @private {Node|null} - keep track of the content added to the summary Node, so that if it is set more than once,
    // the previous one can be removed.
    this._screenSummaryContent = null;

    // at the Node from options in the same way that can be done at any time
    options.screenSummaryContent && this.setScreenSummaryContent( options.screenSummaryContent );

    // @public (read-only) - add children and set accessible order to these to organize and structure the PDOM.
    this.playAreaNode = new PlayAreaNode();
    this.addChild( this.playAreaNode );
    this.controlAreaNode = new ControlAreaNode();
    this.addChild( this.controlAreaNode );
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

        const scale = this.getLayoutScale( width, height );
        this.setScaleMagnitude( scale );

        let dx = 0;
        let dy = 0;

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
      },

      /**
       * Set the screen summary Node for the PDOM of this Screen View. Prefer passing in a screen summary Node via
       * constructor options, but this method can be used directly when necessary.
       * @param {Node} node
       * @public
       */
      setScreenSummaryContent: function( node ) {
        assert && assert( node instanceof Node );
        assert && assert( node !== this._screenSummaryContent, 'this is already the screen summary node content' );

        this._screenSummaryContent && this._screenSummaryNode.removeChild( this._screenSummaryContent );

        this._screenSummaryContent = node;
        this._screenSummaryNode.addChild( node );
      },

      /**
       * Set the screen summary Node intro string
       * @param {string} simName
       * @param {number} numberOfScreens
       * @public (joist-internal)
       */
      setScreenSummaryIntroString: function( simName, numberOfScreens ) {
        this._screenSummaryNode.setIntroString( simName, numberOfScreens );
      },

      set accessibleOrder( order ) { throw new Error( 'should not need to set accessible order on the screen view' ); }
    },

    //statics
    {
      // @public
      DEFAULT_LAYOUT_BOUNDS: DEFAULT_LAYOUT_BOUNDS
    }
  );
} )
;