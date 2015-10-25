var BuildingMetrics2013 = '/Data/bipartite_.csv'

d3.csv(BuildingMetrics2013, function (csv) {
/*
Go from Deparments-> Property -> Values
 */

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [
    , ""
  ])[1].replace(/\+/g, '%20')) || null
}

// FOR Testing
var deparmentName = getURLParameter('acronym') || 'CDCR';

  // Get only this deparment
  csv = csv
    .filter(function (d) {
      return d['Department'] == deparmentName;
    });

    var nested = d3.nest()
    .key(function (d) {
      return d['Primary Property Type - Self Selected'];
    }).entries(csv);
console.log(nested);
nested.forEach(function(d){
  console.log(d.key);
})
  });
