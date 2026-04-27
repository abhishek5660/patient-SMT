const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function test() {
    try {
        await mongoose.connect('mongodb://localhost:27017/patient_system');

        const User = require('./models/User');

        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            return;
        }

        console.log("Found user:", user.email);
        
        user.name = user.name || "Test";
        user.email = user.email || "test@test.com";
        user.bloodGroup = "";
        user.dob = null;
        user.age = null;
        
        user.emergencyContact = {
            name: "",
            phone: "",
            relation: ""
        };

        console.log("Saving user...");
        await user.save();
        console.log("Save successful!");
    } catch (err) {
        console.error("Server Error triggered:", err);
    } finally {
        mongoose.connection.close();
    }
}

test();
