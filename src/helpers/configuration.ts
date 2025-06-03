// for handling command line arguments via npx
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';

function getConfiguration() {
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
        description: 'Output location of the translationKeys file.',
      },
      quiet: {
        alias: 'q',
        type: 'boolean',
        description: 'Supress output from the script.',
      },
    })
    .parse();

  // From config file
  const configFileName = '.tkrc.json';
  const configFile = () => {
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
  };

  // Default values
  const i18nLocationDefault = './src/i18n';
  const translationsLocationDefault = i18nLocationDefault + '/translations';
  const outputLocationDefault = i18nLocationDefault + '/translationKeys.ts';
  const quietDefault = false;

  // Parameter priority is as follows:
  // CLI Argument > Config File > Default Values
  return {
    i18nLocation:
      cliArgs.i18nLocation ?? configFile?.i18n_LOCATION ?? i18nLocationDefault,
    translations:
      cliArgs.translations ??
      configFile?.TRANSLATIONS_LOCATION ??
      translationsLocationDefault,
    output:
      cliArgs.output ?? configFile?.OUTPUT_LOCATION ?? outputLocationDefault,
    quiet: cliArgs.quiet ?? configFile?.QUIET ?? quietDefault,
  };
}

export { getConfiguration };
