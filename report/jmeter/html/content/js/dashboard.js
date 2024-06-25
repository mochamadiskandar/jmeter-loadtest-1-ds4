/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 96.56815298595123, "KoPercent": 3.4318470140487713};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.814941502607715, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.997336227308603, 500, 1500, "Get List Users"], "isController": false}, {"data": [0.9984216459977452, 500, 1500, "Get User By Id"], "isController": false}, {"data": [0.4488705265235906, 500, 1500, "Register User"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 106415, 3652, 3.4318470140487713, 250.25514260207552, 23, 12501, 34.0, 718.0, 788.0, 880.0, 347.0424023428583, 379.0116822141788, 87.07330797873034], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get List Users", 35476, 5, 0.014094035404216936, 55.893759161123384, 23, 12501, 31.0, 40.0, 44.0, 54.0, 115.81012571450957, 145.81739781819547, 26.71323343835386], "isController": false}, {"data": ["Get User By Id", 35480, 21, 0.05918827508455468, 55.74633596392378, 24, 4283, 31.0, 40.0, 46.0, 76.0, 118.24774702714232, 136.65691093591693, 25.416337031908228], "isController": false}, {"data": ["Register User", 35459, 3626, 10.225894695281875, 639.3337093544654, 568, 2939, 611.0, 732.0, 797.0, 885.0, 118.25973852721451, 101.87479220688535, 36.32096297712947], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 1,550 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,546 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,007 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,553 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,233 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,709 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,223 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,543 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,115 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,444 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,374 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,267 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,559 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,284 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,072 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,202 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,213 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,240 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 3, 0.08214676889375684, 0.0028191514354179393], "isController": false}, {"data": ["The operation lasted too long: It took 1,083 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 4,543 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,584 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,247 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,236 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 0.054764512595837894, 0.0018794342902786261], "isController": false}, {"data": ["The operation lasted too long: It took 1,943 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,068 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,563 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,574 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,025 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,018 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 0.054764512595837894, 0.0018794342902786261], "isController": false}, {"data": ["The operation lasted too long: It took 1,528 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,222 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["400/Bad Request", 3546, 97.09748083242059, 3.332236996664004], "isController": false}, {"data": ["The operation lasted too long: It took 1,292 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,227 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,547 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 0.054764512595837894, 0.0018794342902786261], "isController": false}, {"data": ["The operation lasted too long: It took 1,655 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,073 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,532 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,554 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 12,501 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 4,283 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,492 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,027 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,332 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,016 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 0.054764512595837894, 0.0018794342902786261], "isController": false}, {"data": ["The operation lasted too long: It took 1,220 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,545 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,508 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,290 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,589 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,744 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,682 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,779 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,238 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 0.054764512595837894, 0.0018794342902786261], "isController": false}, {"data": ["The operation lasted too long: It took 1,514 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,521 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,201 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,245 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,901 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,827 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,133 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,537 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,279 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,642 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,551 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,012 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,495 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,552 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,071 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,272 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,269 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,596 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,535 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,509 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,564 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,237 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,939 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,259 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,260 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,267 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,010 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,256 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,097 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,254 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,228 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,280 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,243 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,232 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,217 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,533 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,040 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,577 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,544 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,480 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,761 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,491 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,307 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,276 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}, {"data": ["The operation lasted too long: It took 1,265 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.027382256297918947, 9.397171451393131E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 106415, 3652, "400/Bad Request", 3546, "The operation lasted too long: It took 1,240 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 3, "The operation lasted too long: It took 1,236 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,018 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,547 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get List Users", 35476, 5, "The operation lasted too long: It took 2,267 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 12,501 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 4,543 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,374 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Get User By Id", 35480, 21, "The operation lasted too long: It took 1,240 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 3, "The operation lasted too long: It took 1,827 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 1,280 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 2,133 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 1,217 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1], "isController": false}, {"data": ["Register User", 35459, 3626, "400/Bad Request", 3546, "The operation lasted too long: It took 1,238 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,018 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,547 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,016 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
