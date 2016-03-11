(function () {
  'use strict';

  angular
    .module('revapm.Portal.Reports')
    .directive('pieChart', pieChartDirective);

  /*@ngInject*/
  function pieChartDirective() {

    function link($scope, element, attrs) {
      var el = element[0];

      var chart = new Highcharts.Chart({
        chart: {
          renderTo: el,
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },

        title: {
          text: ''
        },

        tooltip: {
          //pointFormat: '{point.name}: <b>{point.percentage:.1f}% ({point.y} requests)</b>',
          formatter: function() {
            return '<b>'+ this.point.name +': </b>'+
              Highcharts.numberFormat(this.point.percentage, 0) + '% (' + Highcharts.numberFormat(this.y, 0, ".", ",") + ' requests)';
          }
        },

        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            }
          }
        },

        series: [{
          data: []
        }]
      });

      $scope.$watch('ngData', function (value) {
        if (!value || !_.isArray(value)) {
          return;
        }
        // Set new data
        chart.series[0].setData(value);
      });
    }

    return {
      scope: {
        ngData: '='
      },
      link: link
    };
  };

})();
