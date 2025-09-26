// Copyright 2025, University of Colorado Boulder
// AUTOMATICALLY GENERATED – DO NOT EDIT.
// Generated from joist-strings_en.yaml

/* eslint-disable */
/* @formatter:off */

import { TReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import type { FluentVariable } from '../../chipper/js/browser/FluentPattern.js';
import FluentPattern from '../../chipper/js/browser/FluentPattern.js';
import FluentContainer from '../../chipper/js/browser/FluentContainer.js';
import FluentConstant from '../../chipper/js/browser/FluentConstant.js';
import FluentComment from '../../chipper/js/browser/FluentComment.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';

// This map is used to create the fluent file and link to all StringProperties.
// Accessing StringProperties is also critical for including them in the built sim.
// However, if strings are unused in Fluent system too, they will be fully excluded from
// the build. So we need to only add actually used strings.
const fluentKeyToStringPropertyMap = new Map();

const addToMapIfDefined = ( key: string, path: string ) => {
  const sp = _.get( JoistStrings, path );
  if ( sp ) {
    fluentKeyToStringPropertyMap.set( key, sp );
  }
};

addToMapIfDefined( 'joist_title', 'joist.titleStringProperty' );
addToMapIfDefined( 'done', 'doneStringProperty' );
addToMapIfDefined( 'menuItem_options', 'menuItem.optionsStringProperty' );
addToMapIfDefined( 'menuItem_about', 'menuItem.aboutStringProperty' );
addToMapIfDefined( 'menuItem_outputLog', 'menuItem.outputLogStringProperty' );
addToMapIfDefined( 'menuItem_phetWebsite', 'menuItem.phetWebsiteStringProperty' );
addToMapIfDefined( 'menuItem_reportAProblem', 'menuItem.reportAProblemStringProperty' );
addToMapIfDefined( 'menuItem_screenshot', 'menuItem.screenshotStringProperty' );
addToMapIfDefined( 'menuItem_fullscreen', 'menuItem.fullscreenStringProperty' );
addToMapIfDefined( 'menuItem_getUpdate', 'menuItem.getUpdateStringProperty' );
addToMapIfDefined( 'menuItem_enhancedSound', 'menuItem.enhancedSoundStringProperty' );
addToMapIfDefined( 'menuItem_mailInputEventsLog', 'menuItem.mailInputEventsLogStringProperty' );
addToMapIfDefined( 'menuItem_mailInputEventsLog__deprecated', 'menuItem.mailInputEventsLog__deprecatedStringProperty' );
addToMapIfDefined( 'menuItem_outputInputEventsLog', 'menuItem.outputInputEventsLogStringProperty' );
addToMapIfDefined( 'menuItem_outputInputEventsLog__deprecated', 'menuItem.outputInputEventsLog__deprecatedStringProperty' );
addToMapIfDefined( 'menuItem_submitInputEventsLog', 'menuItem.submitInputEventsLogStringProperty' );
addToMapIfDefined( 'menuItem_submitInputEventsLog__deprecated', 'menuItem.submitInputEventsLog__deprecatedStringProperty' );
addToMapIfDefined( 'menuItem_settings', 'menuItem.settingsStringProperty' );
addToMapIfDefined( 'menuItem_settings__deprecated', 'menuItem.settings__deprecatedStringProperty' );
addToMapIfDefined( 'title_settings', 'title.settingsStringProperty' );
addToMapIfDefined( 'showPointers', 'showPointersStringProperty' );
addToMapIfDefined( 'termsPrivacyAndLicensing', 'termsPrivacyAndLicensingStringProperty' );
addToMapIfDefined( 'termsPrivacyAndLicensing__simMetadata_phetioReadOnly', 'termsPrivacyAndLicensing__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_title', 'credits.titleStringProperty' );
addToMapIfDefined( 'credits_title__simMetadata_phetioReadOnly', 'credits.title__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_leadDesign__simMetadata_phetioReadOnly', 'credits.leadDesign__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_softwareDevelopment__simMetadata_phetioReadOnly', 'credits.softwareDevelopment__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_team__simMetadata_phetioReadOnly', 'credits.team__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_contributors__simMetadata_phetioReadOnly', 'credits.contributors__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_qualityAssurance__simMetadata_phetioReadOnly', 'credits.qualityAssurance__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_graphicArts__simMetadata_phetioReadOnly', 'credits.graphicArts__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_soundDesign__simMetadata_phetioReadOnly', 'credits.soundDesign__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_translation', 'credits.translationStringProperty' );
addToMapIfDefined( 'credits_translation__simMetadata_phetioReadOnly', 'credits.translation__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'credits_thanks', 'credits.thanksStringProperty' );
addToMapIfDefined( 'credits_thanks__simMetadata_phetioReadOnly', 'credits.thanks__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'options_title', 'options.titleStringProperty' );
addToMapIfDefined( 'options_title__simMetadata_phetioReadOnly', 'options.title__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'versionPattern__simMetadata_phetioReadOnly', 'versionPattern__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'updates_upToDate', 'updates.upToDateStringProperty' );
addToMapIfDefined( 'updates_outOfDate', 'updates.outOfDateStringProperty' );
addToMapIfDefined( 'updates_checking', 'updates.checkingStringProperty' );
addToMapIfDefined( 'updates_offline', 'updates.offlineStringProperty' );
addToMapIfDefined( 'updates_getUpdate', 'updates.getUpdateStringProperty' );
addToMapIfDefined( 'updates_noThanks', 'updates.noThanksStringProperty' );
addToMapIfDefined( 'translation_credits_link', 'translation.credits.linkStringProperty' );
addToMapIfDefined( 'translation_credits_link__simMetadata_phetioReadOnly', 'translation.credits.link__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'thirdParty_credits_link', 'thirdParty.credits.linkStringProperty' );
addToMapIfDefined( 'thirdParty_credits_link__simMetadata_phetioReadOnly', 'thirdParty.credits.link__simMetadata.phetioReadOnlyStringProperty' );
addToMapIfDefined( 'keyboardShortcuts_title', 'keyboardShortcuts.titleStringProperty' );
addToMapIfDefined( 'keyboardShortcuts_toGetStarted', 'keyboardShortcuts.toGetStartedStringProperty' );
addToMapIfDefined( 'simTitleWithScreenNamePattern__simMetadata_phetioDocumentation', 'simTitleWithScreenNamePattern__simMetadata.phetioDocumentationStringProperty' );
addToMapIfDefined( 'projectorMode', 'projectorModeStringProperty' );
addToMapIfDefined( 'queryParametersWarningDialog_invalidQueryParameters', 'queryParametersWarningDialog.invalidQueryParametersStringProperty' );
addToMapIfDefined( 'queryParametersWarningDialog_oneOrMoreQueryParameters', 'queryParametersWarningDialog.oneOrMoreQueryParametersStringProperty' );
addToMapIfDefined( 'queryParametersWarningDialog_theSimulationWillStart', 'queryParametersWarningDialog.theSimulationWillStartStringProperty' );
addToMapIfDefined( 'ieErrorPage_platformError', 'ieErrorPage.platformErrorStringProperty' );
addToMapIfDefined( 'ieErrorPage_ieIsNotSupported', 'ieErrorPage.ieIsNotSupportedStringProperty' );
addToMapIfDefined( 'ieErrorPage_useDifferentBrowser', 'ieErrorPage.useDifferentBrowserStringProperty' );
addToMapIfDefined( 'preferences_title', 'preferences.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_general_title', 'preferences.tabs.general.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_general_title__comment', 'preferences.tabs.general.title__commentStringProperty' );
addToMapIfDefined( 'preferences_tabs_overview_title', 'preferences.tabs.overview.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_general_accessibilityIntro', 'preferences.tabs.general.accessibilityIntroStringProperty' );
addToMapIfDefined( 'preferences_tabs_general_moreAccessibility', 'preferences.tabs.general.moreAccessibilityStringProperty' );
addToMapIfDefined( 'preferences_tabs_simulation_title', 'preferences.tabs.simulation.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_visual_title', 'preferences.tabs.visual.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_visual_interactiveHighlights', 'preferences.tabs.visual.interactiveHighlightsStringProperty' );
addToMapIfDefined( 'preferences_tabs_visual_interactiveHighlightsDescription', 'preferences.tabs.visual.interactiveHighlightsDescriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_visual_projectorModeDescription', 'preferences.tabs.visual.projectorModeDescriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_title', 'preferences.tabs.audio.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_voicing_titleEnglishOnly', 'preferences.tabs.audio.voicing.titleEnglishOnlyStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_voicing_description', 'preferences.tabs.audio.voicing.descriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_sounds_title', 'preferences.tabs.audio.sounds.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_sounds_extraSounds_title', 'preferences.tabs.audio.sounds.extraSounds.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_audioFeatures_title', 'preferences.tabs.audio.audioFeatures.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_sounds_description', 'preferences.tabs.audio.sounds.descriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_audio_sounds_extraSounds_description', 'preferences.tabs.audio.sounds.extraSounds.descriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_input_title', 'preferences.tabs.input.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_title', 'preferences.tabs.localization.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_languageSelection_title', 'preferences.tabs.localization.languageSelection.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_languageSelection_description', 'preferences.tabs.localization.languageSelection.descriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_title', 'preferences.tabs.localization.regionAndCulture.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_description', 'preferences.tabs.localization.regionAndCulture.descriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_africa', 'preferences.tabs.localization.regionAndCulture.africaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_africaModest', 'preferences.tabs.localization.regionAndCulture.africaModestStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_asia', 'preferences.tabs.localization.regionAndCulture.asiaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_latinAmerica', 'preferences.tabs.localization.regionAndCulture.latinAmericaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_oceania', 'preferences.tabs.localization.regionAndCulture.oceaniaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_random', 'preferences.tabs.localization.regionAndCulture.randomStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_unitedStatesOfAmerica', 'preferences.tabs.localization.regionAndCulture.unitedStatesOfAmericaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_africa', 'preferences.tabs.localization.regionAndCulture.portrayalSets.africaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_africa__deprecated', 'preferences.tabs.localization.regionAndCulture.portrayalSets.africa__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_africaModest', 'preferences.tabs.localization.regionAndCulture.portrayalSets.africaModestStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_africaModest__deprecated', 'preferences.tabs.localization.regionAndCulture.portrayalSets.africaModest__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_asia', 'preferences.tabs.localization.regionAndCulture.portrayalSets.asiaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_asia__deprecated', 'preferences.tabs.localization.regionAndCulture.portrayalSets.asia__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_latinAmerica', 'preferences.tabs.localization.regionAndCulture.portrayalSets.latinAmericaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_latinAmerica__deprecated', 'preferences.tabs.localization.regionAndCulture.portrayalSets.latinAmerica__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_oceania', 'preferences.tabs.localization.regionAndCulture.portrayalSets.oceaniaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_oceania__deprecated', 'preferences.tabs.localization.regionAndCulture.portrayalSets.oceania__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_multicultural', 'preferences.tabs.localization.regionAndCulture.portrayalSets.multiculturalStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_multicultural__deprecated', 'preferences.tabs.localization.regionAndCulture.portrayalSets.multicultural__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_unitedStatesOfAmerica', 'preferences.tabs.localization.regionAndCulture.portrayalSets.unitedStatesOfAmericaStringProperty' );
addToMapIfDefined( 'preferences_tabs_localization_regionAndCulture_portrayalSets_unitedStatesOfAmerica__deprecated', 'preferences.tabs.localization.regionAndCulture.portrayalSets.unitedStatesOfAmerica__deprecatedStringProperty' );
addToMapIfDefined( 'PhetButton_name', 'PhetButton.nameStringProperty' );
addToMapIfDefined( 'PhetButton_name__deprecated', 'PhetButton.name__deprecatedStringProperty' );
addToMapIfDefined( 'HomeButton_name', 'HomeButton.nameStringProperty' );
addToMapIfDefined( 'HomeButton_name__deprecated', 'HomeButton.name__deprecatedStringProperty' );
addToMapIfDefined( 'adaptedFrom', 'adaptedFromStringProperty' );
addToMapIfDefined( 'adaptedFrom__deprecated', 'adaptedFrom__deprecatedStringProperty' );
addToMapIfDefined( 'titlePattern__deprecated', 'titlePattern__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_input_gestureControls_title', 'preferences.tabs.input.gestureControls.titleStringProperty' );
addToMapIfDefined( 'preferences_tabs_input_gestureControls_title__deprecated', 'preferences.tabs.input.gestureControls.title__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_input_gestureControls_description', 'preferences.tabs.input.gestureControls.descriptionStringProperty' );
addToMapIfDefined( 'preferences_tabs_input_gestureControls_description__deprecated', 'preferences.tabs.input.gestureControls.description__deprecatedStringProperty' );
addToMapIfDefined( 'preferences_tabs_general_simulationSpecificSettings', 'preferences.tabs.general.simulationSpecificSettingsStringProperty' );
addToMapIfDefined( 'preferences_tabs_general_simulationSpecificSettings__deprecated', 'preferences.tabs.general.simulationSpecificSettings__deprecatedStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelp_keyboardShortcuts', 'a11y.keyboardHelp.keyboardShortcutsStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelp_tabToGetStarted_accessibleHelpText', 'a11y.keyboardHelp.tabToGetStarted.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelp_tabToGetStarted_readingBlockNameResponse', 'a11y.keyboardHelp.tabToGetStarted.readingBlockNameResponseStringProperty' );
addToMapIfDefined( 'a11y_inPlayArea', 'a11y.inPlayAreaStringProperty' );
addToMapIfDefined( 'a11y_inControlArea', 'a11y.inControlAreaStringProperty' );
addToMapIfDefined( 'a11y_simScreens', 'a11y.simScreensStringProperty' );
addToMapIfDefined( 'a11y_simScreen', 'a11y.simScreenStringProperty' );
addToMapIfDefined( 'a11y_home', 'a11y.homeStringProperty' );
addToMapIfDefined( 'a11y_homeScreenHint', 'a11y.homeScreenHintStringProperty' );
addToMapIfDefined( 'a11y_simResources', 'a11y.simResourcesStringProperty' );
addToMapIfDefined( 'a11y_soundToggle_alert_simSoundOn', 'a11y.soundToggle.alert.simSoundOnStringProperty' );
addToMapIfDefined( 'a11y_soundToggle_alert_simSoundOff', 'a11y.soundToggle.alert.simSoundOffStringProperty' );
addToMapIfDefined( 'a11y_soundToggle_label', 'a11y.soundToggle.labelStringProperty' );
addToMapIfDefined( 'a11y_checkOutShortcuts', 'a11y.checkOutShortcutsStringProperty' );
addToMapIfDefined( 'a11y_phetMenu', 'a11y.phetMenuStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_visual_interactiveHighlights_enabledAlert', 'a11y.preferences.tabs.visual.interactiveHighlights.enabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_visual_interactiveHighlights_disabledAlert', 'a11y.preferences.tabs.visual.interactiveHighlights.disabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_sounds_soundsOn', 'a11y.preferences.tabs.audio.sounds.soundsOnStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_sounds_soundsOff', 'a11y.preferences.tabs.audio.sounds.soundsOffStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_sounds_extraSounds_extraSoundsOn', 'a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOnStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_sounds_extraSounds_extraSoundsOff', 'a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOffStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_title', 'a11y.preferences.tabs.audio.voicing.titleStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_voicingOn', 'a11y.preferences.tabs.audio.voicing.voicingOnStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_voicingOff', 'a11y.preferences.tabs.audio.voicing.voicingOffStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_voicingOffOnlyAvailableInEnglish', 'a11y.preferences.tabs.audio.voicing.voicingOffOnlyAvailableInEnglishStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_voicingToolbar_title', 'a11y.preferences.tabs.audio.voicing.voicingToolbar.titleStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_voicingToolbar_toolbarAdded', 'a11y.preferences.tabs.audio.voicing.voicingToolbar.toolbarAddedStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_voicingToolbar_toolbarRemoved', 'a11y.preferences.tabs.audio.voicing.voicingToolbar.toolbarRemovedStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_title', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.titleStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_description', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.descriptionStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_objectDetails_label', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.labelStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_objectDetails_enabledAlert', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.enabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_objectDetails_disabledAlert', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.disabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_contextChanges_label', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.labelStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_contextChanges_enabledAlert', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.enabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_contextChanges_disabledAlert', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.disabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_helpfulHints_label', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.labelStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_helpfulHints_enabledAlert', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.enabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_helpfulHints_disabledAlert', 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.disabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_title', 'a11y.preferences.tabs.audio.voicing.customizeVoice.titleStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_expandedAlert', 'a11y.preferences.tabs.audio.voicing.customizeVoice.expandedAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_collapsedAlert', 'a11y.preferences.tabs.audio.voicing.customizeVoice.collapsedAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_voice_title', 'a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titleStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_voice_noVoicesAvailable', 'a11y.preferences.tabs.audio.voicing.customizeVoice.voice.noVoicesAvailableStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_title', 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.titleStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_labelString', 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.labelStringStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_low', 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.lowStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_normal', 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.normalStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_aboveNormal', 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.aboveNormalStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_high', 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.highStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_voiceRateNormal', 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.voiceRateNormalStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_audio_voicing_customizeVoice_pitch_title', 'a11y.preferences.tabs.audio.voicing.customizeVoice.pitch.titleStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_input_gestureControl_enabledAlert', 'a11y.preferences.tabs.input.gestureControl.enabledAlertStringProperty' );
addToMapIfDefined( 'a11y_preferences_tabs_input_gestureControl_disabledAlert', 'a11y.preferences.tabs.input.gestureControl.disabledAlertStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_title', 'a11y.voicingToolbar.titleStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_openToolbar', 'a11y.voicingToolbar.openToolbarStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_closeToolbar', 'a11y.voicingToolbar.closeToolbarStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_hideToolbar', 'a11y.voicingToolbar.hideToolbarStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_showToolbar', 'a11y.voicingToolbar.showToolbarStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_toolbarShown', 'a11y.voicingToolbar.toolbarShownStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_toolbarHidden', 'a11y.voicingToolbar.toolbarHiddenStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_title', 'a11y.voicingToolbar.voicing.titleStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_quickInfo', 'a11y.voicingToolbar.voicing.quickInfoStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_playOverviewLabel', 'a11y.voicingToolbar.voicing.playOverviewLabelStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_playDetailsLabel', 'a11y.voicingToolbar.voicing.playDetailsLabelStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_playHintLabel', 'a11y.voicingToolbar.voicing.playHintLabelStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_overviewLabel', 'a11y.voicingToolbar.voicing.overviewLabelStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_detailsLabel', 'a11y.voicingToolbar.voicing.detailsLabelStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_hintLabel', 'a11y.voicingToolbar.voicing.hintLabelStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_simVoicingOnAlert', 'a11y.voicingToolbar.voicing.simVoicingOnAlertStringProperty' );
addToMapIfDefined( 'a11y_voicingToolbar_voicing_simVoicingOffAlert', 'a11y.voicingToolbar.voicing.simVoicingOffAlertStringProperty' );

// A function that creates contents for a new Fluent file, which will be needed if any string changes.
const createFluentFile = (): string => {
  let ftl = '';
  for (const [key, stringProperty] of fluentKeyToStringPropertyMap.entries()) {
    ftl += `${key} = ${stringProperty.value.replace('\n','\n ')}\n`;
  }
  return ftl;
};

const fluentSupport = new FluentContainer( createFluentFile, Array.from(fluentKeyToStringPropertyMap.values()) );

const JoistFluent = {
  joist: {
    titleStringProperty: _.get( JoistStrings, 'joist.titleStringProperty' )
  },
  doneStringProperty: _.get( JoistStrings, 'doneStringProperty' ),
  menuItem: {
    optionsStringProperty: _.get( JoistStrings, 'menuItem.optionsStringProperty' ),
    aboutStringProperty: _.get( JoistStrings, 'menuItem.aboutStringProperty' ),
    outputLogStringProperty: _.get( JoistStrings, 'menuItem.outputLogStringProperty' ),
    phetWebsiteStringProperty: _.get( JoistStrings, 'menuItem.phetWebsiteStringProperty' ),
    reportAProblemStringProperty: _.get( JoistStrings, 'menuItem.reportAProblemStringProperty' ),
    screenshotStringProperty: _.get( JoistStrings, 'menuItem.screenshotStringProperty' ),
    fullscreenStringProperty: _.get( JoistStrings, 'menuItem.fullscreenStringProperty' ),
    getUpdateStringProperty: _.get( JoistStrings, 'menuItem.getUpdateStringProperty' ),
    enhancedSoundStringProperty: _.get( JoistStrings, 'menuItem.enhancedSoundStringProperty' ),
    mailInputEventsLogStringProperty: _.get( JoistStrings, 'menuItem.mailInputEventsLogStringProperty' ),
    mailInputEventsLog__deprecatedStringProperty: _.get( JoistStrings, 'menuItem.mailInputEventsLog__deprecatedStringProperty' ),
    outputInputEventsLogStringProperty: _.get( JoistStrings, 'menuItem.outputInputEventsLogStringProperty' ),
    outputInputEventsLog__deprecatedStringProperty: _.get( JoistStrings, 'menuItem.outputInputEventsLog__deprecatedStringProperty' ),
    submitInputEventsLogStringProperty: _.get( JoistStrings, 'menuItem.submitInputEventsLogStringProperty' ),
    submitInputEventsLog__deprecatedStringProperty: _.get( JoistStrings, 'menuItem.submitInputEventsLog__deprecatedStringProperty' ),
    settingsStringProperty: _.get( JoistStrings, 'menuItem.settingsStringProperty' ),
    settings__deprecatedStringProperty: _.get( JoistStrings, 'menuItem.settings__deprecatedStringProperty' )
  },
  title: {
    settingsStringProperty: _.get( JoistStrings, 'title.settingsStringProperty' )
  },
  showPointersStringProperty: _.get( JoistStrings, 'showPointersStringProperty' ),
  termsPrivacyAndLicensingStringProperty: _.get( JoistStrings, 'termsPrivacyAndLicensingStringProperty' ),
  termsPrivacyAndLicensing__simMetadata: {
    phetioReadOnlyStringProperty: _.get( JoistStrings, 'termsPrivacyAndLicensing__simMetadata.phetioReadOnlyStringProperty' )
  },
  credits: {
    titleStringProperty: _.get( JoistStrings, 'credits.titleStringProperty' ),
    title__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.title__simMetadata.phetioReadOnlyStringProperty' )
    },
    leadDesignStringProperty: _.get( JoistStrings, 'credits.leadDesignStringProperty' ),
    leadDesign__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.leadDesign__simMetadata.phetioReadOnlyStringProperty' )
    },
    softwareDevelopmentStringProperty: _.get( JoistStrings, 'credits.softwareDevelopmentStringProperty' ),
    softwareDevelopment__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.softwareDevelopment__simMetadata.phetioReadOnlyStringProperty' )
    },
    teamStringProperty: _.get( JoistStrings, 'credits.teamStringProperty' ),
    team__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.team__simMetadata.phetioReadOnlyStringProperty' )
    },
    contributorsStringProperty: _.get( JoistStrings, 'credits.contributorsStringProperty' ),
    contributors__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.contributors__simMetadata.phetioReadOnlyStringProperty' )
    },
    qualityAssuranceStringProperty: _.get( JoistStrings, 'credits.qualityAssuranceStringProperty' ),
    qualityAssurance__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.qualityAssurance__simMetadata.phetioReadOnlyStringProperty' )
    },
    graphicArtsStringProperty: _.get( JoistStrings, 'credits.graphicArtsStringProperty' ),
    graphicArts__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.graphicArts__simMetadata.phetioReadOnlyStringProperty' )
    },
    soundDesignStringProperty: _.get( JoistStrings, 'credits.soundDesignStringProperty' ),
    soundDesign__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.soundDesign__simMetadata.phetioReadOnlyStringProperty' )
    },
    translationStringProperty: _.get( JoistStrings, 'credits.translationStringProperty' ),
    translation__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.translation__simMetadata.phetioReadOnlyStringProperty' )
    },
    thanksStringProperty: _.get( JoistStrings, 'credits.thanksStringProperty' ),
    thanks__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'credits.thanks__simMetadata.phetioReadOnlyStringProperty' )
    }
  },
  options: {
    titleStringProperty: _.get( JoistStrings, 'options.titleStringProperty' ),
    title__simMetadata: {
      phetioReadOnlyStringProperty: _.get( JoistStrings, 'options.title__simMetadata.phetioReadOnlyStringProperty' )
    }
  },
  versionPatternStringProperty: _.get( JoistStrings, 'versionPatternStringProperty' ),
  versionPattern__simMetadata: {
    phetioReadOnlyStringProperty: _.get( JoistStrings, 'versionPattern__simMetadata.phetioReadOnlyStringProperty' )
  },
  updates: {
    upToDateStringProperty: _.get( JoistStrings, 'updates.upToDateStringProperty' ),
    outOfDateStringProperty: _.get( JoistStrings, 'updates.outOfDateStringProperty' ),
    checkingStringProperty: _.get( JoistStrings, 'updates.checkingStringProperty' ),
    offlineStringProperty: _.get( JoistStrings, 'updates.offlineStringProperty' ),
    newVersionAvailableStringProperty: _.get( JoistStrings, 'updates.newVersionAvailableStringProperty' ),
    yourCurrentVersionStringProperty: _.get( JoistStrings, 'updates.yourCurrentVersionStringProperty' ),
    getUpdateStringProperty: _.get( JoistStrings, 'updates.getUpdateStringProperty' ),
    noThanksStringProperty: _.get( JoistStrings, 'updates.noThanksStringProperty' )
  },
  translation: {
    credits: {
      linkStringProperty: _.get( JoistStrings, 'translation.credits.linkStringProperty' ),
      link__simMetadata: {
        phetioReadOnlyStringProperty: _.get( JoistStrings, 'translation.credits.link__simMetadata.phetioReadOnlyStringProperty' )
      }
    }
  },
  thirdParty: {
    credits: {
      linkStringProperty: _.get( JoistStrings, 'thirdParty.credits.linkStringProperty' ),
      link__simMetadata: {
        phetioReadOnlyStringProperty: _.get( JoistStrings, 'thirdParty.credits.link__simMetadata.phetioReadOnlyStringProperty' )
      }
    }
  },
  keyboardShortcuts: {
    titleStringProperty: _.get( JoistStrings, 'keyboardShortcuts.titleStringProperty' ),
    toGetStartedStringProperty: _.get( JoistStrings, 'keyboardShortcuts.toGetStartedStringProperty' )
  },
  simTitleWithScreenNamePatternStringProperty: _.get( JoistStrings, 'simTitleWithScreenNamePatternStringProperty' ),
  simTitleWithScreenNamePattern__simMetadata: {
    phetioDocumentationStringProperty: _.get( JoistStrings, 'simTitleWithScreenNamePattern__simMetadata.phetioDocumentationStringProperty' )
  },
  projectorModeStringProperty: _.get( JoistStrings, 'projectorModeStringProperty' ),
  queryParametersWarningDialog: {
    invalidQueryParametersStringProperty: _.get( JoistStrings, 'queryParametersWarningDialog.invalidQueryParametersStringProperty' ),
    oneOrMoreQueryParametersStringProperty: _.get( JoistStrings, 'queryParametersWarningDialog.oneOrMoreQueryParametersStringProperty' ),
    theSimulationWillStartStringProperty: _.get( JoistStrings, 'queryParametersWarningDialog.theSimulationWillStartStringProperty' )
  },
  ieErrorPage: {
    platformErrorStringProperty: _.get( JoistStrings, 'ieErrorPage.platformErrorStringProperty' ),
    ieIsNotSupportedStringProperty: _.get( JoistStrings, 'ieErrorPage.ieIsNotSupportedStringProperty' ),
    useDifferentBrowserStringProperty: _.get( JoistStrings, 'ieErrorPage.useDifferentBrowserStringProperty' )
  },
  preferences: {
    titleStringProperty: _.get( JoistStrings, 'preferences.titleStringProperty' ),
    tabs: {
      general: {
        titleStringProperty: _.get( JoistStrings, 'preferences.tabs.general.titleStringProperty' ),
        title__commentStringProperty: _.get( JoistStrings, 'preferences.tabs.general.title__commentStringProperty' ),
        accessibilityIntroStringProperty: _.get( JoistStrings, 'preferences.tabs.general.accessibilityIntroStringProperty' ),
        moreAccessibilityStringProperty: _.get( JoistStrings, 'preferences.tabs.general.moreAccessibilityStringProperty' ),
        simulationSpecificSettingsStringProperty: _.get( JoistStrings, 'preferences.tabs.general.simulationSpecificSettingsStringProperty' ),
        simulationSpecificSettings__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.general.simulationSpecificSettings__deprecatedStringProperty' )
      },
      overview: {
        titleStringProperty: _.get( JoistStrings, 'preferences.tabs.overview.titleStringProperty' )
      },
      simulation: {
        titleStringProperty: _.get( JoistStrings, 'preferences.tabs.simulation.titleStringProperty' )
      },
      visual: {
        titleStringProperty: _.get( JoistStrings, 'preferences.tabs.visual.titleStringProperty' ),
        interactiveHighlightsStringProperty: _.get( JoistStrings, 'preferences.tabs.visual.interactiveHighlightsStringProperty' ),
        interactiveHighlightsDescriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.visual.interactiveHighlightsDescriptionStringProperty' ),
        projectorModeDescriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.visual.projectorModeDescriptionStringProperty' )
      },
      audio: {
        titleStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.titleStringProperty' ),
        voicing: {
          titleEnglishOnlyStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.voicing.titleEnglishOnlyStringProperty' ),
          descriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.voicing.descriptionStringProperty' )
        },
        sounds: {
          titleStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.sounds.titleStringProperty' ),
          extraSounds: {
            titleStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.sounds.extraSounds.titleStringProperty' ),
            descriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.sounds.extraSounds.descriptionStringProperty' )
          },
          descriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.sounds.descriptionStringProperty' )
        },
        audioFeatures: {
          titleStringProperty: _.get( JoistStrings, 'preferences.tabs.audio.audioFeatures.titleStringProperty' )
        }
      },
      input: {
        titleStringProperty: _.get( JoistStrings, 'preferences.tabs.input.titleStringProperty' ),
        gestureControls: {
          titleStringProperty: _.get( JoistStrings, 'preferences.tabs.input.gestureControls.titleStringProperty' ),
          title__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.input.gestureControls.title__deprecatedStringProperty' ),
          descriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.input.gestureControls.descriptionStringProperty' ),
          description__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.input.gestureControls.description__deprecatedStringProperty' )
        }
      },
      localization: {
        titleStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.titleStringProperty' ),
        languageSelection: {
          titleStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.languageSelection.titleStringProperty' ),
          descriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.languageSelection.descriptionStringProperty' )
        },
        regionAndCulture: {
          titleStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.titleStringProperty' ),
          descriptionStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.descriptionStringProperty' ),
          africaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.africaStringProperty' ),
          africaModestStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.africaModestStringProperty' ),
          asiaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.asiaStringProperty' ),
          latinAmericaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.latinAmericaStringProperty' ),
          oceaniaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.oceaniaStringProperty' ),
          randomStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.randomStringProperty' ),
          unitedStatesOfAmericaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.unitedStatesOfAmericaStringProperty' ),
          portrayalSets: {
            africaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.africaStringProperty' ),
            africa__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.africa__deprecatedStringProperty' ),
            africaModestStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.africaModestStringProperty' ),
            africaModest__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.africaModest__deprecatedStringProperty' ),
            asiaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.asiaStringProperty' ),
            asia__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.asia__deprecatedStringProperty' ),
            latinAmericaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.latinAmericaStringProperty' ),
            latinAmerica__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.latinAmerica__deprecatedStringProperty' ),
            oceaniaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.oceaniaStringProperty' ),
            oceania__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.oceania__deprecatedStringProperty' ),
            multiculturalStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.multiculturalStringProperty' ),
            multicultural__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.multicultural__deprecatedStringProperty' ),
            unitedStatesOfAmericaStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.unitedStatesOfAmericaStringProperty' ),
            unitedStatesOfAmerica__deprecatedStringProperty: _.get( JoistStrings, 'preferences.tabs.localization.regionAndCulture.portrayalSets.unitedStatesOfAmerica__deprecatedStringProperty' )
          }
        }
      }
    }
  },
  PhetButton: {
    nameStringProperty: _.get( JoistStrings, 'PhetButton.nameStringProperty' ),
    name__deprecatedStringProperty: _.get( JoistStrings, 'PhetButton.name__deprecatedStringProperty' )
  },
  HomeButton: {
    nameStringProperty: _.get( JoistStrings, 'HomeButton.nameStringProperty' ),
    name__deprecatedStringProperty: _.get( JoistStrings, 'HomeButton.name__deprecatedStringProperty' )
  },
  adaptedFromStringProperty: _.get( JoistStrings, 'adaptedFromStringProperty' ),
  adaptedFrom__deprecatedStringProperty: _.get( JoistStrings, 'adaptedFrom__deprecatedStringProperty' ),
  titlePatternStringProperty: _.get( JoistStrings, 'titlePatternStringProperty' ),
  titlePattern__deprecatedStringProperty: _.get( JoistStrings, 'titlePattern__deprecatedStringProperty' ),
  a11y: {
    keyboardHelp: {
      keyboardShortcutsStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelp_keyboardShortcuts', _.get( JoistStrings, 'a11y.keyboardHelp.keyboardShortcutsStringProperty' ) ),
      tabToGetStarted: {
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelp_tabToGetStarted_accessibleHelpText', _.get( JoistStrings, 'a11y.keyboardHelp.tabToGetStarted.accessibleHelpTextStringProperty' ) ),
        readingBlockNameResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelp_tabToGetStarted_readingBlockNameResponse', _.get( JoistStrings, 'a11y.keyboardHelp.tabToGetStarted.readingBlockNameResponseStringProperty' ) )
      }
    },
    inPlayAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_inPlayArea', _.get( JoistStrings, 'a11y.inPlayAreaStringProperty' ) ),
    inControlAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_inControlArea', _.get( JoistStrings, 'a11y.inControlAreaStringProperty' ) ),
    simScreensStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_simScreens', _.get( JoistStrings, 'a11y.simScreensStringProperty' ) ),
    simScreenStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_simScreen', _.get( JoistStrings, 'a11y.simScreenStringProperty' ) ),
    screenNamePatternStringProperty: _.get( JoistStrings, 'a11y.screenNamePatternStringProperty' ),
    goToScreenPatternStringProperty: _.get( JoistStrings, 'a11y.goToScreenPatternStringProperty' ),
    screenSimPatternStringProperty: _.get( JoistStrings, 'a11y.screenSimPatternStringProperty' ),
    homeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_home', _.get( JoistStrings, 'a11y.homeStringProperty' ) ),
    homeScreenDescriptionPatternStringProperty: _.get( JoistStrings, 'a11y.homeScreenDescriptionPatternStringProperty' ),
    homeScreenHintStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_homeScreenHint', _.get( JoistStrings, 'a11y.homeScreenHintStringProperty' ) ),
    homeScreenIntroPatternStringProperty: _.get( JoistStrings, 'a11y.homeScreenIntroPatternStringProperty' ),
    homeScreenButtonDetailsPatternStringProperty: _.get( JoistStrings, 'a11y.homeScreenButtonDetailsPatternStringProperty' ),
    simResourcesStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_simResources', _.get( JoistStrings, 'a11y.simResourcesStringProperty' ) ),
    soundToggle: {
      alert: {
        simSoundOnStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_soundToggle_alert_simSoundOn', _.get( JoistStrings, 'a11y.soundToggle.alert.simSoundOnStringProperty' ) ),
        simSoundOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_soundToggle_alert_simSoundOff', _.get( JoistStrings, 'a11y.soundToggle.alert.simSoundOffStringProperty' ) )
      },
      labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_soundToggle_label', _.get( JoistStrings, 'a11y.soundToggle.labelStringProperty' ) )
    },
    checkOutShortcutsStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_checkOutShortcuts', _.get( JoistStrings, 'a11y.checkOutShortcutsStringProperty' ) ),
    phetMenuStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_phetMenu', _.get( JoistStrings, 'a11y.phetMenuStringProperty' ) ),
    preferences: {
      tabs: {
        labelledDescriptionPatternStringProperty: _.get( JoistStrings, 'a11y.preferences.tabs.labelledDescriptionPatternStringProperty' ),
        tabResponsePatternStringProperty: _.get( JoistStrings, 'a11y.preferences.tabs.tabResponsePatternStringProperty' ),
        visual: {
          interactiveHighlights: {
            enabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_visual_interactiveHighlights_enabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.visual.interactiveHighlights.enabledAlertStringProperty' ) ),
            disabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_visual_interactiveHighlights_disabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.visual.interactiveHighlights.disabledAlertStringProperty' ) )
          }
        },
        audio: {
          sounds: {
            soundsOnStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_sounds_soundsOn', _.get( JoistStrings, 'a11y.preferences.tabs.audio.sounds.soundsOnStringProperty' ) ),
            soundsOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_sounds_soundsOff', _.get( JoistStrings, 'a11y.preferences.tabs.audio.sounds.soundsOffStringProperty' ) ),
            extraSounds: {
              extraSoundsOnStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_sounds_extraSounds_extraSoundsOn', _.get( JoistStrings, 'a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOnStringProperty' ) ),
              extraSoundsOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_sounds_extraSounds_extraSoundsOff', _.get( JoistStrings, 'a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOffStringProperty' ) )
            }
          },
          voicing: {
            titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_title', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.titleStringProperty' ) ),
            voicingOnStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_voicingOn', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.voicingOnStringProperty' ) ),
            voicingOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_voicingOff', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.voicingOffStringProperty' ) ),
            voicingOffOnlyAvailableInEnglishStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_voicingOffOnlyAvailableInEnglish', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.voicingOffOnlyAvailableInEnglishStringProperty' ) ),
            voicingToolbar: {
              titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_voicingToolbar_title', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.voicingToolbar.titleStringProperty' ) ),
              toolbarAddedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_voicingToolbar_toolbarAdded', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.voicingToolbar.toolbarAddedStringProperty' ) ),
              toolbarRemovedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_voicingToolbar_toolbarRemoved', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.voicingToolbar.toolbarRemovedStringProperty' ) )
            },
            simVoicingOptions: {
              titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_title', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.titleStringProperty' ) ),
              descriptionStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_description', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.descriptionStringProperty' ) ),
              objectDetails: {
                labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_objectDetails_label', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.labelStringProperty' ) ),
                enabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_objectDetails_enabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.enabledAlertStringProperty' ) ),
                disabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_objectDetails_disabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.disabledAlertStringProperty' ) )
              },
              contextChanges: {
                labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_contextChanges_label', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.labelStringProperty' ) ),
                enabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_contextChanges_enabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.enabledAlertStringProperty' ) ),
                disabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_contextChanges_disabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.disabledAlertStringProperty' ) )
              },
              helpfulHints: {
                labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_helpfulHints_label', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.labelStringProperty' ) ),
                enabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_helpfulHints_enabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.enabledAlertStringProperty' ) ),
                disabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_simVoicingOptions_helpfulHints_disabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.disabledAlertStringProperty' ) )
              }
            },
            customizeVoice: {
              titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_title', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.titleStringProperty' ) ),
              expandedAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_expandedAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.expandedAlertStringProperty' ) ),
              collapsedAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_collapsedAlert', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.collapsedAlertStringProperty' ) ),
              variablesPatternStringProperty: _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.variablesPatternStringProperty' ),
              writtenVariablesPatternStringProperty: _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.writtenVariablesPatternStringProperty' ),
              voice: {
                titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_voice_title', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titleStringProperty' ) ),
                titlePatternStringProperty: _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titlePatternStringProperty' ),
                noVoicesAvailableStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_voice_noVoicesAvailable', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.voice.noVoicesAvailableStringProperty' ) )
              },
              rate: {
                titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_title', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.titleStringProperty' ) ),
                labelStringStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_labelString', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.labelStringStringProperty' ) ),
                rangeDescriptions: {
                  lowStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_low', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.lowStringProperty' ) ),
                  normalStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_normal', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.normalStringProperty' ) ),
                  aboveNormalStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_aboveNormal', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.aboveNormalStringProperty' ) ),
                  highStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_high', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.highStringProperty' ) ),
                  voiceRateNormalStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_rate_rangeDescriptions_voiceRateNormal', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.voiceRateNormalStringProperty' ) )
                }
              },
              pitch: {
                titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_audio_voicing_customizeVoice_pitch_title', _.get( JoistStrings, 'a11y.preferences.tabs.audio.voicing.customizeVoice.pitch.titleStringProperty' ) )
              }
            }
          }
        },
        input: {
          gestureControl: {
            enabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_input_gestureControl_enabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.input.gestureControl.enabledAlertStringProperty' ) ),
            disabledAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_preferences_tabs_input_gestureControl_disabledAlert', _.get( JoistStrings, 'a11y.preferences.tabs.input.gestureControl.disabledAlertStringProperty' ) )
          }
        },
        localization: {
          languageSelection: {
            languageChangeResponsePatternStringProperty: _.get( JoistStrings, 'a11y.preferences.tabs.localization.languageSelection.languageChangeResponsePatternStringProperty' )
          }
        }
      }
    },
    voicingToolbar: {
      titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_title', _.get( JoistStrings, 'a11y.voicingToolbar.titleStringProperty' ) ),
      openToolbarStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_openToolbar', _.get( JoistStrings, 'a11y.voicingToolbar.openToolbarStringProperty' ) ),
      closeToolbarStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_closeToolbar', _.get( JoistStrings, 'a11y.voicingToolbar.closeToolbarStringProperty' ) ),
      hideToolbarStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_hideToolbar', _.get( JoistStrings, 'a11y.voicingToolbar.hideToolbarStringProperty' ) ),
      showToolbarStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_showToolbar', _.get( JoistStrings, 'a11y.voicingToolbar.showToolbarStringProperty' ) ),
      toolbarShownStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_toolbarShown', _.get( JoistStrings, 'a11y.voicingToolbar.toolbarShownStringProperty' ) ),
      toolbarHiddenStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_toolbarHidden', _.get( JoistStrings, 'a11y.voicingToolbar.toolbarHiddenStringProperty' ) ),
      voicing: {
        titleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_title', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.titleStringProperty' ) ),
        quickInfoStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_quickInfo', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.quickInfoStringProperty' ) ),
        playOverviewLabelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_playOverviewLabel', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.playOverviewLabelStringProperty' ) ),
        playDetailsLabelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_playDetailsLabel', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.playDetailsLabelStringProperty' ) ),
        playHintLabelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_playHintLabel', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.playHintLabelStringProperty' ) ),
        overviewLabelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_overviewLabel', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.overviewLabelStringProperty' ) ),
        detailsLabelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_detailsLabel', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.detailsLabelStringProperty' ) ),
        hintLabelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_hintLabel', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.hintLabelStringProperty' ) ),
        simVoicingOnAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_simVoicingOnAlert', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.simVoicingOnAlertStringProperty' ) ),
        simVoicingOffAlertStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voicingToolbar_voicing_simVoicingOffAlert', _.get( JoistStrings, 'a11y.voicingToolbar.voicing.simVoicingOffAlertStringProperty' ) )
      }
    }
  }
};

export default JoistFluent;

joist.register('JoistFluent', JoistFluent);
