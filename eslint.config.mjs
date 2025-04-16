// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for joist.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import simEslintConfig from '../perennial-alias/js/eslint/config/sim.eslint.config.mjs';

export default [
  ...simEslintConfig,
  {
    rules: {
      'template-curly-spacing': 'off',
      'phet/documentation-before-imports': 'off'
    }
  }
];