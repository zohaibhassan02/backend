const mongoose = require("mongoose");
const UserAuthModal = new mongoose.Schema(
    {
        fullName: {
            type: String,
            require: true,
            trim: true,
            min: 10,
            max: 20,
        },

        email: {
            type: String,
            require: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
        },
        // role: {
        //     type: String,
        //     enum: ["superAdmin", "admin", "user"],
        //     default: "user",
        // },
        companyName: {
            type: String,
            require: true,
            min: 10,
            max: 20,
        },
        hearFrom: {
            type: String,
            require: true,
            trim: true,
            min: 10,
            max: 20,
        },
        subusers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "subusers",
        }]

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("users", UserAuthModal);
