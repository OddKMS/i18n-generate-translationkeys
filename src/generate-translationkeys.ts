import { $, fs } from 'zx';
import * as path from 'path';
import * as jq from 'node-jq';
import { getConfiguration } from '#helpers';
import { Configuration } from '#types';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

const generateKeys = (config?: Configuration) => {
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

  const translationFiles = getTranslationFiles(translationsLocation);
  console.log(translationFiles);

  return { translationKeys, config };
};

function getTranslationFiles(translationsLocation: string) {
  let translationFiles: string[] = [];

  // First we check that the translations directory exists at all
  if (existsSync(translationsLocation)) {
    readdir(translationsLocation, { recursive: true }).then((files) => {
      files
        .filter((file) => file.endsWith('.json'))
        .forEach((jsonFile) => {
          translationFiles.push(jsonFile);
        });
    });
  }

  return translationFiles;
}

export default generateKeys;
export { getTranslationFiles };
