const validate = (schema) => {

    return (req, res, next) => {

        const errors = [];

        for (const field of schema) {

            const value = req.body[field.name];

            // Required
            if (field.required) {

                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {
                    errors.push(`${field.name} is required.`);
                    continue;
                }

            }

            if (value === undefined || value === null) {
                continue;
            }

            // String
            if (
                field.type === "string" &&
                typeof value !== "string"
            ) {
                errors.push(`${field.name} must be a string.`);
                continue;
            }

            // Number
            if (
                field.type === "number" &&
                typeof value !== "number"
            ) {
                errors.push(`${field.name} must be a number.`);
                continue;
            }

            // Boolean
            if (
                field.type === "boolean" &&
                typeof value !== "boolean"
            ) {
                errors.push(`${field.name} must be a boolean.`);
                continue;
            }

            // Enum
            if (
                field.enum &&
                !field.enum.includes(value)
            ) {
                errors.push(
                    `${field.name} must be one of: ${field.enum.join(", ")}`
                );
            }

            // Min Length
            if (
                field.min &&
                typeof value === "string" &&
                value.length < field.min
            ) {
                errors.push(
                    `${field.name} must be at least ${field.min} characters.`
                );
            }

            // Max Length
            if (
                field.max &&
                typeof value === "string" &&
                value.length > field.max
            ) {
                errors.push(
                    `${field.name} cannot exceed ${field.max} characters.`
                );
            }

        }

        if (errors.length) {

            return res.status(400).json({
                success: false,
                errors
            });

        }

        next();

    };

};

module.exports = validate;