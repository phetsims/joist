/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;