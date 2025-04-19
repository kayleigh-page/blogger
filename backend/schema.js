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
const Site = require("./models/Site");
const BlogPost = require("./models/BlogPost");
const PortfolioItem = require("./models/PortfolioItem");
const NewsletterSubscriber = require("./models/NewsletterSubscriber");




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

// Site Type
const SiteType = new GraphQLObjectType({
  name: "Site",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    url: { type: GraphQLString },
    userId: { type: GraphQLString },
    description: { type: GraphQLString },
    picture: { type: GraphQLString },
  }),
});

// BlogPost Type
const BlogPostType = new GraphQLObjectType({
  name: "BlogPost",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    siteId: { type: GraphQLString },
    userId: { type: GraphQLString },
    content: { type: GraphQLString },
    description: { type: GraphQLString },
    keywords: { type: GraphQLString },
    publishTime: { type: GraphQLString },
    publishDate: { type: GraphQLString },
    image: { type: GraphQLString },
    imageCaption: { type: GraphQLString },
    imageAbstract: { type: GraphQLString },
    imageAlternativeHeadline: { type: GraphQLString },
    imageKeywords: { type: GraphQLString },
    twitterLabel1: { type: GraphQLString },
    twitterData1: { type: GraphQLString },
    twitterLabel2: { type: GraphQLString },
    twitterData2: { type: GraphQLString },
    articleSection: { type: GraphQLString },
    articleTag1: { type: GraphQLString },
    articleTag2: { type: GraphQLString },
    articleTag3: { type: GraphQLString },
    articleTag4: { type: GraphQLString },
    articleTag5: { type: GraphQLString },
  }),
});

// PortfolioItem Type
const PortfolioItemType = new GraphQLObjectType({
  name: "PortfolioItem",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    siteId: { type: GraphQLString },
    userId: { type: GraphQLString },
    content: { type: GraphQLString },
    repoLink: { type: GraphQLString },
    demoLink: { type: GraphQLString },
    liveLink: { type: GraphQLString },
    infoLink: { type: GraphQLString },
    description: { type: GraphQLString },
    keywords: { type: GraphQLString },
    publishTime: { type: GraphQLString },
    publishDate: { type: GraphQLString },
    image: { type: GraphQLString },
    imageCaption: { type: GraphQLString },
    imageAbstract: { type: GraphQLString },
    imageAlternativeHeadline: { type: GraphQLString },
    imageKeywords: { type: GraphQLString },
    twitterLabel1: { type: GraphQLString },
    twitterData1: { type: GraphQLString },
    twitterLabel2: { type: GraphQLString },
    twitterData2: { type: GraphQLString },
    articleSection: { type: GraphQLString },
    articleTag1: { type: GraphQLString },
    articleTag2: { type: GraphQLString },
    articleTag3: { type: GraphQLString },
    articleTag4: { type: GraphQLString },
    articleTag5: { type: GraphQLString },
  }),
});

// NewsletterSubscriber Type
const NewsletterSubscriberType = new GraphQLObjectType({
  name: "NewsletterSubscriber",
  fields: () => ({
    id: { type: GraphQLString },
    email: { type: GraphQLString },
    siteId: { type: GraphQLString },
    userId: { type: GraphQLString },
    comment: { type: GraphQLString },
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

// Get Sites Query
// This query retrieves all sites associated with the authenticated user.
const GetSitesQuery = {
  type: new GraphQLList(SiteType),
  async resolve(_, __, req) {
    const userId = authMiddleware(req);
    const sites = await Site.find({ userId });
    return sites;
  },
};
// Get Site Query
// This query retrieves a specific site by its ID.
const GetSiteQuery = {
  type: SiteType,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    const userId = authMiddleware(req);
    const site = await Site.findOne({ _id: id, userId });
    if (!site) throw new Error("Site not found");

    return site;
  },
};

// Get BlogPosts for user Query
// This query retrieves all blog posts associated with the authenticated user.
const GetUserBlogPostsCountQuery = {
  type: GraphQLInt,
  async resolve(_, __, req) {
    const userId = authMiddleware(req);
    return await BlogPost.countDocuments({ userId });
  },
};
const GetUserBlogPostsQuery = {
  type: new GraphQLList(BlogPostType),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  async resolve(_, { limit = 20, offset = 0 }, req) {
    const userId = authMiddleware(req);
    const blogPosts = await BlogPost.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(offset)
      .limit(limit);
    return blogPosts;
  },
};

// Get BlogPosts Query
// This query retrieves all blog posts associated with a specific site ID.
const GetBlogPostsCountQuery = {
  type: GraphQLInt,
  args: { siteId: { type: GraphQLString } },
  async resolve(_, {siteId}, req) {
    //const userId = authMiddleware(req);
    return await BlogPost.countDocuments({ siteId });
  },
};
const GetBlogPostsQuery = {
  type: new GraphQLList(BlogPostType),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
    siteId: { type: GraphQLString },
  },
  async resolve(_, { limit = 20, offset = 0, siteId }, req) {
    const blogPosts = await BlogPost.find({ siteId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(offset)
      .limit(limit);
    return blogPosts;
  },
};

// Get BlogPost Query
// This query retrieves a specific blog post by its ID.
const GetBlogPostQuery = {
  type: BlogPostType,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    const blogPost = await BlogPost.findById(id);
    if (!blogPost) throw new Error("BlogPost not found");

    return blogPost;
  },
};

// Get BlogPost by slug Query
// This query retrieves a specific blog post by its slug.
const GetBlogPostBySlugQuery = {
  type: BlogPostType,
  args: { slug: { type: GraphQLString } },
  async resolve(_, { slug }, req) {
    const blogPost = await BlogPost.findOne({ slug });
    if (!blogPost) throw new Error("BlogPost not found");

    return blogPost;
  },
};

// Get PortfolioItems for user Query
// This query retrieves all portfolio items associated with the authenticated user.
const GetUserPortfolioItemsCountQuery = {
  type: GraphQLInt,
  async resolve(_, __, req) {
    const userId = authMiddleware(req);
    return await PortfolioItem.countDocuments({ userId });
  },
};
const GetUserPortfolioItemsQuery = {
  type: new GraphQLList(PortfolioItemType),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  async resolve(_, { limit = 20, offset = 0 }, req) {
    const userId = authMiddleware(req);
    const portfolioItems = await PortfolioItem.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(offset)
      .limit(limit);
    return portfolioItems;
  },
};

// Get PortfolioItems Query
// This query retrieves all portfolio items associated with a specific site ID.
const GetPortfolioItemsCountQuery = {
  type: GraphQLInt,
  args: { siteId: { type: GraphQLString } },
  async resolve(_, { siteId }, req) {
    return await PortfolioItem.countDocuments({ siteId});
  },
};
const GetPortfolioItemsQuery = {
  type: new GraphQLList(PortfolioItemType),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
    siteId: { type: GraphQLString },
  },
  async resolve(_, { limit = 20, offset = 0, siteId }, req) {
    const portfolioItems = await PortfolioItem.find({ siteId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(offset)
      .limit(limit);
    return portfolioItems;
  },
};

// Get PortfolioItem Query
// This query retrieves a specific portfolio item by its ID.
const GetPortfolioItemQuery = {
  type: PortfolioItemType,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    const portfolioItem = await PortfolioItem.findById(id);
    if (!portfolioItem) throw new Error("PortfolioItem not found");

    return portfolioItem;
  },
};

// Get NewsletterSubscribers Query
// This query retrieves all newsletter subscribers associated with a specific site ID.
const GetNewsletterSubscribersCountQuery = {
  type: GraphQLInt,
  args: { siteId: { type: GraphQLString } },
  async resolve(_, { siteId }, req) {
    authMiddleware(req);
    return await NewsletterSubscriber.countDocuments({ siteId });
  },
};
const GetNewsletterSubscribersQuery = {
  type: new GraphQLList(NewsletterSubscriberType),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
    siteId: { type: GraphQLString },
  },
  async resolve(_, { limit = 20, offset = 0, siteId }, req) {
    authMiddleware(req);
    const newsletterSubscribers = await NewsletterSubscriber.find({ siteId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(offset)
      .limit(limit);
    return newsletterSubscribers;
  },
};

// Get NewsletterSubscribers for user Query
// This query retrieves all newsletter subscribers associated with the authenticated user.
const GetUserNewsletterSubscribersCountQuery = {
  type: GraphQLInt,
  async resolve(_, __, req) {
    const userId = authMiddleware(req);
    return await NewsletterSubscriber.countDocuments({ userId });
  },
};
const GetUserNewsletterSubscribersQuery = {
  type: new GraphQLList(NewsletterSubscriberType),
  args: {
    limit: { type: GraphQLInt },
    offset: { type: GraphQLInt },
  },
  async resolve(_, { limit = 20, offset = 0 }, req) {
    const userId = authMiddleware(req);
    const newsletterSubscribers = await NewsletterSubscriber.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(offset)
      .limit(limit);
    return newsletterSubscribers;
  },
};
// Get NewsletterSubscriber Query
// This query retrieves a specific newsletter subscriber by its ID.
const GetNewsletterSubscriberQuery = {
  type: NewsletterSubscriberType,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    authMiddleware(req);
    const newsletterSubscriber = await NewsletterSubscriber.findById(id);
    if (!newsletterSubscriber)
      throw new Error("NewsletterSubscriber not found");
    return newsletterSubscriber;
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

// Add Site Mutation
// This mutation adds a new site for the authenticated user.
const AddSiteMutation = {
  type: SiteType,
  args: {
    name: { type: GraphQLString },
    url: { type: GraphQLString },
    /*description: { type: GraphQLString },
    picture: { type: GraphQLString },*/
  },
  //async resolve(_, { name, url, description, picture }, req) {
  async resolve(_, { name, url }, req) {
    const userId = authMiddleware(req);
    //const site = new Site({ name, url, description, picture, userId });
    const site = new Site({ name, url, userId });
    await site.save();
    return site;
  },
};
// Update Site Mutation
// This mutation updates an existing site for the authenticated user.
const UpdateSiteMutation = {
  type: SiteType,
  args: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    url: { type: GraphQLString },
    description: { type: GraphQLString },
    picture: { type: GraphQLString },
  },
  async resolve(_, { id, name, url, description, picture }, req) {
    const userId = authMiddleware(req);
    const site = await Site.findOneAndUpdate(
      { _id: id, userId },
      { name, url, description, picture },
      { new: true }
    );
    if (!site) throw new Error("Site not found");
    return site;
  },
};
// Delete Site Mutation
// This mutation deletes a site for the authenticated user.
const DeleteSiteMutation = {
  type: GraphQLBoolean,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    const userId = authMiddleware(req);
    const site = await Site.findOneAndDelete({ _id: id, userId });
    if (!site) throw new Error("Site not found");
    return true;
  },
};

// Add BlogPost Mutation
// This mutation adds a new blog post for the authenticated user.
const AddBlogPostMutation = {
  type: BlogPostType,
  args: {
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    siteId: { type: GraphQLString },
  },
  async resolve(_, args, req) {
    const userId = authMiddleware(req);
    const blogPost = new BlogPost({ ...args, userId });
    await blogPost.save();
    return blogPost;
  },
};
// Update BlogPost Mutation
// This mutation updates an existing blog post for the authenticated user.
const UpdateBlogPostMutation = {
  type: BlogPostType,
  args: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    siteId: { type: GraphQLString },
    content: { type: GraphQLString },
    description: { type: GraphQLString },
    keywords: { type: GraphQLString },
    publishTime: { type: GraphQLString },
    publishDate: { type: GraphQLString },
    image: { type: GraphQLString },
    imageCaption: { type: GraphQLString },
    imageAbstract: { type: GraphQLString },
    imageAlternativeHeadline: { type: GraphQLString },
    imageKeywords: { type: GraphQLString },
    twitterLabel1: { type: GraphQLString },
    twitterData1: { type: GraphQLString },
    twitterLabel2: { type: GraphQLString },
    twitterData2: { type: GraphQLString },
    articleSection: { type: GraphQLString },
    articleTag1: { type: GraphQLString },
    articleTag2: { type: GraphQLString },
    articleTag3: { type: GraphQLString },
    articleTag4: { type: GraphQLString },
    articleTag5: { type: GraphQLString },
  },
  async resolve(_, args, req) {
    const userId = authMiddleware(req);
    const blogPost = await BlogPost.findOneAndUpdate(
      { _id: args.id, userId },
      args,
      { new: true }
    );
    if (!blogPost) throw new Error("BlogPost not found");
    return blogPost;
  },
};
// Delete BlogPost Mutation
// This mutation deletes a blog post for the authenticated user.
const DeleteBlogPostMutation = {
  type: GraphQLBoolean,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    const userId = authMiddleware(req);
    const blogPost = await BlogPost.findOneAndDelete({ _id: id, userId });
    if (!blogPost) throw new Error("BlogPost not found");
    return true;
  },
};

// Add PortfolioItem Mutation
// This mutation adds a new portfolio item for the authenticated user.
const AddPortfolioItemMutation = {
  type: PortfolioItemType,
  args: {
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    siteId: { type: GraphQLString },
  },
  async resolve(_, args, req) {
    const userId = authMiddleware(req);
    const portfolioItem = new PortfolioItem({ ...args, userId });
    await portfolioItem.save();
    return portfolioItem;
  },
};
// Update PortfolioItem Mutation
// This mutation updates an existing portfolio item for the authenticated user.
const UpdatePortfolioItemMutation = {
  type: PortfolioItemType,
  args: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    siteId: { type: GraphQLString },
    content: { type: GraphQLString },
    repoLink: { type: GraphQLString },
    demoLink: { type: GraphQLString },
    liveLink: { type: GraphQLString },
    infoLink: { type: GraphQLString },
    description: { type: GraphQLString },
    keywords: { type: GraphQLString },
    publishTime: { type: GraphQLString },
    publishDate: { type: GraphQLString },
    image: { type: GraphQLString },
    imageCaption: { type: GraphQLString },
    imageAbstract: { type: GraphQLString },
    imageAlternativeHeadline: { type: GraphQLString },
    imageKeywords: { type: GraphQLString },
    twitterLabel1: { type: GraphQLString },
    twitterData1: { type: GraphQLString },
    twitterLabel2: { type: GraphQLString },
    twitterData2: { type: GraphQLString },
    articleSection: { type: GraphQLString },
    articleTag1: { type: GraphQLString },
    articleTag2: { type: GraphQLString },
    articleTag3: { type: GraphQLString },
    articleTag4: { type: GraphQLString },
    articleTag5: { type: GraphQLString },
  },
  async resolve(_, args, req) {
    const userId = authMiddleware(req);
    const portfolioItem = await PortfolioItem.findOneAndUpdate(
      { _id: args.id, userId },
      args,
      { new: true }
    );
    if (!portfolioItem) throw new Error("PortfolioItem not found");
    return portfolioItem;
  },
};
// Delete PortfolioItem Mutation
// This mutation deletes a portfolio item for the authenticated user.
const DeletePortfolioItemMutation = {
  type: GraphQLBoolean,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    const userId = authMiddleware(req);
    const portfolioItem = await PortfolioItem.findOneAndDelete({ _id: id, userId });
    if (!portfolioItem) throw new Error("PortfolioItem not found");
    return true;
  },
};

// AddAuthenticatedNewsletterSubscriber Mutation
// This mutation adds a new newsletter subscriber for the authenticated user.
const AddAuthenticatedNewsletterSubscriberMutation = {
  type: NewsletterSubscriberType,
  args: {
    email: { type: GraphQLString },
    siteId: { type: GraphQLString },
  },
  async resolve(_, args, req) {
    const userId = authMiddleware(req);
    const newsletterSubscriber = new NewsletterSubscriber({ ...args, userId });
    await newsletterSubscriber.save();
    return newsletterSubscriber;
  },
};
// AddNewsletterSubscriber Mutation
// This mutation adds a new newsletter subscriber without authentication.
// It is used for public sign-ups.
const AddNewsletterSubscriberMutation = {
  type: NewsletterSubscriberType,
  args: {
    email: { type: GraphQLString },
    siteId: { type: GraphQLString },
    userId: { type: GraphQLString },
  },
  async resolve(_, args, req) {
    const newsletterSubscriber = new NewsletterSubscriber({ ...args });
    await newsletterSubscriber.save();
    return newsletterSubscriber;
  },
};
// Update NewsletterSubscriber Mutation
// This mutation updates an existing newsletter subscriber for the authenticated user.
const UpdateNewsletterSubscriberMutation = {
  type: NewsletterSubscriberType,
  args: {
    id: { type: GraphQLString },
    email: { type: GraphQLString },
    siteId: { type: GraphQLString },
    comment: { type: GraphQLString },
  },
  async resolve(_, args, req) {
    const userId = authMiddleware(req);
    const newsletterSubscriber = await NewsletterSubscriber.findOneAndUpdate(
      { _id: args.id, userId },
      args,
      { new: true }
    );
    if (!newsletterSubscriber) throw new Error("NewsletterSubscriber not found");
    return newsletterSubscriber;
  },
};
// Delete NewsletterSubscriber Mutation
// This mutation deletes a newsletter subscriber for the authenticated user.
const DeleteNewsletterSubscriberMutation = {
  type: GraphQLBoolean,
  args: { id: { type: GraphQLString } },
  async resolve(_, { id }, req) {
    const userId = authMiddleware(req);
    const newsletterSubscriber = await NewsletterSubscriber.findOneAndDelete({ _id: id, userId });
    if (!newsletterSubscriber) throw new Error("NewsletterSubscriber not found");
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

    // sites
    getSites: GetSitesQuery, // Private
    getSite: GetSiteQuery, // Private

    // blog posts
    getUserBlogPosts: GetUserBlogPostsQuery, // Private
    getUserBlogPostsCount: GetUserBlogPostsCountQuery, // Private
    getBlogPosts: GetBlogPostsQuery, // Public
    getBlogPostsCount: GetBlogPostsCountQuery, // Public
    getBlogPost: GetBlogPostQuery, // Public
    getBlogPostBySlug: GetBlogPostBySlugQuery, // Public

    // portfolio items
    getUserPortfolioItems: GetUserPortfolioItemsQuery, // Private
    getUserPortfolioItemsCount: GetUserPortfolioItemsCountQuery, // Private
    getPortfolioItems: GetPortfolioItemsQuery, // Public
    getPortfolioItemsCount: GetPortfolioItemsCountQuery, // Public
    getPortfolioItem: GetPortfolioItemQuery, // Public

    // newsletter subscribers
    getNewsletterSubscribers: GetNewsletterSubscribersQuery, // Private
    getNewsletterSubscribersCount: GetNewsletterSubscribersCountQuery, // Private
    getUserNewsletterSubscribers: GetUserNewsletterSubscribersQuery, // Private
    getUserNewsletterSubscribersCount: GetUserNewsletterSubscribersCountQuery, // Private
    getNewsletterSubscriber: GetNewsletterSubscriberQuery, // Private
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

    // sites
    addSite: AddSiteMutation, // Private
    updateSite: UpdateSiteMutation, // Private
    deleteSite: DeleteSiteMutation, // Private

    // blog posts
    addBlogPost: AddBlogPostMutation, // Private
    updateBlogPost: UpdateBlogPostMutation, // Private
    deleteBlogPost: DeleteBlogPostMutation, // Private

    // portfolio items
    addPortfolioItem: AddPortfolioItemMutation, // Private
    updatePortfolioItem: UpdatePortfolioItemMutation, // Private
    deletePortfolioItem: DeletePortfolioItemMutation, // Private

    // newsletter subscribers
    addNewsletterSubscriber: AddNewsletterSubscriberMutation, // Public
    addAuthenticatedNewsletterSubscriber: AddAuthenticatedNewsletterSubscriberMutation, // Private
    updateNewsletterSubscriber: UpdateNewsletterSubscriberMutation, // Private
    deleteNewsletterSubscriber: DeleteNewsletterSubscriberMutation, // Private
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});