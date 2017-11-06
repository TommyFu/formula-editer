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
      _aMembers : [
        { name: 'pi', value: '3.14159' },
        { name: 'e', value: '2.71828' },
        { name: 'year', value: '2017' },
        { name: 'currency1', value: '4.0' },
        { name: 'currency2', value: '0.8' },
      ],
      _calcFn : {
        'round': {
          op : 'round',
          priority : 0,
          opNum : 1,
          type : 'function',
          calc: (op) => {
            return op.round();
          }
        },
        'power': {
          op : 'power',
          priority : 0,
          opNum : 2,
          type : 'function',
          calc: (op1, op2) => {
            return op1.pow(op2);
          }
        },
        'abs': {
          op : 'abs',
          priority : 0,
          opNum : 1,
          type : 'function',
          calc: (op) => {
            return op.abs();
          }
        },
        'sqrt': {
          op : 'sqrt',
          priority : 0,
          opNum : 1,
          type : 'function',
          calc: (op) => {
            return op.sqrt();
          }
        }
      },
      
      REGEX : {
        member : /^([^,:;'=\[\]]+)$/,
        memberWithBracket : /^\[[^,:;'=\[\]]+\]/,
        endWithIf : /.*if$/i
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
        FORMULA_VALID: 'Valid Formula.',
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
      },

      formatRules : {
        TAB : "        ",
        SPACE : "",
        ENTER : "\n"
      },

      formatFormula : function(sSource) {
        let i = 0, j = 0;
        let TAB = this.formatRules.TAB;
        let SPACE = this.formatRules.SPACE;
        let ENTER = this.formatRules.ENTER;

        let sResult = "";
        let iCountIf = 0;
        let aOperatorStack = [];
        let aFunctionSrack = [];
        let sTemp = "", lastChar = "", passedCharForDbg = "";

        //remove blanks except those in the member []  
        // sSource = this.removeBlanks(sSource);

        for (i = 0; i < sSource.length; i++) {
          let ch = sSource[i];
          if (typeof ch !== "string") {
            continue;
          }
          if (ch.match(/^\s$/)) { // white space
            //blank space
            if (ch.match(/^ $/) && sTemp !== "" && sTemp.indexOf("[") !== -1 && sTemp.indexOf("]") === -1) { //[aa bb]
              sTemp += ch;
            }
            continue;
          }

          if (ch === "[") {
            sTemp += ch;
          } else if (ch === "]") {
            sTemp += ch;
            sResult += sTemp;
            sTemp = "";
          } else if (sTemp !== "" && sTemp.indexOf("[") !== -1 && sTemp.indexOf("]") === -1) { //member with special chars eg.[-member/%#()]
            sTemp += ch;
          } else if (ch === "(") {
            aOperatorStack.push("(");
            if (this.REGEX.endWithIf.test(sResult)) {
              iCountIf++;
              aFunctionSrack.push('if');
            }else{
              aFunctionSrack.push('other');
            }
            sResult += ch;
          } else if (ch === ")") {
            //---------------------tab control start---------------------
            if (aOperatorStack[aOperatorStack.length - 1] === "(") {
              aOperatorStack.pop();
            } else if (iCountIf > 0 && aOperatorStack.length >= 3 &&
              aOperatorStack[aOperatorStack.length - 1] === "," &&
              aOperatorStack[aOperatorStack.length - 2] === "," &&
              aOperatorStack[aOperatorStack.length - 3] === "(") {
              for (j = 0; j < 3; j++) {
                aOperatorStack.pop();
              }
              iCountIf--;
              sResult += ENTER;
              for (j = 0; j < iCountIf; j++) {
                sResult += TAB;
              }
            } else { //function(,)
              aOperatorStack.pop();
              aOperatorStack.pop();
            }
            aFunctionSrack.pop();
            //--------------------- tab control end ---------------------
            sResult += ch;
          } else if (ch === ",") {
            aOperatorStack.push(",");
            sResult += ch;
            
            //---------------------tab control start--------------------
            if (iCountIf > 0 && aFunctionSrack.length > 0
              && aFunctionSrack[aFunctionSrack.length - 1] === 'if') {
              sResult += ENTER;
              for (j = 0; j < iCountIf; j++) {
                sResult += TAB;
              }
            }
            //--------------------- tab control end ---------------------
          } else {
            sResult += ch;
            continue;
          }

          //save last char for negative number
          lastChar = sSource[i];
          //debug is easier with this variable
          passedCharForDbg += lastChar;
        }

        if (sTemp !== "") {
          sResult += sTemp + SPACE;
          sTemp = "";
        }
        return sResult;
      }

    }
  }

  if (typeof exports == "object" && typeof module == "object") { 
    debugger;
    module.exports = util();
  }

  return util();

});