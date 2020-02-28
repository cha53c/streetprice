const cheerio = require("cheerio")
const fs = require("fs")

const PriceHistoryParser = (function () {


    const text = fs.readFileSync('House Prices in Glencoe Road, Weybridge, Surrey, KT13.htm', (err, data) => {
        if (err) throw err;
        console.log(data);
    });
// note decoding html entities didn't work;
    const $ = cheerio.load(text, {decodeEntities: false});

    function parseByHouse() {
        let address = $('.soldAddress').first().text();
        address = address.substring(address.indexOf(",") + 1);
        console.log(address);
        let salesRecord = [];

        $('.soldDetails').each(function (index, element) {
            let houseNumber, salePrice, propertyType, bedRooms, soldDate;
            houseNumber = $(element).children('.soldAddress').text().split(",", 1)[0];
            $(element).find('tr').each(function (index, element) {
                soldDate = $(element).children('.soldDate').text();
                salePrice = $(element).children('.soldPrice').text();
                salePrice = salePrice.substring(1);
                propertyType = $(element).children('.soldType').text().split(",", 1)[0];
                bedRooms = $(element).children('.noBed').text().substring(0, 1);
                let sale = {
                    houseNumber: houseNumber, soldDate: soldDate,
                    propertyType: propertyType, bedRooms: bedRooms, salePrice: salePrice
                }
                // console.log(sale);
                salesRecord.push(sale)
            });
        });
        console.log(salesRecord);
        return salesRecord;
    }


//build into a chart in html

    function buildHtml(req) {
        var header = '<script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js"></script>';
        var body = buildLineChart();

        return '<!DOCTYPE html>'
            + '<html><head>' + header + '</head><body> <h1>Bar Chart</h1>' + body + '</body></html>';
    };

//TODO move this into a template
    function buildLineChart() {
        return '<canvas id="myChart" width="400" height="400"></canvas>\n' +
            '<script>\n' +
            'var ctx = document.getElementById(\'myChart\').getContext(\'2d\');\n' +
            'var chart = new Chart(ctx, {\n' +
            '    type: \'line\',\n' +
            '    data: {\n' +
            '    labels: [' + labels + '],\n' +
            '    datasets: [{\n ' +
            '    data: [' + data + '],\n' +
            '    label: \'terrace\',\n' +
            '    borderColor: \'#3e95cd\',\n' +
            '    fill: false\n' +
            '    }],\n' +
            '    options: {\n' +
            '        scales: {\n' +
            '            xAxes: [{\n' +
            '                type: \'time\',\n' +
            '                distribution: \'series\'\n' +
            '            }]\n' +
            '        }\n' +
            '    }\n' +
            '}});' +
            '</script>';
    }


    function buildDataForLineChart(records) {
        let data = [];
        let terraced = [];
        let semiDetached = [];
        let detached = [];

        terraced = filterRecords('Terraced');
        console.log(terraced);

        //TODO change to produce a dataset for each house type
        records.forEach(function (record) {
            let price = parseInt(record.salePrice, 10) * 1000;
            let year = new Date(record.soldDate).getFullYear();
            data.push({x: year, y: price});
        });
        //TODO calculate averages for years with multiple sales
        data = buildDataAvgs(data);
        data.sort(tupleSortByDate);
        console.log(data);

        let ret = [];
        for (let i = 0; i < data.length; i++) {
            ret.push(data[i].y);
        }

        console.log(ret);
        return ret.toString();
    }

    function buildXYLineData(records) {
// return an object

    }


// labels are each year from 1995 to 2020
    function generateLabels() {
        arr = [];
        for (let i = 1995; i <= 2020; i++) {
            arr.push(i.toString());
        }
        // console.log(arr.toString());
        return arr.toString();
    }

    function filterRecords(houseType) {
        return records.filter(rec => rec.propertyType.toLowerCase() == houseType.toLowerCase());
    }

    function tupleSortByDate(a, b) {
        a = a.x;
        b = b.x;
        return a - b;
    };

    function buildDataAvgs(records) {
        //create a new array with all the dates from the records
        let dates = [];
        let avgData = [];
        records.forEach(function (rec) {
            dates.push(rec.x)
        });
        //remove duplicates from the dates array
        dates = [...new Set(dates)];
        //TODO use the dates array to cycle through the records calculation the averages and putting them in a new array
        //calculate the average for each date
        for (let i = 0; i < dates.length; i++) {
            let temp = records.filter(rec => dates[i] == rec.x);
            let total = 0;
            temp.forEach(function (rec) {
                total += parseInt(rec.y);
            });
            let avgPrice = Math.round(total / temp.length);
            avgData.push({x: dates[i], y: avgPrice});
        }
        // console.log("average");
        // console.log(avgData);
        return avgData;
    }

    var fileName = './file.html';
    var stream = fs.createWriteStream(fileName);
    let records = parseByHouse();
    let data = buildDataForLineChart(records);
    let labels = generateLabels();

    stream.once('open', function (fd) {
        var html = buildHtml();

        stream.end(html);
    });

    return {
      tupleSortByDate: tupleSortByDate
    };

})();

module.exports = PriceHistoryParser;