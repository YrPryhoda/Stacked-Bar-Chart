const http = require("http");
const ChartService = require('./chartService');
const PORT = 3000;
const host = '127.0.0.1';

const postRequest = (req, callback) => {
    let body = '';
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', () => {
        const data = body.toString()
        callback(data)
    });
}

const server = http.createServer((req, res) => {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/') {
        postRequest(req, (body) => {
            ChartService.findFormsByParams(body, (err, data) => {
                res.writeHead(200, headers);
                err && console.log(err);
                return res.end(err ? err.message : JSON.stringify(data))
            })
        })
    }

    if (req.method === 'GET' && req.url === '/config') {
        ChartService.findChartOptions((err, data) => {
            res.writeHead(200, headers);
            err && console.log(err);
            return res.end(err ? err.message : JSON.stringify(data))
        })
    }

    if (req.method === 'POST' && req.url === '/config') {
        postRequest(req, (body) => {
            ChartService.setChartLangOrSpec(body, (err) => {
                res.writeHead(200, headers);
                err && console.log(err);
                return res.end(err ? err.message : body)
            })
        })
    }

    if (req.method === 'POST' && req.url === '/cities') {
        postRequest(req, (body) => {
            ChartService.setChartCities(body, (err) => {
                res.writeHead(200, headers);
                err && console.log(err);
                return res.end(err ? err.message : body)
            })
        })
    }
});

server.listen(PORT, host, () => {
    console.log(`Server is running on ${host}:${PORT}`)
});