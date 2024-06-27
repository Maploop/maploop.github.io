var maintenancePrice;
var basicStart;
var advancedStart;

fetch('https://raw.githubusercontent.com/Maploop/DataCenter/main/prices_endpoint.mdat', {
  method: "GET",
  cache: "no-cache"
}).then(res => res.json()).then(jsonDat => {
  maintenancePrice = jsonDat["MaintenancePerMonth"];
  basicStart = jsonDat["Basic"];
  advancedStart = jsonDat["Advanced"];

  document.getElementById('maintenancePriceTag').innerHTML = maintenancePrice;
  document.getElementById('basicPriceTag').innerHTML = basicStart;
  document.getElementById('advancedPriceTag').innerHTML = advancedStart;
});