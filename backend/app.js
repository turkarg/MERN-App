const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(cors({
    origin: 'http://localhost:3000', // React app origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Include PATCH
    allowedHeaders: ['Content-Type', 'Authorization'], // Include relevant headers
}));

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Allow-Control-Allow-Methods','GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/places',placesRoutes);
app.use('/api/users',usersRoutes);

app.use((req,res,next) => {
 throw new HttpError('Could not find url!',404);
});

app.use((error, req, res, next) => {
    if(req.file){
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 505).json(error.message || 'Some unknown error occured!');
});

mongoose
.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.o6jx5.mongodb.net/${process.env.DB_NAME}`)
.then(() => {
    app.listen(5000);
})
.catch(err => {
    console.log(err);
})
