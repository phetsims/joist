// Copyright 2013-2019, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var ScreenButton = require( 'JOIST/ScreenButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // a11y-strings
  var simScreensString = JoistA11yStrings.simScreens.value;
  var simScreenString = JoistA11yStrings.simScreen.value;
  var homeScreenDescriptionPatternString = JoistA11yStrings.homeScreenDescriptionPattern.value;

  // constants
  var LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  // iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
  var TITLE_FONT_FAMILY = 'Century Gothic, Futura';

  /**
   * @param {Sim} sim
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function HomeScreenView( sim, tandem, options ) {
    var self = this;

    options = _.extend( {
      warningNode: null // {Node | null}, to display below the icons as a warning if available
    }, options );

    ScreenView.call( this, {
      layoutBounds: LAYOUT_BOUNDS,
      tandem: tandem,

      // a11y
      labelContent: sim.name,
      descriptionContent: StringUtils.fillIn( homeScreenDescriptionPatternString, {
        name: sim.name,
        screens: sim.screens.length
      } )
    } );

    var title = new Text( sim.name, {
      font: new PhetFont( {
        size: 52,
        family: TITLE_FONT_FAMILY
      } ),
      fill: 'white',
      y: 130,
      tandem: tandem.createTandem( 'title' )
    } );
    this.addChild( title );
    title.scale( Math.min( 1, 0.9 * this.layoutBounds.width / title.width ) );
    title.centerX = this.layoutBounds.centerX;

    // Keep track of which screen is highlighted so the same screen can remain highlighted even if nodes are replaced
    // (say when one grows larger or smaller).
    var highlightedScreenIndexProperty = new Property( -1 );

    var screenElements = _.map( sim.screens, function( screen, index ) {

      assert && assert( screen.name, 'name is required for screen ' + sim.screens.indexOf( screen ) );
      assert && assert( screen.homeScreenIcon, 'homeScreenIcon is required for screen ' + screen.name );

      // Even though in the user interface the small and large buttons seem like a single UI component that has grown
      // larger, it would be quite a headache to create a composite button for the purposes of tandem, so instead the
      // large and small buttons are registered as separate instances.  See https://github.com/phetsims/phet-io/issues/99
      var largeTandem = tandem.createTandem( screen.screenTandem.tail + 'LargeButton' );

      // a11y
      var a11yScreenButtonOptions = {
        tagName: 'button',
        innerContent: screen.name,
        descriptionContent: screen.descriptionContent,
        appendDescription: true,
        containerTagName: 'li'
      };

      var largeScreenButton = new ScreenButton(
        true,
        sim,
        index,
        highlightedScreenIndexProperty,
        largeTandem,
        _.extend( a11yScreenButtonOptions, {
          // Don't 40 the VBox or it will shift down when the border becomes thicker
          resize: false,
          cursor: 'pointer'
        } ) );

      // Even though in the user interface the small and large buttons seem like a single UI component that has grown
      // larger, it would be quite a headache to create a composite button for the purposes of tandem, so instead the
      // large and small buttons are registered as separate instances.  See https://github.com/phetsims/phet-io/issues/99
      var smallTandem = tandem.createTandem( screen.screenTandem.tail + 'SmallButton' );

      var smallScreenButton = new ScreenButton(
        false,
        sim,
        index,
        highlightedScreenIndexProperty,
        smallTandem,
        _.extend( a11yScreenButtonOptions, {
          spacing: 3,
          cursor: 'pointer',
          showUnselectedHomeScreenIconFrame: screen.showUnselectedHomeScreenIconFrame
        } ) );

      smallScreenButton.addInputListener( smallScreenButton.highlightListener );
      largeScreenButton.addInputListener( smallScreenButton.highlightListener );

      // a11y support for click listeners on the screen buttons
      var toggleListener = function() {
        smallScreenButton.visible && smallScreenButton.focus();
        largeScreenButton.visible && largeScreenButton.focus();
      };
      smallScreenButton.addInputListener( { focus: toggleListener } );
      largeScreenButton.addInputListener( { click: toggleListener } );
      // largeScreenButton.mouseArea = largeScreenButton.touchArea = Shape.bounds( largeScreenButton.bounds ); // cover the gap in the vbox

      // a11y - add the right aria attributes to the buttons
      smallScreenButton.setAccessibleAttribute( 'aria-roledescription', simScreenString );
      largeScreenButton.setAccessibleAttribute( 'aria-roledescription', simScreenString );

      return { screen: screen, small: smallScreenButton, large: largeScreenButton, index: index };
    } );

    // a11y this is needed to create the right PDOM structure, the phet menu shouldn't be a child of this 'nav', so
    // the HomeScreenView can't be the 'nav' tag.
    var navIconsNode = new Node( {

      // a11y
      tagName: 'nav',
      ariaLabel: simScreensString
    } );

    // Intermediate node, so that icons are always in the same rendering layer
    var iconsParentNode = new Node( { tagName: 'ol' } );

    // add the icons to the nav tag Node
    navIconsNode.addChild( iconsParentNode );
    this.addChild( navIconsNode );

    // Space the icons out more if there are fewer, so they will be spaced nicely.
    // Cannot have only 1 screen because for 1-screen sims there is no home screen.
    var spacing = 60;
    if ( sim.screens.length === 4 ) {
      spacing = 33;
    }
    if ( sim.screens.length >= 5 ) {
      spacing = 20;
    }

    var hBox = null;

    // @private - for a11y, allow focus to be set when returning to home screen from sim
    this.highlightedScreenButton = null;

    sim.screenIndexProperty.link( function( screenIndex ) {

      // remove previous layout of icons
      if ( hBox ) {
        hBox.removeAllChildren(); // because icons have reference to hBox (their parent)
        iconsParentNode.removeChild( hBox );
      }

      // add new layout of icons
      var icons = _.map( screenElements, function( screenChild ) {

        // check for the current screen
        if ( screenChild.index === screenIndex ) {
          self.highlightedScreenButton = screenChild.large;
        }
        return screenChild.index === screenIndex ? screenChild.large : screenChild.small;
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
      var warningNode = options.warningNode;

      this.addChild( warningNode );
      warningNode.centerX = this.layoutBounds.centerX;
      warningNode.bottom = this.layoutBounds.maxY - 2;
    }
  }

  joist.register( 'HomeScreenView', HomeScreenView );

  return inherit( ScreenView, HomeScreenView, {

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
} );