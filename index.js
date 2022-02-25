// SETUP
const express = require('express');
const { collection } = require('handlebars-helpers/lib');
const hbs = require('hbs');
const async = require('hbs/lib/async');
const waxOn = require('wax-on');
const MongoUtil = require("./MongoUtil.js");
const ObjectId = require('mongodb').ObjectId; 
const helpers = require('handlebars-helpers')(
    {
        'handlebars':hbs.handlebars
    }
);
require('dotenv').config();

async function main() {

    // 1A. SETUP EXPRESS application
    let app = express();

    // 1B. SETUP VIEW ENGINE
    app.set('view engine', 'hbs');

    // 1C. SETUP STATIC FOLDER
    app.use(express.static('public')); // set up static file for images, css

    // 1D. SETUP WAX ON (FOR TEMPLATE INHERITANCE)
    waxOn.on(hbs.handlebars);
    waxOn.setLayoutPath('./views/layouts'); // set up templates

    // 1E. ENABLE FORMS
    app.use(express.urlencoded({ extended: false }));

    // 1F. Connect to Mongo
    await MongoUtil.connect(process.env.MONGO_URI, process.env.DBNAME);
    let db = MongoUtil.getDB();
    let CAR_INFO = db.collection( process.env.COLLECTION_CAR )
    let CAR_OWNER = db.collection( process.env.COLLECTION_OWNER )
    let CAR_REFERENCE = db.collection( process.env.COLLECTION_REFERENCE )

    //ROUTES
    app.get('/', async (req,res)=>{
        
        res.render('index')
    })
    // OWNER ROUTE
    app.get('/owner', async (req,res)=>{
        let dataOwner = await CAR_OWNER.find().toArray();
        res.render('owners/owner')
    })
    // CAR ROUTE
    app.get('/car', async (req,res)=>{
        let dataCar = await CAR_INFO.find().toArray();
        res.render('cars/car')
    })
    // REFERENCE ROUTE
    app.get('/reference', async (req,res)=>{
        let dataReference = await CAR_REFERENCE.find().toArray();
        res.render('references/reference')
    })

    // LISTEN
    app.listen(3000, function () {
        console.log("...We Are Serving...")
    })
}
main();