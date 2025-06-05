// for handling command line arguments via npx
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';

type configuration = {
  i18nLocation: string;
  translations: string;
  output: string;
  filenameOverride: string;
  quiet: boolean;
};

function getConfiguration(): configuration {
  // CLI Arguments
  const cliArgs = yargs(hideBin(process.argv))
    .options({
      i18nLocation: {
        type: 'string',
        description: 'i18n folder in your project',
      },
      translations: {
        alias: 't',
        type: 'string',
        description: 'Location of the translation json files.',
      },
      output: {
        alias: 'o',
        type: 'string',
        description:
          'Path to the output directory of the translationKeys.ts file.',
      },
      filenameOverride: {
        alias: 'f',
        type: 'string',
        description: 'Overrides the file and object name of the output.',
      },
      quiet: {
        alias: 'q',
        type: 'boolean',
        description: 'Supress output from the script.',
      },
    })
    .parseSync();

  // From config file
  function getConfigFromFile():
    | {
        i18nLocation: string;
        translationsLocation: string;
        output: string;
        filenameOverride: string;
        quiet: boolean;
      }
    | undefined {
    const configFileName = '.tkrc.json';

    if (fs.existsSync(configFileName)) {
      try {
        const configData = fs.readFileSync(configFileName, 'utf-8');
        const config = JSON.parse(configData);
        return config;
      } catch (error) {
        console.error('Could not read from .tkrc.json', error);
      }
    } else {
      return undefined;
    }
  }

  const configFile = getConfigFromFile();

  // Default values
  const i18nLocationDefault = './src/i18n';
  const translationsLocationDefault = i18nLocationDefault + '/translations';
  const filenameDefault = '/translationKeys.ts';
  const outputLocationDefault = i18nLocationDefault;
  const quietDefault = false;

  // Parameter priority is as follows:
  // CLI Argument > Config File > Default Values
  const i18nLocation =
    cliArgs.i18nLocation ?? configFile?.i18nLocation ?? i18nLocationDefault;

  const translations =
    cliArgs.translations ??
    configFile?.translationsLocation ??
    translationsLocationDefault;

  let output = cliArgs.output ?? configFile?.output ?? outputLocationDefault;

  // If the output path is erroneously provided with a filename/ending
  // we remove the filename and display an message informing the user
  // of the correct way to change the filename
  const outputHasFileEnding: RegExp = /^.*\.(.*)$/gm;
  if (outputHasFileEnding.test(output)) {
    console.warn('Filename detected in output parameter.');
    console.warn(
      'The supplied filename will be ignored and default filename will be used.'
    );
    console.warn(
      'To output to a different file use the --filenameOverride parameter.'
    );
  }

  const filenameOverride =
    cliArgs.filenameOverride ?? configFile?.filenameOverride ?? filenameDefault;

  const quiet = cliArgs.quiet ?? configFile?.quiet ?? quietDefault;

  return {
    i18nLocation,
    translations,
    output,
    filenameOverride,
    quiet,
  };
}

export { getConfiguration };
