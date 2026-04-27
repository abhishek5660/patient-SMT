const mongoose = require('mongoose');

async function fixDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/patient_system');
        
        const result = await mongoose.connection.db.collection('users').updateMany(
            { qualifications: { $type: "array" } },
            { $set: { qualifications: "" } }
        );
        console.log("Fixed qualifications:", result.modifiedCount);
        
        // Also fix any other empty arrays in string fields just in case
        const result2 = await mongoose.connection.db.collection('users').updateMany(
            { specialization: { $type: "array" } },
            { $set: { specialization: "" } }
        );
        console.log("Fixed specialization:", result2.modifiedCount);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

fixDB();
