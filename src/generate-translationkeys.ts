import { $ } from 'zx';
import * as path from 'path';
import * as jq from 'node-jq';
import { getConfiguration } from '#helpers';
import { configuration } from '#types';

const generateKeys = (config?: configuration) => {
  const {
    i18nLocation,
    translationsLocation,
    outputDirectory,
    filename,
    verbose,
    quiet,
  } = config ?? getConfiguration();

  function TUIOutput(outputText: string, ...variables: any[]) {
    return console.log(outputText, ...variables);
  }

  function TUIVerbose(outputText: string, ...variables: any[]) {
    return verbose && console.log(outputText, ...variables);
  }

  const readFiles = () => {
    //  Create a union of the different translation files.
    //  This way, we don't miss out on any keys that may have been added
    //  to one of the languages but not the other.
    //
    //  The translated texts will be combined willy-nilly,
    //  but we only care about the keys so that is acceptable.
    const filesFilter = 'reduce .[] as $obj ({}; . * $obj)';
    const translationFiles = '';

    // const translations = jq -s  $translation_files
  };

  TUIOutput('Generating TranslationKeys object, please wait...');

  TUIVerbose('----------------------------------------------------');
  TUIVerbose('| Running script with the following configuration: |');
  TUIVerbose('----------------------------------------------------');
  TUIVerbose('i18n location:     ', i18nLocation);
  TUIVerbose('translations:      ', translationsLocation);
  TUIVerbose('output:            ', outputDirectory);
  TUIVerbose('filename:          ', filename);
  TUIVerbose('verbose:           ', verbose);
  TUIVerbose('quiet:             ', quiet);

  const translationKeys = outputDirectory + '/' + filename;

  return { translationKeys, config };
};

export default generateKeys;
