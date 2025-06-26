import { $, fs } from 'zx';
import * as path from 'path';
import * as jq from 'node-jq';
import { getConfiguration, getTranslationFiles } from '#helpers';
import { Configuration } from '#types';
import { existsSync } from 'node:fs';

const generateKeys = async (config?: Configuration) => {
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

  const translationFiles = await getTranslationFiles(translationsLocation);
  console.log(translationFiles);

  return { translationKeys, config };
};

export default generateKeys;
