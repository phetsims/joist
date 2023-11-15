// Copyright 2023, University of Colorado Boulder

/**
 * API Context for description plugins.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node } from '../../scenery/js/imports.js';
import joist from './joist.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import DescriptionRegistry from '../../tandem/js/DescriptionRegistry.js';
import TReadOnlyProperty, { PropertyLazyLinkListener, PropertyLinkListener, PropertyListener } from '../../axon/js/TReadOnlyProperty.js';
import TEmitter, { TEmitterListener } from '../../axon/js/TEmitter.js';
import { Locale } from './i18n/localeProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import localeOrderProperty from './i18n/localeOrderProperty.js';

export type DescriptionStrings = {
  locale: Locale;
  launch( context: DescriptionContext ): void;
};

export type DescriptionLogic = {
  launch( context: DescriptionContext, strings: DescriptionStrings ): void;
  added( tandemID: string, obj: PhetioObject ): void;
  removed( tandemID: string, obj: PhetioObject ): void;
};

export default class DescriptionContext {

  private readonly links: Link[] = [];
  private readonly listens: Listen[] = [];
  private readonly assignments: Assignment[] = [];

  public get( tandemID: string ): PhetioObject | null {
    return DescriptionRegistry.map.get( tandemID ) || null;
  }

  public getRequired( tandemID: string ): PhetioObject {
    const obj = this.get( tandemID );

    assert && assert( obj !== null );

    return obj!;
  }

  public link( property: TReadOnlyProperty<unknown>, listener: PropertyLinkListener<unknown> ): void {
    // TS just... lets us do this?
    property.link( listener );

    this.links.push( new Link( property, listener ) );
  }

  public lazyLink( property: TReadOnlyProperty<unknown>, listener: PropertyLazyLinkListener<unknown> ): void {
    // TS just... lets us do this?
    property.lazyLink( listener );

    this.links.push( new Link( property, listener ) );
  }

  public unlink( property: TReadOnlyProperty<unknown>, listener: PropertyLazyLinkListener<unknown> ): void {
    property.unlink( listener );

    const index = this.links.findIndex( link => link.property === property && link.listener === listener );

    assert && assert( index >= 0 );

    this.links.splice( index, 1 );
  }

  // TODO: support multilinks https://github.com/phetsims/joist/issues/941

  public addListener( emitter: TEmitter<unknown[]>, listener: TEmitterListener<unknown[]> ): void {
    emitter.addListener( listener );

    this.listens.push( new Listen( emitter, listener ) );
  }

  public removeListener( emitter: TEmitter<unknown[]>, listener: TEmitterListener<unknown[]> ): void {
    emitter.removeListener( listener );

    const index = this.listens.findIndex( listen => listen.emitter === emitter && listen.listener === listener );

    assert && assert( index >= 0 );

    this.listens.splice( index, 1 );
  }

  public nodeSet( node: Node, property: keyof Node, value: unknown ): void {
    const index = this.assignments.findIndex( assignment => assignment.target === node && assignment.property === property );
    if ( index < 0 ) {
      this.assignments.push( new Assignment( node, property, node[ property ] ) );
    }

    // @ts-expect-error
    node[ property ] = value;
  }

  public dispose(): void {
    // NOTE: can links/listens be tied to a tandem/object? So that if we "remove" the object, we will assume it's disposed?

    while ( this.links.length ) {
      const link = this.links.pop()!;

      if ( !link.property.isDisposed ) {
        link.property.unlink( link.listener );
      }
    }
    while ( this.listens.length ) {
      const listen = this.listens.pop()!;

      // @ts-expect-error
      if ( !listen.emitter.isDisposed ) {
        listen.emitter.removeListener( listen.listener );
      }
    }
    while ( this.assignments.length ) {
      const assignment = this.assignments.pop()!;

      if ( !assignment.target.isDisposed ) {
        // @ts-expect-error
        assignment.target[ assignment.property ] = assignment.initialValue;
      }
    }
  }

  // What is available and registered
  public static readonly stringsMap = new Map<Locale, DescriptionStrings>();
  public static readonly logicProperty = new TinyProperty<DescriptionLogic | null>( null );
  public static readonly isStartupCompleteProperty = new TinyProperty<boolean>( false );

  public static readonly activeStringsProperty = new TinyProperty<DescriptionStrings | null>( null );
  public static readonly activeContextProperty = new TinyProperty<DescriptionContext | null>( null );

  public static startupComplete(): void {
    DescriptionContext.isStartupCompleteProperty.value = true;

    localeOrderProperty.link( () => {
      this.reload();
    } );
  }

  private static reload(): void {
    // If we haven't started up yet, don't do anything (we'll reload when we start up).
    if ( !this.isStartupCompleteProperty.value ) {
      return;
    }

    if ( this.activeContextProperty.value ) {
      this.activeContextProperty.value.dispose();
    }

    const logic = this.logicProperty.value;
    if ( logic === null ) {
      return;
    }

    const locales = localeOrderProperty.value;

    // Search in locale fallback order for the best description strings to use.
    this.activeStringsProperty.value = null;
    for ( const locale of locales ) {
      if ( DescriptionContext.stringsMap.has( locale ) ) {

        this.activeStringsProperty.value = DescriptionContext.stringsMap.get( locale )!;
        break;
      }
    }

    const strings = this.activeStringsProperty.value;
    if ( strings === null ) {
      return;
    }

    this.activeContextProperty.value = new DescriptionContext();

    logic.launch( this.activeContextProperty.value, strings );
  }

  private static needsReloadForLocale( locale: Locale ): boolean {
    if ( !DescriptionContext.stringsMap.has( locale ) ) {
      // NOTE: We could check to see if it's a "better" locale than our current one
      return localeOrderProperty.value.includes( locale );
    }

    return ( DescriptionContext.stringsMap.get( locale )! ) === this.activeStringsProperty.value;
  }

  public static registerStrings( strings: DescriptionStrings ): DescriptionStrings {
    const needsReload = DescriptionContext.needsReloadForLocale( strings.locale );

    DescriptionContext.stringsMap.set( strings.locale, strings );

    if ( needsReload ) {
      DescriptionContext.reload();
    }

    return strings;
  }

  public static registerLogic( logic: DescriptionLogic ): DescriptionLogic {
    DescriptionContext.logicProperty.value = logic;

    DescriptionContext.reload();

    return logic;
  }
}

class Link {
  public constructor(
    public readonly property: TReadOnlyProperty<unknown>,
    public readonly listener: PropertyListener<unknown>
  ) {}
}

class Listen {
  public constructor(
    public readonly emitter: TEmitter<unknown[]>,
    public readonly listener: TEmitterListener<unknown[]>
  ) {}
}

class Assignment {
  public constructor(
    public readonly target: Node,
    public readonly property: keyof Node,
    public readonly initialValue: string
  ) {}
}

joist.register( 'DescriptionContext', DescriptionContext );
