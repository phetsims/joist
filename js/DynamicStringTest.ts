// Copyright 2022-2023, University of Colorado Boulder

/**
 * For testing dynamic layout in sims that may not yet have submitted translations, enabled via ?stringTest=dynamic.
 * Please see initialize-globals for the hotkeys.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import { localizedStrings } from '../../chipper/js/getStringModule.js';
import Utils from '../../dot/js/Utils.js';
import joist from './joist.js';

// key codes
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const SPACE_BAR = 32;

// Random words of different lengths that can be cycled through
const WORD_SOURCE = 'Sometimes when Hippopotomonstrosesquippedaliophobia want lyrics you turn to Shakespeare like ' +
                    'the following text copied from some work ' +
                    'To be or not to be that is the question ' +
                    'Supercalifragilisticexpeladocious tis nobler in the mind to suffer ' +
                    'The slings and arrows of antidisestablishmentarianism fortune ' +
                    'Or to take Incomprehensibility against a sea of Floccinaucinihilipilification';

export default class DynamicStringTest {
  public static init(): void {

    let stringFactor = 1;
    let stride = 0;
    const words = WORD_SOURCE.split( ' ' );

    function setStride( newStride: number ): void {
      stride = newStride;
      console.log( 'stride = ' + stride );
      localizedStrings.forEach( ( localizedString, index ) => {
        localizedString.property.value = words[ ( index + stride ) % words.length ];
      } );
    }

    window.addEventListener( 'keydown', event => {

      // Left Arrow: halve string
      // Right Arrow: double string
      if ( event.keyCode === LEFT_ARROW || event.keyCode === RIGHT_ARROW ) {

        // Set the string factor based on left (halve) or right (double) arrow keys.
        stringFactor = event.keyCode === LEFT_ARROW ? Math.max( stringFactor * 0.5, 0.01 ) : stringFactor * 2;

        localizedStrings.forEach( localizedString => {
          localizedString.restoreInitialValue( 'en' );

          // Strip out all RTL (U+202A), LTR  (U+202B), and PDF  (U+202C) characters from string.
          const strippedString = localizedString.property.value.replace( /[\u202A\u202B\u202C]/g, '' );
          localizedString.property.value = applyStringFactor( strippedString, stringFactor );
        } );
      }

      // Space Bar: reset
      else if ( event.keyCode === SPACE_BAR ) {
        stringFactor = 1;
        stride = 0;
        console.log( 'stride = ' + stride );
        localizedStrings.forEach( localizedString => localizedString.restoreInitialValue( 'en' ) );
      }

      // Up Arrow: increase stride
      else if ( event.keyCode === UP_ARROW ) {
        setStride( stride + 1 );
      }

      // Down Arrow: decrease stride
      else if ( event.keyCode === DOWN_ARROW ) {
        let newStride = stride - 1;
        if ( newStride < 0 ) {
          newStride = words.length - 1;
        }
        setStride( newStride );
      }
    } );
  }
}

/**
 * Returns a string with its length based on the string factor.
 */
function applyStringFactor( string: string, factor: number ): string {
  assert && assert( factor > 0, `factor must be > 0: ${factor}` );

  if ( factor > 1 ) {
    return doubleString( string, factor );
  }
  else {

    // Create an array of all placeholders that are present in the string. These are strings surrounded by 2 sets of
    // curly braces, like '{{value}}'. This will be an empty array if no match is found.
    const placeholders = string.match( /{{(.+?)}}/g ) || [];

    // Remove all placeholders from the string.
    const noPlaceholdersString = string.replace( /{{(.+?)}}/g, '' );

    // Reduce the length of the string.
    const stringLength = Utils.toFixedNumber( noPlaceholdersString.length * factor + 1, 0 );
    const reducedString = noPlaceholdersString.substring( 0, stringLength );

    // Append placeholders to the end of the reduced string. This will add nothing if placeholders is empty.
    return reducedString + placeholders.join( '' );
  }
}

/**
 * Doubles a string n times.
 */
function doubleString( string: string, n: number ): string {
  assert && assert( n > 1 && Number.isInteger( n ), `expected an integer greater than 1, n=${n}` );
  let growingString = string;
  while ( n > 1 ) {
    growingString += string;
    n -= 1;
  }
  return growingString;
}

joist.register( 'DynamicStringTest', DynamicStringTest );