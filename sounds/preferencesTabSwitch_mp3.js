/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAACBswxCEzjIrDjBeW1nWQOPADA/E+9QSccExPE81JREkQl5v6bZ4I0G8DzzApBlAAoRRcvQ8bPG1ZfKAl9e+O/////t//9oAUAgTCAFKxMMYJG4tBowOBvECBjiqEsxGidrI8eeXxMyBUTjZaUytk6yE+NBc0n/d/7/+n///P0qgBAABBkqlm5EgmkZ/RwfEMcYeBOQgUY//syxAuCCTAzJs53IbEThqh1vmhGVimaMsaYKCaYMkwaxBoYoFUZxiuEDKDSINQoSM+A6Mq4zBwKgRmQ/KKpn/////////7wBLrsJFAGFh0hMIgEL7RxgFIssGEQ0x/ghHJinVNmZYiGuPK0FD59UrY4qhLKKMv9FbQwNo3L09alNr//t6ZBdKO3/q21AAAADlGAAIBD8f15ZcCQQ//7MsQIAgfIMUes80DxHYcnadzwhgwVURKYQBg0kYy5oVJkqYyigyRAWdt8eDqHc0C1K4AryiqCYgeX/0Wf//////qAdgMACAwnLgal9M8w9dY6fDkw9BwABGjEfNTwIBkDmpDiZlK5jdfIlDIcMa+gyqGggAjQZUupYtZ7zt0Alg6v/9///////3IAABgAIAxhKA1LBcKg8Y6kweH/+zLECQIIiDM1Lu8IsOuGJ2m9bJ6mYYQg2YBAgIxhNjAaAQRmCB50bMcESAWxEIEYcInhz5yAIYOH2zgv9M3Loqj/////+8C7thGAEgzhRQWGAKxnJny5X/Cgg38FPYSBg9CTchJICnYoCmoQKSr/sJiluivmXVdFaiF3dtf/7v/21QAAAAoABI0AYYThmCEGBj06fQUDjLIi05k7//swxA0CB/QxM63rYzD6haSlzeiWgkRLiDp84AUZhAYsooYLBFB8xlfsWxjWJ5///9W7xyfVR9aP/1gGGBIGSDCJbAw0MzGSBOoEEDDBcYAATknswMMHk8x2GP3aOqhIVyoztoDKAkeC70zcbJu/9H///8VS8aq1utUAAAACSWBpAGkQYRsmLggcMnLGK9KwqIPG0DBDFxyOdCWC//syxBECB8wtI63pJTD0haM1vWQGskULA01mcIIkwXFtdGVe9yIlUQroT//o36///UADRRG0oDhmEfEAM+MfKFQ17NqVBT6FeMLThQQ48gM0CyYaJbiZ9mbJbWLLEeLuEn9P1/9jflv38ro1PaHVAAAADw21sAACSCyH8ATADSPQDqP4qQMoakcKyfxOlFR9fP+p8S89g1Xf/PY0Yf/7MsQXAMYgKRunheQwjgeeUPSwxt8OkgAW5JeCaGWTg40otI1VABKqEbiUpGZoPwhDyVCeMEFTGoYhxUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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