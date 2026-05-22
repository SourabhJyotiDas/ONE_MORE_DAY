const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { googleId, name, email, picture } = req.body;
    console.log('Login attempt for email:', email);
    
    if (!googleId || !email) {
      console.log('Missing required fields:', { googleId, email });
      return res.status(400).json({ message: 'googleId and email are required' });
    }

    let user = await User.findOne({ googleId });
    if (!user) {
      // console.log('Creating new user:', email);
      user = new User({ googleId, name, email, picture });
      await user.save();
    } else {
      // console.log('User found, updating profile:', email);
      // Update profile if changed
      user.name = name;
      user.picture = picture;
      await user.save();
    }
    
    // console.log('Login successful for:', email);
    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};
