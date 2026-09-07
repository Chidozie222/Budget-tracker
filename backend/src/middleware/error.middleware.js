export const error = (err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    message: `something is wrong`,
  });
};
