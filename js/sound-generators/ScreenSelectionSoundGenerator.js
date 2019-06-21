// Copyright 2019, University of Colorado Boulder

/**
 * generates sounds for when the user switches between screens
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const MultiClip = require( 'TAMBO/sound-generators/MultiClip' );
  const tambo = require( 'TAMBO/tambo' );

  // sounds
  const screenSelectedSound = require( 'sound!TAMBO/screen-selection.mp3' );
  const homeSelectedSound = require( 'sound!TAMBO/screen-selection-home-v2.mp3' );

  class ScreenSelectionSoundGenerator extends MultiClip {

    /**
     * @param {Property.<Screen|null>} currentScreenProperty - an axon property that indicates which sim screen is
     * currently selected
     */
    constructor( currentScreenProperty ) {

      super( [ homeSelectedSound, screenSelectedSound ] );

      currentScreenProperty.lazyLink( currentScreen => {
        if ( currentScreen === null ) {

          // home screen sound
          this.play( 0 );
        }
        else {

          // non-home screen selection sound
          this.play( 1 );
        }
      } );
    }
  }

  return tambo.register( 'ScreenSelectionSoundGenerator', ScreenSelectionSoundGenerator );
} );