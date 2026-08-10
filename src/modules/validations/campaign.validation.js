exports.createCampaign = [
    {
        name: "title",
        required: true,
        type: "string",
        min: 3,
        max: 150
    },
    {
        name: "description",
        required: true,
        type: "string",
        min: 5,
        max: 5000
    },
    {
        name: "mediaType",
        required: true,
        type: "string",
        enum: ["image", "video", "none"]
    },
    {
        name: "shareLink",
        required: true,
        type: "string"
    }
];