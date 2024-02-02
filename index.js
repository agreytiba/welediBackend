const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

require('dotenv').config();
const app = express();
const cors = require('cors');
const port = 8080;
const websiteName = 'weledi.com'; /// add your domain like this format domain.com

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(cors());
app.use("/api/checkout", require("./Routes/payment"));
const stripe = require('stripe')(process.env.STRIPE_SECRET);
app.post('/api/pay', async (req, res) => {
    var price = req.body.price;
    price = parseInt(price) * 100;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: price,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: 'accept_a_payment' },
    });
    res.json({ client_secret: paymentIntent['client_secret'], server_time: Date.now() });
});
app.post('/api/check', async (req, res) => {
    const accountType = req.body.accountType;
    const expDate = req.body.expDate;
    var specific_date = new Date(expDate);
    var current_date = new Date();
    /// We need to get account membership type - expiration. and check if the user can download the resume
    if (current_date.getTime() < specific_date.getTime()) {
        res.json({ status: 'true' });
    } else {
        res.json({ status: 'false' });
    }
});

app.post('/api/date', async (req, res) => {
    var current_date = new Date();
    res.json({ date: current_date });
});

app.get('/api/resume', async (req, res) => {});
///
app.post('/api/export', async (req, res) => {
   
    try {
        (async () => {
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: '/snap/bin/chromium' });
            const page = await browser.newPage();
            console.log('navigating to :  ');
            console.log('https://' + websiteName + '/export/' + req.body.resumeName + '/' + req.body.resumeId + '/' + req.body.language);
            await page.goto('https://' + websiteName + '/export/' + req.body.resumeName + '/' + req.body.resumeId + '/' + req.body.language, {
                timeout: 60000,
            });
            await page.waitForSelector('#resumen', {
                visible: true,
            });
            await page.waitFor(3000);

            var pdf = await page.pdf({ path: 'hn.pdf', format: 'a4' });
            await browser.close();

            res.download('./hn.pdf');
        })();
    } catch (error) {}
});



/// Just to check if api is working
app.get('/api/return', async (req, res) => {
    res.end('Hello World\n');
});

// ...


// Listen both http & https ports
const httpsServer = https.createServer(
    {
        // UPDATE 1.0.0 No need to update this 2 lines
        key: fs.readFileSync('/etc/letsencrypt/live/' + weledi.com + '/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/' + weledi.com + '/fullchain.pem'),
    },
    app
);

//  const httpServer = http.createServer({

//    }, app);

httpsServer.listen(port, () => {
    console.log('HTTPS Server running on port ' + port);
});


