import { afterEach, describe, expect, it, vi } from 'vitest';
import { getConfiguration } from '#helpers';
import * as fsMocked from 'node:fs';
import { $ } from 'zx';
import { error } from 'node:console';

const configFilename = '.tkrc.json';

const configFileMock = {
  i18nLocation: './testFolder',
  translationsLocation: './testTranslations',
  outputDirectory: './testOutput',
  filename: 'testfile.ts',
  verbose: true,
  quiet: false,
};

const configFileDefaults = {
  i18nLocation: './src/i18n',
  translationsLocation: './src/i18n/translations',
  outputDirectory: './src/i18n',
  filename: 'translationKeys.ts',
  verbose: false,
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

    process.argv = process.argv.concat(testParameters);

    const config = getConfiguration();

    expect(() => getConfiguration()).not.toThrow();
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
});

describe('The cli parameters', () => {
  it.todo('should support setting the i18n folder location', async () => {});
  it.todo(
    'should support setting the translations folder location',
    async () => {}
  );
  it.todo('should support setting the output folder location', async () => {});
  it.todo('should support setting a filename override', async () => {});
  it.todo('should support setting the verbose parameter', async () => {});
  it.todo('should support setting the quiet parameter', async () => {});
  it('should throw an error if supplied with an unknown parameter', async () => {
    const nonexistingParameter = '-p';
    const cliOutput = await testCli(nonexistingParameter);
    expect(cliOutput.stderr).toContain(`Unknown argument`);
  });
});

describe('The .tkrc.json config file', () => {
  it.todo('should support setting the i18n folder location', () => {});
  it.todo('should support setting the translations folder location', () => {});
  it.todo('should support setting the output folder location', () => {});
  it.todo('should support setting a filename override', () => {});
  it.todo('should support setting the quiet parameter', () => {});
  it.todo('should support setting the verbose parameter', () => {});
});

async function testCli(parameters?: string | string[]) {
  const $$ = $({ nothrow: true, quiet: true });

  const unpackParams = () => {
    if (Array.isArray(parameters)) {
      return parameters.join(' ');
    } else {
      return parameters;
    }
  };

  const params = unpackParams();

  if (params) {
    return $$`node ./bin.ts ${params}`;
  } else {
    return $$`node ./bin.ts`;
  }
}
