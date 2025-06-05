#!/usr/bin/env node
// We set up and execute our script like this in order to
// avoid the annoying experimental-warning spam from Node
import 'suppress-experimental-warnings';
const { default: generate } = await import('#generate-keys');

generate();
