export const validator = (schema) => {
    return (req, res, next) => {
        try {
            const language =
                req.headers["accept-language"] || "en";

            const result = schema(language).safeParse({
                body: req.body,

                params: req.params,

                query: req.query,

                headers: req.headers
            });

            if (!result.success) {
                return res.status(400).json({
                    message: "validation error",
                    issues: result.error.issues
                });
            }

            req.validated = result.data;

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default validator;