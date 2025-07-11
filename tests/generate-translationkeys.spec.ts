import generateKeys, * as generatorSpy from '#generate-keys';
import * as helperSpy from '#helpers';
import { getConfiguration, configFileDefaults } from '#helpers';
import { Configuration } from '#types';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest';
import { generateTestData } from './data/testData.ts';
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

describe('the generate-translationkeys script', () => {
  it('should get a configuration detailing runtime operation if no config is supplied', async () => {
    const configSpy = vi.spyOn(helperSpy, 'getConfiguration');

    await generateKeys();

    expect(configSpy).toHaveBeenCalledOnce();

    // Supress error ts(2344) since we're checking against an unknown type
    // @ts-ignore
    expectTypeOf(configSpy).toMatchObjectType<Configuration>();
  });

  it('should accept a configuration object as parameter', async () => {
    const genKeySpy = vi.spyOn(generatorSpy, 'default');

    const configParameterObject: Configuration = {
      i18nLocation: './mockLocation',
      translationsLocation: './lockMocation',
      outputDirectory: './locomotion',
      filename: 'steam_locomotive.ts',
      verbose: false,
      quiet: false,
    };

    expect(async () => await generateKeys(configParameterObject)).not.toThrow();

    expect(genKeySpy).toHaveBeenCalledWith(configParameterObject);
  });

  it('should prioritize the configuration object over config from CLI or file', async () => {
    const mockConfigFile: Configuration = {
      i18nLocation: './sällskapsresan',
      translationsLocation: './snowroller',
      outputDirectory: './segelsällskapsresan',
      filename: 'ofrivillig_golfare.ts',
      verbose: false,
      quiet: false,
    };

    const genKeySpy = vi.spyOn(generatorSpy, 'default');
    const configSpy = vi
      .spyOn(helperSpy, 'getConfiguration')
      .mockImplementationOnce(() => {
        return mockConfigFile;
      });

    const configParameterObject: Configuration = {
      i18nLocation: './warcraft-iii',
      translationsLocation: './red-alert',
      outputDirectory: './empire-earth',
      filename: 'age-of-empires.ts',
      verbose: true,
      quiet: false,
    };

    const keys = await generateKeys(configParameterObject);

    // Configuration
    expect(configSpy).not.toHaveBeenCalled();
    expect(configSpy).not.toHaveReturnedWith(mockConfigFile);

    // Key Generation
    expect(genKeySpy).toHaveBeenCalledWith(configParameterObject);
    expect(genKeySpy).not.toHaveResolvedWith(configFileDefaults);
    expect(genKeySpy).toHaveResolvedWith(
      expect.objectContaining({ config: configParameterObject })
    );

    // Output verification
    expect(keys.config).not.toMatchObject(configFileDefaults);
    expect(keys.config).toMatchObject(configParameterObject);
  });

  it('should get an array of translations files', async () => {
    vi.spyOn(helperSpy, 'getConfiguration').mockImplementation(() => {
      return configFileDefaults;
    });

    const getTranslationsSpy = vi.spyOn(helperSpy, 'getTranslationFiles');

    await generateKeys();

    expect(getTranslationsSpy).toHaveBeenCalledOnce();
    expect(getTranslationsSpy).toHaveResolvedWith(
      expect.arrayContaining([expect.stringContaining('.json')])
    );
  });

  it('should get an json object containing the paths to the translation texts', async () => {
    vi.spyOn(helperSpy, 'getConfiguration').mockImplementation(() => {
      return configFileDefaults;
    });

    const getTranslationKeysSpy = vi.spyOn(helperSpy, 'getTranslationKeys');

    await generateKeys();

    expect(getTranslationKeysSpy).toHaveBeenCalledOnce();
    expect(getTranslationKeysSpy).toHaveResolved();
  });

  it.todo('should output a file containing json paths as keys', () => {});
});
