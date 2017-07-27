'use strict';

import test from 'ava';
const formulaUtil = require('../formula/formulaUtil');


test('formula', t => {
  console.log(JSON.stringify(formulaUtil));
  t.true(formulaUtil !== null);

  t.pass();
});






