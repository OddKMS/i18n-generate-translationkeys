import { describe, expect, it, vi } from 'vitest';
import { getConfiguration } from '#helpers';

describe('The configuration helper', () => {
  it('should read and accept parameters from the npx cli', () => {});

  it('should read and return a config from the .tkrc.json config file', () => {});

  it('should not throw an error if the config file does not exist', () => {});

  it('should display a warning if the output parameter ends with a filename and ending', () => {});

  it('should trim the filename and ending from the output parameter if they exist', () => {});

  it('should replace the output parameter with the default if the trim leaves it empty', () => {});

  it('should prioritize cli arguments over the config file', () => {});

  it('should return a default config if neither parameters nor config file are supplied', () => {});
});

describe('The npx cli parameters', () => {
  it('should support setting the i18n folder location', () => {});
  it('should support setting the translations folder location', () => {});
  it('should support setting the output folder location', () => {});
  it('should support setting a filename override', () => {});
  it('should support setting the quiet parameter', () => {});
  it('should support setting the verbose parameter', () => {});
});

describe('The .tkrc.json config file', () => {
  it('should support setting the i18n folder location', () => {});
  it('should support setting the translations folder location', () => {});
  it('should support setting the output folder location', () => {});
  it('should support setting a filename override', () => {});
  it('should support setting the quiet parameter', () => {});
  it('should support setting the verbose parameter', () => {});
});
