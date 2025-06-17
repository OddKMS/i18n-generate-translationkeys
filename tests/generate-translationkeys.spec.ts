import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { configuration } from '#types';
import * as configurationSpy from '#helpers';
import * as generatorSpy from '#generate-keys';
import generate from '#generate-keys';

describe('the generate-translationkeys script', () => {
  it('should get a configuration detailing runtime operation', () => {
    const spy = vi.spyOn(configurationSpy, 'getConfiguration');

    generateKeys();

    expect(spy).toHaveBeenCalledOnce();

    const spyConfigResult = spy.mock.results[0];

    // Supress error ts(2344) since we're checking against an unknown type
    // @ts-ignore
    expectTypeOf(spyConfigResult.value).toMatchObjectType<configuration>();
  });

  it.todo('should accept a configuration object as parameter', () => {});

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

function generateKeys(params?: any) {
  generate();
}
