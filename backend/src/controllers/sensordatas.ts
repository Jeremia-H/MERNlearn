import { RequestHandler } from "express";
import sensordataModel from "../models/sensordata";                                                                                          //It doesnt matter what we call the import, it just imports what we sepcified in the sensordata.ts as export
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { assertIsDefined } from "../util/assertIsDefined";

export const getSensorDatas: RequestHandler = async (req, res, next) => {                                                                    //changed this to asnyc so we can use await in the function.
    const authenticatedUserId = req.session.userId;
    try {                                                                                                                                    //Error Handling!
        assertIsDefined(authenticatedUserId);
        const sensordatas = await sensordataModel.find({userId: authenticatedUserId}).exec();                                                                             //With this we get the data from the database
        res.status(200).json(sensordatas);                                                                                                   // this catches the response from the await above as ok and then gives out the sensordata as json    
    } catch (error) {                                                                                                                        //Error Handling Part 2
        next(error);                                                                                                                         // give the error over to the next route.
    }
};

export const getSensorData: RequestHandler =async (req, res, next) => {                                                                      //This function will handle specific datapoints by using the ID mongoDB gives every entry
    const sensordataID = req.params.sensordataID;                                                                                            //This uses the ID we specify in the routes file after the : router.get("/:sensordataID"
    const authenticatedUserId = req.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(sensordataID)) {
            throw createHttpError(400, "Invalid sensordata ID")                                                                              // if the sensordataID is invalid we check here and give an error
        }

        const sensordata = await sensordataModel.findById(sensordataID).exec();                                                              //THis is similar to getting all data but now we can use the express function to just get a singular datapoint by its ID, which we use the const for
        if (!sensordata) {                                                                                                                   // doing error handlign if the sensordata is not found / null / unkown / etc.
            throw createHttpError(404, "Sensordata not found");                                                                              // this only throws an error if the string is similar to a real one, not if you only e.g. put "123" then you still get unkown error, for that we check earlier
        }

        if (!sensordata.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this note");
        }
        res.status(200).json(sensordata);
    } catch (error) {
        next(error);
        
    }
}

interface CreateSensorDataBody {                                                                                                             // Creating an interface so we can check ourselves if the Body Data is actually a string, we will also use this to check if the sensorname is actually included 
    sensorname?: string,
    grad?: string,
}

export const createSensorData: RequestHandler<unknown, unknown, CreateSensorDataBody, unknown> = async (req, res, next) => {                 //This Handler will be able to create new Data in our db, we pass the CreateSensorDataBody in the RequestHandler
    const sensorname = req.body.sensorname;                                                                                                  //telling it to use the sensorname we send to it via http.post
    const grad = req.body.grad;                                                                                                              //telling it to use the grad we send to it via http.post
    const authenticatedUserId = req.session.userId;
    try {

        assertIsDefined(authenticatedUserId);
        if (!sensorname) {                                                                                                                   // !sensorname means if the sensorname is false, which it is when it is undefined
            throw createHttpError(400, "data must have a sensorname");                                                                       // then we throw a 400 error
        }

        const newSensordata = await sensordataModel.create({                                                                                 //In here we now say we want to create a new entry in the db with the consts we created above
            userId: authenticatedUserId,
            sensorname: sensorname,
            grad: grad
        });

        res.status(201).json(newSensordata)                                                                                                  // saying new resource has been created
    } catch (error) {
        next(error);
        
    }
};

interface UpdateSensorDataParams {                                                                                                           // we need to define the interafce for sensordataID because we want to use it in the requesthandler and therefore we have to specify what type of data it is
    sensordataID: string,                                                                                                                    // we dont need the question mark after the sensordataID because it will always be there if we reach this place in the firsthand
}

interface UpdateSensorDataBody {                                                                                                             // we need this because we also use these in the requesthandler 
    sensorname?: string,
    grad?: string,
}

export const updateSensorData: RequestHandler<UpdateSensorDataParams, unknown, UpdateSensorDataBody, unknown> = async (req, res, next) => {
    const sensordataID = req.params.sensordataID;
    const newSensorname = req.body.sensorname;
    const newGrad = req.body.grad;
    const authenticatedUserId = req.session.userId;
    
    try {
        assertIsDefined(authenticatedUserId);
        
        if (!mongoose.isValidObjectId(sensordataID)) {
            throw createHttpError(400, "Invalid sensordata ID")                                                                              // if the sensordataID is invalid we check here and give an error, just copied from different controller
        }
        if (!newSensorname) {                                                                                                                // !sensorname means if the sensorname is false, which it is when it is undefined
            throw createHttpError(400, "data must have a sensorname");                                                                       // then we throw a 400 error
        }

        const sensordata = await sensordataModel.findById(sensordataID).exec();
        if (!sensordata) {                                                                                                                   // doing error handlign if the sensordata is not found / null / unkown / etc.
            throw createHttpError(404, "Sensordata not found");                                                                              // this only throws an error if the string is similar to a real one, not if you only e.g. put "123" then you still get unkown error, for that we check earlier
        }

        if (!sensordata.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this note");
        }

        sensordata.sensorname = newSensorname;
        sensordata.grad = newGrad;

        const updatedSensorData = await sensordata.save();                                                                                   // save method from mongoose 

        res.status(200).json(updatedSensorData);
    } catch (error) {
        next(error);
    }
}

export const deleteSensorData: RequestHandler =async (req,res,next) => {
    const sensordataID = req.params.sensordataID;
    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(sensordataID)) {
            throw createHttpError(400, "Invalid sensordata ID")                                                                              // if the sensordataID is invalid we check here and give an error, just copied from different controller
        }

        const sensordata = await sensordataModel.findById(sensordataID).exec();
        if (!sensordata) {                                                                                                                   // doing error handlign if the sensordata is not found / null / unkown / etc.
            throw createHttpError(404, "Sensordata not found");                                                                              // this only throws an error if the string is similar to a real one, not if you only e.g. put "123" then you still get unkown error, for that we check earlier
        }

        if (!sensordata.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this note");
        }


        await sensordata.deleteOne()                                                                                                         //deleting the document we found by the ID
        res.sendStatus(204);                                                                                                                 //sendStatus becasue we dont need the json

    } catch (error) {
        next(error);
    }
}