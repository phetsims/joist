// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author - Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );

  var Emitter = require( 'AXON/Emitter' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Frame = require( 'JOIST/Frame' );
  var Util = require( 'DOT/Util' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var Shape = require( 'KITE/Shape' );

  // phet-io modules
  var TScreenButton = require( 'ifphetio!PHET_IO/types/joist/TScreenButton' );

  var LARGE_ICON_HEIGHT = 140;

  /**
   * @param large {boolean} - whether or not this is a large or small screenButton
   * @param sim
   * @param index - index of this screen so we can get the screen, sorta backwards
   * @param highlightedScreenIndexProperty
   * @param options
   * @constructor
   */
  function ScreenButton( large, sim, index, highlightedScreenIndexProperty, options ) {
    var self = this;

    var tandem = options.tandem;
    options.tandem = tandem.createSupertypeTandem();

    var screen = sim.screens[ index ];

    this.startedCallbacksForFiredEmitter = new Emitter();
    this.endedCallbacksForFiredEmitter = new Emitter();

    // Maps the number of screens to a scale for the small icons. The scale is percentage of LARGE_ICON_HEIGHT.
    var smallIconScale = Util.linear( 2, 4, 0.875, 0.50, sim.screens.length );

    // Use the small icon scale if this is a small screen button
    var height = large ? LARGE_ICON_HEIGHT : smallIconScale * LARGE_ICON_HEIGHT;


    // The small screen's nodes have an opacity of .5
    var opacity = options.opacity ? options.opacity : 1;

    // Wrap in a Node because we're scaling, and the same icon will be used for small and large icon, and may be used by
    // the navigation bar.
    var icon = new Node( {
      opacity: opacity,
      children: [ screen.homeScreenIcon ],
      scale: height / screen.homeScreenIcon.height
    } );

    // Frame for large
    var frame = new Frame( icon );

    // Frame for small
    if ( !large ) {
      frame = new Rectangle( 0, 0, icon.width, icon.height, {
        stroke: options.showSmallHomeScreenIconFrame ? '#dddddd' : null,
        lineWidth: 0.7
      } );
    }

    // Only link if a large button
    large && highlightedScreenIndexProperty.link( function( highlightedIndex ) { frame.setHighlighted( highlightedIndex === index ); } );


    // Create the icon with the frame inside
    var iconWithFrame = new Node( {
      opacity: opacity,
      children: [ frame, icon ]
    } );

    // Text for the screen button
    var text = new Text( screen.name, {
      font: new PhetFont( large ? 42 : 18 ),
      fill: large ? PhetColorScheme.PHET_LOGO_YELLOW : 'gray' // Color match with the PhET Logo yellow
    } );

    // Shrink the text if it goes beyond the edge of the image
    if ( text.width > iconWithFrame.width ) {
      text.scale( iconWithFrame.width / text.width );
    }

    VBox.call( this, _.extend( {
        children: [
          iconWithFrame,
          text
        ]
      }, options )
    );

    // Input listeners after the parent call
    var buttonDown = large ?
                     function() {
                       sim.showHomeScreenProperty.value = false;
                       highlightedScreenIndexProperty.value = -1;
                     } :
                     function() {
                       sim.screenIndexProperty.value = index;
                     };

    this.addInputListener( {
      down: function( event ) {
        self.startedCallbacksForFiredEmitter.emit();
        buttonDown();
        self.endedCallbacksForFiredEmitter.emit();
      }
    } );

    // Set highlight listeners to the small screen button
    if ( !large ) {
      this.highlightListener = {
        over: function( event ) {
          highlightedScreenIndexProperty.value = index;
          icon.opacity = 1;
          text.fill = 'white';
        },
        out: function( event ) {
          highlightedScreenIndexProperty.value = -1;
          icon.opacity = 0.5;
          text.fill = 'gray';
        }
      };

      // On the home screen if you touch an inactive screen thumbnail, it grows.  If then without lifting your finger
      // you swipe over to the next thumbnail, that one would grow.
      this.addInputListener( {
        over: function( event ) {
          if ( event.pointer.isTouch ) {
            sim.screenIndexProperty.value = index;
          }
        }
      } );
    }

    this.mouseArea = this.touchArea = Shape.bounds( this.bounds ); // cover the gap in the vbox

    this.mutate( { tandem: tandem, phetioType: TScreenButton } );
  }

  joist.register( 'ScreenButton', ScreenButton );

  return inherit( VBox, ScreenButton );
} );