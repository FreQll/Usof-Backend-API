const jwt = require("jsonwebtoken");

const checkAdminRights = (req, res, next) => {
    try {
        const token = req.cookies.token;
        const user = jwt.verify(token, process.env.SECRET_KEY);
        if (user.role !== "admin") {
            return res.status(401).send("Access denied");
        }
        return next();
    }
    catch(err) {
        return res.status(401).send("Invalid Token");
    }
};

module.exports = checkAdminRights;