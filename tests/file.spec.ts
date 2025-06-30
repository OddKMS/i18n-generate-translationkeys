import * as helperSpy from '#helpers';
import {
  getTranslationFiles,
  getTranslationKeys,
  getConfiguration,
  configFileDefaults,
  createTranslationKeysFile,
} from '#helpers';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { generateTestData } from './data/testData.ts';
import * as fsMocked from 'node:fs';
import * as fsAsyncMocked from 'node:fs/promises';
import { fs, vol } from 'memfs';
import { afterEach } from 'node:test';

// Set up testdata in an in-memory filesystem
beforeAll(() => {
  vi.spyOn(helperSpy, 'getConfiguration').mockImplementation(() => {
    return configFileDefaults;
  });

  vi.mock('node:fs', async () => {
    const memfs: { fs: typeof fs } = await vi.importActual('memfs');

    return { default: memfs.fs, ...memfs.fs };
  });

  vi.mock('node:fs/promises', async () => {
    const memfs: { fs: typeof fs } = await vi.importActual('memfs');

    return { default: memfs.fs.promises, ...memfs.fs.promises };
  });

  vol.fromJSON(generateTestData(getConfiguration(), 42));
});

afterEach(() => {
  vol.reset();
});

afterAll(() => {
  vi.resetAllMocks();
});

describe('The file generator function', () => {
  it('should take a configuration object as parameter', async () => {
    const createTKFileSpy = vi.spyOn(helperSpy, 'createTranslationKeysFile');

    const config = getConfiguration();

    const translationFiles = await getTranslationFiles(
      config.translationsLocation
    );

    const translationKeys = await getTranslationKeys(translationFiles);

    expect(
      async () => await createTranslationKeysFile(config, translationKeys)
    ).not.toThrow();

    expect(createTKFileSpy).toHaveBeenCalledWith(config, translationKeys);
  });

  it.todo(
    'should also take a translationKeys json object as parameter',
    async () => {}
  );

  it.todo(
    'should create a file in the location dictated by the configuration object',
    async () => {}
  );

  it.todo(
    'should use the filename in the configuration to name the file',
    async () => {}
  );

  it.todo(
    'should populate the file using the passed json object',
    async () => {}
  );

  it.todo(
    'should template the file so that it resembles a TypeScript module export of the passed object',
    async () => {}
  );

  it.todo('should return the file path of the created file', async () => {});
});
