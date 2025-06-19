import generateKeys, * as generatorSpy from '#generate-keys';
import {
  faker,
  fakerNB_NO,
  fakerEN_GB,
  fakerDE,
  fakerJA,
  generateMersenne32Randomizer,
  Faker,
  Randomizer,
} from '@faker-js/faker';
import { makeFactory } from 'factory.ts';
import * as configurationSpy from '#helpers';
import { getConfiguration } from '#helpers';
import { configuration } from '#types';
import { vol } from 'memfs';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

describe('the generate-translationkeys script', () => {
  it('should get a configuration detailing runtime operation if no config is supplied', () => {
    const configSpy = vi.spyOn(configurationSpy, 'getConfiguration');

    generateKeys();

    expect(configSpy).toHaveBeenCalledOnce();

    const spyConfigResult = configSpy.mock.results[0];

    // Supress error ts(2344) since we're checking against an unknown type
    // @ts-ignore
    expectTypeOf(spyConfigResult.value).toMatchObjectType<configuration>();
  });

  it('should accept a configuration object as parameter', () => {
    const genKeySpy = vi.spyOn(generatorSpy, 'default');

    const configParameterObject: configuration = {
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
    const mockConfigFile: configuration = {
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

    const configParameterObject: configuration = {
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
    const config = getConfiguration();

    interface Translation {
      key: string;
      value: string | Translation;
    }

    // Make sure generated test data are consistent by using the same
    // seed for each of the faker instances
    faker.seed(42);
    fakerNB_NO.seed(42);
    fakerEN_GB.seed(42);
    fakerDE.seed(42);
    fakerJA.seed(42);

    // Generate keys first, then re-use them for the factories of
    // the different locales. 100 different keys should be enough.
    const testTranslationKeys = () => {
      const randomizer = generateMersenne32Randomizer(42);
      let fakerKeys = [];

      for (let i = 0; i < 100; i++) {
        const randalthor = randomizer.next();

        // Switching up what words the translation keys are composed of
        if (randalthor >= 0 && randalthor < 0.33) {
          fakerKeys.push(faker.company.buzzAdjective());
        } else if (randalthor >= 0.33 && randalthor < 0.66) {
          fakerKeys.push(faker.company.buzzNoun());
        } else if (randalthor >= 0.66 && randalthor < 1) {
          fakerKeys.push(faker.company.buzzVerb());
        }
      }

      return fakerKeys;
    };

    const translationFactory = makeFactory<Translation>({
      key: 'localizationKey',
      value:
        'this is a long text that will need translation into other languages',
    });

    let translations_NB_NO;
    let translations_EN_GB;
    let translations_DE;
    let translations_JA;

    const translationStructureRandomizer = generateMersenne32Randomizer(42);

    // If we hit a text, we return. If we get a Translation type we keep
    // rolling the dice to see how deep the rabbithole goes
    function buildTestTranslations(
      fakerInstance: Faker,
      keyList: string[],
      randomizer: Randomizer,
      textOrNestedTranslation?: string | Translation
    ) {
      if (typeof textOrNestedTranslation === 'string') {
        return textOrNestedTranslation;
      }

      // We only continue the recursion as long as there are keys remaining
      // to map out
      if (keyList.length >= 1) {
        const nextDecider = randomizer.next();

        if (nextDecider >= 0.5) {
          // The next call will exit the recursion
          const text = fakerInstance.word.words({ count: { min: 2, max: 10 } });
          return buildTestTranslations(
            fakerInstance,
            keyList,
            randomizer,
            text
          );
        } else {
          // The next call will continue the recrusion
          const nextKey = keyList.shift() as string;

          const nextTranslation: Translation = {
            key: nextKey,
            value: buildTestTranslations(fakerInstance, keyList, randomizer),
          };

          return nextTranslation;
        }
      } else {
        // We ran out of keys
        return fakerInstance.word.words({ count: { min: 2, max: 10 } });
      }
    }

    let norwegianTranslationKeys = testTranslationKeys();
    const testData = buildTestTranslations(
      fakerNB_NO,
      norwegianTranslationKeys,
      translationStructureRandomizer
    );

    console.log('Recursive test data geneartion attempt');
    console.log(testData);

    const dummy = { test: 'best' };

    // const testData = {
    //   './src/i18n/': JSON.stringify(dummy),
    // };

    // vol.fromJSON(testData);

    console.log(vol.toJSON());

    // vi.mock('node:fs', async () => {
    //   const fs = await vi.importActual('node:fs');

    //   return {
    //     ...fs,
    //     readFileSync: vi.fn(() => {
    //       return JSON.stringify(configFileDefaults);
    //     }),
    //   };
    // });

    const spy = vi.spyOn(generatorSpy, 'default');

    generateKeys();

    expect(spy).toHaveBeenCalledOnce();
    expect.fail();
  });

  it.todo('should output a file containing json paths as keys', () => {});
});
