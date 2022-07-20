// Copyright 2014-2022, University of Colorado Boulder

/**
 * OptionsDialog displays sim-global options, accessed via the PhET > Options menu item.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../scenery/js/imports.js';
import Dialog, { DialogOptions } from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

type SelfOptions = EmptySelfOptions;

export type OptionsDialogOptions = SelfOptions & StrictOmit<DialogOptions, 'title'>;

export default class OptionsDialog extends Dialog {

  private readonly disposeOptionsDialog: () => void;

  public static readonly DEFAULT_FONT = new PhetFont( 20 );
  public static readonly DEFAULT_SPACING = 14;

  /**
   * @param createContent - creates the dialog's content
   * @param [providedOptions]
   */
  public constructor( createContent: ( tandem: Tandem ) => Node, providedOptions?: OptionsDialogOptions ) {

    const options = optionize<OptionsDialogOptions, SelfOptions, DialogOptions>()( {

      // DialogOptions
      titleAlign: 'center',
      bottomMargin: 26,
      ySpacing: 26,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioDynamicElement: true
    }, providedOptions );

    options.title = new Text( joistStrings.options.title, {
      font: new PhetFont( 30 ),
      maxWidth: 400, // determined empirically
      tandem: options.tandem.createTandem( 'title' )
    } );

    const content = createContent( options.tandem.createTandem( 'content' ) );

    super( content, options );

    this.disposeOptionsDialog = () => {
      content.dispose();
      options.title!.dispose();
    };
  }

  public override dispose(): void {
    this.disposeOptionsDialog();
    super.dispose();
  }
}

joist.register( 'OptionsDialog', OptionsDialog );