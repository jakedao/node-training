const DB_ERROR = {
  CAST_ERROR: 'CastError',
  VALIDATION_ERROR: 'ValidationError',
  DUPLICATED_FIELDS: 11000,
};

const TOKEN_ERROR = {
  TOKEN_ERROR: 'JsonWebTokenError',
  TOKEN_EXPIRED: 'TokenExpiredError',
};

module.exports = {
  DB_ERROR,
  TOKEN_ERROR,
};
