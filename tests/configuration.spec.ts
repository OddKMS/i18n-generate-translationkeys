import { describe, expect, it, vi } from 'vitest';
import { getConfiguration } from '#helpers';
import * as fsMocked from 'node:fs';
import { $ } from 'zx';
import { error } from 'node:console';

const tkrcFilename = '.tkrc.json';

const configFileMock = {
  i18nLocation: './testFolder',
  translationsLocation: './testTranslations',
  output: './testOutput',
  filenameOverride: 'testfile.ts',
  verbose: true,
  quiet: false,
};

vi.mock('node:fs', async () => {
  const fs = await vi.importActual('node:fs');

  return {
    ...fs,
    readFileSync: vi.fn(() => {
      return JSON.stringify(configFileMock);
    }),
  };
});

describe('The configuration helper', () => {
  it('should read and accept parameters passed from the cli', async () => {
    const testParameter = '-v';
    const cliOutput = await testCli(testParameter);

    expect(cliOutput.exitCode).toBe(0);
  });

  it('should read and return a config from the .tkrc.json config file', () => {
    const fsExistsSyncSpy = vi.spyOn(fsMocked, 'existsSync');
    const configuration = getConfiguration();

    expect(fsExistsSyncSpy).toHaveBeenCalledWith(tkrcFilename);
    expect(configuration).toMatchObject(configFileMock);
  });

  it('should not throw an error if a config file does not exist', () => {
    const fileExistsSpy = vi
      .spyOn(fsMocked, 'existsSync')
      .mockImplementationOnce((path) => {
        if (path == tkrcFilename) {
          return false;
        }

        // This needs to be here in order to satisfy the type
        return true;
      });

    getConfiguration();

    expect(fileExistsSpy).toHaveBeenCalledWith(tkrcFilename);
    expect(fileExistsSpy).toHaveReturnedWith(false);

    expect(() => getConfiguration()).not.toThrowError();
  });

  it('should throw an error if we cannot read from the config file', () => {
    const testErrorMessage = 'Could not read from .tkrc.json';

    const readFileSpy = vi
      .spyOn(fsMocked, 'readFileSync')
      .mockImplementationOnce(() => {
        throw error(testErrorMessage);
      });

    expect(() => getConfiguration()).toThrowError(testErrorMessage);
    expect(readFileSpy).toHaveBeenCalledWith(tkrcFilename, 'utf-8');
  });

  it('should display a warning if the output parameter ends with a filename and ending', async () => {
    const warningText = 'Filename detected in output parameter.';
    const outputParameter = '/jeg/er/en/fjompe.nisse';

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, output: outputParameter })
    );

    const consoleSpy = vi.spyOn(console, 'warn');

    getConfiguration();

    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(warningText)
    );
  });

  it('should trim the filename and ending from the output parameter if they exist', () => {
    const outputParameter = '/we/are/the/knights/who/say.vim';
    const truncatedOutputParameter = '/we/are/the/knights/who';

    vi.spyOn(fsMocked, 'readFileSync').mockReturnValueOnce(
      JSON.stringify({ ...configFileMock, output: outputParameter })
    );

    const config = getConfiguration();

    expect(config.output).toBe(truncatedOutputParameter);
  });

  it('should replace the output parameter with the default if the trim leaves it empty', () => {});

  it('should prioritize cli arguments over the config file', () => {});

  it('should return a default config if neither parameters nor config file are supplied', () => {});

  vi.clearAllMocks();
});

describe('The cli parameters', () => {
  it('should support setting the i18n folder location', async () => {});
  it('should support setting the translations folder location', async () => {});
  it('should support setting the output folder location', async () => {});
  it('should support setting a filename override', async () => {});
  it('should support setting the verbose parameter', async () => {});
  it('should support setting the quiet parameter', async () => {});
  it('should throw an error if supplied with an unknown parameter', async () => {
    const nonexistingParameter = '-p';
    const cliOutput = await testCli(nonexistingParameter);
    expect(cliOutput.stderr).toContain(`Unknown argument`);
  });
});

describe('The .tkrc.json config file', () => {
  it('should support setting the i18n folder location', () => {});
  it('should support setting the translations folder location', () => {});
  it('should support setting the output folder location', () => {});
  it('should support setting a filename override', () => {});
  it('should support setting the quiet parameter', () => {});
  it('should support setting the verbose parameter', () => {});
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
