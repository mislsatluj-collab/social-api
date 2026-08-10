const trackingService = require("./tracking.service");

// Generate Tracking Link
exports.generateTrackingLink = async (req, res, next) => {

    try {

        const trackingLink =
            await trackingService.generateTrackingLinkService(
                req.params.campaignId,
                req.user._id
            );

        return res.status(200).json({
            success: true,
            trackingLink: `${process.env.BASE_URL}/s/${trackingLink.trackingCode}`
        });

    } catch (error) {

        next(error);

    }

};

// Public Redirect with Deep Link Interceptor
exports.redirect = async (req, res, next) => {
    try {
        const redirectUrl = await trackingService.redirectService(req.params.trackingCode, req);

        // Instantly redirect to the destination URL
        return res.redirect(302, redirectUrl);

    } catch (error) {
        next(error);
    }
};