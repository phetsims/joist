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
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );


  // phet-io modules
  var TScreenButton = require( 'ifphetio!PHET_IO/types/joist/TScreenButton' );

  var LARGE_ICON_HEIGHT = 140;

  function ScreenButton( large, sim, index, highlightedScreenIndexProperty, options ) {
    var self = this;

    var tandem = options.tandem;
    options.tandem = tandem.createSupertypeTandem();

    var screen = sim.screens[ index ];


    if ( large ) {
      // Wrap in a Node because we're scaling, and the same icon will be used for smallIconContent, and may be used by
      // the navigation bar.
      var largeIcon = new Node( {
        children: [ screen.homeScreenIcon ],
        scale: LARGE_ICON_HEIGHT / screen.homeScreenIcon.height
      } );
      var frame = new Frame( largeIcon );

      highlightedScreenIndexProperty.link( function( highlightedIndex ) { frame.setHighlighted( highlightedIndex === index ); } );

      var largeIconWithFrame = new Node( { children: [ frame, largeIcon ] } );
      var largeText = new Text( screen.name, { font: new PhetFont( 42 ), fill: PhetColorScheme.PHET_LOGO_YELLOW } );//Color match with the PhET Logo yellow

      //Shrink the text if it goes beyond the edge of the image
      if ( largeText.width > largeIconWithFrame.width ) {
        largeText.scale( largeIconWithFrame.width / largeText.width );
      }

      // 'down' function for the large button, refactored for input listener and accessibility
      var largeButtonDown = function() {
        self.startedCallbacksForFiredEmitter.emit();
        sim.showHomeScreenProperty.value = false;
        highlightedScreenIndexProperty.value = -1;
        self.endedCallbacksForFiredEmitter.emit();
      };
      VBox.call( this, {

        //Don't 40 the VBox or it will shift down when the border becomes thicker
        resize: false,

        cursor: 'pointer',

        children: [
          largeIconWithFrame,
          largeText
        ]
      } );

      this.startedCallbacksForFiredEmitter = new Emitter();
      this.endedCallbacksForFiredEmitter = new Emitter();


      // Activate the large screen button when pressed
      this.addInputListener( {
        down: largeButtonDown
      } );
    }
    else {

      // Maps the number of screens to a scale for the small icons. The scale is percentage of LARGE_ICON_HEIGHT.
      var smallIconScale = Util.linear( 2, 4, 0.875, 0.50, sim.screens.length );

      // Show a small (unselected) screen icon.  In some cases (if the icon has a black background), a border may be
      // shown around it as well.  See https://github.com/phetsims/color-vision/issues/49
      // Wrap in a Node because we're scaling, and the same icon will be used for largeIcon, and may be used by the
      // navigation bar.
      var smallIconContent = new Node( {
        opacity: 0.5,
        children: [ screen.homeScreenIcon ],
        scale: smallIconScale * LARGE_ICON_HEIGHT / screen.homeScreenIcon.height
      } );

      var smallFrame = new Rectangle( 0, 0, smallIconContent.width, smallIconContent.height, {
        stroke: options.showSmallHomeScreenIconFrame ? '#dddddd' : null,
        lineWidth: 0.7
      } );
      var smallScreenButtonIcon = new Node( { opacity: 0.5, children: [ smallFrame, smallIconContent ] } );

      var smallScreenButtonText = new Text( screen.name, { font: new PhetFont( 18 ), fill: 'gray' } );

      //Shrink the text if it goes beyond the edge of the image
      if ( smallScreenButtonText.width > smallScreenButtonIcon.width ) {
        smallScreenButtonText.scale( smallScreenButtonIcon.width / smallScreenButtonText.width );
      }

      // down function for small button, refactored for accessibility and the input listener
      var smallButtonDown = function() {
        self.startedCallbacksForFiredEmitter.emit();
        sim.screenIndexProperty.value = index;
        self.endedCallbacksForFiredEmitter.emit();
      };
      VBox.call ( this, {
        spacing: 3, cursor: 'pointer', children: [
          smallScreenButtonIcon,
          smallScreenButtonText
        ]
      } );

      this.startedCallbacksForFiredEmitter = new Emitter();
      this.endedCallbacksForFiredEmitter = new Emitter();
      this.mouseArea = this.touchArea = Shape.bounds( this.bounds ); //cover the gap in the vbox
      this.addInputListener( {
        down: function( event ) {
          smallButtonDown();
        },

        // On the home screen if you touch an inactive screen thumbnail, it grows.  If then without lifting your finger
        // you swipe over to the next thumbnail, that one would grow.
        over: function( event ) {
          if ( event.pointer.isTouch ) {
            sim.screenIndexProperty.value = index;
          }
        }
      } );


      this.highlightListener = {
        over: function( event ) {
          highlightedScreenIndexProperty.value = index;
          smallScreenButtonIcon.opacity = 1;
          smallScreenButtonText.fill = 'white';
        },
        out: function( event ) {
          highlightedScreenIndexProperty.value = -1;
          smallScreenButtonIcon.opacity = 0.5;
          smallScreenButtonText.fill = 'gray';
        }
      };
    }



    if(large){
      this.mouseArea = this.touchArea = Shape.bounds( this.bounds ); //cover the gap in the vbox
    }


    this.mutate( { tandem: tandem, phetioType: TScreenButton } );
  }


  joist.register( 'ScreenButton', ScreenButton );

  return inherit( VBox, ScreenButton );
} );