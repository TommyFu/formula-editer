(function(mod) {
  if (typeof exports == "object" && typeof module == "object") { // CommonJS
    mod()
  } else if (typeof define == "function" && define.amd) { // AMD
    define([], mod);
  }
})(function() {
  'use strict';
  function util(){
    return {
      _aLogicFn : [ 'and', 'or' ],
      _aFunction : [ 'if', 'round', 'power', 'abs', 'sqrt'],
      _calcFn : {
        'round': (op) => {
          return op.round();
        },
        'power': (op1, op2) => {
          return op1.round(op2);
        },
        'abs': (op) => {
          return op.abs();
        },
        'sqrt': (op) => {
          return op.sqrt();
        }
      },
      
      REGEX : {
        member : /^([^,:;'=\[\]]+)$/,
        memberWithBracket : /^\[[^,:;'=\[\]]+\]/,
        memberWithBracketAndMinus : /^\-?\[[^,:;'=\[\]]+\]$/
      },

      errMsg: {
        FORMULA_VARIABLE_FORMAT_ERR: 'Invalid variable format',
        //"a * + b", "*2", log(2,3), 1 * a, if(,,)
        FORMULA_FORMAT_ERR: 'Invalid formula format.',
        //member should be surrounded with "[]", else it's a constant number, so "a1000" is wrong, it should be "1000" or "[a1000]" 
        FORMULA_CONSTANT_ERR: 'Invalid constant number, constant number can only be digit.',
        //"[a100" or "a100]"
        FORMULA_MEMBER_ERR: 'Invalid member format, member should be surrounded with [].',
        //"[[a100]" or "a100]]"
        FORMULA_VARIABLE_ERR: 'Invalid variable format, variable should be surrounded with [\'\'].',
        //"(a + b", "(a + b))" 
        FORMULA_UNMATCH_BRAC: 'Unmatched () in formula.',
        //Invalidate character
        FORMULA_INVALIDATE_CHAR: 'Invalidate character {0} in formula.',
        //"[a] / 0", "1000 / 0.0"
        FORMULA_DIVIDE_ZERO: 'Cannot divide by zero.',
        //"", "()" 
        FORMULA_NOT_NULL: 'Formula cannot be empty.',
        //
        FORMULA_IF_FORMAT_ERR: 'Invalid if-else format.',
        // 
        FORMULA_FUNCTION_FORMAT_ERR: 'Invalid function format.',
        // 
        FORMULA_FUNCTION_NOT_EXIST: 'Function {0} does not exist.',
        //"if([error]+100, 0 ,0)"
        FORMULA_CONDITION_BOOL: 'Evaluation of if condition only can be boolean calculation.',
        //"if([a]>0, [error]>0, 0)"
        FORMULA_EXPRESSION_NOT_BOOL: 'Expression evaluation can NOT be logical operations.',
        //"([error]>0) + 2"
        FORMULA_ARITHMETIC_BOOL: 'Logical operations is not allowed in mathematical operations(+,-,*,/).',
        //"[a] or [a] > 1"
        FORMULA_BOOLEAN_VALUE: 'Value is not allowed in boolen calculation(and, or).',
        //final result cannot be a boolean calculation
        FORMULA_RESULT_BOOL: 'Formula computed result can NOT be boolean calculation.',
        //all clear :)
        FORMULA_VALID: 'Va;lid Formula.',
        //
        FORMULA_MEMBER_NOT_EXIST: 'Member {0} does not exist.',
        //"log(4) log(4)"
        FORMULA_OP_MISS: 'Missing operator.'
      },

      /**
       * [aaa] --> aaa
       * 
       * @param {String} sMember
       */
      removeMemberBrackets : function(sMember) {
        if (sMember.indexOf('[') !== -1 && sMember.indexOf(']') !== -1) {
          sMember = sMember.trim();
          if (sMember[0] === "[") {
            sMember = sMember.substring(1);
          }
          if (sMember[sMember.length - 1] === "]") {
            sMember = sMember.substring(0, sMember.length - 1);
          }
        }
        return sMember;
      }
    }
  }

  if (typeof exports == "object" && typeof module == "object") { 
    module.exports = {
      util: util
    }
  }

  return util();

});