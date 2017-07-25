requirejs(['formula/formulaBuilder'], function(builder) {
    'use strict';

    $(document).ready(() => {
      builder.registWebFormula();

      let myTextarea = document.getElementById("formula-editer");
      CodeMirror.fromTextArea(myTextarea, {
        lineNumbers: false,
        mode: "webFormula"
      });

      builder.registerHelper([]);

      $('.formula-btn-calculate').click(() => {
        alert(1);
      });

      $('.formula-btn-format').click(() => {
        
      });
    });
    

});