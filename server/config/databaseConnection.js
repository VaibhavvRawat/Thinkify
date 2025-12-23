// import mongoose from "mongoose";
// // const DATABASE_URL="mongodb://localhost:27017"
// // const DATABASE_NAME="Anadi"
// const databaseConnection = async () => {
//     try {
//         const DB_OPTIONS = {    
//             dbName: DATABASE_NAME,
//         }
//         await mongoose.connect(DATABASE_URL, DB_OPTIONS);
//         console.log("Database Connected Successfully...");
//     } catch (error) {
//         console.log("Database Connection Failed");
//         console.error(error);
//     }
// }

// export default databaseConnection;

import mongoose from "mongoose";

const databaseConnection = async (DATABASE_URL, DATABASE_NAME) => {
    try {
        const DB_OPTIONS = {
            dbName: DATABASE_NAME,
        };
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log("✅ Database Connected Successfully...");
    } catch (error) {
        console.log("❌ Database Connection Failed");
        console.error(error.message);
    }
};

export default databaseConnection;
