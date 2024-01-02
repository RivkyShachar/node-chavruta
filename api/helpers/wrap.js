exports.asyncHandler = (asyncFn) => {
    return async (req, res) => {
        try {
            await asyncFn(req, res);
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ msg: "Email already in use, try logging in" });
            }
            // Check for specific error types (e.g., validation errors, database errors) and provide appropriate messages
            if (err.name === 'ValidationError') {
                return res.status(400).json({ msg: "Validation error", error: err.message });
            }
            console.error(err);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    };
};