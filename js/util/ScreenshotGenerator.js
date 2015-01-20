// Copyright 2002-2013, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like "PhET Website", "Settings", etc.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  function ScreenshotGenerator() {}

  ScreenshotGenerator.prototype.generateScreenshot = function( node, callback ) {

    //set all renderers to canvas for capture
    var setToCanvas = function( root ) {

      //Skip invisible nodes to speed up
      if ( root.visible ) {
        if ( root.renderer !== null && root.renderer.name !== 'canvas' ) {
          console.log( root.renderer.name );
          root.__saveRenderer = root.renderer;
          root.renderer = 'canvas';
        }
        for ( var i = 0; i < root.children.length; i++ ) {
          setToCanvas( root.children[ i ] );
        }
      }
    };
    console.log( 'setting to canvas' );
    setToCanvas( node );
    console.log( 'done setting to canvas' );
    node.toCanvas( function( canvas ) {
      console.log( 'to canvas called back' );
      callback( canvas );

      console.log( 'added image, restoring' );
      //set all renderers to canvas for capture
      var restoreRenderers = function( root ) {
        if ( root.visible ) {
          if ( root.__saveRenderer ) {
            root.renderer = root.__saveRenderer;
            delete root.__saveRenderer;
          }
          else {
//                  console.log( 'skipping node: ', typeof root );
          }
          for ( var i = 0; i < root.children.length; i++ ) {
            restoreRenderers( root.children[ i ] );
          }
        }
      };
      restoreRenderers( node );
    } );
  };

  return ScreenshotGenerator;
} );