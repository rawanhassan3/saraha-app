import mongoose from "mongoose";
import * as enums from "../../common/index.js";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 30,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 30,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: function () {
                return this.provider === enums.providerEnum.system;
            },
            minLength: 6
        },

        phone: {
            type: String
        },

        DOB: {
            type: Date
        },

        gender: {
            type: Number,
            enum: Object.values(enums.genderEnum),
            default: enums.genderEnum.male
        },

        image: {
            type: String
        },

        deletedAt: {
            type: Date
        },

        confirmEmail: {
            type: Date,
            default: new Date()
        },

        provider: {
            type: Number,
            enum: Object.values(enums.providerEnum),
            default: enums.providerEnum.system
        },

        role: {
            type: Number,
            enum: Object.values(enums.roleEnum),
            default: enums.roleEnum.user
        }
    },
    {
        timestamps: true,
        strict: true,
        strictQuery: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

userSchema
    .virtual("fullName")
    .set(function (value) {
        if (value && typeof value === "string") {
            const [firstName, lastName] = value.split(" ");

            this.firstName = firstName;
            this.lastName = lastName;
        }
    })
    .get(function () {
        return `${this.firstName} ${this.lastName}`;
    });

const User = mongoose.model("user", userSchema);

export const userModel = User;

export default User;