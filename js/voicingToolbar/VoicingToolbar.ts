// Copyright 2021-2025, University of Colorado Boulder

/**
 * The VoicingToolbar along the left edge of the screen with controls related to Voicing. It is displayed when
 * Voicing is enabled. But it can be hidden separately in the PreferencesDialog at that point.
 *
 * When open, the sim will resize and shift to the right to create space. Screen bounds are adjusted so that
 * simulation components will never overlap with the VoicingToolbar.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import type TProperty from '../../../axon/js/TProperty.js';
import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Shape from '../../../kite/js/Shape.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import voicingManager from '../../../scenery/js/accessibility/voicing/voicingManager.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import ButtonNode from '../../../sun/js/buttons/ButtonNode.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import audioManager from '../audioManager.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import type LookAndFeel from '../LookAndFeel.js';
import { type AnyScreen } from '../Screen.js';
import VoicingToolbarAlertManager from './VoicingToolbarAlertManager.js';
import VoicingToolbarItem from './VoicingToolbarItem.js';

// constants
const MAX_ANIMATION_SPEED = 250; // in view coordinates per second, assuming 60 fps
const CONTENT_TOP_MARGIN = 15; // margin between top of VoicingToolbar and contents

// constants
const openToolbarStringProperty = JoistStrings.a11y.voicingToolbar.openToolbarStringProperty;
const closeToolbarStringProperty = JoistStrings.a11y.voicingToolbar.closeToolbarStringProperty;
const hideToolbarStringProperty = JoistStrings.a11y.voicingToolbar.hideToolbarStringProperty;
const showToolbarStringProperty = JoistStrings.a11y.voicingToolbar.showToolbarStringProperty;
const toolbarShownStringProperty = JoistStrings.a11y.voicingToolbar.toolbarShownStringProperty;
const toolbarHiddenStringProperty = JoistStrings.a11y.voicingToolbar.toolbarHiddenStringProperty;

type SelfOptions = EmptySelfOptions;
type VoicingToolbarOptions = EmptySelfOptions & StrictOmit<NodeOptions, 'isDisposable'>;

class VoicingToolbar extends Node {

  // Whether the VoicingToolbar is enabled (visible to the user)
  private readonly isEnabledProperty: TReadOnlyProperty<boolean>;

  // the Rectangle for the VoicingToolbar that surrounds all content, bounds set once
  // content is created and in layout to fill height of screen
  private readonly backgroundRectangle: Rectangle;

  // The position of the right edge of the backgroundRectangle in local coordinates.
  // This is what controls the position of the VoicingToolbar as it is open/closed/removed/animating.
  public readonly rightPositionProperty: TProperty<number>;

  // The target position for the rightPositionProperty, to support animation. In step,
  // the rightPositionProperty will be changed until the rightPositionProperty equals the rightDestinationPosition.
  private rightDestinationPosition: number;

  // Whether the VoicingToolbar is open or closed. This is different from whether or not it is showing.
  private readonly openProperty: BooleanProperty;

  // Whether the VoicingToolbar is shown to the user. This is when the toolbar is enabled, voicing is enabled,
  // and if all audio is enabled. The VoicingToolbar only includes controls related to audio (voicing) so
  // when audio is disabled there is no need to show it.
  private readonly isShowingProperty: TReadOnlyProperty<boolean>;

  // Scale applied to the VoicingToolbar and its contents in response to layout and window resizing.
  private layoutScale = 1;

  // Contents for the VoicingToolbar, currently only controls related to the voicing
  // feature.
  private readonly menuContent: VoicingToolbarItem;

  private readonly openButton: RoundPushButton;

  // width of content for the toolbar in the local coordinate frame
  private readonly contentWidth: number;

  // Margin between toolbar content and edge of the backgroundRectangle, in the local coordinate
  // frame. Also used to determine the right position when closed. This is the width of the button so that when the
  // VoicingToolbar is closed only the button is shown and all other content is hidden.
  private readonly contentMargin: number;

  public constructor( enabledProperty: TReadOnlyProperty<boolean>, selectedScreenProperty: TReadOnlyProperty<AnyScreen>,
                      lookAndFeel: LookAndFeel, providedOptions?: VoicingToolbarOptions ) {

    const options = optionize<VoicingToolbarOptions, SelfOptions, NodeOptions>()( {

      // Only one instance is expected so dispose is not necessary.
      isDisposable: false,

      // pdom
      tagName: 'div',

      // phet-io
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, providedOptions );

    super( options );

    this.isEnabledProperty = enabledProperty;

    this.backgroundRectangle = new Rectangle( 0, 0, 0, 0, {
      fill: lookAndFeel.navigationBarFillProperty
    } );

    // The VoicingToolbar is initially open unless explicitly collapsed because of a query parameter.
    this.openProperty = new BooleanProperty( !phet.chipper.queryParameters.voicingCollapseToolbar );

    this.isShowingProperty = DerivedProperty.and( [
      this.isEnabledProperty,
      voicingManager.enabledProperty,
      audioManager.audioEnabledProperty ] );

    const voicingAlertManager = new VoicingToolbarAlertManager( selectedScreenProperty );
    this.menuContent = new VoicingToolbarItem( voicingAlertManager, lookAndFeel, {
      tandem: options.tandem?.createTandem( 'menuContent' )
    } );

    // icon for the openButton
    const chevronIcon = new DoubleChevron();

    this.openButton = new RoundPushButton( {
      content: chevronIcon,
      listener: () => this.openProperty.toggle(),
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      baseColor: 'lightgrey',

      // phet-io - opting out of Tandems for now
      tandem: Tandem.OPT_OUT
    } );

    this.contentWidth = this.menuContent.localBounds.width;

    this.contentMargin = this.openButton.localBounds.width;

    // The position of the right edge of the backgroundRectangle in local coordinates.
    // This is what controls the position of the VoicingToolbar as it is open/closed/removed/animating.
    this.rightPositionProperty = new NumberProperty( this.getHiddenPosition() );

    // The target position for the rightPositionProperty, to support animation. In step,
    // the rightPositionProperty will be changed until the rightPositionProperty equals the rightDestinationPosition.
    this.rightDestinationPosition = 0;

    // a parent for all Nodes of the toolbar, so we can set visibility of this group internally when
    // the isShowingProperty changes
    const contentParent = new Node( {
      children: [ this.backgroundRectangle, this.menuContent, this.openButton ]
    } );
    this.addChild( contentParent );

    // move to destination position in the animation frame
    const timerListener = ( dt: number ) => {
      this.step( dt );
    };
    stepTimer.addListener( timerListener );

    const isOpenListener = ( open: boolean, oldValue: boolean | null ) => {

      // rotate chevron to indicate direction of toolbar movement
      chevronIcon.matrix = open ? Matrix3.scaling( -1, 1 ) : Matrix3.IDENTITY;

      // when closed, menu content should be hidden from screen readers and the navigation order
      this.menuContent.pdomVisible = open;

      this.openButton.accessibleName = open ? closeToolbarStringProperty : openToolbarStringProperty;
      this.openButton.voicingNameResponse = open ? hideToolbarStringProperty : showToolbarStringProperty;

      this.updateDestinationPosition();

      if ( oldValue !== null ) {
        const alertProperty = open ? toolbarShownStringProperty : toolbarHiddenStringProperty;
        this.openButton.voicingSpeakContextResponse( {
          contextResponse: alertProperty
        } );

        this.addAccessibleResponse( alertProperty );
      }
    };
    this.openProperty.link( isOpenListener );

    // when shown or hidden update destination positions so it animates open or close
    const isShowingListener = ( showing: boolean ) => {
      this.updateDestinationPosition();

      // when now showing, this entire toolbar should be hidden for Interactive Description, but we don't use
      // visibility directly because we want to see the VoicingToolbar animate away
      contentParent.pdomVisible = showing;
    };
    this.isShowingProperty.link( isShowingListener );
  }

  /**
   * Returns the width of the VoicingToolbar that can be seen on screen. This can be any value from the full width of the
   * VoicingToolbar to zero width, depending on whether it is open, closed, removed entirely, or animating.
   */
  public getDisplayedWidth(): number {
    return this.rightPositionProperty.value * this.layoutScale + this.openButton.width / 2;
  }

  private getHiddenPosition(): number {
    assert && assert( typeof this.contentMargin === 'number' );
    return -this.contentMargin / 2;
  }

  /**
   * Update rightDestinationPosition so that the VoicingToolbar will animate towards opening, closing, or being removed
   * entirely from view.
   */
  private updateDestinationPosition(): void {
    if ( this.isShowingProperty.value ) {
      // the VoicingToolbar is enabled and should either show all content or just the openButton
      this.rightDestinationPosition = this.openProperty.value ? this.contentWidth + this.contentMargin * 2 : this.contentMargin;
    }
    else {
      // no aspect of the menu should be visible
      this.rightDestinationPosition = this.getHiddenPosition();
    }
  }

  /**
   * Animated the VoicingToolbar as it opens and closes.
   */
  private step( dt: number ): void {
    const distance = Math.abs( this.rightPositionProperty.value - this.rightDestinationPosition );
    if ( distance !== 0 ) {
      const animationDistance = Math.min( distance, MAX_ANIMATION_SPEED * dt );
      const currentPosition = this.rightPositionProperty.value;
      this.rightPositionProperty.value = this.rightDestinationPosition > currentPosition ?
                                         currentPosition + animationDistance :
                                         currentPosition - animationDistance;
    }
  }

  /**
   * Layout for the VoicingToolbar, called whenever position changes or window is resized.
   */
  public layout( scale: number, height: number ): void {
    this.layoutScale = scale;
    this.menuContent.setScaleMagnitude( scale );
    this.openButton.setScaleMagnitude( scale );
    this.backgroundRectangle.rectWidth = scale * ( this.contentWidth + this.contentMargin * 2 );
    this.backgroundRectangle.rectHeight = height;
    this.backgroundRectangle.right = this.rightPositionProperty.value * scale;
    this.openButton.center = this.backgroundRectangle.rightCenter;
    this.menuContent.centerTop = this.backgroundRectangle.centerTop.plusXY( 0, CONTENT_TOP_MARGIN );
  }
}

/**
 * The icon for the button that opens and closes the VoicingToolbar.
 */
class DoubleChevron extends Path {
  public constructor() {

    // spacing and dimensions for the arrows
    const chevronSpacing = 8;
    const chevronWidth = 5;
    const chevronHeight = 12;

    const chevronShape = new Shape();
    for ( let i = 0; i < 2; i++ ) {
      const left = i * chevronSpacing;
      chevronShape.moveTo( left, 0 );
      chevronShape.lineTo( left + chevronWidth, chevronHeight / 2 );
      chevronShape.lineTo( left, chevronHeight );
    }

    super( chevronShape, {
      stroke: 'black',
      lineWidth: 3.5,
      lineCap: 'round'
    } );
  }
}

joist.register( 'VoicingToolbar', VoicingToolbar );
export default VoicingToolbar;