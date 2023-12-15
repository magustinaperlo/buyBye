"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
class User extends sequelize_1.Model {
}
exports.User = User;
const sequelize = new sequelize_1.Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '123456789',
    database: 'challenge_buybye',
});
exports.sequelize = sequelize;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isName: true,
        },
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        set(value) {
            const hashedPassword = bcrypt_1.default.hashSync(value, 10);
            this.setDataValue('password', hashedPassword);
        },
    },
    cpf: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isCpf: true,
        },
    },
    birthdate_date: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isBirthdatedate: true,
        },
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isPhone_number: true,
        },
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isState: true,
        },
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isCity: true,
        },
    },
    active: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isActive: true,
        },
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
});
User.prototype.comparePassword = function (candidatePassword) {
    return bcrypt_1.default.compareSync(candidatePassword, this.password);
};
