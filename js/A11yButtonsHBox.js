// Copyright 2018, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var KeyboardHelpButton = require( 'JOIST/KeyboardHelpButton' );
  var NavigationBarSoundToggleButton = require( 'JOIST/NavigationBarSoundToggleButton' );
  var platform = require( 'PHET_CORE/platform' );
  var soundManager = require( 'TAMBO/soundManager' );
  var TransformTracker = require( 'SCENERY/util/TransformTracker' );

  /**
   * @param {Sim} sim
   * @param {Property.<Color|string>} backgroundColorProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function A11yButtonsHBox( sim, backgroundColorProperty, tandem, options ) {
    options = _.extend( {
      align: 'center',
      spacing: 6
    }, options );

    // list of optional buttons added for a11y
    var a11yButtons = [];

    // only put the sound on/off button on the nav bar if the sound library is enabled
    if ( sim.supportsSound ) {
      var soundOnOffButton = new NavigationBarSoundToggleButton(
        soundManager.enabledProperty,
        backgroundColorProperty,
        tandem.createTandem( 'soundOnOffButton' )
      );
      a11yButtons.push( soundOnOffButton );
    }

    // only show the keyboard help button if the sim is accessible, there is keyboard help content, and we are
    // not in mobile safari
    if ( phet.chipper.accessibility && sim.keyboardHelpNode && !platform.mobileSafari ) {

      // @public (joist-internal, read-only) - Pops open a dialog with information about keyboard navigation
      this.keyboardHelpButton = new KeyboardHelpButton(
        sim.keyboardHelpNode,
        backgroundColorProperty,
        tandem.createTandem( 'keyboardHelpButton' )
      );
      a11yButtons.push( this.keyboardHelpButton );
    }

    options.children = a11yButtons;
    HBox.call( this, options );
  }

  joist.register( 'A11yButtonsHBox', A11yButtonsHBox );

  return inherit( HBox, A11yButtonsHBox, {}, {

    /**
     * Ensures that the home-screen's a11y HBox will have the same global transform as the navbar's a11y HBox.
     * Listens to both sides (the navbar a11y HBox, and the home-screen's a11y HBox's parent) so that when either
     * changes, the transforms are synchronized by changing the home-screen's button position.
     * This method was copied from PhetButton.js, see https://github.com/phetsims/joist/issues/304.
     * @public (joist-internal)
     *
     * @param {HomeScreenView} homeScreen - The home screen view, where we will position the a11y HBox.
     * @param {NavigationBar} navigationBar - The main navigation bar
     * @param {Node} rootNode - The root of the Display's node tree
     */
    linkA11yButtonsHBoxTransform: function( homeScreen, navigationBar, rootNode ) {
      var homeScreenHBox = homeScreen.view.a11yButtonsHBox;

      var navBarHBoxTracker = new TransformTracker( navigationBar.a11yButtonsHBox.getUniqueTrailTo( rootNode ), {
        isStatic: true // our listener won't change any listeners - TODO: replace with emitter? see https://github.com/phetsims/scenery/issues/594
      } );
      var homeScreenTracker = new TransformTracker( homeScreenHBox.getParent().getUniqueTrailTo( rootNode ), {
        isStatic: true // our listener won't change any listeners - TODO: replace with emitter? see https://github.com/phetsims/scenery/issues/594
      } );

      function transformA11yButtonsHBox() {
        // Ensure transform equality: navBarHBox(global) = homeScreen(global) * homeScreenHBox(self)
        homeScreenHBox.matrix = homeScreenTracker.matrix.inverted().timesMatrix( navBarHBoxTracker.matrix );
      }

      // hook up listeners
      navBarHBoxTracker.addListener( transformA11yButtonsHBox );
      homeScreenTracker.addListener( transformA11yButtonsHBox );

      // synchronize immediately, in case there are no more transform changes before display
      transformA11yButtonsHBox();
    }
  } );
} );