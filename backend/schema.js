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

const User = require("./models/User");




/****************************************************************************************
 * GraphQL Types                                                                        *
 ****************************************************************************************/
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    twoFASecret: { type: GraphQLString },
    isTwoFAEnabled: { type: GraphQLBoolean },
  }),
});




/****************************************************************************************
 * GraphQL Queries                                                                      *
 ****************************************************************************************/
const GetUserQuery = {
  type: UserType,
  async resolve(_, __, req) {
    const userId = authMiddleware(req);
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return user;
  },
};




/****************************************************************************************
 * GraphQL Mutations                                                                    *
 ****************************************************************************************/
const RegisterMutation = {
  type: UserType,
  args: {
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  async resolve(_, { email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) { throw new Error("User already exists"); }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    
    await user.save();
    return user;
  },
};




/****************************************************************************************
 * GraphQL Exports                                                                      *
 ****************************************************************************************/
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // users
    getUser: GetUserQuery, // Private
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // users
    register: RegisterMutation, // Public
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});