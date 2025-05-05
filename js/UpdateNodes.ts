// Copyright 2015-2025, University of Colorado Boulder

/**
 * UI parts for update-related dialogs
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import SpinningIndicatorNode from '../../scenery-phet/js/SpinningIndicatorNode.js';
import VoicingText from '../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import HBox from '../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../scenery/js/layout/nodes/VBox.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import RichText, { type RichTextLinks } from '../../scenery/js/nodes/RichText.js';
import VStrut from '../../scenery/js/nodes/VStrut.js';
import allowLinksProperty from '../../scenery/js/util/allowLinksProperty.js';
import openPopup from '../../scenery/js/util/openPopup.js';
import TextPushButton from '../../sun/js/buttons/TextPushButton.js';
import checkSolidShape from '../../sun/js/shapes/checkSolidShape.js';
import exclamationSolidShape from '../../sun/js/shapes/exclamationSolidShape.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import updateCheck from './updateCheck.js';
import type UpdateDialog from './UpdateDialog.js';
import UpdateState from './UpdateState.js';

// constants
const UPDATE_TEXT_FONT = new PhetFont( 14 );
const MAX_WIDTH = 550; // Maximum width of the resulting update items

type Options = {
  big?: boolean;
  centerX?: number;
  centerY?: number;
  left?: number;
  top?: number;
};

type TStep = {
  step: ( dt: number ) => void;
  stepListener: ( dt: number ) => void;
};

type TStepHBox = TStep & HBox;

const UpdateNodes = {

  /**
   * "Checking" state node. With two size options (if options.big == true, it will be bigger)
   *
   * [options] - passed to the Node
   * returns step( dt ) and stepListener (bound to the node itself)
   * (joist-internal)
   */
  createCheckingNode: function( options: Options ): Node & TStep {
    const spinningIndicatorNode = new SpinningIndicatorNode( { diameter: options.big ? 24 : 18 } );
    const checkingNode = new HBox( merge( {
      spacing: options.big ? 10 : 8,
      maxWidth: MAX_WIDTH,
      children: [
        spinningIndicatorNode,
        new VoicingText( JoistStrings.updates.checkingStringProperty, {
          font: new PhetFont( options.big ? 16 : 14 ),
          fontWeight: options.big ? 'bold' : 'normal'
        } )
      ]
    }, options ) ) as TStepHBox;
    checkingNode.step = function( dt ) {
      if ( updateCheck.stateProperty.value === UpdateState.CHECKING ) {
        spinningIndicatorNode.step( dt );
      }
    };
    checkingNode.stepListener = checkingNode.step.bind( checkingNode );
    return checkingNode;
  },

  /**
   * "Up-to-date" state node
   * [options] - passed to the Node
   * (joist-internal)
   */
  createUpToDateNode: function( options: Options ): Node {
    return new HBox( merge( {
      spacing: 8,
      maxWidth: MAX_WIDTH,
      children: [
        new Rectangle( 0, 0, 20, 20, 5, 5, {
          fill: '#5c3',
          scale: options.big ? 1.2 : 1,
          children: [
            new Path( checkSolidShape, {
              fill: '#fff',
              scale: 0.48,
              centerX: 10,
              centerY: 10
            } )
          ]
        } ),
        new VoicingText( JoistStrings.updates.upToDateStringProperty, {
          font: new PhetFont( options.big ? 16 : 14 ),
          fontWeight: options.big ? 'bold' : 'normal'
        } )
      ]
    }, options ) );
  },

  /**
   * "Out-of-date" state node for the "About" dialog.
   * [options] - passed to the Node
   * (joist-internal)
   */
  createOutOfDateAboutNode: function( options: Options ): Node {
    const stringProperty = new DerivedProperty( [ JoistStrings.updates.outOfDateStringProperty, allowLinksProperty ], ( outOfDateString, allowLinks ) => {
      return allowLinks ? `<a href="{{url}}">${outOfDateString}</a>` : outOfDateString;
    } );

    const links: RichTextLinks = { url: updateCheck.updateURL };

    const linkNode = new RichText( stringProperty, {
      links: links,
      font: UPDATE_TEXT_FONT
    } );
    return new HBox( merge( {
      spacing: 8,
      maxWidth: MAX_WIDTH,
      children: [
        new Path( exclamationSolidShape, {
          fill: '#E87600', // "safety orange", according to Wikipedia
          scale: 0.381
        } ),
        linkNode
      ],

      // pdom
      tagName: 'div'
    }, options ) );
  },

  /**
   * "Out-of-date" state node for the "Check for update" dialog.
   * dialog - the dialog, so that it can be closed with the "No thanks..." button
   * [options] - passed to the Node
   * (joist-internal)
   */
  createOutOfDateDialogNode: function( dialog: UpdateDialog, ourVersionString: string, latestVersionString: string, options: Options ): Node {

    const latestVersionStringProperty = new DerivedProperty( [ JoistStrings.updates.newVersionAvailableStringProperty ], string => {
      return StringUtils.format( string, latestVersionString );
    } );
    const ourVersionStringProperty = new DerivedProperty( [ JoistStrings.updates.yourCurrentVersionStringProperty ], string => {
      return StringUtils.format( string, ourVersionString );
    } );

    const getUpdateButton = new TextPushButton( JoistStrings.updates.getUpdateStringProperty, {
      visibleProperty: allowLinksProperty,
      baseColor: '#6f6', font: UPDATE_TEXT_FONT, listener: function() {
        openPopup( updateCheck.updateURL ); // open in a new window/tab
      }
    } );
    const noThanksButton = new TextPushButton( JoistStrings.updates.noThanksStringProperty, {
      baseColor: '#ddd', font: UPDATE_TEXT_FONT, listener: function() {
        dialog.hide();

        // Closing the dialog is handled by the Dialog listener itself, no need to add code to close it here.
      }
    } );

    const latestVersionText = new VoicingText( latestVersionStringProperty, {
      font: new PhetFont( 16 ), fontWeight: 'bold'
    } );
    const ourVersionText = new VoicingText( ourVersionStringProperty, {
      font: UPDATE_TEXT_FONT
    } );

    const content = new VBox( merge( {
      spacing: 15,
      maxWidth: MAX_WIDTH,
      children: [
        new VBox( {
          spacing: 5, align: 'left', children: [
            latestVersionText,
            ourVersionText
          ]
        } ),
        new HBox( {
          spacing: 25, children: [
            getUpdateButton,
            noThanksButton
          ]
        } )
      ]
    }, options ) );

    content.addDisposable(
      getUpdateButton,
      noThanksButton,
      latestVersionText,
      ourVersionText,
      latestVersionStringProperty,
      ourVersionStringProperty
    );

    return content;
  },

  /**
   * "Offline" state node
   * [options] - passed to the Node
   * (joist-internal)
   */
  createOfflineNode: function( options: Options ): Node {
    return new HBox( merge( {
      spacing: 0,
      maxWidth: MAX_WIDTH,
      children: [
        new VStrut( 20 ), // spacer to match layout of other nodes
        new VoicingText( JoistStrings.updates.offlineStringProperty, {
          font: new PhetFont( options.big ? 16 : 14 ),
          fontWeight: options.big ? 'bold' : 'normal'
        } )
      ]
    }, options ) );
  }
};

joist.register( 'UpdateNodes', UpdateNodes );

export default UpdateNodes;