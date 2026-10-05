export default (err, req, res, next) => {

    console.log(err);
    const statusCode = err.cause || err.status || 500;
    res.status(statusCode).json({
        message: err.message
    });

};