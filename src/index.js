requirejs([
  'formula/formulaBuilder',
  'formula/formulaCalculator',
  'formula/formulaUtil'
], function(builder, calculator, util) {
  'use strict';

  function addMembers(){
    let members = util._aMembers;
    for(let i = 0; i < members.length; i++){
      let mem = members[i];
      let $mem = $('<div></div>');
      $mem.html(`[${mem.name}] = ${mem.value}`);
      if(i % 2 === 0){
        $mem.addClass('helps-cell-left');
      }else{
        $mem.addClass('helps-cell-right');
      }
      $mem.addClass('helps-cells');
      $('.helps-members').append($mem);
    }
  }

  function addFunctions(){
    let functions = util._calcFn;
    let k = 0;
    for(let i in functions){
      let fn = functions[i];
      let $fn = $('<div></div>');
      $fn.html(fn.op + '()');
      if(k++ % 2 === 0){
        $fn.addClass('helps-cell-left');
      }else{
        $fn.addClass('helps-cell-right');
      }
      $fn.addClass('helps-cells');
      $('.helps-functions').append($fn);
    }
  }

  $(document).ready(() => {
    builder.registWebFormula();

    let myTextarea = document.getElementById("formula-editer");
    let cm = CodeMirror.fromTextArea(myTextarea, {
      lineNumbers: false,
      mode: "webFormula"
    });

    builder.registerHelper([]);
    addMembers();
    addFunctions();

    let members = util._aMembers
    $('.formula-btn-calculate').click(() => {
      let formula = cm.getValue().trim();
      let res = calculator.calculate(formula, members);
      if(res.valid){
        $('.calculate-content').text(res.value);
      }else{
        $('.calculate-content').text(res.message);
      }

      $('.format-section').css('display','none');
      $('.calculate-section').fadeIn();
    });

    $('.formula-btn-format').click(() => {
      let formula = cm.getValue().trim();
      let res = calculator.calculate(formula, members);
      if(res.valid){
        res = util.formatFormula(formula);
        $('.format-content').text(res);
      }else{
        $('.format-content').text(res.message);
      }

      $('.calculate-section').css('display','none');
      $('.format-section').fadeIn();
    });
  });

});