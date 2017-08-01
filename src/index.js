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

      let members = [
        { name: 'pi', value: '3.14159' },
        { name: 'e', value: '2.71828' },
        { name: 'gross_revenue', value: '1.5e7' },
        { name: 'net_revenue', value: '1.23e7' },
        { name: 'net_income', value: '10e6' },
        { name: 'year', value: '2017' },
        { name: 'currency1', value: '4.0' },
        { name: 'currency2', value: '0.8' },
      ];

      $('.formula-btn-calculate').click(() => {
        alert(1);
      });

      $('.formula-btn-format').click(() => {
        alert(2);
      });
    });
    

});