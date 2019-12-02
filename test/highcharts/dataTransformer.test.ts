'use strict';

import * as _ from 'lodash';
import { DraftColumnType, IColumn, ChartType } from '../../src/common/chartModels';
import { DataTransformer, ICategoriesAndSeries } from '../../src/visualizers/highcharts/dataTransformer';

describe('Unit tests for Highcharts CategoriesAndSeries', () => {
    //#region beforeEach

    beforeEach(() => {
        // Add mock to date.valueOf -> return the full year
        jest
        .spyOn(Date.prototype, 'valueOf')
        .mockImplementation(function() {
            const date = this;
            
            return date.getFullYear();
        });
    })

    //#endregion beforeEach


    //#region Tests

    describe('Validate getCategoriesAndSeries method', () => {
        //#region getStandardCategoriesAndSeries

        it('Validate getStandardCategoriesAndSeries: non-date x-axis and 1 y-axis', () => {
            const rows = [
                ['Israel', 'Herzliya', 30],
                ['United States', 'New York', 100],
                ['Japan', 'Tokyo', 20],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[0],  // country
                        yAxes: [columns[2]] // request_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [30, 100, 20]
                }],
                categories: ['Israel', 'United States', 'Japan']
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        it('Validate getStandardCategoriesAndSeries: date x-axis and 1 y-axis', () => {
            const rows = [
                ['Israel', '2019-05-25T00:00:00Z', 'Herzliya', 30],
                ['Japan', '2019-05-25T00:00:00Z', 'Tokyo', 20],
                ['United States', '2000-06-26T00:00:00Z', 'New York', 100],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'timestamp', type: DraftColumnType.DateTime },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[1],  // timestamp
                        yAxes: [columns[3]] // request_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ true);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [[2019,  30], [2019, 20], [2000, 100]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        it('Validate getStandardCategoriesAndSeries: non-date x-axis and multiple y-axis', () => {
            const rows = [
                ['Israel', 'Herzliya', 30, 300],
                ['United States', 'New York', 100, 150],
                ['Japan', 'Tokyo', 20, 200],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
                { name: 'second_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[1], // city
                        yAxes: [columns[2], columns[3]] // request_count and second_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [30, 100, 20]
                },
                {
                    name: 'second_count',
                    data: [300, 150, 200]
                }],
                categories: ['Herzliya', 'New York', 'Tokyo']
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });
   
        it('Validate getStandardCategoriesAndSeries: date x-axis and multiple y-axis', () => {
            const rows = [
                ['2019-05-25T00:00:00Z', 'Israel', 'Herzliya', 30, 300],
                ['2019-05-25T00:00:00Z', 'Japan', 'Tokyo', 20, 150],
                ['2000-06-26T00:00:00Z', 'United States', 'New York', 100, 200],
            ];

            const columns: IColumn[] = [
                { name: 'timestamp', type: DraftColumnType.DateTime },
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
                { name: 'second_count', type: DraftColumnType.Long },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[0], // timestamp
                        yAxes: [columns[3], columns[4]] // request_count and second_count
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ true);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'request_count',
                    data: [[2019,  30], [2019, 20], [2000, 100]]
                },
                {
                    name: 'second_count',
                    data: [[2019,  300], [2019, 150], [2000, 200]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        //#endregion getStandardCategoriesAndSeries

        //#region getSplitByCategoriesAndSeries

        it('Validate getCategoriesAndSeries: non-date x-axis with splitBy', () => {
            const rows = [
                ['United States', 'Atlanta', 300],
                ['United States', 'Redmond', 20],
                ['Israel', 'Herzliya', 1000],
                ['Israel', 'Tel Aviv', 10],
                ['United States', 'New York', 100],
                ['Japan', 'Tokyo', 20],
                ['Israel', 'Jerusalem', 5],
                ['United States', 'Boston', 200],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[0],    // country
                        yAxes: [columns[2]],  // request_count
                        splitBy: [columns[1]] // city
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'Atlanta',
                    data: [300, null, null]
                },
                {
                    name: 'Redmond',
                    data: [20, null, null]
                },
                {
                    name: 'Herzliya',
                    data: [null, 1000, null]
                },
                {
                    name: 'Tel Aviv',
                    data: [null, 10, null]
                },
                {
                    name: 'New York',
                    data: [100, null, null]
                },
                {
                    name: 'Tokyo',
                    data: [null, null, 20]
                },
                {
                    name: 'Jerusalem',
                    data: [null, 5, null]
                },
                {
                    name: 'Boston',
                    data: [200, null, null]
                }],
                categories: ['United States', 'Israel', 'Japan']
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        it('Validate getCategoriesAndSeries: date x-axis with splitBy', () => {
            const rows = [
                ['Israel', '1988-06-26T00:00:00Z', 'Jerusalem', 500],
                ['Israel', '2000-06-26T00:00:00Z', 'Herzliya', 1000],
                ['United States', '2000-06-26T00:00:00Z', 'Boston', 200],
                ['Israel', '2000-06-26T00:00:00Z', 'Tel Aviv', 10],
                ['United States', '2000-06-26T00:00:00Z', 'New York', 100],      
                ['Japan', '2019-05-25T00:00:00Z', 'Tokyo', 20],
                ['United States', '2019-05-25T00:00:00Z', 'Atlanta', 300],
                ['United States', '2019-05-25T00:00:00Z', 'Redmond', 20]
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'timestamp', type: DraftColumnType.DateTime },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    columnsSelection: {
                        xAxis: columns[1],   // timestamp
                        yAxes: [columns[3]], // request_count
                        splitBy: [columns[2]], // city
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ true);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'Jerusalem',
                    data: [[1988,  500]]
                },
                {
                    name: 'Herzliya',
                    data: [[2000,  1000]]
                },
                {
                    name: 'Boston',
                    data: [[2000,  200]]
                },
                {
                    name: 'Tel Aviv',
                    data: [[2000,  10]]
                },
                {
                    name: 'New York',
                    data: [[2000,  100]]
                },
                {
                    name: 'Tokyo',
                    data: [[2019,  20]]
                },
                {
                    name: 'Atlanta',
                    data: [[2019,  300]]
                },
                {
                    name: 'Redmond',
                    data: [[2019,  20]]
                }],
                categories: undefined
            };

            // Assert
            expect(result).toEqual(expectedCategoriesAndSeries);
        });

        //#endregion getSplitByCategoriesAndSeries
        
        //#region getPieCategoriesAndSeriesForSplitBy

        function validateResults(result, expected) {
            const seriesToValidate = _.map(result.series, (currentSeries) => {
                return {
                    name: currentSeries.name,
                    data: currentSeries.data
                }
            });

            // Assert
            expect(seriesToValidate).toEqual(expected.series);
            expect(result.categories).toEqual(expected.categories);
        }

        it('Validate getPieCategoriesAndSeriesForSplitBy: pie chart with 2 levels', () => {
            const rows = [
                ['Israel', 'Tel Aviv', 10],
                ['United States', 'Redmond', 5],
                ['United States', 'New York', 2],
                ['United States', 'Miami', 3],
                ['Israel', 'Herzliya', 30],
                ['Israel', 'Jaffa', 50],
                ['United States', 'Boston', 1],
            ];

            const columns: IColumn[] = [
                { name: 'country', type: DraftColumnType.String },
                { name: 'city', type: DraftColumnType.String },
                { name: 'request_count', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    chartType: ChartType.Pie,
                    columnsSelection: {
                        xAxis: columns[0],    // country
                        yAxes: [columns[2]],  // request_count
                        splitBy: [columns[1]] // city
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'country',
                    data: [
                        { name: 'Israel',  y: 90 },
                        { name: 'United States', y: 11}
                    ]
                }, 
                {
                    name: 'city',
                    data: [
                        { name: 'Tel Aviv', y: 10 },
                        { name: 'Herzliya', y: 30 },
                        { name: 'Jaffa', y: 50 },
                        { name: 'Redmond', y: 5 },
                        { name: 'New York', y: 2 },
                        { name: 'Miami', y: 3 },
                        { name: 'Boston', y: 1 },
    
                   ]
                }],
                categories: []
            };

            // Assert
            validateResults(result, expectedCategoriesAndSeries);
        });

        it('Validate getPieCategoriesAndSeriesForSplitBy: pie chart with 3 levels', () => {
            const rows = [                
                ['Internet Explorer', 'v8', '0', 10],
                ['Chrome', 'v65', '0', 5],
                ['Firefox', 'v58', '0', 5],
                ['Firefox', 'v58', '1', 2],
                ['Chrome', 'v66', '0', 15],
                ['Internet Explorer', 'v8', '1', 1],
                ['Internet Explorer', 'v11', '0', 1],
                ['Chrome', 'v66', '1', 5],
                ['Chrome', 'v66', '2', 5],
                ['Safari', 'v11', '0', 20],
                ['Firefox', 'v59', '0', 3],
                ['Chrome', 'v65', '1', 20],
                ['Internet Explorer', 'v8', '2', 5],
                ['Internet Explorer', 'v8', '3', 3],
            ];

            const columns: IColumn[] = [
                { name: 'browser', type: DraftColumnType.String },
                { name: 'version', type: DraftColumnType.String },
                { name: 'minor_version', type: DraftColumnType.String },
                { name: 'usage', type: DraftColumnType.Int },
            ];

            // Input
            const options: any = {
                chartOptions: {
                    chartType: ChartType.Donut,
                    columnsSelection: {
                        xAxis: columns[0], // browser
                        yAxes:  [columns[3]], // usage
                        splitBy: [columns[1], columns[2]] // version, minor_version
                    },
                    utcOffset: 0
                },
                queryResultData: {
                    rows: rows,
                    columns: columns
                }
            }

            // Act
            const result = DataTransformer.getCategoriesAndSeries(options, /*isDatetimeAxis*/ false);

            const expectedCategoriesAndSeries: ICategoriesAndSeries = {
                series: [{
                    name: 'browser',
                    data: [
                        { name: 'Internet Explorer',  y: 20 },
                        { name: 'Chrome', y: 50 },
                        { name: 'Firefox', y: 10 },
                        { name: 'Safari', y: 20 }
                    ]
                }, 
                {
                    name: 'version',
                    data: [
                        { name: 'v8', y: 19 },
                        { name: 'v11', y: 1 },
                        { name: 'v65', y: 25 },
                        { name: 'v66', y: 25 },
                        { name: 'v58', y: 7 },
                        { name: 'v59', y: 3 },
                        { name: 'v11', y: 20 }
                   ]
                }, 
                {
                    name: 'minor_version',
                    data: [
                        { name: '0', y: 10 },
                        { name: '1', y: 1 },
                        { name: '2', y: 5 },
                        { name: '3', y: 3 },
                        { name: '0', y: 1 },
                        { name: '0', y: 5 },
                        { name: '1', y: 20 },
                        { name: '0', y: 15 },
                        { name: '1', y: 5 },
                        { name: '2', y: 5 },
                        { name: '0', y: 5 },
                        { name: '1', y: 2 },
                        { name: '0', y: 3 },  
                        { name: '0', y: 20 }
                   ]
                }],
                categories: []
            };

            // Assert
            validateResults(result, expectedCategoriesAndSeries);
        });

        //#endregion getPieCategoriesAndSeriesForSplitBy
    });
   
    //#endregion Tests
});