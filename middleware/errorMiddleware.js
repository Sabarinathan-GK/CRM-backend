const errorHandler = (err, req, res, next) =>{
    console.error(err.stack || err.message);

    let statusCode = err.statusCode || res.statusCode || 500;
    let message = err.message || "Internal Server Error";

    //Handle invalid MongoDb ObjectId
    if(err.name === "CastError"){
        statusCode = 400;
        message = "Invalid resource ID";
    }

    //Handle Mongoose Validation errors
    if(err.name === "ValidationError"){
        statusCode = 400;
        message = Object.values(err.errors)
        .map((error) => error.message)
        .join(",");
    }

    //Handle duplicate MongoDB values
    if(err.code === 11000){
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = field
        ? `${field} already exists`
        : "Duplicate value already exists";
    }

    res.status(statusCode).json({
        success : false,
        message
    });
};

module.exports = errorHandler;