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
// User Type
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
// Get User Query
// This query retrieves the authenticated user's information.
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
// Register Mutation
// This mutation allows a new user to register by providing an email and password.
// It checks if the user already exists and hashes the password before saving it to the database.
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

// Login Mutation
// This mutation allows a user to log in by providing an email and password.
// It checks if the user exists, verifies the password, and generates a JWT token for authentication.
// If 2FA is enabled, it also verifies the OTP token.
// It also implements rate limiting to prevent brute-force attacks.
// Rate limiting is implemented using an in-memory map to track login attempts based on the user's IP address.
const loginAttempts = new Map(); // IP -> { count, timestamp }
const RATE_LIMIT_MAX = process.env.LOGIN_ATTEMPTS; // x login attempts
const RATE_LIMIT_WINDOW = process.env.LOGIN_WINDOW * 60 * 1000; // in x minutes
const LoginMutation = {
  type: GraphQLString,
  args: {
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    token: { type: GraphQLString },
  },
  async resolve(_, { email, password, token }, { req }) {
    /* RATE LIMITING */
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "unknown";
    // Clean old entries
    const now = Date.now();
    const entry = loginAttempts.get(ip);
    if (entry && now - entry.timestamp > RATE_LIMIT_WINDOW) {
      loginAttempts.delete(ip);
    }

    // Rate limiting
    const attempts = loginAttempts.get(ip) || { count: 0, timestamp: now };
    if (attempts.count >= RATE_LIMIT_MAX) {
      console.warn(`🚨 Rate limit exceeded for login: ${ip}`);
      throw new Error("Login failed.");
    }

    /* LOGIN LOGIC */
    const user = await User.findOne({ email });
    if (!user) {
      /* RATE LIMIT: If login fails, increase count: */
      attempts.count++;
      attempts.timestamp = now;
      loginAttempts.set(ip, attempts);
      throw new Error("Login failed.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      /* RATE LIMIT: If login fails, increase count: */
      attempts.count++;
      attempts.timestamp = now;
      loginAttempts.set(ip, attempts);
      throw new Error("Login failed.");
    }

    // If 2FA is enabled, require OTP
    if (user.isTwoFAEnabled) {
      if (!token) throw new Error("Login failed.");

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token,
      });

      if (!verified) {
        /* RATE LIMIT: If login fails, increase count: */
        attempts.count++;
        attempts.timestamp = now;
        loginAttempts.set(ip, attempts);
        throw new Error("Login failed.");
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return jwtToken;
  },
};

// Setup 2FA Mutation
// This mutation sets up 2FA for the authenticated user.
// It generates a secret key and a QR code URL for the user to scan with their authenticator app.
const Setup2FAMutation = {
  type: GraphQLString,
  args: {},
  async resolve(_, __, context) {
    const userId = authMiddleware(context);
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const secret = speakeasy.generateSecret({
      name: `ABS Blogger (${user.email})`,
    });
    user.twoFASecret = secret.base32;
    await user.save();

    return new Promise((resolve, reject) => {
      QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) reject(err);
        resolve(data_url);
      });
    });
  },
};

// Verify and enable 2FA Mutation
// This mutation verifies the OTP token provided by the user.
// It checks if the token is valid and enables 2FA for the user.
const Verify2FAMutation = {
  type: GraphQLBoolean,
  args: { token: { type: GraphQLString } },
  async resolve(_, { token }, context) {
    const userId = authMiddleware(context);
    const user = await User.findById(userId);
    if (!user || !user.twoFASecret)
      throw new Error("2FA is not set up for this account");

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
    });

    if (!verified) throw new Error("Invalid 2FA code");

    user.isTwoFAEnabled = true;
    await user.save();

    return true;
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
    //register: RegisterMutation, // Public
    login: LoginMutation, // Public
    //setup2FA: Setup2FAMutation, // Private
    //verify2FA: Verify2FAMutation, // Private
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});