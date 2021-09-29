# state-stats

This is a simple program written in NodeJS that takes in some statistical information in the form of two CSV files and performs some basic calculations on it.

## Table of Contents
- [Prerequisities](#prerequisities)
- [Installing](#install)

### Prerequisites
You must have NodeJS version v14.16.0 or later installed to run this program.

**NOTE: This program uses ES6 modules, and thus it can only run in NodeJS versions of at least v14.16.0 or later! Please make sure your NodeJS version is compatible with this program.**

### Installing

1. Clone the repository.
```
git clone https://github.com/vanderheim/state-stats.git
```

2. cd into the directory and run npm install. This will install all the libraries that are required by the program.
```
npm install
```

3. Run the program (index.js). This program takes two named arguments: --states and --population. You can also run it with the --help argument to get a brief overview of what the program does and how the former arguments work. Point the states and population arguments to your CSV files. An example run has been included below.

```
node index.js --states states.csv --population population-by-zip-code.csv
```

This will output a stringified JSON of the computed statistics in the following format:
```
{
  "pop_total_by_state": [
    {"massachusetts": 324},
    {"maine": 324},
    ...
  ],
  "average_pop_per_zip": 324,
  "average_pop_per_state": 324
}
```

After you're done, you can now take the output from this program and run it through the State Stats SQL program, which will convert the data to SQL database query statements.

Ths states SQL program repository can be found here https://github.com/vanderheim/state-stats-sql
