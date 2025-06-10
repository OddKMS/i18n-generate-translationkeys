// for handling command line arguments via npx
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';

type configuration = {
  i18nLocation: string;
  translations: string;
  output: string;
  filenameOverride: string;
  verbose: boolean;
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
      verbose: {
        alias: 'v',
        type: 'boolean',
        description: 'Show additional runtime information from the script.',
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
        verbose: boolean;
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
  const defaultI18nLocation = './src/i18n';
  const defaultTranslationsLocation = defaultI18nLocation + '/translations';
  const defaultOutputLocation = defaultI18nLocation;
  const defaultFilename = '/translationKeys.ts';
  const defaultVerbose = false;
  const defaultQuiet = false;

  // Parameter priority is as follows:
  // CLI Argument > Config File > Default Values
  const i18nLocation =
    cliArgs.i18nLocation ?? configFile?.i18nLocation ?? defaultI18nLocation;

  const translations =
    cliArgs.translations ??
    configFile?.translationsLocation ??
    defaultTranslationsLocation;

  let output = cliArgs.output ?? configFile?.output ?? defaultOutputLocation;

  // If the output path is erroneously provided with a filename/ending
  // we remove the filename and display an message informing the user
  // of the correct way to change the filename
  const outputHasFileEnding: RegExp = /^.+\.(.+)$/gm;
  if (outputHasFileEnding.test(output)) {
    const warningText =
      'Filename detected in output parameter.\n' +
      'The supplied filename will be ignored and default filename will be used.\n' +
      'To output to a different file use the --filenameOverride parameter\n' +
      'or set the filenameOverride field of the config file';

    console.warn(warningText);

    // Finds and removes any filename including the preceding '/'
    const findLastLegOfOutput: RegExp = /([\/][^\/|\n]+\..+)$/gm;
    output = output.replace(findLastLegOfOutput, '');

    // in the case that this leaves output completely empty we fall back
    // to the default output location
    if (output.length == 0) {
      output = defaultOutputLocation;
    }
  }

  const filenameOverride =
    cliArgs.filenameOverride ?? configFile?.filenameOverride ?? defaultFilename;

  const verbose = cliArgs.verbose ?? configFile?.verbose ?? defaultVerbose;

  const quiet = cliArgs.quiet ?? configFile?.quiet ?? defaultQuiet;

  return {
    i18nLocation,
    translations,
    output,
    filenameOverride,
    verbose,
    quiet,
  };
}

export { getConfiguration };
