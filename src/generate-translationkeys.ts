import { $ } from 'zx';
import * as path from 'path';
import * as jq from 'node-jq';
import { getConfiguration } from '#helpers';

const {
  i18nLocation,
  translationsLocation,
  output,
  filenameOverride,
  verbose,
  quiet,
} = getConfiguration();

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

const generate = () => {
  if (verbose) {
    console.log(
      '--------------------------------------------------------------'
    );
    console.log('Running script with the following config:');
    console.log(
      '--------------------------------------------------------------'
    );
    console.log('i18n location:     ', i18nLocation);
    console.log('translations:      ', translationsLocation);
    console.log('output:            ', output);
    console.log('filename override: ', filenameOverride);
    console.log('verbose:           ', verbose);
    console.log('quiet:             ', quiet);
  }
};

export default generate;
