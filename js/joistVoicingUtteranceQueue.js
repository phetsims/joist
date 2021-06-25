// Copyright 2021, University of Colorado Boulder

/**
 * A singleton UtteranceQueue that is used for Voicing of joist components. It uses webSpeaker
 * to announce utterances using HTML5 SpeechSynthesis. Voicing for joist components can be
 * enabled/disabled separately from other sim Voicing output. The most common case of this
 * is when we want to Voice parts sim settings in the Preferences Dialog even when Voicing
 * is disabled. By enabling Voicing for these components it makes it easier for the user to
 * find settings that would be otherwise not accessible to them unless they enable Voicing.
 *
 * @author Jesse Greenberg
 */

import webSpeaker from '../../scenery/js/accessibility/voicing/webSpeaker.js';
import UtteranceQueue from '../../utterance-queue/js/UtteranceQueue.js';
import joist from './joist.js';

const joistVoicingUtteranceQueue = new UtteranceQueue( webSpeaker );

joist.register( 'joistVoicingUtteranceQueue', joistVoicingUtteranceQueue );
export default joistVoicingUtteranceQueue;