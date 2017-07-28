'use strict';

import test from 'ava';
const calculator = require('../src/formula/formulaCalculator');

test('assert invalid formula', t => {
  // let aInvalidFormula = [
  //   "[a] + [b])",
  //   "[a] + [b])",
  //   "[a] ++ [b]",
  //   "[a] + * [b]",
  //   "()",
  //   "[100+]200",
  //   "test",
  //   "a]",
  //   "*2",
  //   "[a] *",
  //   "[a] + 2 *",
  //   "[a] * 2 +",
  //   "[a] / 0",
  //   "3^2",
  //   "[a](()",
  //   "if(if([a]>2, 0<2, 3>3), 2, 3)",
  //   "if(, ,)",
  //   "if([a]+4, [a]+4, 1)",
  //   "[a]!",
  //   "logg([a])",
  //   "123aaa",
  //   "[a]!+[b]",
  //   "if([a]+1or[b], 2, 3)"
  // ];

  // let prefix;
  // for (let i = 0; i < aInvalidFormula.length; i++) {
  //   prefix = "Case " + i + ". " + aInvalidFormula[i] + " -> ";
  //   t.is(prefix + calculator.calculate(aInvalidFormula[i]).isValid, prefix + false);
  // }

  // t.pass();
});

test('assert valid formula', t => {
  let aValidFormula = [
    {
      formula : '2 * (-1)',
      value : '-2'
    }
  ];

  let prefix;
  for (let i = 0; i < aValidFormula.length; i++) {
    prefix = "Case " + i + ". " + aValidFormula[i].formula + " -> ";
    t.is(prefix + calculator.calculate(aValidFormula[i].formula),
      prefix + aValidFormula[i].value);
  }

  t.pass();
});




