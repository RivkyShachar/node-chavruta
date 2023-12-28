exports.asyncHandler = (asyncFn) => {
    return async (req, res) => {
        try {
            await asyncFn(req, res);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    };
};