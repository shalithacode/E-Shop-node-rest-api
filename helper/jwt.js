const { expressjwt: jwt } = require("express-jwt");

require("dotenv/config");

async function isRevoked(req, jwt) {
  const payload = jwt.payload;
  if (!payload.isAdmin) {
    return true;
  }
  return false;
}

const authJwt = () => {
  return jwt({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/upload(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/product(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/category(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/order(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      "/user/login",
      "/user/register",
    ],
  });
};
module.exports = authJwt;
