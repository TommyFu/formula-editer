define(['formula/formulaUtil'], function(util) {
  'use strict';

  let aCondition = util._aLogicFn;
  let conditionsRegex = new RegExp("\\b((" + aCondition.join(")|(") + "))", 'i');
  let aFunction = util._aFunction;
  let functionsRegex = new RegExp("\\b((" + aFunction.join(")|(") + "))", 'i');

  function formulaToken(stream, state) {
    if (stream.eatSpace()) {
        return null;
    }

    if (stream.match(util.REGEX.memberWithBracket)) {
        return "member";
    } else if (stream.match(conditionsRegex)) {
        return "condition";
    } else if (stream.match(functionsRegex)) {
        return "function";
    } else if (stream.match(/^[0-9.]+/)) {
        return "constant";
    } else if (stream.match(/^[\+|\-|\*|\/]/)) {
        return "arithmetic";
    } else if (stream.match(/^=\s*=/)) {
        return "error";
    } else if (stream.match(/^[<\s*=|>\s*=|=|!\s*=|<|>]/)) {
        return "bool";
    } else if (stream.match(/^[,|;]/)) {
        return "comma";
    } else if (stream.match(/^[(|)]/)) {
        return "bracket";
    } else {
        stream.next();
        return "error";
    }
  }

  function hint(editor, options) {
    let autoList = this._hintList
    options.completeSingle = false;
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    
    if (curLine.charAt(cur.ch - 1) === "[") { //"["
      return {
        list : autoList,
        from : CodeMirror.Pos(cur.line, cur.ch - 1),
        to : CodeMirror.Pos(cur.line, cur.ch)
      };
    }
  }

  function registWebFormula(){
    CodeMirror.defineMode('webFormula', function(conf, parserConf) {
      return {
        startState : function() {
          return {
            context : 0,
            sTemp : ""
          };
        },
        token : function(stream, state) {
          return formulaToken(stream, state);
        }
      };
    });

    CodeMirror.defineMIME("text/x-webFormula", "webFormula");
  }

  function registerHelper(hintList) {
    this._hintList = hintList;
    CodeMirror.registerHelper("hint", "webFormula", hint);
  }
  
  return {
    registWebFormula: registWebFormula,
    registerHelper: registerHelper
  };
});