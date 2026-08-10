const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },

        role: {
            type: String,
            enum: ["leader", "volunteer", "admin"],
            required: true,
            index: true
        },

        leaderCode: {
            type: String,
            unique: true,
            sparse: true,
            uppercase: true,
            trim: true
        },

        joinedLeader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },

        profileImage: {
            type: String,
            default: ""
        },

        isVerified: {
            type: Boolean,
            default: true
        },

        state: {
            type: String,
            default: ""
        },

        district: {
            type: String,
            default: ""
        },

        pushToken: {
            type: String,
            default: ""
        },

        isProfileCompleted: {
            type: Boolean,
            default: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        referralCount: {
            type: Number,
            default: 0
        },

        password: {
            type: String,
            default: ""
        },

        failedLoginAttempts: {
            type: Number,
            default: 0
        },

        lockUntil: {
            type: Date,
            default: null
        },

        lastLogin: {
            type: Date,
            default: null
        },

        lastActiveAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Virtual: Leader -> Volunteers
userSchema.virtual("volunteers", {
    ref: "User",
    localField: "_id",
    foreignField: "joinedLeader"
});

module.exports = mongoose.model("User", userSchema);