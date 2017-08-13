(function(mod) {
  if (typeof exports == "object" && typeof module == "object") { // CommonJS
    mod(require('./formulaUtil'), require('../lib/bignumber/bignumber.min'))
  } else if (typeof define == "function" && define.amd) { // AMD
    define(['formula/formulaUtil'], mod);
  }
})(function(util, bigNumber) {
  'use strict';

  let aLogicFn = util._aLogicFn;
  let BigNum = null;
  if(typeof window !== 'undefined' && window.BigNumber){
    BigNum = window.BigNumber;
  }else{
    BigNum = bigNumber;
  }
  let operator = {
    '#' : {
      op : '#',
      priority : -1,
      opNum : -1,
      type : ""
    }, //end  
    '(' : {
      op : '(',
      priority : 0,
      opNum : -1,
      type : ""
    },
    ',' : {
      op : ',',
      priority : 1,
      opNum : -1,
      type : ""
    },
    ')' : {
      op : ')',
      priority : 2,
      opNum : -1,
      type : ""
    },
    'reversesign' : { // -([A]+1)
      op : 'reversesign',
      priority : 0,
      opNum : 1,
      type : "function"
    },
    'if' : {
      op : 'if',
      priority : 0,
      opNum : 3,
      type : "function"
    },
    'and' : {
      op : 'and',
      priority : 3,
      opNum : 2,
      type : "bool"
    },
    'or' : {
      op : 'or',
      priority : 3,
      opNum : 2,
      type : "bool"
    },
    '>' : {
      op : '>',
      priority : 4,
      opNum : 2,
      type : "bool"
    },
    '<' : {
      op : '<',
      priority : 4,
      opNum : 2,
      type : "bool"
    },
    '>=' : {
      op : '>=',
      priority : 4,
      opNum : 2,
      type : "bool"
    },
    '<=' : {
      op : '<=',
      priority : 4,
      opNum : 2,
      type : "bool"
    },
    '==' : {
      op : '==',
      priority : 4,
      opNum : 2,
      type : "bool"
    },
    '!=' : {
      op : '!=',
      priority : 4,
      opNum : 2,
      type : "bool"
    },
    '+' : {
      op : '+',
      priority : 5,
      opNum : 2,
      type : "arithmetic"
    },
    '-' : {
      op : '-',
      priority : 5,
      opNum : 2,
      type : "arithmetic"
    },
    '*' : {
      op : '*',
      priority : 6,
      opNum : 2,
      type : "arithmetic"
    },
    '/' : {
      op : '/',
      priority : 6,
      opNum : 2,
      type : "arithmetic"
    }
  };

  let functions = util._calcFn;
  for(let i in functions){
    operator[i] = functions[i];
  }

  function getOperator(ch) {
    let ops = operator;
    for (let i in ops) {
      if (ch.toLowerCase() === i) {
        return ops[i];
      }
    }
   return null;
  }

  /**
   * compress Stack by ")". three types 1. one operation, int() | log() 2. two operations, ([a] + [b]) 3. three
   * operations, if(condition, statement1, statement2)
   */
  function compressStack_bracket(aResultStack, aOperatorStack) {
    let operator = getOperator(")");
    let oTemp = null;
    compressStack_2ops(aResultStack, aOperatorStack, operator);
    if (aOperatorStack.length >= 3 && 
      aOperatorStack[aOperatorStack.length - 1].op === "," &&
      aOperatorStack[aOperatorStack.length - 2].op === "," &&
      aOperatorStack[aOperatorStack.length - 3].op === "if") {
      let expression2 = aResultStack.pop();
      let expression1 = aResultStack.pop();
      let condition = aResultStack.pop();
      oTemp = buildFormula_if(condition, expression1, expression2);
      if (!oTemp.valid) {
        return oTemp;
      }
      aResultStack.push(oTemp);

      for (let i = 0; i < 3; i++) {
        aOperatorStack.pop(); // "," "," "if" 
      }
    } else if (aOperatorStack.length > 0 
      && aOperatorStack[aOperatorStack.length - 1].op === "(") {
      aOperatorStack.pop(); //"("
    } else if (aOperatorStack.length >= 1) {
      let topStackOp = aOperatorStack[aOperatorStack.length - 1];
      let bhasTwoParameters = false;
      if (topStackOp.op === "," && 
        aResultStack.length >= 2 && aOperatorStack.length > 1) {
        aOperatorStack.splice(aOperatorStack.length - 1, 1);
        topStackOp = aOperatorStack[aOperatorStack.length - 1];
        bhasTwoParameters = true;
      }

      if (topStackOp.opNum >= 1) {
        if (bhasTwoParameters) {
          let secondParam = aResultStack.pop();
          let firstParam = aResultStack.pop();
          oTemp = buildFormula_fn(aOperatorStack.pop(), firstParam, secondParam);
        } else {
          oTemp = buildFormula_fn(aOperatorStack.pop(), aResultStack.pop());
        }

        if (!oTemp.valid) {
          return oTemp;
        }
        aResultStack.push(oTemp);
      }
    } else {
      return {
        valid : false,
        message : util.errMsg.FORMULA_UNMATCH_BRAC
      };
    }
    return {
      valid: true
    };
  };

  /**
   * Compressing two-operators calculating This function can also handle the compressing by ",". from "if" to ",",
   * or from "," to ","
   */
  function compressStack_2ops(aResultStack, aOperatorStack, operator) {
    let topStackOp = aOperatorStack[aOperatorStack.length - 1];
    if (aOperatorStack.length === 0) {
      if (operator.op !== ")") {
        aOperatorStack.push(operator);
      }
    } else {
      if (operator.priority > topStackOp.priority) {
        if (operator.op !== ")") {
         aOperatorStack.push(operator);
        }
      } else {
        while (operator.priority <= topStackOp.priority) {
          if (operator.op === "," && topStackOp.op === ",") { // if(, ,)  two "," priority is same, but needn't do compress
            break;
          }
          if (aResultStack.length === 1 || aResultStack.length === 0) {
            return {
              valid: false,
              message : util.errMsg.FORMULA_FORMAT_ERR
            };
          }
          if (aResultStack.length >= 2) {
            let topOp = aOperatorStack.pop();
            let ex2 = aResultStack.pop();
            let ex1 = aResultStack.pop(); 
            let oTemp = buildFormula_2ops(topOp, ex1, ex2);
            //validation failed
            if (!oTemp.valid) {
              return oTemp;
            }
            aResultStack.push(oTemp);
            topStackOp = aOperatorStack[aOperatorStack.length - 1];
          }
          if (aOperatorStack.length === 0) { //no operator in stack
            break;
          }
        }

        if (operator.op !== "#" && operator.op !== ")") {
          aOperatorStack.push(operator);
        }
      }
    }
    return {
      valid: true
    };
  }

  function isInMember(sSource, iPos) {
    for (var i = iPos + 1; i < sSource.length; i++) {
      if (sSource[i] === "[") {
        return false;
      } else if (sSource[i] === "]") {
        return true;
        }
      }
    return false;
  }

  /**
   * @return {object} If validation successfully, return true. If validation failed, return { message : "ERROR MESSAGE" }
   */
  function validateMemberFormat(aMembersList, aMembers) {
    for (let item in aMembersList) {
      let sMember = aMembersList[item];
      if (sMember.indexOf("[") !== -1 || sMember.indexOf("]") !== -1) { //If contains '[' or ']', validation the member //[10000]
        //validation failed
        if(sMember.trim()[0] === '-'){
          sMember = sMember.substring(1);
        }
        let m = util.removeMemberBrackets(sMember);
        if (!sMember.match(util.REGEX.memberWithBracket)) {
          return {
            valid: false,
            message: util.errMsg.FORMULA_MEMBER_ERR
          };
        } else if (aMembers && !aMembers[m]) {
          return {
            isValud: false,
            message : util.errMsg.FORMULA_MEMBER_NOT_EXIST.replace('{0}', sMember)
          };
        }
      } else {//10000
        // validation failed
        if (!sMember.match(util.REGEX.member)) {
          return {
            isValud: false,
            message : util.errMsg.FORMULA_CONSTANT_ERR
          };
        }
        if (isNaN(parseFloat(sMember))) {
          return {
            valid: false,
            message : util.errMsg.FORMULA_CONSTANT_ERR
          };
        }
        try{
          new BigNum(sMember);
        }catch(ex){
          return {
            isValud: false,
            message : util.errMsg.FORMULA_CONSTANT_ERR
          };
        }
      }
    }
    return {
      valid: true
    };
  }

  /**
   * @return {object} { data : {}, type : "member | constant | function" }
   */
  function buildFormula_member(sMember, members) {
    let tmp, result = {};

    if (sMember.indexOf("[") !== -1 && sMember[sMember.length - 1] === "]") { //start with "[", end with "]" is member
      if (sMember[0] === "-") { //-1 * [a]
        let m = sMember.substring(1);
        tmp = util.removeMemberBrackets(m);
        result.type = "member";
        result.data = (new BigNum(-1)).times(new BigNum(members[tmp]));
      } else {
        result.type = "member";
        tmp = util.removeMemberBrackets(sMember);
        result.data = new BigNum(members[tmp]);
      }
    } else {
      result.type = "constant";
      result.data = new BigNum(sMember);
    }
    return result;
  }

  /**
   * @param {object} oFormula1 { data : {}, type : "member | constant | function | bool" }
   * @param {object} oFormula2 { data : {}, type : "member | constant | function | bool" }
   */
  function buildFormula_2ops(operator, oFormula1, oFormula2) {
    let oResult = {
      valid: true
    };

    //verify if divisor is zero
    if (operator.op === "/" && oFormula2.type === "constant" && oFormula2.data
      && oFormula2.data.isZero()) {
      return { //validation failed
        valid: false,
        message: util.errMsg.FORMULA_DIVIDE_ZERO
      };
    }

    //"+|-|*|/" cannot operate BOOL type calculation
    if (operator.op.match(/^(\+|\-|\*|\/)$/)) {
      if (oFormula1.type === "bool" || oFormula2.type === "bool") {
        return { //validation failed
          valid: false,
          message : util.errMsg.FORMULA_ARITHMETIC_BOOL
        };
      }
    }

    //value is not allowed in boolen calculation(and, or).
    if (aLogicFn.indexOf(operator.op.toLowerCase()) !== -1) {
      if (oFormula1.type !== "bool" || oFormula2.type !== "bool") {
        return { //validation failed
          valid: false,
          message : util.errMsg.FORMULA_BOOLEAN_VALUE
        };
      }
    }

    if (operator.type === "bool") {
      oResult.type = "bool";
      if(operator.op === 'and'){
        oResult.data = oFormula1.data && oFormula1.data;
      }else if(operator.op === 'or'){
        oResult.data = oFormula1.data || oFormula1.data;
      }else if(operator.op === '>'){
        oResult.data = oFormula1.data.gt(oFormula2.data);
      }else if(operator.op === '<'){
        oResult.data = oFormula1.data.lt(oFormula2.data);
      }else if(operator.op === '>='){
        oResult.data = oFormula1.data.gte(oFormula2.data);
      }else if(operator.op === '<='){
        oResult.data = oFormula1.data.lte(oFormula2.data);
      }else if(operator.op === '=='){
        oResult.data = oFormula1.data.eq(oFormula2.data);
      }else if(operator.op === '!='){
        oResult.data = !(oFormula1.data.eq(oFormula2.data));
      }
    } else {
      oResult.type = "function";
      if(operator.op === '+'){
        oResult.data = oFormula1.data.add(oFormula2.data);
      }else if(operator.op === '-'){
        oResult.data = oFormula1.data.sub(oFormula2.data);
      }else if(operator.op === '*'){
        oResult.data = oFormula1.data.mul(oFormula2.data);
      }else if(operator.op === '/'){
        oResult.data = oFormula1.data.div(oFormula2.data);
      }
    }
    
    return oResult;
  }

  /**
   * @return {object}
   */
  function buildFormula_if(condition, expression1, expression2) {
    if (!condition || !expression1 || !expression2) {
      return {
        valid: false,
        message : util.errMsg.FORMULA_IF_FORMAT_ERR
      };
    } else if (expression1.type === "bool" || expression2.type === "bool") {
      return {
        valid: false,
        message : util.errMsg.FORMULA_EXPRESSION_NOT_BOOL
      };
    } else if (condition.type !== "bool") {
      return {
        valid: false,
        message : util.errMsg.FORMULA_CONDITION_BOOL
      };
    }

    let result = {
      valid: true
    };
    result.type = "function";
    if(condition.data){
      result.data = expression1.data;
    }else{
      result.data = expression2.data;
    }
    return result;
  }

  /**
   * add a const number or a member into result stack
   */
  function addOneConstOrMem(str, aResultStack, members) {
    if (str !== "") {
      aResultStack.push(buildFormula_member.call(this, str, members));
    }
  }

  /**
   * @return {object}
   */
  function buildFormula_fn(oFunction, oFormula, oFormula2) {
    if (!oFunction || !oFormula) {
      return {
        valid: false,
        message : util.errMsg.FORMULA_FUNCTION_FORMAT_ERR
      };
    } else if (oFormula.type === "bool") {
      return {
        valid: false,
        message : util.errMsg.FORMULA_CONDITION_BOOL
      };
    }
    let result = {
      valid: true
    };
    result.type = "function";
    if(oFormula2){
      result.data = oFunction.calc(oFormula.data, oFormula2.data);
    }else{
      result.data = oFunction.calc(oFormula.data);
    }
    
    return result;
  }

  /**
   * Using Reverse Polish Notation to parse formula string to JSON and validate formula in single pass.
   * @param {string} sSource, formula string
   * @param {array} aMembers, hint list
   * @return {object}, {valid: {boolen}, value : {number}, message: {string}}
   */
  function calculate(sSource, aMembers) {
    if (sSource.trim() === "") {
      return {
        valid : true,
        value : 0
      };
    }
    
    let members = {};
    if (aMembers && aMembers.length > 0) {
       for(let i = 0; i < aMembers.length; i++){
         members[aMembers[i].name] = aMembers[i].value;
       }
    }

    let aOperatorStack = [];
    let aResultStack = [];
    
    let sTemp = "", lastChar = "", passedCharForDbg = "";
    let validateResult = null, res = null, operator = null;

    for (let i = 0; i < sSource.length; i++) {
      let ch = sSource[i];
      if (typeof ch !== "string") {
        continue;
      }

      if (ch.match(/^\s$/)) { // white space
        //blank space
        if (ch.match(/^ $/) && sTemp !== "" && sTemp.indexOf("[") !== -1
          && sTemp.indexOf("]") === -1) { //[aa bb]
          sTemp += ch;
        }
        continue;
      }

      if (sTemp !== "" && sTemp.indexOf("[") !== -1 
        && sTemp.indexOf("]") === -1) { //member with special chars eg.[-member/%#()]
        sTemp += ch;
      } else if (ch.match(/^[A-Za-z0-9& #%_\[\]\.]$/)) {
        sTemp += ch;
        let prefix = "";
        if (sTemp.match(/^[\d]+[A-Za-z]+$/)) { // [a] + 100 AND
          prefix = sTemp.match(/\d+/);
        } else if (sTemp.match(/.+][A-Za-z]+$/)) { // 100 + [A] AND
          prefix = sTemp.match(/.+]/);
        }
        if (prefix !== "") {
          let op = sTemp.substring(prefix[0].length);
          let sPrefix = prefix[0];
          if (aLogicFn.indexOf(op.toLowerCase()) !== -1) {
            //validate member format
            validateResult = validateMemberFormat([ sPrefix ], members);
            if (!validateResult.valid) {
              return {
                valid : false,
                message : validateResult.message
              };
            }
            //is a member
            addOneConstOrMem.call(this, sPrefix, aResultStack, members);
            sTemp = "";
            operator = getOperator(op);
            res = compressStack_2ops(aResultStack, aOperatorStack, operator);
            if (!res.valid) {//validation failed
              return {
                valid : false,
                message : res.message
              };
            }
          }
        }
      } else if (ch === "(") {
        if (sTemp === "") {
          aOperatorStack.push(getOperator("("));
        }else {
          operator = getOperator(sTemp);
          if (operator !== null && operator.op === '-') {  // -([A]+1)
            aOperatorStack.push(getOperator("reversesign"));
            sTemp = "";
          } else if (operator !== null && operator.type === "function") {
            aOperatorStack.push(getOperator(sTemp));
            sTemp = "";
          } else { //validation failed 
            return {
              valid : false,
              message : util.errMsg.FORMULA_FUNCTION_NOT_EXIST
            };
          }
        }
      } else if (ch === ")") {
        //if sTemp is not empty, verify and add it to the aResultStack
        if (sTemp !== "") {
          //validate member format
          validateResult = validateMemberFormat([ sTemp ], members);
          if (!validateResult.valid) {
            return {
              valid : false,
              message : validateResult.message
            };
          }
          // type is member
          addOneConstOrMem.call(this, sTemp, aResultStack, members);
          sTemp = "";
        }
        res = compressStack_bracket(aResultStack, aOperatorStack);
        if (!res.valid) {//validation failed
          return {
            valid : false,
            message : res.message
          };
         }
        if (aResultStack.length >= 2 && aOperatorStack.length === 0) { //log(4) log(4) +
          return {
            valid : false,
            message : util.errMsg.FORMULA_OP_MISS
          };
        }
      } else if (ch.match(/^(\+|\-|\*|\/)$/)) {
        if (sTemp !== "" && ch === "-" && isInMember(sSource, i)) {
          sTemp += ch;
        } else {
          let aJudgeNegative = [ "", "(", "-", "+", "*", "/", "," ];
          if (ch === "-" && aJudgeNegative.indexOf(lastChar) !== -1) {
            sTemp = "-" + sTemp;
            continue;
          }
          //if sTemp is not empty, verify and add it to the aResultStack
          if (sTemp !== "") {
            //validate member format
            validateResult = validateMemberFormat([sTemp], members);
            if (!validateResult.valid) {
              return {
                valid : false,
                message : validateResult.message
              };
            }
            //type is member
            addOneConstOrMem.call(this, sTemp, aResultStack, members);
            sTemp = "";
          }
          operator = getOperator(ch);
          res = compressStack_2ops(aResultStack, aOperatorStack, operator);
          if (!res.valid) {//validation failed
            return {
              valid : false,
              message : res.message
            };
          }
        }
      } else if (ch === "<" || ch === ">") {
        if (i + 1 !== sSource.length && sSource[i + 1] === "=") { //">=", "<="
          continue;
        } else {
          //if sTemp is not empty, verify and add it to the aResultStackcontext
          if (sTemp !== "") {
            //validate member format
            validateResult = validateMemberFormat([ sTemp ], members);
            if (!validateResult.valid) {
              return {
                valid : false,
                message : validateResult.message
              };
            }
            // type is member
            addOneConstOrMem.call(this, sTemp, aResultStack, members);
            sTemp = "";
          }
          operator = getOperator(ch);
          res = compressStack_2ops(aResultStack, aOperatorStack, operator);
          if (!res.valid) {// validation failed
            return {
              valid : false,
              message : res.message
            };
          }
        }
       } else if (ch === "!") {
        if (i + 1 === sSource.length) { //validation failed cannot end with !
          return {
            valid : false,
            message : util.errMsg.FORMULA_INVALIDATE_CHAR.replace('{0}', '!')
          };
        }
        if (sSource[i + 1] !== "=") { //[a]!+[b]
          return {
            valid : false,
            message : util.errMsg.FORMULA_INVALIDATE_CHAR.replace('{0}', '!')
          };
        }
      } else if (ch === "=") {
        let prevCh = sSource[i - 1];
        operator = "";
        if (prevCh && prevCh.match(/^(!|>|<)$/)) {
          operator = getOperator(prevCh + "=");
        } else {
          operator = getOperator('==');
        }

        //if sTemp is not empty, verify and add it to the aResultStack
        if (sTemp !== "") {
          //validate member format
          validateResult = validateMemberFormat([ sTemp ], members);
          if (!validateResult.valid) {
            return {
              valid : false,
              message : validateResult.message
            };
          }
          // ### type is member
          addOneConstOrMem.call(this, sTemp, aResultStack, members);
          sTemp = "";
        }
        res = compressStack_2ops(aResultStack, aOperatorStack, operator);
        if (!res.valid) {//validation failed
          return {
            valid : false,
            message : res.message
          };
        }
      } else if (ch === ",") {
        //if sTemp is not empty, verify and add it to the aResultStack
        if (sTemp !== "") {
          //validate member format
          validateResult = validateMemberFormat([sTemp], members);
          if (!validateResult.valid) {
            return {
              valid : false,
              message : validateResult.message
            };
          }
          //type is member
          addOneConstOrMem.call(this, sTemp, aResultStack, members);
          sTemp = "";
        } else {
          //if(1, if(2, 3, 4), 5)  in this case sTemp is empty
        }

        operator = getOperator(ch);
        res = compressStack_2ops(aResultStack, aOperatorStack, operator);
        if (!res.valid) {//validation failed
          return {
            valid : false,
            message : res.message
          };
        }
      } else {
        //validation failed
        return {
          valid : false,
          message : util.errMsg.FORMULA_INVALIDATE_CHAR
        };
      }

      //save last char for negative number
      lastChar = ch;
      //debug is easier with this variable
      passedCharForDbg += lastChar;
    }//end for

    //single formula without any operator
    if (sTemp !== "") {
      //validate member format
      validateResult = validateMemberFormat([ sTemp ], members);
      if (!validateResult.valid) {
        return {
          valid : false,
          message : validateResult.message
        };
      }
      //type is member
      addOneConstOrMem.call(this, sTemp, aResultStack, members);
      sTemp = "";
    }

    while (aOperatorStack.length !== 0) {
      if (aResultStack.length < 2) {
        //validation failed
        return {
          valid : false,
          message : util.errMsg.FORMULA_FORMAT_ERR
        };
      }

      res = compressStack_2ops(aResultStack, aOperatorStack, getOperator("#")); // "#" is end
      if (!res.valid) {//validation failed
        return {
          valid : false,
          message : res.message
        };
      }
    }

    if (aResultStack.length >= 2) {
      //validation failed
      return {
        valid : false,
        message : util.errMsg.FORMULA_OP_MISS
      };
    } else if (aResultStack.length === 0) {
      //validation failed
      return {
        valid : false,
        message : util.errMsg.FORMULA_NOT_NULL
      };
    }

    if (aResultStack[0].type === "bool") {
      //validation failed
      return {
        valid : false,
        message : util.errMsg.FORMULA_RESULT_BOOL
      };
    }

    return {
      valid : true,
      value : aResultStack.pop().data.toString()
    }
  }

  if (typeof exports == "object" && typeof module == "object") {
    module.exports = {
      calculate: calculate
    }
  }

  return {
    calculate : calculate
  }
});