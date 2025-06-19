import type { Translation, Configuration } from '#types';
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
import { Volume } from 'memfs';

function generateTestData(configuration: Configuration, seed: number): Volume {
  // Make sure generated test data are somewhat similar by using
  // the same seed for each of the faker instances.
  faker.seed(seed);
  fakerNB_NO.seed(seed);
  fakerEN_GB.seed(seed);
  fakerDE.seed(seed);
  fakerJA.seed(seed);

  // We need to create these outside of the other functions in order to keep
  // test data consistent.
  const translationStructureRandomizer = generateMersenne32Randomizer(seed);
  const translationKeys = testTranslationKeys(seed);

  // Four different language sets should be enough to test properly.
  const translations_NB_NO = buildTestTranslations(
    fakerNB_NO,
    translationKeys,
    translationStructureRandomizer,
    seed
  );

  const translations_EN_GB = buildTestTranslations(
    fakerEN_GB,
    translationKeys,
    translationStructureRandomizer,
    seed
  );

  const translations_DE = buildTestTranslations(
    fakerDE,
    translationKeys,
    translationStructureRandomizer,
    seed
  );

  const translations_JA = buildTestTranslations(
    fakerJA,
    translationKeys,
    translationStructureRandomizer,
    seed
  );

  // We use the translation location specified in the config in order to place
  // our test data. That way our tests are as similar to the actual use as possible.
  const translationLocation_NB_NO =
    configuration.translationsLocation + '/NB_NO/translations.json';

  const translationLocation_EN_GB =
    configuration.translationsLocation + '/EN_GB/translations.json';

  const translationLocation_DE =
    configuration.translationsLocation + '/DE/translations.json';

  const translationLocation_JA =
    configuration.translationsLocation + '/JA/translations.json';

  const testVolume = new Volume();

  testVolume.mkdirSync(configuration.translationsLocation + '/NB_NO', {
    recursive: true,
  });

  testVolume.mkdirSync(configuration.translationsLocation + '/EN_GB', {
    recursive: true,
  });

  testVolume.mkdirSync(configuration.translationsLocation + '/DE', {
    recursive: true,
  });

  testVolume.mkdirSync(configuration.translationsLocation + '/JA', {
    recursive: true,
  });

  testVolume.writeFileSync(
    translationLocation_NB_NO,
    JSON.stringify(translations_NB_NO)
  );

  testVolume.writeFileSync(
    translationLocation_EN_GB,
    JSON.stringify(translations_EN_GB)
  );

  testVolume.writeFileSync(
    translationLocation_DE,
    JSON.stringify(translations_DE)
  );

  testVolume.writeFileSync(
    translationLocation_JA,
    JSON.stringify(translations_JA)
  );

  console.log('Test data created:');
  console.log(testVolume.toTree());

  return testVolume;
}

// If we hit a text, we return. If we get a Translation type we keep
// rolling the dice to see how deep the rabbithole goes
function buildTestTranslations(
  fakerInstance: Faker,
  keyList: string[],
  randomizer: Randomizer,
  seed: number
) {
  // Copy the translationKeys list to a new array so the original one can be
  // re-used in order for translation keys to be identical between sets.
  let translationKeys = Array.from(keyList);

  // We also need to re-seed the randomizer to ensure that the translation tree
  // structure is kept identical between language sets.
  randomizer.seed(seed);

  let testTranslations: Translation = {};

  while (translationKeys.length > 0) {
    const translationKey = translationKeys.shift() as string;

    testTranslations[translationKey] = recursiveGenerateTranslationText();
  }

  return testTranslations;

  function recursiveGenerateTranslationText(): string | Translation {
    // We only continue the recursion as long as there are keys remaining
    // to map out
    if (translationKeys.length >= 1) {
      const goDeeperDecider = randomizer.next();

      // Coin toss: Do we stop populating this branch or keep going?
      if (goDeeperDecider >= 0.5) {
        // We exit the recursion and return a random text
        return fakerInstance.word.words({
          count: { min: 2, max: 10 },
        });
      } else {
        // We continue the recrusion

        // Some nodes have multiple branches so that our tree is a tree
        // and not simply a collection of... sticks.
        const branchOutDecider = randomizer.next();

        if (branchOutDecider <= 0.4) {
          let branchedTranslations: Translation = {};

          // Use the value of the decider to determine how many branches
          // to add to the node
          for (let index = 0; index < branchOutDecider; index += 0.1) {
            if (translationKeys.length > 0) {
              const branchKey = translationKeys.shift() as string;

              branchedTranslations[branchKey] =
                recursiveGenerateTranslationText();
            }
          }

          return branchedTranslations;
        } else {
          // No branched node, create another node and spin the wheel again
          const nextKey = translationKeys.shift() as string;

          let nestedTranslation: Translation = {};

          nestedTranslation[nextKey] = recursiveGenerateTranslationText();

          return nestedTranslation;
        }
      }
    } else {
      // We ran out of keys
      return fakerInstance.word.words({ count: { min: 2, max: 10 } });
    }
  }
}

// Generate keys first, then re-use them for the factories of
// the different locales. 100 different keys should be enough.
function testTranslationKeys(seed: number) {
  const randomizer = generateMersenne32Randomizer(seed);
  let fakerKeys: string[] = [];

  while (fakerKeys.length < 100) {
    const randalthor = randomizer.next();
    let potentialKey: string = '';

    // Switching up what words the translation keys are composed of
    if (randalthor >= 0 && randalthor < 0.33) {
      potentialKey = faker.company.buzzAdjective();
    } else if (randalthor >= 0.33 && randalthor < 0.66) {
      potentialKey = faker.company.buzzNoun();
    } else if (randalthor >= 0.66 && randalthor < 1) {
      potentialKey = faker.company.buzzVerb();
    }

    // We want only unique keys for simplicity's sake
    if (!fakerKeys.includes(potentialKey)) {
      fakerKeys.push(potentialKey);
    }
  }

  return fakerKeys;
}

export { generateTestData };
