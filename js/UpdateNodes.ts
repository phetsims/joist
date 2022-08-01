// Copyright 2015-2022, University of Colorado Boulder

/**
 * UI parts for update-related dialogs
 */

import merge from '../../phet-core/js/merge.js';
import openPopup from '../../phet-core/js/openPopup.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import SpinningIndicatorNode from '../../scenery-phet/js/SpinningIndicatorNode.js';
import { HBox, Node, Path, Rectangle, RichText, VBox, VoicingText, VStrut } from '../../scenery/js/imports.js';
import checkSolidShape from '../../sherpa/js/fontawesome-5/checkSolidShape.js';
import exclamationTriangleSolidShape from '../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import TextPushButton from '../../sun/js/buttons/TextPushButton.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import updateCheck from './updateCheck.js';
import UpdateState from './UpdateState.js';
import UpdateDialog from './UpdateDialog.js';

const updatesCheckingString = joistStrings.updates.checking;
const updatesGetUpdateString = joistStrings.updates.getUpdate;
const updatesNewVersionAvailableString = joistStrings.updates.newVersionAvailable;
const updatesNoThanksString = joistStrings.updates.noThanks;
const updatesOfflineString = joistStrings.updates.offline;
const updatesOutOfDateString = joistStrings.updates.outOfDate;
const updatesUpToDateString = joistStrings.updates.upToDate;
const updatesYourCurrentVersionString = joistStrings.updates.yourCurrentVersion;

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

type IStep = {
  step: ( dt: number ) => void;
  stepListener: ( dt: number ) => void;
};

type TStepHBox = IStep & HBox;

const UpdateNodes = {

  /**
   * "Checking" state node. With two size options (if options.big == true, it will be bigger)
   *
   * [options] - passed to the Node
   * returns step( dt ) and stepListener (bound to the node itself)
   * (joist-internal)
   */
  createCheckingNode: function( options: Options ): Node & IStep {
    const spinningIndicatorNode = new SpinningIndicatorNode( { diameter: options.big ? 24 : 18 } );
    const checkingNode = new HBox( merge( {
      spacing: options.big ? 10 : 8,
      maxWidth: MAX_WIDTH,
      children: [
        spinningIndicatorNode,
        new VoicingText( updatesCheckingString, {
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
              scale: 0.029,
              centerX: 10,
              centerY: 10
            } )
          ]
        } ),
        new VoicingText( updatesUpToDateString, {
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
    const text = phet.chipper.queryParameters.allowLinks ? `<a href="{{url}}">${updatesOutOfDateString}</a>` : updatesOutOfDateString;
    const linkNode = new RichText( text, {
      links: phet.chipper.queryParameters.allowLinks && { url: updateCheck.updateURL }, // RichText must fill in URL for link
      font: UPDATE_TEXT_FONT
    } );
    return new HBox( merge( {
      spacing: 8,
      cursor: phet.chipper.queryParameters.allowLinks ? 'pointer' : null,
      maxWidth: MAX_WIDTH,
      children: [
        new Path( exclamationTriangleSolidShape, {
          fill: '#E87600', // "safety orange", according to Wikipedia
          scale: 0.03
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
    return new VBox( merge( {
      spacing: 15,
      maxWidth: MAX_WIDTH,
      children: [
        new VBox( {
          spacing: 5, align: 'left', children: [
            new VoicingText( StringUtils.format( updatesNewVersionAvailableString, latestVersionString ), {
              font: new PhetFont( 16 ), fontWeight: 'bold'
            } ),
            new VoicingText( StringUtils.format( updatesYourCurrentVersionString, ourVersionString ), {
              font: UPDATE_TEXT_FONT
            } )
          ]
        } ),
        new HBox( {
          spacing: 25, children: [
            new TextPushButton( updatesGetUpdateString, {
              baseColor: '#6f6', font: UPDATE_TEXT_FONT, listener: function() {
                openPopup( updateCheck.updateURL ); // open in a new window/tab
              }
            } ),
            new TextPushButton( updatesNoThanksString, {
              baseColor: '#ddd', font: UPDATE_TEXT_FONT, listener: function() {
                dialog.hide();

                // Closing the dialog is handled by the Dialog listener itself, no need to add code to close it here.
              }
            } )
          ]
        } )
      ]
    }, options ) );
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
        new VoicingText( updatesOfflineString, {
          font: new PhetFont( options.big ? 16 : 14 ),
          fontWeight: options.big ? 'bold' : 'normal'
        } )
      ]
    }, options ) );
  }
};

joist.register( 'UpdateNodes', UpdateNodes );

export default UpdateNodes;