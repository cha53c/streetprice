const PriceHistoryParser = require("../js/price-history-parser");

describe("sort tuples in to ascending date order", () => {

    it('should leave array in original order', () => {
        let tuples = [{x: 1995, y: 100250}, {x: 1996, y: 99500}];
        let sorted = tuples.sort(PriceHistoryParser.tupleSortByDate);
        expect(sorted[0]).toEqual(tuples[0]);
    })

    it('should should be in date order', () => {
        let tuples = [{x: 1996, y: 99500}, {x: 1995, y: 100250} ];
        let sorted = tuples.sort(PriceHistoryParser.tupleSortByDate);
        expect(sorted[0].x).toBe(1995);
        expect(sorted[1].x).toBe(1996);
    })
    it('should keep equivalent dates next to each other', () => {
        let tuples = [{x: 1995, y: 100250}, {x: 1995, y: 99500}];
        let sorted = tuples.sort(PriceHistoryParser.tupleSortByDate);
        expect(sorted[0]).toEqual(tuples[0]);
        expect(sorted[1]).toEqual(tuples[1]);
    })

});

