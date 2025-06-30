import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import jq from 'node-jq';
import { Json, OptionsInput } from 'node-jq/lib/options.js';

async function getTranslationFiles(translationsLocation: string) {
  let translationFiles: string[] = [];

  // First we check that the translations directory exists at all
  if (existsSync(translationsLocation)) {
    await readdir(translationsLocation, { recursive: true }).then((files) => {
      files
        .filter((file) => file.endsWith('.json'))
        .forEach((jsonFile) => {
          translationFiles.push(jsonFile);
        });
    });
  }

  return translationFiles;
}

async function readTranslations(translationFilepaths: string[]) {
  let translations: string[] = [];

  await Promise.all(
    translationFilepaths.map(async (translationFile) => {
      await readFile(translationFile, 'utf-8').then((data) => {
        translations.push(JSON.parse(data));
      });
    })
  );

  return translations;
}

async function getTranslationKeys(
  translationFilepaths: string[]
): Promise<Json> {
  const translations = await readTranslations(translationFilepaths);

  const options: OptionsInput = {
    input: 'json',
    output: 'json',
  };

  // Create a union of the different translation files.
  // This way, we don't miss out on any keys that may have been added
  // to one of the languages but not the other.
  //
  // The translated texts will be combined willy-nilly,
  // but we only care about the keys so that is acceptable.
  const reduceFilter = 'reduce .[] as $obj ({}; . * $obj)';
  const translationsUnion = (await jq.run(
    reduceFilter,
    translations,
    options
  )) as Json;

  // Then, we get all the keys from the combined translations object
  // and replace the values with the dotted-out path to the related translation.
  const keysFilter =
    'reduce paths(type!="object" and type=="string") as $path \
     (.; setpath($path; ($path | join("."))))';
  const translationKeys = (await jq.run(
    keysFilter,
    translationsUnion,
    options
  )) as Json;

  return translationKeys;
}

export { getTranslationFiles, getTranslationKeys };
