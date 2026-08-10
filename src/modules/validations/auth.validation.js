exports.sendOTP = [
    {
        name: "email",
        required: true,
        type: "string",
        min: 5,
        max: 100
    }
];

exports.verifyOTP = [
    {
        name: "email",
        required: true,
        type: "string"
    },
    {
        name: "otp",
        required: true,
        type: "string",
        min: 4,
        max: 6
    }
];

exports.completeProfile = [
    {
        name: "signupToken",
        required: true,
        type: "string"
    },
    {
        name: "name",
        required: true,
        type: "string",
        min: 2,
        max: 100
    },
    {
        name: "role",
        required: true,
        type: "string",
        enum: ["leader", "volunteer"]
    },
    {
        name: "mobile",
        required: true,
        type: "string",
        min: 10,
        max: 15
    }
];