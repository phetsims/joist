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
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );

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
      layerSplit: true // so we're not in the same layer as the navbar, etc.
    }, options ) );
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

        //center vertically
        if ( scale === width / this.layoutBounds.width ) {
          this.translate( 0, (height - this.layoutBounds.height * scale) / 2 / scale );
        }

        //center horizontally
        else if ( scale === height / this.layoutBounds.height ) {
          this.translate( (width - this.layoutBounds.width * scale) / 2 / scale, 0 );
        }
      }
    },

    //statics
    {
      DEFAULT_LAYOUT_BOUNDS: DEFAULT_LAYOUT_BOUNDS
    }
  );

  return ScreenView;
} );