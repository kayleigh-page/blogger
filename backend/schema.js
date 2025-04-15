const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
} = require("graphql");
const { GraphQLJSON } = require("graphql-type-json");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const authMiddleware = require("./middleware/auth");

