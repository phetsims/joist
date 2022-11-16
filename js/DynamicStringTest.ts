// Copyright 2022, University of Colorado Boulder

import { localizedStrings } from '../../chipper/js/getStringModule.js';
import Utils from '../../dot/js/Utils.js';

/**
 * For testing dynamic layout in sims that may not yet have submitted translations, enabled via ?stringTest=dynamic.
 * Please see initialize-globals for the hotkeys.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */
export default class DynamicStringTest {

  public static init(): void {

    let stride = 0;

    // Random words of different lengths that can be cycled through
    const wordSource = 'Sometimes when Hippopotomonstrosesquippedaliophobia want lyrics you turn to Shakespeare like the following text copied from some work ' +
                       'To be or not to be that is the question ' +
                       'Supercalifragilisticexpeladocious tis nobler in the mind to suffer ' +
                       'The slings and arrows of antidisestablishmentarianism fortune ' +
                       'Or to take Incomprehensibility against a sea of Floccinaucinihilipilification';
    const words = wordSource.split( ' ' );
    window.addEventListener( 'keydown', event => {

      // check if the keyboard event is a right arrow key
      if ( event.keyCode === 39 ) {
        localizedStrings.forEach( localizedString => {
          localizedString.property.value = localizedString.property.value + localizedString.property.value;
        } );
      }

      // check if the keyboard event is a left arrow key
      if ( event.keyCode === 37 ) {
        localizedStrings.forEach( localizedString => {

          // Strip out all RTL (U+202A), LTR  (U+202B), and PDF  (U+202C) characters from string.
          const strippedString = localizedString.property.value.replace( /[\u202A\u202B\u202C]/g, '' );
          const stringLength = Utils.toFixedNumber( strippedString.length / 2 + 1, 0 );
          localizedString.property.value = localizedString.property.value.substring( 0, stringLength );
        } );
      }

      function setStride( newStride: number ): void {
        stride = newStride;
        console.log( 'stride = ' + stride );
        localizedStrings.forEach( ( localizedString, index ) => {
          localizedString.property.value = words[ ( index + stride ) % words.length ];
        } );
      }

      // Check if the user press the spacebar
      if ( event.keyCode === 32 ) {
        stride = 0;
        console.log( 'stride = ' + stride );
        localizedStrings.forEach( localizedString => localizedString.restoreInitialValue( 'en' ) );
      }

      // Check if the keyboard event is an up arrow key
      if ( event.keyCode === 38 ) {
        setStride( stride + 1 );
      }

      // Check if the keyboard event is an down arrow key
      if ( event.keyCode === 40 ) {
        let newStride = stride - 1;
        if ( newStride < 0 ) {
          newStride = words.length - 1;
        }
        setStride( newStride );
      }
    } );
  }
}