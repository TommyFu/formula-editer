'use strict';

import test from 'ava';
const calculator = require('../src/formula/formulaCalculator');
const bignumber = require('../src/lib/bignumber/bignumber.min');

test('assert invalid formula', t => {
  let aInvalidFormula = [
    "[a] + [b])",
    "[notExisting] + 1",
    "[a] ++ [b]",
    "[a] + * [b]",
    "()",
    "[a]200",
    "test",
    "a]",
    "*2",
    "[a] *",
    "[a] + 2 *",
    "[a] * 2 +",
    "[a] / 0",
    "3^2",
    "[a](()",
    "if(if([a]>2, 0<2, 3>3), 2, 3)",
    "if(, ,)",
    "if([a]+4, [a]+4, 1)",
    "[a]!",
    "logg([a])",
    "1aa23",
    "[a]!+[b]",
    "if([a]+1or[b], 2, 3)"
  ];

  let members = [
    { name: 'a', value: '300' },
    { name: 'b', value: '4.56' },
  ];

  let prefix;
  for (let i = 0; i < aInvalidFormula.length; i++) {
    prefix = "Case " + i + ". " + aInvalidFormula[i] + " -> ";
    let res = calculator.calculate(aInvalidFormula[i], members);
    t.is(prefix + res.valid, prefix + false);
  }

  t.pass();
});

test('assert valid formula', t => {
  let aValidFormula = [
    {
      formula : '10000',
      value : '10000'
    },
    {
      formula : '[a]',
      value : '300'
    },
    {
      formula : '100 + 2 * 200',
      value : '500'
    },
    {
      formula : '2 * (-1)',
      value : '-2'
    },
    {
      formula : '[a]*[b]+[c]',
      value : '2598'
    },
    {
      formula : '[c] / ([a] - [b] * [d])',
      value : '1.01485148514851485149'
    },
    {
      formula : '[1000] * [3-1] + 1000',
      value : '-3064.63'
    },
    {
      formula : 'if([a]>1,if([b]!=2,3,4),5)',
      value : '3'
    },
    {
      formula : 'sqrt(2)',
      value : '1.4142135623730950488'
    },
    {
      formula : 'aBs([d])',
      value : '200'
    },
    {
      formula : 'abs([d]+ power(2,4))',
      value : '184'
    },
    {
      formula : 'round(sqrt(power(2,1)))',
      value : '1'
    },
    {
      formula : 'if([a] >= 100 AND [b] < 100, 10, 20)',
      value : '10'
    },
    {
      formula : '[3-1] - ( - [d])',
      value : '-245.67'
    },
    {
      formula : '[aa bb]',
      value : '100'
    },
    {
      formula : '1-(2+[b])',
      value : '-5.56'
    },
  ];

  let members = [
    { name: 'a', value: '300' },
    { name: 'b', value: '4.56' },
    { name: 'c', value: '1.23e3' },
    { name: 'd', value: '-200' },
    { name: '3-1', value: '-45.67' },
    { name: '1000', value: '89' },
    { name: 'aa bb', value: '100' },
  ];

  let prefix;
  for (let i = 0; i < aValidFormula.length; i++) {
    prefix = "Case " + i + ". " + aValidFormula[i].formula + " -> ";
    let res = calculator.calculate(aValidFormula[i].formula, members);
    t.is(res.value, aValidFormula[i].value);
  }

  t.pass();
});





