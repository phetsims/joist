// Copyright 2013-2018, University of Colorado Boulder

/**
 * The Home button that appears in the navigation bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  const FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  const JoistButton = require( 'JOIST/JoistButton' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );

  // a11y strings
  var homeString = JoistA11yStrings.home.value;
  var homeScreenString = JoistA11yStrings.homeScreen.value;
  var homeScreenDescriptionString = JoistA11yStrings.homeScreenDescription.value;

  /**
   * @param {number} navBarHeight
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function HomeButton( navBarHeight, navigationBarFillProperty, tandem, options ) {

    options = _.extend( {
      highlightExtensionWidth: 4,
      listener: null,

      // a11y,
      tagName: 'button',
      innerContent: homeString,
      containerTagName: 'li',
      descriptionContent: homeScreenDescriptionString,
      appendDescription: true
    }, options );

    var homeIcon = new FontAwesomeNode( 'home' );
    // scale so that the icon is slightly taller than screen button icons, value determined empirically, see joist#127
    homeIcon.setScaleMagnitude( 0.48 * navBarHeight / homeIcon.height );

    // transparent background, size determined empirically so that highlight is the same size as highlight on screen buttons
    var background = new Rectangle( 0, 0, homeIcon.width + 12, navBarHeight );
    homeIcon.center = background.center;

    var content = new Node( { children: [ background, homeIcon ] } );

    JoistButton.call( this, content, navigationBarFillProperty, tandem, options );

    // a11y - Pass a shape to the focusHighlight to prevent dilation, then tweak the bottom up just a hair so it
    // isn't off the screen.
    var highlightLineWidth = FocusHighlightPath.getOuterLineWidthFromNode( this );
    this.focusHighlight = Shape.bounds( this.bounds.setMaxY( this.bounds.maxY - highlightLineWidth / 2 ) );

    // a11y - add the role description for the HomeButton
    this.setAccessibleAttribute( 'aria-roledescription', homeScreenString );

    Property.multilink( [ this.interactionStateProperty, navigationBarFillProperty ], function( interactionState, navigationBarFill ) {
      if ( navigationBarFill === 'black' ) {
        homeIcon.fill = interactionState === ButtonInteractionState.PRESSED ? 'gray' : 'white';
      }
      else {
        homeIcon.fill = interactionState === ButtonInteractionState.PRESSED ? '#444' : '#222';
      }
    } );
  }

  joist.register( 'HomeButton', HomeButton );

  return inherit( JoistButton, HomeButton );
} );