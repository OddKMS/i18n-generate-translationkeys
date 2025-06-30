import { Configuration } from '#types';
import { Json } from 'node-jq/lib/options.js';

async function createTranslationKeysFile(
  configuration: Configuration,
  translationKeys: Json
): Promise<string> {
  const translationKeysFile =
    configuration.outputDirectory + '/' + configuration.filename;

  return translationKeysFile;
}

export { createTranslationKeysFile };
