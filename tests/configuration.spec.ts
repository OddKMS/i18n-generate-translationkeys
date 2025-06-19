import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { getConfiguration, configFileDefaults } from '#helpers';
import * as configurationHelper from '#helpers';
import * as fsMocked from 'node:fs';
import { error } from 'node:console';
import type { Configuration } from '#types';

const configFilename = '.tkrc.json';

const configFileMock = {
  i18nLocation: './testFolder',
  translationsLocation: './testTranslations',
  outputDirectory: './testOutput',
  filename: 'testfile.ts',
  verbose: true,
  quiet: false,
};

// For the purposes of these tests, the default state is that
// the config file does not exist.
// That way we start from a "blank slate" every time.
vi.mock('node:fs', async () => {
  const fs = await vi.importActual('node:fs');

  return {
    ...fs,
    existsSync: vi.fn(() => {
      return false;
    }),
  };
});

const originalArgv = process.argv;

// Restore argv after each test to make CLI tests consistent
afterEach(() => {
  process.argv = originalArgv;
});

describe('The configuration helper', () => {
  it('should read and accept parameters passed to the cli', async () => {
    const testParameters = ['--i18n=./', '-t', './', '-o', './', '-v'];

    setCliParameters(testParameters);

    expect(() => getConfiguration()).not.toThrow();

    const config = getConfiguration();
    expect(config).toMatchObject({
      i18nLocation: './',
      translationsLocation: './',
      outputDirectory: './',
      filename: configFileDefaults.filename,
      verbose: true,
      quiet: configFileDefaults.quiet,
    });
  });

  it('should read and return a config from the .tkrc.json config file', () => {
    const fileExistsSpy = vi
      .spyOn(fsMocked, 'existsSync')
      .mockImplementationOnce(() => {
        return true;
      });

    const readFileSpy = vi
      .spyOn(fsMocked, 'readFileSync')
      .mockImplementationOnce(() => {
        return JSON.stringify(configFileMock);
      });
    const configuration = getConfiguration();

    expect(fileExistsSpy).toHaveBeenCalledWith(configFilename);
    expect(readFileSpy).toHaveBeenCalledWith(configFilename, 'utf-8');
    expect(configuration).toMatchObject(configFileMock);
  });

  it('should not throw an error if a config file does not exist', () => {
    const fileExistsSpy = vi
      .spyOn(fsMocked, 'existsSync')
      .mockImplementationOnce(() => {
        return false;
      });

    expect(() => getConfiguration()).not.toThrowError();

    expect(fileExistsSpy).toHaveBeenCalledWith(configFilename);
    expect(fileExistsSpy).toHaveReturnedWith(false);
  });

  it('should throw an error if we cannot read from the config file', () => {
    const testErrorMessage = 'Could not read from .tkrc.json';

    const fileExistsSpy = vi
      .spyOn(fsMocked, 'existsSync')
      .mockImplementationOnce(() => {
        return true;
      });

    const readFileSpy = vi
      .spyOn(fsMocked, 'readFileSync')
      .mockImplementationOnce(() => {
        throw error(testErrorMessage);
      });

    expect(() => getConfiguration()).toThrowError(testErrorMessage);
    expect(fileExistsSpy).toHaveBeenCalled();
    expect(readFileSpy).toHaveBeenCalledWith(configFilename, 'utf-8');
  });

  it('should display a warning if the output parameter ends with a filename', () => {
    const warningText = 'Filename detected in outputDirectory parameter:';
    const outputParameter = '/jeg/er/en/fjompe.nisse';

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, outputDirectory: outputParameter })
    );

    const consoleWarningSpy = vi.spyOn(console, 'warn');

    getConfiguration();

    expect(consoleWarningSpy).toHaveBeenCalledOnce();
    expect(consoleWarningSpy).toHaveBeenCalledWith(
      expect.stringContaining(warningText)
    );

    consoleWarningSpy.mockRestore();
  });

  it('should trim any filename and ending from the output parameter', () => {
    const outputParameter = './kazaa/linkin_park-numb.exe';
    const truncatedOutputParameter = './kazaa/';

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, outputDirectory: outputParameter })
    );

    const config = getConfiguration();

    expect(config.outputDirectory).toBe(truncatedOutputParameter);
  });

  it('should leave in any trailing backslash provided', () => {
    const outputParameter = './we/are/the/knights/who/say/vim/';
    const truncatedOutputParameter = './we/are/the/knights/who/say/vim/';

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, outputDirectory: outputParameter })
    );

    const config = getConfiguration();

    expect(config.outputDirectory).toBe(truncatedOutputParameter);
  });

  it('should not truncate any directory if no trailing backslash is provided', () => {
    const outputParameter = './through/the/fire/and/the/flames';
    const truncatedOutputParameter = './through/the/fire/and/the/flames';

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, outputDirectory: outputParameter })
    );

    const config = getConfiguration();

    expect(config.outputDirectory).toBe(truncatedOutputParameter);
  });

  it('should replace the output parameter with the default if the trim leaves it empty', () => {
    const outputParameter = 'naruto_episode_01.divx';

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, outputDirectory: outputParameter })
    );

    const config = getConfiguration();

    expect(config.outputDirectory).toBe(configFileDefaults.outputDirectory);
  });

  it('should replace the output parameter with the default if it is a filename', () => {
    const outputParameter = 'System_of_a_Down-Zelda.mp3';

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, outputDirectory: outputParameter })
    );

    const config = getConfiguration();

    expect(config.outputDirectory).toBe(configFileDefaults.outputDirectory);
  });

  it('should prioritize cli arguments over the config file', async () => {
    const fileExistsSpy = vi
      .spyOn(fsMocked, 'existsSync')
      .mockImplementationOnce(() => {
        return true;
      });
    const readFileSpy = vi
      .spyOn(fsMocked, 'readFileSync')
      .mockImplementationOnce(() => {
        return JSON.stringify(configFileMock);
      });

    const testParameters = [
      '-t',
      './cli/parameters/are/a/pain',
      '-o',
      './cli/argument/test',
      '-v',
    ];

    process.argv = process.argv.concat(testParameters);

    const config = getConfiguration();

    expect(fileExistsSpy).toHaveBeenCalledWith(configFilename);
    expect(fileExistsSpy).toHaveReturnedWith(true);
    expect(readFileSpy).toHaveBeenCalledWith(configFilename, 'utf-8');

    expect(config.translationsLocation).toBe('./cli/parameters/are/a/pain');
    expect(config.translationsLocation).not.toBe(
      configFileMock.translationsLocation
    );

    expect(config.outputDirectory).toBe('./cli/argument/test');
    expect(config.outputDirectory).not.toBe(configFileMock.outputDirectory);
  });

  it('should return a default config if neither parameters nor config file are supplied', () => {
    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return false;
    });

    const config = getConfiguration();

    expect(config).toMatchObject(configFileDefaults);
  });

  it('should export an object of the config defaults so that they are easy to verify against', () => {
    expect(configurationHelper).toHaveProperty('configFileDefaults');

    const configDefaults = configurationHelper.configFileDefaults;

    expect(
      configDefaults,
      'Config defaults should not be undefined'
    ).not.toBeUndefined();

    expectTypeOf(configDefaults).toMatchObjectType<Configuration>();

    expect(configDefaults).toHaveProperty('i18nLocation');
    expect(configDefaults).toHaveProperty('translationsLocation');
    expect(configDefaults).toHaveProperty('outputDirectory');
    expect(configDefaults).toHaveProperty('filename');
    expect(configDefaults).toHaveProperty('verbose');
    expect(configDefaults).toHaveProperty('quiet');
  });
});

describe('The cli parameters', () => {
  it('should support setting the i18n folder location', () => {
    const testConfigvalue = './i/am/a/happy/little/folder';
    const testParameters = [`--i18n=${testConfigvalue}`];

    setCliParameters(testParameters);

    const config = getConfiguration();

    expect(config.i18nLocation).toBe(testConfigvalue);
  });

  it('should support setting the translations folder location', () => {
    const testConfigvalue = './this/is/my/translation/folder';
    const testParameters = ['-t', testConfigvalue];

    setCliParameters(testParameters);

    const config = getConfiguration();

    expect(config.translationsLocation).toBe(testConfigvalue);
  });

  it('should support setting the output folder location', () => {
    const testConfigvalue = './this/is/my/output/folder';
    const testParameters = ['-o', testConfigvalue];

    setCliParameters(testParameters);

    const config = getConfiguration();

    expect(config.outputDirectory).toBe(testConfigvalue);
  });

  it('should support setting a filename override', () => {
    const testConfigvalue = 'superbadass_filename.ts';
    const testParameters = ['-f', testConfigvalue];

    setCliParameters(testParameters);

    const config = getConfiguration();

    expect(config.filename).toBe(testConfigvalue);
  });

  it('should support setting the verbose parameter', () => {
    const testParameters = ['-v'];

    setCliParameters(testParameters);

    const config = getConfiguration();

    expect(config.verbose).toBe(true);
  });

  it('should support setting the quiet parameter', () => {
    const testParameters = ['-q'];

    setCliParameters(testParameters);

    const config = getConfiguration();

    expect(config.quiet).toBe(true);
  });
});

describe('The .tkrc.json config file', () => {
  it('should support setting the i18n folder location', () => {
    const testConfigvalue = './i/am/a/happy/little/folder';
    const testConfigfile = { i18nLocation: testConfigvalue };

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });
    vi.spyOn(fsMocked, 'readFileSync').mockImplementationOnce(() => {
      return JSON.stringify(testConfigfile);
    });

    const config = getConfiguration();

    expect(config.i18nLocation).toBe(testConfigvalue);
  });

  it('should support setting the translations folder location', () => {
    const testConfigvalue = './this/is/my/translation/folder';
    const testConfigfile = { translationsLocation: testConfigvalue };

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });
    vi.spyOn(fsMocked, 'readFileSync').mockImplementationOnce(() => {
      return JSON.stringify(testConfigfile);
    });

    const config = getConfiguration();

    expect(config.translationsLocation).toBe(testConfigvalue);
  });

  it('should support setting the output folder location', () => {
    const testConfigvalue = './this/is/my/output/folder';
    const testConfigfile = { outputDirectory: testConfigvalue };

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });
    vi.spyOn(fsMocked, 'readFileSync').mockImplementationOnce(() => {
      return JSON.stringify(testConfigfile);
    });

    const config = getConfiguration();

    expect(config.outputDirectory).toBe(testConfigvalue);
  });

  it('should support setting a filename override', () => {
    const testConfigvalue = 'superbadass_filename.ts';
    const testConfigfile = { filename: testConfigvalue };

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });
    vi.spyOn(fsMocked, 'readFileSync').mockImplementationOnce(() => {
      return JSON.stringify(testConfigfile);
    });

    const config = getConfiguration();

    expect(config.filename).toBe(testConfigvalue);
  });

  it('should support setting the verbose parameter', () => {
    const testConfigvalue = '-v';
    const testConfigfile = { verbose: testConfigvalue };

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });
    vi.spyOn(fsMocked, 'readFileSync').mockImplementationOnce(() => {
      return JSON.stringify(testConfigfile);
      0;
    });

    const config = getConfiguration();

    expect(config.verbose).toBe(testConfigvalue);
  });

  it('should support setting the quiet parameter', () => {
    const testConfigvalue = '-q';
    const testConfigfile = { quiet: testConfigvalue };

    vi.spyOn(fsMocked, 'existsSync').mockImplementationOnce(() => {
      return true;
    });
    vi.spyOn(fsMocked, 'readFileSync').mockImplementationOnce(() => {
      return JSON.stringify(testConfigfile);
    });

    const config = getConfiguration();

    expect(config.quiet).toBe(testConfigvalue);
  });
});

function setCliParameters(parameters: string[]) {
  process.argv = process.argv.concat(parameters);
}
