// Copyright 2022-2025, University of Colorado Boulder

/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property, { type PropertyOptions } from '../../../axon/js/Property.js';
import { type ReadOnlyPropertyState } from '../../../axon/js/ReadOnlyProperty.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import globalKeyStateTracker from '../../../scenery/js/accessibility/globalKeyStateTracker.js';
import KeyboardUtils from '../../../scenery/js/accessibility/KeyboardUtils.js';
import Tandem from '../../../tandem/js/Tandem.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import joist from '../joist.js';

// Hard coding a few locales here is better than relying on a generated output of the "ground truth" localeData in babel,
// which could change at any time and cause a type error here (either on main or worse, in release branches). Also we
// could reach the TypeScript maximum for number of string union entries, (see https://github.com/microsoft/TypeScript/issues/41160#issuecomment-1287271132).
// Feel free to add any locale here as needed for the type.
// JO 2024-12-23: This is blocking scenerystack manually specifying locales.
// JO: manually adding full list of locales.
export type Locale = 'aa' | 'ab' | 'ac' | 'ad' | 'af' | 'ag' | 'ah' | 'ai' | 'aj' | 'ak' | 'ak_FT' | 'al' | 'am' | 'an' | 'ao' | 'ap' | 'ar' | 'ar_AE' | 'ar_BH' | 'ar_DJ' | 'ar_DZ' | 'ar_EG' | 'ar_EH' | 'ar_ER' | 'ar_IQ' | 'ar_JO' | 'ar_KM' | 'ar_KW' | 'ar_LB' | 'ar_LY' | 'ar_MA' | 'ar_MR' | 'ar_OM' | 'ar_QA' | 'ar_SA' | 'ar_SD' | 'ar_SO' | 'ar_SY' | 'ar_TD' | 'ar_TN' | 'ar_YE' | 'as' | 'at' | 'au' | 'av' | 'aw' | 'ax' | 'ay' | 'az' | 'ba' | 'bb' | 'bc' | 'bd' | 'be' | 'bg' | 'bi' | 'bj' | 'bk' | 'bl' | 'bm' | 'bn' | 'bo' | 'bp' | 'bq' | 'br' | 'bs' | 'bt' | 'bu' | 'bx' | 'by' | 'ca' | 'cb' | 'cc' | 'cd' | 'ce' | 'ch' | 'ci' | 'cj' | 'ck' | 'cl' | 'cm' | 'cn' | 'co' | 'cp' | 'cq' | 'cr' | 'cs' | 'ct' | 'cv' | 'cw' | 'cy' | 'cz' | 'da' | 'db' | 'de' | 'de_AT' | 'de_CH' | 'de_LI' | 'de_LU' | 'dg' | 'di' | 'dk' | 'dl' | 'dm' | 'dn' | 'dr' | 'ds' | 'du' | 'dv' | 'dw' | 'dy' | 'dz' | 'ed' | 'ee' | 'ef' | 'ek' | 'el' | 'em' | 'en' | 'en_AU' | 'en_BI' | 'en_BW' | 'en_BZ' | 'en_CA' | 'en_CB' | 'en_CM' | 'en_ER' | 'en_ET' | 'en_GB' | 'en_GH' | 'en_GM' | 'en_IE' | 'en_IN' | 'en_JM' | 'en_KE' | 'en_LR' | 'en_LS' | 'en_MU' | 'en_MW' | 'en_MY' | 'en_NA' | 'en_NG' | 'en_NZ' | 'en_PH' | 'en_RW' | 'en_SC' | 'en_SL' | 'en_SS' | 'en_SZ' | 'en_TT' | 'en_TZ' | 'en_UG' | 'en_ZA' | 'en_ZM' | 'en_ZW' | 'er' | 'es' | 'es_AR' | 'es_BO' | 'es_CL' | 'es_CO' | 'es_CR' | 'es_DO' | 'es_EC' | 'es_ES' | 'es_GQ' | 'es_GT' | 'es_HN' | 'es_MX' | 'es_NI' | 'es_PA' | 'es_PE' | 'es_PR' | 'es_PY' | 'es_SV' | 'es_US' | 'es_UY' | 'es_VE' | 'et' | 'eu' | 'ew' | 'fa' | 'fa_DA' | 'ff' | 'fg' | 'fi' | 'fj' | 'fl' | 'fn' | 'fo' | 'fr' | 'fr_BE' | 'fr_BF' | 'fr_BI' | 'fr_BJ' | 'fr_CA' | 'fr_CD' | 'fr_CF' | 'fr_CG' | 'fr_CH' | 'fr_CI' | 'fr_CM' | 'fr_DJ' | 'fr_EH' | 'fr_GA' | 'fr_GN' | 'fr_GQ' | 'fr_KM' | 'fr_LU' | 'fr_MC' | 'fr_MG' | 'fr_ML' | 'fr_NE' | 'fr_RW' | 'fr_SC' | 'fr_SN' | 'fr_TD' | 'fr_TG' | 'fs' | 'fu' | 'fy' | 'ga' | 'gb' | 'gc' | 'gd' | 'gf' | 'gg' | 'gk' | 'gl' | 'gn' | 'go' | 'gr' | 'gs' | 'gt' | 'gu' | 'gv' | 'gw' | 'gy' | 'ha' | 'hd' | 'hh' | 'hi' | 'hk' | 'hl' | 'hm' | 'hn' | 'ho' | 'hp' | 'hr' | 'hr_BA' | 'hs' | 'ht' | 'hu' | 'hw' | 'hx' | 'hy' | 'hz' | 'ib' | 'ig' | 'ih' | 'ii' | 'ik' | 'il' | 'im' | 'in' | 'iq' | 'is' | 'it' | 'it_CH' | 'iu' | 'iv' | 'iw' | 'ix' | 'ja' | 'jb' | 'jp' | 'jr' | 'jv' | 'ka' | 'kb' | 'kc' | 'kd' | 'ke' | 'kf' | 'kg' | 'kh' | 'ki' | 'kj' | 'kk' | 'kl' | 'km' | 'kn' | 'ko' | 'kp' | 'kq' | 'kr' | 'ks' | 'kt' | 'ku' | 'ku_TR' | 'kv' | 'kw' | 'kx' | 'ky' | 'kz' | 'lb' | 'ld' | 'lg' | 'lh' | 'li' | 'lk' | 'll' | 'lm' | 'ln' | 'lo' | 'lp' | 'ls' | 'lt' | 'lu' | 'lv' | 'lw' | 'lx' | 'ly' | 'lz' | 'ma' | 'mb' | 'mc' | 'md' | 'me' | 'mf' | 'mg' | 'mh' | 'mi' | 'mk' | 'ml' | 'mm' | 'mn' | 'mo' | 'mq' | 'mr' | 'ms' | 'ms_MY' | 'mt' | 'mu' | 'mv' | 'mw' | 'mx' | 'my' | 'mz' | 'na' | 'nb' | 'nc' | 'nd' | 'ne' | 'nf' | 'ng' | 'nh' | 'ni' | 'nk' | 'nl' | 'nl_BE' | 'nm' | 'nn' | 'np' | 'nq' | 'nr' | 'ns' | 'nt' | 'nu' | 'nv' | 'nw' | 'nx' | 'ny' | 'nz' | 'oa' | 'oc' | 'oe' | 'og' | 'oi' | 'oj' | 'ok' | 'ol' | 'om' | 'oo' | 'op' | 'or' | 'os' | 'ot' | 'ou' | 'pa' | 'pg' | 'pl' | 'pm' | 'pn' | 'pp' | 'ps' | 'pt' | 'pt_AO' | 'pt_BR' | 'pt_CV' | 'pt_GQ' | 'pt_GW' | 'pt_MZ' | 'pt_ST' | 'pu' | 'qc' | 'qe' | 'qu' | 'ra' | 'rb' | 'rc' | 're' | 'rh' | 'ri' | 'rj' | 'rl' | 'rn' | 'ro' | 'rp' | 'rr' | 'ru' | 'rw' | 'ry' | 'rz' | 'sb' | 'sc' | 'sd' | 'se' | 'sg' | 'sh' | 'si' | 'sj' | 'sk' | 'sl' | 'sm' | 'sn' | 'so' | 'sp' | 'sq' | 'sr' | 'sr_BA' | 'ss' | 'st' | 'su' | 'sv' | 'sv_FI' | 'sw' | 'sx' | 'sy' | 'sz' | 'ta' | 'tc' | 'te' | 'tg' | 'th' | 'ti' | 'tj' | 'tk' | 'tl' | 'tm' | 'tn' | 'to' | 'tp' | 'tq' | 'tr' | 'ts' | 'tt' | 'tu' | 'tv' | 'tw' | 'tx' | 'ty' | 'tz' | 'ua' | 'ud' | 'ug' | 'ui' | 'uk' | 'um' | 'un' | 'ur' | 'ut' | 'uy' | 'uz' | 'va' | 've' | 'vi' | 'vs' | 'vt' | 'wa' | 'wl' | 'wo' | 'wr' | 'ws' | 'xa' | 'xh' | 'xl' | 'xr' | 'xs' | 'xt' | 'ya' | 'yi' | 'yk' | 'yn' | 'yo' | 'yp' | 'za' | 'ze' | 'zg' | 'zh_CN' | 'zh_HK' | 'zh_MO' | 'zh_SG' | 'zh_TW' | 'zn' | 'zp' | 'zt' | 'zu' | 'zz';

assert && assert( phet.chipper.locale, 'phet.chipper.locale global expected' );
assert && assert( phet.chipper.localeData, 'phet.chipper.localeData global expected' );
assert && assert( phet.chipper.strings, 'phet.chipper.strings global expected' );

// Sort these properly by their localized name (without using _.sortBy, since string comparison does not provide
// a good sorting experience). See https://github.com/phetsims/joist/issues/965
const availableRuntimeLocales = ( Object.keys( phet.chipper.strings ) as Locale[] ).sort( ( a, b ) => {
  const lowerCaseA = StringUtils.localeToLocalizedName( a ).toLowerCase();
  const lowerCaseB = StringUtils.localeToLocalizedName( b ).toLowerCase();
  return lowerCaseA.localeCompare( lowerCaseB, 'en-US', { sensitivity: 'base' } );
} );

type SelfOptions = EmptySelfOptions;
type LocalePropertyOptions = SelfOptions & StrictOmit<PropertyOptions<Locale>, 'valueType' | 'phetioValueType'>;

export class LocaleProperty extends Property<Locale> {

  public readonly availableRuntimeLocales: Locale[] = availableRuntimeLocales;

  private _isLocaleChanging = false;

  public constructor( value: Locale, providedOptions?: LocalePropertyOptions ) {

    const options = optionize<LocalePropertyOptions, SelfOptions, PropertyOptions<Locale>>()( {
      valueType: 'string',
      phetioValueType: StringIO
    }, providedOptions );

    super( value, options );
  }

  /**
   * True when the locale is in the process of changing, so that you can opt out of work while many strings are changing.
   */
  public get isLocaleChanging(): boolean {
    return this._isLocaleChanging;
  }

  // Override to provide grace and support for the full definition of allowed locales (aligned with the query parameter
  // schema). For example three letter values, and case insensitivity. See checkAndRemapLocale() for details. NOTE that
  // this will assert if the locale doesn't match the right format.
  protected override unguardedSet( value: Locale ): void {
    this._isLocaleChanging = true;

    // NOTE: updates phet.chipper.locale as a side-effect
    super.unguardedSet( phet.chipper.checkAndRemapLocale( value, true ) );

    this._isLocaleChanging = false;
  }

  // This improves the PhET-iO Studio interface, by giving available values, without triggering validation if you want
  // to use the more general locale schema (three digit/case-insensitive/etc).
  protected override toStateObject<StateType>(): ReadOnlyPropertyState<StateType> {
    const parentObject = super.toStateObject<StateType>();

    // Provide via validValues without forcing validation assertions if a different value is set.
    parentObject.validValues = [ ...this.availableRuntimeLocales ].sort() as StateType[];
    return parentObject;
  }

  // Dynamic local switching is not supported if there is only one available runtime locale
  public get supportsDynamicLocale(): boolean {
    return this.availableRuntimeLocales.length > 1;
  }
}

const localeProperty = new LocaleProperty( phet.chipper.locale, {
  disableListenerLimit: true,
  tandem: Tandem.GENERAL_MODEL.createTandem( 'localeProperty' ),
  phetioFeatured: true,
  phetioDocumentation: 'Specifies language currently displayed in the simulation',

  // getStringModule leverages listener order dependencies to only update the Fluent bundle once when all strings change
  // due to a locale changing, see https://github.com/phetsims/chipper/issues/1588
  hasListenerOrderDependencies: true
} );

if ( window.phet?.chipper?.queryParameters?.keyboardLocaleSwitcher ) {

  // DUPLICATION ALERT: don't change these without consulting PHET_IO_WRAPPERS/PhetioClient.initializeKeyboardLocaleSwitcher()
  const FORWARD_KEY = KeyboardUtils.KEY_I;
  const BACKWARD_KEY = KeyboardUtils.KEY_U;

  globalKeyStateTracker.keydownEmitter.addListener( ( event: KeyboardEvent ) => {

    const bump = ( delta: number ) => {

      // Ctrl + u in Chrome on Windows is "view source" in a new tab
      event.preventDefault();

      const index = availableRuntimeLocales.indexOf( localeProperty.value );
      const nextIndex = ( index + delta + availableRuntimeLocales.length ) % availableRuntimeLocales.length;
      localeProperty.value = availableRuntimeLocales[ nextIndex ];

      // Indicate the new locale on the console
      console.log( localeProperty.value );
    };

    if ( event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey ) {
      if ( KeyboardUtils.isKeyEvent( event, FORWARD_KEY ) ) {
        bump( +1 );
      }
      else if ( KeyboardUtils.isKeyEvent( event, BACKWARD_KEY ) ) {
        bump( -1 );
      }
    }
  } );
}

joist.register( 'localeProperty', localeProperty );

export default localeProperty;