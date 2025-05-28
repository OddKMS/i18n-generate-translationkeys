#!/usr/bin/env node
import 'suppress-experimental-warnings';
import { exec } from 'child_process';

exec('./src/generate-translationkeys.sh', (err, stdout, stdrr) => {
  console.log(stdout);
});
