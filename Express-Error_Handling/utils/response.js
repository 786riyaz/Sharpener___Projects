const sendErrorResponse = (res, err) => {
    let statusCode = err.statusCode;
    let message = err.message;
  return res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default sendErrorResponse;
