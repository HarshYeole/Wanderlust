import jwt from "jsonwebtoken"

const verifyJWT = async(req, res, next) => {
    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split("")[1];
        }

        if(!token){
            token = req.cookies?.accessToken;
        }

        if(!token){
            return res
            .status(401)
            .json({
                success: false,
                message: "Access denied. Notoken provided"
            })
        }

        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decode
        next();
    } catch (error) {
        return res
        .status(401)
        .json({
            success: false,
            message: "Invalid or expired token"
        })
    }
}

export default verifyJWT