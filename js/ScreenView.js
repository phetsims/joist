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

  //Default to width and height for iPad2, iPad3, iPad4 running Safari with default tabs and decorations
  //Simulations can change this to provide their own sizes or aspect ratios
  //TODO: the code that uses these bounds needs to account for the minX and minY values if they are overriden in subclasses
  var DEFAULT_LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  function ScreenView( options ) {
    Node.call( this, _.extend( {
      layerSplit: true // so we're not in the same layer as the navbar, etc.
    }, options ) );
  }

  inherit( Node, ScreenView, {

      layoutBounds: DEFAULT_LAYOUT_BOUNDS.copy(),

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