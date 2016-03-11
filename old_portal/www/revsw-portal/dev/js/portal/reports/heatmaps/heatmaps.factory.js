(function () {
  'use strict';

  angular
    .module('revapm.Portal.Domains')
    .factory('HeatmapsDrawer', HeatmapsDrawer);

  /*@ngInject*/
  function HeatmapsDrawer(HeatmapsConfig) {

    function Interpolate(start, end, steps, count) {
      var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
      return Math.floor(final);
    }

    function Color(_r, _g, _b) {
      var r, g, b;
      var setColors = function (_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
      };

      setColors(_r, _g, _b);
      this.getColors = function () {
        var colors = {
          r: r,
          g: g,
          b: b
        };
        return colors;
      };
    }

    function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

    function valueFormat( d, force ) {

      if (d > 1000000000 || force === 'G') {
        return Math.round(d / 10000000) / 100 + "G";
      }

      if (d > 1000000 || force === 'M') {
        return Math.round(d / 100000) / 10 + "M";
      }

      if (d > 1000 || force === 'K') {
        return Math.round(d / 100 ) / 10 + "K";
      }

      return d;
    }

    function log10(val) {
      return Math.log(val);
    }

    /**
     * Draw a world map using given HTML element ids
     *
     * @param {String} canvasSvgId
     * @param {String} tooltipId
     * @param {object} data
        data pseudo-structure:
          { property: {
              value: 42,
              tooltip: 'here\'s answer - 42 ms'
            },
            property: .....
          }
        where property is most probably country name,
          value - actual value of the property for calculations,
          and tooltip is a string to show over the map
     */
    function drawMap(canvasSvgId, tooltipId, data) {

      var self = this;
      var width = $(canvasSvgId).width(),
        height = width / 1.5;

      var COLOR_COUNTS = this.conf.COLOR_COUNTS;
      var COLOR_FIRST = this.conf.COLORS.FIRST;
      var COLOR_LAST = this.conf.COLORS.LAST;
      var COLOR_ZERO = this.conf.COLORS.ZERO;

      var rgb = hexToRgb(COLOR_FIRST);

      var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);

      rgb = hexToRgb(COLOR_LAST);
      var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);

      var startColors = COLOR_START.getColors(),
        endColors = COLOR_END.getColors();

      var colors = [];

      for (var i = 0; i < COLOR_COUNTS; i++) {
        var r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
        var g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
        var b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
        colors.push(new Color(r, g, b));
      }

      var projection = d3.geo.mercator()
        .scale((width + 1) / 2 / Math.PI)
        .translate([width / 2, height / 1.4])
        .precision(.1);

      var path = d3.geo.path()
        .projection(projection);

      var graticule = d3.geo.graticule();

      // Clear svg
      clearMap( canvasSvgId );

      var svg = d3.select(canvasSvgId).append("svg")
        .attr("width", '100%')
        .attr("height", height);

      svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

      //  simplify input data to name->value hashes
      var valueHash = _.mapValues( data, function( item ) {
        return item.value;
      });

      var quantize = d3.scale.quantize()
        .domain([0, 1.0])
        .range(d3.range(COLOR_COUNTS).map(function (i) {
          return i
        }));

      var values = d3.values( valueHash );

      quantize.domain([
        d3.min(values, function (d) {
          return (+d)
        }),
        d3.max(values, function (d) {
          return (+d)
        })
      ]);

      // Loading world json
      d3.json("js/heatmaps/world-topo-min.json", function (error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;

        svg.append("path")
          .datum(graticule)
          .attr("class", "choropleth")
          .attr("d", path);

        var g = svg.append("g");

        g.append("path")
          .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
          .attr("class", "equator")
          .attr("d", path);

        var country = g.selectAll(".country").data(countries);

        country.enter().insert("path")
          .attr("class", "country")
          .attr("d", path)
          .attr("id", function (d, i) {
            return d.id;
          })
          .attr("title", function (d) {
            return d.properties.name;
          })
          .style("fill", function (d) {
            if (valueHash[d.properties.name]) {
              var c = quantize((valueHash[d.properties.name]));
              var color = colors[c].getColors();
              return "rgb(" + color.r + "," + color.g +
                "," + color.b + ")";
            } else {
              return COLOR_ZERO;
            }
          })
          .on("mousemove", function (d) {
            var html = "";

            html += "<div class=\"tooltip_kv\">";
            html += "<span class=\"tooltip_key\">";
            html += d.properties.name;
            html += "</span>";
            html += "<span class=\"tooltip_value\">";
            html += (data[d.properties.name] && data[d.properties.name].tooltip ? data[d.properties.name].tooltip : "--");
            html += "</span>";
            html += "</div>";

            $(tooltipId).html(html);
            $(this).attr("fill-opacity", "0.8");
            $(tooltipId).show();

            var coordinates = d3.mouse(this);

            var map_width = $('.choropleth')[0].getBoundingClientRect().width;

            if (d3.event.pageX < map_width / 2) {
              d3.select(tooltipId)
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX + 15) + "px");
            } else {
              var tooltip_width = $(tooltipId).width();
              d3.select(tooltipId)
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
            }
          })
          .on("mouseout", function () {
            $(this).attr("fill-opacity", "1.0");
            $(tooltipId).hide();
          });

        g.append("path")
          .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
            return a !== b;
          }))
          .attr("class", "boundary")
          .attr("d", path);
      });
    }

    /**
     * Clear map
     */
    function clearMap( canvasSvgId ) {
      canvasSvgId = canvasSvgId ? canvasSvgId + ' svg' : 'svg';
      if (d3.select(canvasSvgId)) {
        d3.select(canvasSvgId).remove();
      }
    }

    return {

      conf: HeatmapsConfig,

      clearMap: clearMap,

      drawMap: drawMap,

      Interpolate: Interpolate,

      Color: Color,

      hexToRgb: hexToRgb,

      valueFormat: valueFormat,

      log10: log10
    };
  };
})();
