// Copyright 2013-2020, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Text from '../../scenery/js/nodes/Text.js';
import soundManager from '../../tambo/js/soundManager.js';
import HomeScreenButton from './HomeScreenButton.js';
import HomeScreenSoundGenerator from './HomeScreenSoundGenerator.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import ScreenView from './ScreenView.js';

const homeScreenDescriptionPatternString = joistStrings.a11y.homeScreenDescriptionPattern;

// constants

// NOTE: In https://github.com/phetsims/joist/issues/640, we attempted to use ScreenView.DEFAULT_LAYOUT_BOUNDS here.
// Lots of problems were encountered, since both the Home screen and navigation bar are dependent on this value.
// If/when joist is cleaned up, this should be ScreenView.DEFAULT_LAYOUT_BOUNDS.
const LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

// iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
const TITLE_FONT_FAMILY = 'Century Gothic, Futura';

class HomeScreenView extends ScreenView {

  /**
   * @param {Property.<string>} simNameProperty - the internationalized text for the sim name
   * @param {HomeScreenModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( simNameProperty, model, tandem, options ) {
    assert && assert( simNameProperty.value, 'simName is required: ' + simNameProperty.value );

    options = merge( {
      warningNode: null // {Node | null}, to display below the icons as a warning if available
    }, options );

    super( {
      layoutBounds: LAYOUT_BOUNDS,
      tandem: tandem,

      // Remove the "normal" PDOM structure Nodes like the screen summary, play area, and control area Nodes from the
      // HomeScreen. The HomeScreen handles its own description.
      includePDOMNodes: false,

      // pdom
      labelContent: simNameProperty.value,
      descriptionContent: StringUtils.fillIn( homeScreenDescriptionPatternString, {
        name: simNameProperty.value,
        screens: model.simScreens.length
      } )
    } );

    const titleText = new Text( simNameProperty.value, {
      font: new PhetFont( {
        size: 52,
        family: TITLE_FONT_FAMILY
      } ),
      fill: 'white',
      y: 130,
      maxWidth: this.layoutBounds.width - 10, // To support PhET-iO Clients setting this
      tandem: tandem.createTandem( 'titleText' ),
      textPropertyOptions: { phetioReadOnly: true }
    } );

    // update the titleText when the sim name changes
    simNameProperty.link( simTitle => titleText.setText( simTitle ) );

    // Have this before adding the child to support the startup layout. Use `localBoundsProperty` to avoid an infinite loop.
    titleText.localBoundsProperty.link( () => {
      titleText.centerX = this.layoutBounds.centerX;
    } );

    this.addChild( titleText );

    const buttonGroupTandem = tandem.createTandem( 'buttonGroup' );

    const screenButtons = _.map( model.simScreens, screen => {

      assert && assert( screen.nameProperty.value, 'name is required for screen ' + model.simScreens.indexOf( screen ) );
      assert && assert( screen.homeScreenIcon, 'homeScreenIcon is required for screen ' + screen.nameProperty.value );

      const homeScreenButton = new HomeScreenButton(
        screen,
        model, {
          showUnselectedHomeScreenIconFrame: screen.showUnselectedHomeScreenIconFrame,

          // pdom
          descriptionContent: screen.descriptionContent,

          // phet-io
          tandem: buttonGroupTandem.createTandem( screen.tandem.name + 'Button' )
        } );

      screen.pdomDisplayNameProperty.link( screenName => {
        homeScreenButton.innerContent = screenName;
      } );

      return homeScreenButton;
    } );

    // Space the icons out more if there are fewer, so they will be spaced nicely.
    // Cannot have only 1 screen because for 1-screen sims there is no home screen.
    let spacing = 60;
    if ( model.simScreens.length === 4 ) {
      spacing = 33;
    }
    if ( model.simScreens.length >= 5 ) {
      spacing = 20;
    }

    // add layout of icons
    const hBox = new HBox( {
      spacing: spacing,
      children: screenButtons,
      align: 'top',
      resize: false, // see https://github.com/phetsims/scenery/issues/116
      maxWidth: this.layoutBounds.width - 118,

      // pdom
      tagName: 'ol'
    } );
    this.addChild( hBox );

    // @private - for a11y, allow focus to be set when returning to home screen from sim
    this.highlightedScreenButton = null;

    const updateIconsLayout = () => {
      for ( let i = 0; i < screenButtons.length; i++ ) {
        const screenButton = screenButtons[ i ];
        if ( screenButton.screen === model.selectedScreenProperty.value ) {
          this.highlightedScreenButton = screenButton;
          break;
        }
      }

      assert && assert( this.highlightedScreenButton, 'highlighted screen button should be declared' );

      hBox.updateLayout();

      // position the icons
      hBox.centerX = this.layoutBounds.width / 2;
      hBox.top = this.layoutBounds.height / 3 + 20;
    };

    // When the selected screen changes, update layout of the icons
    model.selectedScreenProperty.link( updateIconsLayout );

    // When the visibility of the icons changes, say via Studio, update layout of the icons.
    screenButtons.forEach( screenButton => screenButton._visibleProperty.link( updateIconsLayout ) );

    // Add sound generation for screen selection.  This generates sound for all changes between screens, not just for the
    // home screen.
    soundManager.addSoundGenerator( new HomeScreenSoundGenerator( model, { initialOutputLevel: 0.5 } ), {
      categoryName: 'user-interface'
    } );

    if ( options.warningNode ) {
      const warningNode = options.warningNode;
      this.addChild( warningNode );
      warningNode.centerX = this.layoutBounds.centerX;
      warningNode.bottom = this.layoutBounds.maxY - 2;
    }
  }

  /**
   * For a11y, highlight the currently selected screen button
   * @public
   */
  focusHighlightedScreenButton() {
    this.highlightedScreenButton.focus();
  }
}

// @public
HomeScreenView.TITLE_FONT_FAMILY = TITLE_FONT_FAMILY;
HomeScreenView.LAYOUT_BOUNDS = LAYOUT_BOUNDS;

joist.register( 'HomeScreenView', HomeScreenView );
export default HomeScreenView;