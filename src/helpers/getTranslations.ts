import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

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

export { getTranslationFiles };
