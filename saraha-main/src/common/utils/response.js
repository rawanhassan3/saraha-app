export const response = ({ res, data = {}, status = 200, message = "done" } = {}) => {
    return res.status(status).json({ message, data });
};
export default response;
