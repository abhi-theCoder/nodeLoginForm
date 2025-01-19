const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

// Initialize app
const app = express();

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/loginDB', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => console.log(err));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Import User model
const User = require('./models/User');

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.send('Invalid email');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send('Invalid password');
        }

        return res.send('Login successful');
    } catch (err) {
        console.error(err);
        res.send('Error logging in');
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
 
        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();
        return res.send('User registered successfully');
    } catch (err) {
        console.error(err);
        res.send('Error registering user');
    }
}); 

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});