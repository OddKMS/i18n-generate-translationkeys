import { $ } from 'zx';
import * as path from 'path';
import * as jq from 'node-jq';
import { getConfiguration } from '#helpers';
import { configuration } from '#types';

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

const generateKeys = (config?: configuration) => {
  const {
    i18nLocation,
    translationsLocation,
    outputDirectory,
    filename,
    verbose,
    quiet,
  } = config ?? getConfiguration();

  if (verbose) {
    console.log(
      '--------------------------------------------------------------'
    );
    console.log('Running script with the following configuration:');
    console.log(
      '--------------------------------------------------------------'
    );
    console.log('i18n location:     ', i18nLocation);
    console.log('translations:      ', translationsLocation);
    console.log('output:            ', outputDirectory);
    console.log('filename:          ', filename);
    console.log('verbose:           ', verbose);
    console.log('quiet:             ', quiet);
  }
};

export default generateKeys;
