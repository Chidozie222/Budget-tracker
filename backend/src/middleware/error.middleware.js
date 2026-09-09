export const error = (err, req, res, next) => {
  console.log(err);
  let statusCode = 500;
  let message = "something went wrong";

  switch (err.code) {
    case "23505":
      statusCode = 409;
      message = "A record with this value already exists";
      break;
    case "23503":
      statusCode = 400;
      message = "This record references data that does not exist.";
      break;
    case "23502":
      statusCode = 400;
      message = "A required field is missing";
      break;
    case "23P02":
      statusCode = 400;
      message = "Invalid data format,";
      break;
    default:
      message = "Internal server error";
  }

  res.status(statusCode).json({
    message,
  });
};
