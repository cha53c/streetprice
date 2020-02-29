const fs = require('fs');

const PriceHistoryParser = require("../js/price-history-parser");

describe("sort tuples in to ascending date order", () => {

    it('should leave array in original order', () => {
        let tuples = [{date: 1995, y: 100250}, {date: 1996, y: 99500}];
        let sorted = tuples.sort(PriceHistoryParser.tupleSortByDate);
        expect(sorted[0]).toEqual(tuples[0]);
    })

    it('should should be in date order', () => {
        let tuples = [{date: 1996, y: 99500}, {date: 1995, y: 100250}];
        let sorted = tuples.sort(PriceHistoryParser.tupleSortByDate);
        expect(sorted[0].date).toBe(1995);
        expect(sorted[1].date).toBe(1996);
    })
    it('should keep equivalent dates next to each other', () => {
        let tuples = [{date: 1995, y: 100250}, {date: 1995, y: 99500}];
        let sorted = tuples.sort(PriceHistoryParser.tupleSortByDate);
        expect(sorted[0]).toEqual(tuples[0]);
        expect(sorted[1]).toEqual(tuples[1]);
    })

});

describe('filter records on house type', () => {
    const terraced = 'Terraced';
    const semiDetached = 'Semi-Detached';
    const detached = 'Detached';
    const records = [
        {houseNumber: '48', date: '17 Feb 2006', propertyType: 'Terraced', bedRooms: '', salePrice: '250,000'},
        {houseNumber: '37', date: '30 May 2007', propertyType: 'Semi-Detached', bedRooms: '2', salePrice: '343,167'},
        {houseNumber: '2', date: '12 Apr 2002', propertyType: 'Detached', bedRooms: '3', salePrice: '355,000'}];

    it('should return a list containing only house of type "terrace" ', () => {
        let list = records.filterByHouseType(terraced);
        expect(list.length).toBe(1);
        expect(list[0].propertyType).toEqual(terraced);
        list = records.filterByHouseType(semiDetached);
        expect(list.length).toBe(1);
        expect(list[0].propertyType).toEqual(semiDetached);
        list = records.filterByHouseType(detached);
        expect(list.length).toBe(1);
        expect(list[0].propertyType).toEqual(detached);

    })

    it('should return a list containing only house of type "Semi-detached" ', () => {
        list = records.filterByHouseType(semiDetached);
        expect(list.length).toBe(1);
        expect(list[0].propertyType).toEqual(semiDetached);
    })
    it('should return a list containing only house of type "detached" ', () => {
        list = records.filterByHouseType(detached);
        expect(list.length).toBe(1);
        expect(list[0].propertyType).toEqual(detached);
    })
});

describe('parseByHouse should build and array of objects from the html', () => {
    const text = fs.readFileSync('./spec/data/House Prices in Glencoe Road, Weybridge, Surrey, KT13.htm', (err, data) => {
        if (err) throw err;
        console.log(data);
    });
    const records = PriceHistoryParser.parseByHouse(text);

    it('should load test data from file', () => {
        expect(text).not.toEqual(undefined);
    })

    it('should return an array of sale records for each sale', () => {
        expect(records.length).toBe(31);
    })

    it('should have at least one correctly defined ', ()=> {
        const sale = records[0];
        expect(sale.hasOwnProperty('houseNumber')).toBe(true);
        expect(sale.hasOwnProperty('date')).toBe(true);
        expect(sale.hasOwnProperty('propertyType')).toBe(true);
        expect(sale.hasOwnProperty('bedRooms')).toBe(true);
        expect(sale.hasOwnProperty('salePrice')).toBe(true);
    })

})