const cheerio = require("cheerio")
const fs = require("fs")

const PriceHistoryParser = (function () {

    let $;
    const text = fs.readFileSync('House Prices in Glencoe Road, Weybridge, Surrey, KT13.htm', (err, data) => {
        if (err) throw err;
        console.log(data);
    });

    // TODO depends on parseByHouse initialising cheerio object
    function getStreetAddress() {
        let address = $('.soldAddress').first().text();
        address = address.substring(address.indexOf(",") + 1);
        console.log('address: ' + address);
        return address;
    }


    // parses the street data and builds are record for each sale
    function parseByHouse(text) {
        //TODO note: decoding html entities didn't work;
        $ = cheerio.load(text, {decodeEntities: false});
        let streetAddress = getStreetAddress();

        //create a record for each house sale in the street
        let salesRecord = [];
        // for each section in soldDetails great a sale record
        $('.soldDetails').each(function (index, element) {

            let houseNumber, salePrice, propertyType, bedRooms, date;
            // get the house number
            houseNumber = $(element).children('.soldAddress').text().split(",", 1)[0];
            // build a record for each sale of the house
            $(element).find('tr').each(function (index, element) {
                date = $(element).children('.soldDate').text();
                salePrice = $(element).children('.soldPrice').text();
                salePrice = salePrice.substring(1);
                propertyType = $(element).children('.soldType').text().split(",", 1)[0];
                bedRooms = $(element).children('.noBed').text().substring(0, 1);
                let sale = {
                    houseNumber: houseNumber, date: date,
                    propertyType: propertyType, bedRooms: bedRooms, salePrice: salePrice
                }
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

        terraced = records.filterByHouseType('Terraced');
        console.log(terraced);

        //TODO change to produce a dataset for each house type
        records.forEach(function (record) {
            let price = parseInt(record.salePrice, 10) * 1000;
            let year = new Date(record.date).getFullYear();
            data.push({date: year, y: price});
        });
        // calculate averages for years with multiple sales
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

    Array.prototype.filterByHouseType = function (houseType) {
        return this.filter(rec => rec.propertyType.toLowerCase() == houseType.toLowerCase());
    };

    function tupleSortByDate(a, b) {
        a = a.date;
        b = b.date;
        return a - b;
    };

    function buildDataAvgs(records) {
        //create a new array with all the dates from the records
        let dates = [];
        let avgData = [];
        records.forEach(function (rec) {
            dates.push(rec.date)
        });
        //remove duplicates from the dates array
        dates = [...new Set(dates)];
        //calculate the average for each date
        for (let i = 0; i < dates.length; i++) {
            let temp = records.filter(rec => dates[i] == rec.date);
            let total = 0;
            temp.forEach(function (rec) {
                total += parseInt(rec.y);
            });
            let avgPrice = Math.round(total / temp.length);
            avgData.push({date: dates[i], y: avgPrice});
        }
        // console.log("average");
        // console.log(avgData);
        return avgData;
    }

    var fileName = './file.html';
    var stream = fs.createWriteStream(fileName);
    let records = parseByHouse(text);
    let data = buildDataForLineChart(records);
    let labels = generateLabels();

    stream.once('open', function (fd) {
        var html = buildHtml();

        stream.end(html);
    });

    return {
        tupleSortByDate: tupleSortByDate,
        parseByHouse: parseByHouse
    };

})();

module.exports = PriceHistoryParser;