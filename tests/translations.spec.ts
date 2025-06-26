import * as helperSpy from '#helpers';
import {
  getTranslationFiles,
  getTranslationKeys,
  getConfiguration,
  configFileDefaults,
} from '#helpers';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { generateTestData } from './data/testData.ts';
import * as fsMocked from 'node:fs';
import * as fsAsyncMocked from 'node:fs/promises';
import { fs, vol } from 'memfs';
import { afterEach } from 'node:test';

// Set up testdata in an in-memory filesystem
beforeAll(() => {
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

describe('the getTranslations function', () => {
  it('should read i18n translations json files', async () => {
    vi.spyOn(helperSpy, 'getConfiguration').mockImplementation(() => {
      return configFileDefaults;
    });

    const existsSpy = vi.spyOn(fsMocked, 'existsSync');
    const readdirSpy = vi.spyOn(fsAsyncMocked, 'readdir');
    const getTranslationsSpy = vi.spyOn(helperSpy, 'getTranslationFiles');

    const config = getConfiguration();

    await getTranslationFiles(config.translationsLocation);

    expect(existsSpy).toHaveBeenCalledWith(config.translationsLocation);
    expect(existsSpy).toHaveReturnedWith(true);

    expect(readdirSpy).toHaveBeenCalled();
    expect(readdirSpy).toHaveBeenCalledWith(config.translationsLocation, {
      recursive: true,
    });

    expect(getTranslationsSpy).toHaveBeenCalledOnce();
    expect(getTranslationsSpy).toHaveResolvedWith(
      expect.arrayContaining([expect.stringContaining('.json')])
    );

    vi.resetAllMocks();
  });
});

describe('the getTranslationKeys function', () => {
  it('should accept an array of file paths as parameter', async () => {
    const translationKeysSpy = vi.spyOn(helperSpy, 'getTranslationKeys');

    const testFilepaths: string[] = [
      './src/i18n/karlson/på/taket/hejsanhoppsan.json',
      './src/i18n/brødrene/løvehjerte/childhood_trauma.json',
    ];

    expect(async () => await getTranslationKeys(testFilepaths)).not.toThrow();

    expect(translationKeysSpy).toHaveBeenCalledWith(testFilepaths);
  });

  it.todo(
    'should find the json paths that terminate in a translation (text)',
    async () => {}
  );

  it.todo('should ignore json paths that lead to nested nodes', async () => {});

  it.todo(
    'should create an inclusive union of json path keys so that none are left out',
    async () => {}
  );

  it.todo(
    'should return an object containing the path keys to the translations',
    async () => {}
  );
});
