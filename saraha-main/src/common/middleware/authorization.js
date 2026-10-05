import { ForbiddenException } from "../exceptions/index.js";
export const authorization = (role) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                ForbiddenException("User is not authenticated");
            }
            if (req.user.role !== role) {
                ForbiddenException("Not allowed");
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

export default authorization;