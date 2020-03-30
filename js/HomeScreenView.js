// Copyright 2013-2020, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import AccessiblePeer from '../../scenery/js/accessibility/AccessiblePeer.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Node from '../../scenery/js/nodes/Node.js';
import Text from '../../scenery/js/nodes/Text.js';
import HomeScreenButton from './HomeScreenButton.js';
import joist from './joist.js';
import joistStrings from './joist-strings.js';
import ScreenView from './ScreenView.js';

// a11y strings
const simScreensString = joistStrings.a11y.simScreens;
const homeScreenDescriptionPatternString = joistStrings.a11y.homeScreenDescriptionPattern;

// constants
const LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

// iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
const TITLE_FONT_FAMILY = 'Century Gothic, Futura';

/**
 * @param {string} simName - the internationalized text for the sim name
 * @param {HomeScreenModel} model
 * @param {Tandem} tandem
 * @param {Object} [options]
 * @constructor
 */
function HomeScreenView( simName, model, tandem, options ) {
  assert && assert( simName, 'simName is required: ' + simName );
  const self = this;

  options = merge( {
    warningNode: null // {Node | null}, to display below the icons as a warning if available
  }, options );

  ScreenView.call( this, {
    layoutBounds: LAYOUT_BOUNDS,
    tandem: tandem,

    // Remove the "normal" PDOM structure Nodes like the screen summary, play area, and control area Nodes from the
    // HomeScreen. The HomeScreen handles its own description.
    includePDOMNodes: false,

    // a11y
    labelContent: simName,
    descriptionContent: StringUtils.fillIn( homeScreenDescriptionPatternString, {
      name: simName,
      screens: model.simScreens.length
    } )
  } );

  const title = new Text( simName, {
    font: new PhetFont( {
      size: 52,
      family: TITLE_FONT_FAMILY
    } ),
    fill: 'white',
    y: 130,
    maxWidth: this.layoutBounds.width - 10, // To support PhET-iO Clients setting this
    tandem: tandem.createTandem( 'title' )
  } );

  // Have this before adding the child to support the startup layout.
  title.on( 'bounds', () => {
    title.centerX = this.layoutBounds.centerX;
  } );

  this.addChild( title );
  title.scale( Math.min( 1, 0.9 * this.layoutBounds.width / title.width ) );

  const buttonGroupTandem = tandem.createTandem( 'buttonGroup' );

  const screenElements = _.map( model.simScreens, function( screen, index ) {

    assert && assert( screen.nameProperty.value, 'name is required for screen ' + model.simScreens.indexOf( screen ) );
    assert && assert( screen.homeScreenIcon, 'homeScreenIcon is required for screen ' + screen.nameProperty.value );

    const homeScreenButton = new HomeScreenButton(
      screen,
      model, {
        showUnselectedHomeScreenIconFrame: screen.showUnselectedHomeScreenIconFrame,

        // a11y
        innerContent: screen.nameProperty.value, // TODO: Does this need to be updated somewhere now that screen.name is a Property? see https://github.com/phetsims/joist/issues/597
        descriptionContent: screen.descriptionContent,

        // phet-io
        tandem: buttonGroupTandem.createTandem( screen.tandem.name + 'Button' )
      } );

    return { screen: screen, button: homeScreenButton };
  } );

  // a11y this is needed to create the right PDOM structure, the phet menu shouldn't be a child of this 'nav', so
  // the HomeScreenView can't be the 'nav' tag.
  const navIconsNode = new Node( {

    // a11y
    tagName: 'div',
    containerTagName: 'nav',
    labelTagName: 'h2',
    labelContent: simScreensString
  } );

  navIconsNode.addAriaLabelledbyAssociation( {
    thisElementName: AccessiblePeer.PRIMARY_SIBLING,
    otherNode: navIconsNode,
    otherElementName: AccessiblePeer.LABEL_SIBLING
  } );

  // Intermediate node, so that icons are always in the same rendering layer
  const iconsParentNode = new Node( { tagName: 'ol' } );

  // add the icons to the nav tag Node
  navIconsNode.addChild( iconsParentNode );
  this.addChild( navIconsNode );

  // Space the icons out more if there are fewer, so they will be spaced nicely.
  // Cannot have only 1 screen because for 1-screen sims there is no home screen.
  let spacing = 60;
  if ( model.simScreens.length === 4 ) {
    spacing = 33;
  }
  if ( model.simScreens.length >= 5 ) {
    spacing = 20;
  }

  let hBox = null;

  // @private - for a11y, allow focus to be set when returning to home screen from sim
  this.highlightedScreenButton = null;

  model.selectedScreenProperty.link( selectedScreen => {

    // remove previous layout of icons
    if ( hBox ) {
      hBox.removeAllChildren(); // because icons have reference to hBox (their parent)
      iconsParentNode.removeChild( hBox );
    }

    // add new layout of icons
    const icons = _.map( screenElements, screenElement => {

      // check for the current screen
      if ( screenElement.screen === selectedScreen ) {
        self.highlightedScreenButton = screenElement.button;
      }
      return screenElement.button;
    } );
    hBox = new HBox( {
      spacing: spacing,
      children: icons,
      align: 'top',
      resize: false,
      maxWidth: self.layoutBounds.width - 118
    } );
    iconsParentNode.addChild( hBox );

    // position the icons
    iconsParentNode.centerX = self.layoutBounds.width / 2;
    iconsParentNode.top = self.layoutBounds.height / 3 + 20;
  } );

  if ( options.warningNode ) {
    const warningNode = options.warningNode;

    this.addChild( warningNode );
    warningNode.centerX = this.layoutBounds.centerX;
    warningNode.bottom = this.layoutBounds.maxY - 2;
  }
}

joist.register( 'HomeScreenView', HomeScreenView );

export default inherit( ScreenView, HomeScreenView, {

    /**
     * For a11y, highlight the currently selected screen button
     * @public
     */
    focusHighlightedScreenButton: function() {
      this.highlightedScreenButton.focus();
    }
  },
  // @public - statics
  {
    TITLE_FONT_FAMILY: TITLE_FONT_FAMILY,
    LAYOUT_BOUNDS: LAYOUT_BOUNDS
  }
);