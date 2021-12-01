const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const initData = require('../data');
const wss = require('./wss');

const createdDbCallback = (err, name) => {
    if (err) return console.error(err.message);
    console.log(`Connected to the ${name} database.`);
}

const formsDB = new sqlite3.Database('./db/forms.sqlite', (e) => createdDbCallback(e, 'forms'));
const chartDB = new sqlite3.Database('./db/chartOptions.sqlite', (e) => createdDbCallback(e, 'chartOptions'));

class ChartService {
    constructor() {
        this.countFormsRows((err) => {
            if (err?.message === 'SQLITE_ERROR: no such table: forms') {
                this.readInitialTableConfig(formsDB, './db/db_forms_init.sql', this.fillWithForms)
            }
        })
        this.findChartOptions((err) => {
            if (err?.message === 'SQLITE_ERROR: no such table: chartOptions') {
                this.readInitialTableConfig(chartDB, './db/db_chart_init.sql', this.fillInitialChartConfig)
            }
        })
    }

    findFormsByParams(langOrSpec, callback) {
        const query = 'SELECT city, salary, position, experience, language, specialization ' +
            'FROM forms ' +
            'WHERE language=? OR specialization=?';
        formsDB.all(query, langOrSpec, langOrSpec, (e, data) => {
            wss.send({
                type: 'langOrSpecSelected',
                data: {forms: data, lang: langOrSpec}
            })
            callback(e, data)
        })
    }

    findChartOptions(callback) {
        const query = 'SELECT * FROM chartOptions WHERE id=1';
        chartDB.get(query, callback);
    }

    setChartLangOrSpec(value, callback) {
        const query = 'UPDATE chartOptions SET langOrSpec=? WHERE id = 1'
        chartDB.run(query, value, (err) => {
            callback(err)
        });
    }

    setChartCities(value, callback) {
        const citiesStr = value.toString();
        const query = 'UPDATE chartOptions SET cities=? WHERE id = 1'
        chartDB.run(query, citiesStr, (err) => {
            wss.send({
                    type: 'citiesSelected',
                    data: {cities: value}
                }
            )
            callback(err)
        });
    }

    fillInitialChartConfig() {
        const query = 'INSERT INTO chartOptions (langOrSpec, cities) VALUES ("JavaScript", null)';
        chartDB.run(query)
    }

    fillWithForms = () => {
        console.log('Start filling DB ...')
        const query = 'INSERT INTO forms VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        initData.forEach(form => formsDB.run(query, form));
        this.countFormsRows((err, data) => console.log(data['COUNT(id)'], 'Total rows created'))
    }

    countFormsRows = (callback) => {
        const countQuery = 'SELECT COUNT(id) from forms';
        return formsDB.get(countQuery, callback)
    }

    readInitialTableConfig = (db, path, callback) => {
        db.run(String(fs.readFileSync(path)), callback)
    }
}


module.exports = new ChartService;