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

if ('help' in argv) {
    console.log('This program takes 2 csv files.');
}

fs.createReadStream(argv['states'])
  .pipe(csv())
  .on('data', (row) => {
    let formattedState = row['Long']
    .replace(' ', '_')
    .toLowerCase();

    if (!(formattedState in states)) {
        states[formattedState] = 0;
    }

    const zipCodesArray = row[' Zip Codes']
    .slice(1)
    .replace(/[^0-9 ]/g, '')
    .split(' ');
    //console.log(row[' Zip Codes'], zipCodesArray)

    for (let i = 0; i < zipCodesArray.length; i++) {
        zipCodes[zipCodesArray[i]] = formattedState;
    }
    
  })
  .on('end', () => {
    fs.createReadStream(argv['population'])
    .pipe(csv())
    .on('data', (row) => {        
        let population = parseInt(row[' Population'].slice(1));

        states[zipCodes[row['Zip Code']]] += population;

        avgPerZip += population;
        zipCodesTotal++;
    })
    .on('end', () => {
    
        const finalResultJSON = {
            "pop_total_by_state": [],
            "average_pop_per_zip": 0,
            "average_pop_per_state": 0,
        };

        for (let state in states) {

            let stateTotal = {};
            stateTotal[state] = states[state];

            avgPerState += states[state];
            
            finalResultJSON['pop_total_by_state'].push(stateTotal);
        };

        avgPerState = parseInt(avgPerState / Object.keys(states).length);
        finalResultJSON['average_pop_per_state'] = avgPerState;

        avgPerZip = parseInt(avgPerZip / zipCodesTotal);
        finalResultJSON['average_pop_per_zip'] = avgPerZip;

        process.stdout.write(JSON.stringify(finalResultJSON));
    });
  });
