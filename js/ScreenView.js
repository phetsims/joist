// Copyright 2002-2013, University of Colorado Boulder

/**
 * The view portion of a Screen.
 * Specifies the layout strategy.
 * TODO: should extend this to be compatible with the Sim.js framework.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Events = require( 'AXON/Events' );

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
      layoutBounds: DEFAULT_LAYOUT_BOUNDS.copy()
    }, options );
    this.layoutBounds = options.layoutBounds;

    Node.call( this, _.extend( {
      layerSplit: true, // so we're not in the same layer as the navbar, etc.
      excludeInvisible: true, // so we don't keep invisible screens in the SVG tree
      accessibleContent: {
        createPeer: function( accessibleInstance ) {
          return new ScreenViewAccessiblePeer( accessibleInstance, options.screenDescription );
        }
      }
    }, options ) );

    // @public - event channel for notifications
    this.events = new Events();
  }

  inherit( Node, ScreenView, {

      //Get the scale to use for laying out the sim components and the navigation bar, so its size will track with the sim size
      getLayoutScale: function( width, height ) {
        return Math.min( width / this.layoutBounds.width, height / this.layoutBounds.height );
      },

      //Default layout function uses the layoutWidth and layoutHeight to scale the content (based on whichever is more limiting: width or height)
      //and centers the content in the screen vertically and horizontally
      //This function can be replaced by subclasses that wish to perform their own custom layout.
      layout: function( width, height ) {
        this.resetTransform();

        var scale = this.getLayoutScale( width, height );
        this.setScaleMagnitude( scale );

        var dx = 0;
        var dy = 0;

        //center vertically
        if ( scale === width / this.layoutBounds.width ) {
          dy = (height / scale - this.layoutBounds.height ) / 2;
        }

        //center horizontally
        else if ( scale === height / this.layoutBounds.height ) {
          dx = (width / scale - this.layoutBounds.width ) / 2;
        }

        this.translate( dx, dy );

        /**
         * Trigger notifications that the visible bounds have changed, in case any clients need to update the views.
         *
         * @param {number} dx - the horizontal offset in stage coordinates
         * @param {number} dy - the vertical offset in stage coordinates
         * @param {number} width - the width of the entire visible area in stage coordinates
         * @param {number} height - the height of the entire visible area in stage coordinates
         * @param {number} scale - the scale factor between stage coordinates and pixel coordinates
         * @public
         */
        this.events.trigger( 'layoutFinished', dx, dy, width / scale, height / scale, scale );
      }
    },

    //statics
    {
      DEFAULT_LAYOUT_BOUNDS: DEFAULT_LAYOUT_BOUNDS
    }
  );

  /**
   * An accessible peer for handling the parallel DOM for screen views. See https://github.com/phetsims/scenery/issues/461
   * Provides a description, and nesting with aria-hidden to help with visibility.
   */
  function ScreenViewAccessiblePeer( accessibleInstance, screenDescription ) {
    this.initialize( accessibleInstance, screenDescription );
  }
  inherit( AccessiblePeer, ScreenViewAccessiblePeer, {
    initialize: function( accessibleInstance, screenDescription ) {
      var trail = accessibleInstance.trail;
      this.node = trail.lastNode(); // TODO: may be namespace conflict in future?

      this.domElement = document.createElement( 'div' );
      this.initializeAccessiblePeer( accessibleInstance, this.domElement );

      if ( screenDescription ) {
        var uniqueId = trail.getUniqueId();
        var descriptionId = 'screen-description-' + uniqueId;
        this.domElement.setAttribute( 'aria-describedby', 'screen-description-' + uniqueId );

        var descriptionParagraph = document.createElement( 'p' );
        descriptionParagraph.id = descriptionId;
        descriptionParagraph.innerText = screenDescription;
        this.domElement.appendChild( descriptionParagraph );
      }

      // Separate container for children needed, since the description can be a child
      this.containerDOMElement = document.createElement( 'div' );
      this.domElement.appendChild( this.containerDOMElement );

      this.visibilityListener = this.updateVisibility.bind( this );
      this.node.onStatic( 'visibility', this.visibilityListener );

      this.updateVisibility();
    },

    updateVisibility: function() {
      this.domElement.hidden = !this.node.visible;
    },

    dispose: function() {
      AccessiblePeer.prototype.dispose.call( this );

      this.node.offStatic( 'visibility', this.visibilityListener );
    }
  } );

  return ScreenView;
} );