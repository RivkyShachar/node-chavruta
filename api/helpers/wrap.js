exports.asyncHandler = (asyncFn) => {
    return async (req, res) => {
        try {
            await asyncFn(req, res);
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ msg: "Email already in use, try logging in" });
            }
            console.error(err);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    };
};