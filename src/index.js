requirejs([
  'formula/formulaBuilder',
  'formula/formulaCalculator',
  'formula/formulaUtil'
], function(builder, calculator, util) {
  'use strict';

  $(document).ready(() => {
    builder.registWebFormula();

    let myTextarea = document.getElementById("formula-editer");
    let cm = CodeMirror.fromTextArea(myTextarea, {
      lineNumbers: false,
      mode: "webFormula"
    });

    builder.registerHelper([]);

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