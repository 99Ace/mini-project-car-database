// ==========================================================
// SETUP ALL DEPENDENCIES
const express = require('express');
const { collection } = require('handlebars-helpers/lib');
const hbs = require('hbs');
const async = require('hbs/lib/async');
const waxOn = require('wax-on');
const MongoUtil = require("./MongoUtil.js");
const ObjectId = require('mongodb').ObjectId;
const helpers = require('handlebars-helpers')(
    {
        'handlebars': hbs.handlebars
    }
);
require('dotenv').config();

async function main() {
    // ==========================================================
    // 1A. SETUP EXPRESS application
    // ==========================================================
    let app = express();

    // ==========================================================
    // 1B. SETUP VIEW ENGINE
    // ==========================================================
    app.set('view engine', 'hbs');

    // ==========================================================
    // 1C. SETUP STATIC FOLDER
    // ==========================================================
    app.use(express.static('public')); // set up static file for images, css

    // ==========================================================
    // 1D. SETUP WAX ON (FOR TEMPLATE INHERITANCE)
    // ==========================================================
    waxOn.on(hbs.handlebars);
    waxOn.setLayoutPath('./views/layouts'); // set up templates

    // ==========================================================
    // 1E. ENABLE FORMS
    // ==========================================================
    app.use(express.urlencoded({ extended: false }));

    // ==========================================================
    // 1F. CONNECT TO MONGODB
    // ==========================================================
    await MongoUtil.connect(process.env.MONGO_URI, process.env.DBNAME);
    let db = MongoUtil.getDB();
    let CAR_INFO = db.collection(process.env.COLLECTION_CAR)
    let CAR_OWNER = db.collection(process.env.COLLECTION_OWNER)
    let CAR_REFERENCE = db.collection(process.env.COLLECTION_REFERENCE)



    // ==========================================================
    // ROUTES
    // ==========================================================
    app.get('/', async (req, res) => {
        res.render('index')
    })

    // ==========================================================
    // OWNER ROUTE
    // ==========================================================
    // READ    
    app.get('/owner', async (req, res) => {
        let dataOwner = await CAR_OWNER.find().toArray();
        res.render('owners/owner', {
            'data': dataOwner
        })
    })
    // CREATE
    app.get('/owner/create', (req, res) => {
        res.render('owners/create_owner')
    })
    app.post('/owner/create', async (req, res) => {
        console.log(req.body)
        let {
            username, fname, lname, email, password, password_confirm
        } = req.body
        console.log(username, fname, lname, email, password, password_confirm)

        // Set the data into Object format which we will pass to mongodb later
        let newUser = {
            username,
            fname,
            lname,
            email,
            password,
            "ownership": [],
            "interest": []
        }
        console.log(newUser)
        // ***************
        // WRITE TO MONGO
        // ***************
        CAR_OWNER.insertOne(newUser)

        res.redirect("/owner")
    })
    // UPDATE
    app.get('/owner/:taskId/update', async (req, res) => {
        try {
            let taskId = req.params.taskId;
            let user = await CAR_OWNER.findOne(
                {
                    '_id': ObjectId(taskId)
                }
            )
            // console.log(user)
            // console.log(taskId)
            res.render("owners/update_owner.hbs", { user })
        } catch (e) {
            console.log(e)
        }
    })
    app.post('/owner/:taskId/update', async (req, res) => {
        try {
            let taskId = req.params.taskId;
            let user = await CAR_OWNER.findOne(
                {
                    '_id': ObjectId(taskId)
                }
            )
            let {
                username, fname, lname, email
            } = req.body

            let newUser = {
                username,
                fname,
                lname,
                email,
                password: user.password,
                "ownership": user.ownership,
                "interest": user.interest
            }
            console.log("......Edited DATA..........")
            console.log(newUser)
            console.log("...........................")

            // *************
            // UPDATE MONGO
            // *************
            CAR_OWNER.updateOne(
                {
                    '_id': ObjectId(taskId)
                },
                {
                    '$set': newUser
                }
            )

            res.redirect('/owner')
        } catch (e) {
            console.log(e)
            res.send(e)
        }
    })
    // DELETE
    app.get('/owner/:taskId/delete', async (req, res) => {
        let taskId = req.params.taskId;
        let user = await CAR_OWNER.findOne(
            {
                '_id': ObjectId(taskId)
            }
        )
        res.render('owners/delete_owner.hbs', { user })
    })
    app.post('/owner/:taskId/delete', async (req,res) =>{
        let taskId = req.params.taskId;
        let user = await CAR_OWNER.findOne(
            {
                '_id': ObjectId(taskId)
            }
        )
        await CAR_OWNER.deleteOne({
            _id:ObjectId( taskId )
        })
        res.redirect('/owner')
    })


    // ==========================================================
    // CAR ROUTE
    // ==========================================================
    // READ    
    app.get('/car', async (req, res) => {
        let dataCar = await CAR_INFO.find().toArray();
        res.render('cars/car')
    })
    // CREATE

    // UPDATE

    // DELETE

    // ==========================================================
    // REFERENCE ROUTE
    // ==========================================================
    // READ    
    app.get('/reference', async (req, res) => {
        let dataReference = await CAR_REFERENCE.find().toArray();
        res.render('references/reference')
    })
    // CREATE
    app.get('/car9/reference/create', (req,res) => {
        res.render('car9_reference/car_create')
    })
    // UPDATE

    // DELETE


    // ==========================================================
    // LISTEN
    // ==========================================================
    app.listen(3000, function () {
        console.log("...We Are Serving...")
    })
}
main();