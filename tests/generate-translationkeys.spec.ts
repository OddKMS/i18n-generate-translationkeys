import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { configuration } from '#types';
import * as configurationSpy from '#helpers';
import * as generatorSpy from '#generate-keys';
import generateKeys from '#generate-keys';

describe('the generate-translationkeys script', () => {
  it('should get a configuration detailing runtime operation', () => {
    const configSpy = vi.spyOn(configurationSpy, 'getConfiguration');

    generateKeys();

    expect(configSpy).toHaveBeenCalledOnce();

    const spyConfigResult = configSpy.mock.results[0];

    // Supress error ts(2344) since we're checking against an unknown type
    // @ts-ignore
    expectTypeOf(spyConfigResult.value).toMatchObjectType<configuration>();
  });

  it('should accept a configuration object as parameter', () => {
    const genSpy = vi.spyOn(generatorSpy, 'default');

    const config: configuration = {
      i18nLocation: './mockLocation',
      translationsLocation: './lockMocation',
      outputDirectory: './locomotion',
      filename: 'steam_locomotive.ts',
      verbose: false,
      quiet: false,
    };

    expect(() => generateKeys(config)).not.toThrow();

    expect(genSpy).toHaveBeenCalledWith(config);
  });

  it.todo(
    'should prioritize the configuration object over config from CLI or file',
    () => {}
  );

  it('should read i18n translations files', () => {
    const spy = vi.spyOn(generatorSpy, 'default');

    generateKeys();

    expect(spy).toHaveBeenCalledOnce();
  });

  it.todo('should output a file containing json paths as keys', () => {});
});
