import passport from "passport";

export const isUser = (req, res, next) => {
    passport.authenticate("jwt", function (error, user, info) {
        if (error) {
            return res.status(500).send({ status: "error", message: "Authentication error" });
        }
        if (!user || !user.user) {
            return res.status(401).send({ status: "error", message: "Unauthorized" });
        }

        req.user = user;
        req.logger.debug(req.user);

        if (req.user.user.role === "user" || req.user.user.role === "premium") {
            return next();
        } else {
            return res.status(403).send({ status: "error", message: "User role required" });
        }
    })(req, res, next);
};