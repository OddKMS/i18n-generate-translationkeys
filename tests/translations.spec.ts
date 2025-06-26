import * as helperSpy from '#helpers';
import {
  getTranslationFiles,
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

describe('the getTranslations helper function', () => {
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
