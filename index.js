import csv from 'csv-parser';
import fs from 'fs';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
let argv = require('minimist')(process.argv.slice(2));

const zipCodes = {};
const states = {};
let avgPerState = 0;
let avgPerZip = 0;
let zipCodesTotal = 0;

// Display help message if --help was called.
if ('help' in argv) {
    console.log('This program takes 2 arguments, one for state data and one for zip code population data. It outputs a stringified JSON file for further processing.');
    console.log('--states           Location of state info CSV file.')
    console.log('--population       Location of populations by zip code CSV file.')
} else {
    // Since we are dealing with potentially large files, we can use the stream API to read in chunks instead of loading the entire file into memory.
    // Step 1: Build a dictionary to easily look up states by their zip code.
    fs.createReadStream(argv['states'])
        .pipe(csv())
        .on('data', (row) => {

            // Format the zip codes column for processing.
            let formattedState = row['Long']
                .replace(' ', '_')
                .toLowerCase();

            if (!(formattedState in states)) {
                states[formattedState] = 0;
            }

            // Format the zip codes column for processing.
            const zipCodesArray = row[' Zip Codes']
                .slice(1)
                .replace(/[^0-9 ]/g, '')
                .split(' ');

            // Build a dictionary, mapping states to zip codes for the next step.
            for (let i = 0; i < zipCodesArray.length; i++) {
                zipCodes[zipCodesArray[i]] = formattedState;
            }
        })
        .on('end', () => {

            // Step 2: Build final result using previously built dictionary.
            fs.createReadStream(argv['population'])
                .pipe(csv())
                .on('data', (row) => {
                    let population = parseInt(row[' Population'].slice(1));

                    states[zipCodes[row['Zip Code']]] += population;

                    avgPerZip += population;
                    zipCodesTotal++;
                })
                .on('end', () => {

                    // Build our final JSON output.
                    const finalResultJSON = {
                        "pop_total_by_state": [],
                        "average_pop_per_zip": 0,
                        "average_pop_per_state": 0,
                    };

                    // Populate our total population array and start calculating state average.
                    for (let state in states) {
                        let stateTotal = {};
                        stateTotal[state] = states[state];

                        avgPerState += states[state];

                        finalResultJSON['pop_total_by_state'].push(stateTotal);
                    };

                    // Finalize calculations for state and zip code averages.
                    avgPerState = parseInt(avgPerState / Object.keys(states).length);
                    finalResultJSON['average_pop_per_state'] = avgPerState;

                    avgPerZip = parseInt(avgPerZip / zipCodesTotal);
                    finalResultJSON['average_pop_per_zip'] = avgPerZip;

                    process.stdout.write(JSON.stringify(finalResultJSON));
                });
        });
}