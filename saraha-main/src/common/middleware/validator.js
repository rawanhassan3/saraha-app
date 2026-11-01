
export const validator = (schema) => {
    return (req, res, next) => {
        try {
            const language =
                req.headers["accept-language"] || "en";

            // Support both function schemas and regular Zod schemas
            const validationSchema =
                typeof schema === "function"
                    ? schema(language)
                    : schema;

            const result = validationSchema.safeParse({
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
