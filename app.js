
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cors = require('cors');
const fileupload = require('express-fileupload');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const {connectDB} = require('./src/config/dbconnect');

var RouterMetadataD1 = require('./src/Router/MetadataD1');
var RouterMetadataD3 = require('./src/Router/MetadataD3');
var RouterMetadataGala = require('./src/Router/MetadataGala');
var RouterAuth = require('./src/Router/Auth');
var RouterImage = require('./src/Router/Image');
var RouterCurry = require('./src/Router/Curry');

var RouterLocker = require('./src/Router/Locker');
var RouterSubscribeEmail = require('./src/Router/SubscribeEmail');
const RouterStripe = require('./src/Router/Stripe');
const RouterPaymentInfo = require('./src/Router/PaymentInfo');
const RouterSnapShot = require('./src/Router/SnapShot');

const cronJob = require('./src/cronJob');
const {watchEtherTransfers} = require('./src/Controller/HolderD1Controller');
const {setQuantityByScript} = require('./src/Controller/SnapShotController');

require("dotenv").config();


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "Express API server"
        },
        servers: [
            {
                url: "https://backend.lunamarket.io/"
            },
            {
                url: "https://staging.backend.lunamarket.io/"
            },
            {
                url: "http://localhost:5000/"
            }
        ]       
    },
    apis: ["./src/router/*.js"]
}

const specs = swaggerJsDoc(options);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(fileupload());

// Default
app.get('/', (req, res)=> {
    res.json({
        message: `Welcome to Luna Server — ${process.env.NODE_ENV}`
    })
});


//connect Router
app.use('/api/metadata/drop1', RouterMetadataD1);
app.use('/api/metadata/drop3', RouterMetadataD3);
app.use('/api/metadata/gala', RouterMetadataGala);
app.use('/api/auth', RouterAuth);
app.use('/api/image', RouterImage);
app.use('/api/curry', RouterCurry);
app.use('/api/locker', RouterLocker);
app.use('/api/subscribe/email', RouterSubscribeEmail);
app.use('/api/stripe', RouterStripe);
app.use('/api/paymentinfo', RouterPaymentInfo);
app.use('/api/snapshot', RouterSnapShot);

//swagger doc
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

// cron job
if (process.env.NODE_ENV == 'production') {
    cronJob();
}

// watchEtherTransfers();

// setQuantityByScript();


module.exports = app;