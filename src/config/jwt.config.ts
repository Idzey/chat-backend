const jwtConfig = {
  secret: process.env.JWT_SECRET,
  global: true,
  signOptions: {
    expiresIn: '7d',
  },
};

export default jwtConfig;
