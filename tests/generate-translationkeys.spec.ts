import { describe, expect, it, vi } from 'vitest';
import * as generatorSpy from '#generate-keys';
import generate from '#generate-keys';

describe('the generate-translationkeys script', () => {
  it.todo(
    'should have default values for those set by the config file',
    () => {},
  );
  it.todo('should read configuration values from file', () => {});

  it('should read i18n translations files', () => {
    const spy = vi.spyOn(generatorSpy, 'default');

    generate_keys();

    expect(spy).toHaveBeenCalledOnce();
  });

  it.todo('should output a file containing json paths as keys', () => {});
});

function generate_keys(params?: any) {
  generate();
}
