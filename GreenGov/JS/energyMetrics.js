function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [
    , ""
  ])[1].replace(/\+/g, '%20')) || null
}

function isNumeric(n) {
  // return !isNaN(parseFloat(n)) && isFinite(n);
  return !isNaN(n);
}

var department = getURLParameter('acronym') || 'CHP';
var deptLookup = findDepartment(department);


function metricTotals(dataset, field) {
  var out = {}

  var perDepartment = d3
    .nest()
    .key(function (d) {
      return d['Department']
    })
    .key(function (d) {
      return d[field]
    })
    .entries(dataset);

  perDepartment
    .forEach(function (e) {
      var total = e
        .values
        .reduce(function (p, c) {
          var value = Number.parseFloat(c.key)
          if (isNumeric(value)) {
            return p + value
          } else {
            return p
          }
        }, 0);
      console.log(e.key);
      // set the total on the department ackroymn
      out[e.key] = total
      })
    return out;
  }

  function GetMetrics() {

    $.when($.ajax('/Data/energy2013.csv'), $.ajax('/Data/energy2014.csv'))
      .then(function (csv2013, csv2014) {
        // console.log(csv2013[0], csv2014[0]);

        // Parse
        var data2013 = d3.csv
          .parse(csv2013[0]);
        var data2014 = d3.csv
          .parse(csv2014[0]);

        //Filter


        data2013 = data2013
          .filter(function (d) {
            return d['Department'] == department;
          })
        data2014 = data2014
          .filter(function (d) {
            return d['Department'] == department;
          })


        var energyTotals2013 = metricTotals(data2013, 'Site Energy Use (kBtu)');
        var energyTotals2014 = metricTotals(data2014, 'Site Energy Use (kBtu)');

        var waterTotals2013 = metricTotals(data2013, 'Water Use (All Water Sources) (kgal)');
        var waterTotals2014 = metricTotals(data2014, 'Water Use (All Water Sources) (kgal)');

    console.log(waterTotals2013, waterTotals2014);

    // Create Charts
    $('#water').highcharts({
      chart: {
        type: 'line'
      },
    series: [{
            data: [waterTotals2013[department], waterTotals2014[department]]
        }],
      title: {
        text: 'Water Usage Per'
      },
      xAxis: {
        categories: [
          '2013', '2014'
        ]
      },
      yAxis: {
        title: {
          text: 'Water Use (All Water Sources) (kgal)'
        }
      }
    });

    // Create Charts
    $('#energy').highcharts({
      chart: {
        type: 'line'
      },
    series: [{
            data: [energyTotals2013[department], energyTotals2014[department]]
        }],
      title: {
        text: 'Total Energy Usage'
      },
      xAxis: {
        categories: [
          '2013', '2014'
        ]
      },
      yAxis: {
        title: {
          text: 'Site Energy Use (kBtu)'
        }
      }
    });

    })
  }


function CO2Totals(dataset) {
  var out = {}
  function nameLookUp() {
    return 'Organization Name';
  }

// filter
dataset = dataset.filter(function (d) {
  // console.log(deptLookup.CO2e,d, d[deptLookup.CO2e]);
  return d['Organization Name'] == deptLookup.CO2e;
})

  var perDepartment = d3
    .nest()
    .key(function (d) {
      return d[deptLookup.CO2e]
    })
    .key(function (d) {
      return d['Emission Year']
    })
    .key(function(d) {
      return d['CO2e']
    })
    .entries(dataset);

var data = []
var categories = []
console.log(perDepartment);
  perDepartment[0].values.map(function(yearObj){
        //  per year
        categories.push(yearObj.key);
        data.push(Number.parseFloat(yearObj.values[0].key));
      })

  console.log(categories, data);
  // Create Charts
  $('#co2').highcharts({
    chart: {
      type: 'line'
    },
  series: [{
          data: data
      }],
    title: {
      text: 'CO2'
    },
    xAxis: {
      categories: categories
    },
    yAxis: {
      title: {
        text: 'Site Energy Use (kBtu)'
      }
    }
  });

}



function Co2Metrics() {
  d3.csv('/Data/CO2/agency_co2_per_year.csv', function(csv) {
    // console.log(csv);
    CO2Totals(csv)
  })
}



  $(document)
    .ready(function () {
      GetMetrics();
Co2Metrics();
    });
