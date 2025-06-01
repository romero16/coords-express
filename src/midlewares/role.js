const HttpStatus = require('../enums/status.enum');

const authorizeRole = (...requiredRoles) => {
  return (req, res, next) => {
    const user = req.user;
    
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    const hasValidRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (hasValidRole) {
      return next();
    }

    return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Acceso no autorizado!' });
  };
};

module.exports = authorizeRole;
