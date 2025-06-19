import generateKeys, * as generatorSpy from '#generate-keys';

import * as configurationSpy from '#helpers';
import { getConfiguration, configFileDefaults } from '#helpers';
import { Configuration } from '#types';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { generateTestData } from './data/testData.ts';

describe('the generate-translationkeys script', () => {
  it('should get a configuration detailing runtime operation if no config is supplied', () => {
    const configSpy = vi.spyOn(configurationSpy, 'getConfiguration');

    generateKeys();

    expect(configSpy).toHaveBeenCalledOnce();

    const spyConfigResult = configSpy.mock.results[0];

    // Supress error ts(2344) since we're checking against an unknown type
    // @ts-ignore
    expectTypeOf(spyConfigResult.value).toMatchObjectType<Configuration>();
  });

  it('should accept a configuration object as parameter', () => {
    const genKeySpy = vi.spyOn(generatorSpy, 'default');

    const configParameterObject: Configuration = {
      i18nLocation: './mockLocation',
      translationsLocation: './lockMocation',
      outputDirectory: './locomotion',
      filename: 'steam_locomotive.ts',
      verbose: false,
      quiet: false,
    };

    expect(() => generateKeys(configParameterObject)).not.toThrow();

    expect(genKeySpy).toHaveBeenCalledWith(configParameterObject);
  });

  it('should prioritize the configuration object over config from CLI or file', () => {
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
      .spyOn(configurationSpy, 'getConfiguration')
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

    const keys = generateKeys(configParameterObject);

    // Configuration
    expect(configSpy).not.toHaveBeenCalled();
    expect(configSpy).not.toHaveReturnedWith(mockConfigFile);

    // Key Generation
    expect(genKeySpy).toHaveBeenCalledWith(configParameterObject);
    expect(genKeySpy).not.toHaveReturnedWith(
      expect.objectContaining({ config: mockConfigFile })
    );
    expect(genKeySpy).toHaveReturnedWith(
      expect.objectContaining({ config: configParameterObject })
    );

    // Output verification
    expect(keys.config).toMatchObject(configParameterObject);
  });

  it('should read i18n translations files', () => {
    vi.spyOn(configurationSpy, 'getConfiguration').mockImplementationOnce(
      () => {
        return configFileDefaults;
      }
    );

    const config = getConfiguration();

    const testData = generateTestData(config, 42);

    const spy = vi.spyOn(generatorSpy, 'default');

    generateKeys();

    expect(spy).toHaveBeenCalledOnce();
    expect.fail();
  });

  it.todo('should output a file containing json paths as keys', () => {});
});
