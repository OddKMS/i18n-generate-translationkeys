// for handling command line arguments via npx
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { existsSync, readFileSync } from 'node:fs';
import type { configuration } from '#types';

const configFileDefaults: configuration = {
  i18nLocation: './src/i18n',
  translationsLocation: './src/i18n/translations',
  outputDirectory: './src/i18n',
  filename: 'translationKeys.ts',
  verbose: false,
  quiet: false,
};

function getConfiguration(): configuration {
  // CLI Arguments
  const cliArgs = yargs(hideBin(process.argv))
    .options({
      i18nLocation: {
        alias: 'i18n',
        type: 'string',
        description: 'i18n folder in your project',
      },
      translationsLocation: {
        alias: 't',
        type: 'string',
        description: 'Location of the translation json files.',
      },
      outputDirectory: {
        alias: 'o',
        type: 'string',
        description:
          'Path to the output directory of the translationKeys.ts file.',
      },
      filename: {
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
    .strict()
    .parseSync();

  // From config file
  function getConfigFromFile():
    | {
        i18nLocation: string;
        translationsLocation: string;
        outputDirectory: string;
        filename: string;
        verbose: boolean;
        quiet: boolean;
      }
    | undefined {
    const configFileName = '.tkrc.json';

    if (existsSync(configFileName)) {
      try {
        const configData = readFileSync(configFileName, 'utf-8');
        const config = JSON.parse(configData);
        return config;
      } catch (error) {
        throw new Error('Could not read from .tkrc.json');
      }
    } else {
      return undefined;
    }
  }

  const configFile = getConfigFromFile();

  // Default values
  const defaultI18nLocation = './src/i18n';
  const defaultTranslationsLocation = defaultI18nLocation + '/translations';
  const defaultOutputDirectory = defaultI18nLocation;
  const defaultFilename = 'translationKeys.ts';
  const defaultVerbose = false;
  const defaultQuiet = false;

  // Parameter priority is as follows:
  // CLI Argument > Config File > Default Values
  const i18nLocation =
    cliArgs.i18nLocation ?? configFile?.i18nLocation ?? defaultI18nLocation;

  const translationsLocation =
    cliArgs.translationsLocation ??
    configFile?.translationsLocation ??
    defaultTranslationsLocation;

  let outputDirectory =
    cliArgs.outputDirectory ??
    configFile?.outputDirectory ??
    defaultOutputDirectory;

  // If the output path is erroneously provided with a filename/ending
  // we remove the filename and display an message informing the user
  // of the correct way to change the filename
  const outputHasFileEnding: RegExp = /^[^\s].+\.(.+)$/gm;
  if (outputHasFileEnding.test(outputDirectory)) {
    const warningText =
      'Filename detected in outputDirectory parameter:\n' +
      outputDirectory +
      '\n' +
      'The supplied filename will be ignored and the remaining path will be used.\n' +
      'To output to a different file use the --filename parameter\n' +
      'or set the filename field of the config file';

    console.warn(warningText);

    // Finds and removes any filename including the preceding '/'
    const findLastLegOfOutput: RegExp = /([^\/|\n]+\..+)$/gm;
    outputDirectory = outputDirectory.replace(findLastLegOfOutput, '');

    // in the case that this leaves output completely empty we fall back
    // to the default output location
    if (outputDirectory.length == 0) {
      outputDirectory = defaultOutputDirectory;
    }
  }

  const filename = cliArgs.filename ?? configFile?.filename ?? defaultFilename;

  const verbose = cliArgs.verbose ?? configFile?.verbose ?? defaultVerbose;

  const quiet = cliArgs.quiet ?? configFile?.quiet ?? defaultQuiet;

  return {
    i18nLocation,
    translationsLocation,
    outputDirectory,
    filename,
    verbose,
    quiet,
  };
}

export { getConfiguration, configFileDefaults };
