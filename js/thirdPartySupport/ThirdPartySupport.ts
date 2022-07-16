// Copyright 2017-2022, University of Colorado Boulder

/**
 * Enumeration of third parties that PhET supports.  Each third party has its own type that sets up listeners for
 * communication between third party frames and the simulation.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';
import LegendsOfLearningSupport from './LegendsOfLearningSupport.js';

const ThirdPartySupport = {
  legendsOfLearning: LegendsOfLearningSupport
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( ThirdPartySupport ); }

joist.register( 'ThirdPartySupport', ThirdPartySupport );

export default ThirdPartySupport;