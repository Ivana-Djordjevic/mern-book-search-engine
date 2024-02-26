const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, args, context) => {
        return User.findOne({ _id: context.user._id })
    },
  },

  Mutation: {
    createUser: async (_, args) => {

      const user = await User.create(args);
      const token = signToken(user);

      return { token, user}
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (_, args, context) => {
      console.log('context:')
      console.log(context.user)
      const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.book } },
          { new: true, runValidators: true }
        );
      return updatedUser
    },
    deleteBook:  async (_, args, context) => {
      const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
  
      return updatedUser
    }
  }
}

module.exports = resolvers;