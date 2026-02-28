require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const cleanDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const corruptedName = "function valueOf() { [native code] }";

        console.log(`Searching for products with name: "${corruptedName}"...`);
        const result = await Product.deleteMany({ name: corruptedName });

        console.log(`Deleted ${result.deletedCount} corrupted products.`);

        // Also cleanup by slug if needed
        const resultSlug = await Product.deleteMany({ slug: "function-valueof-native-code" });
        if (resultSlug.deletedCount > 0) {
            console.log(`Deleted ${resultSlug.deletedCount} items by slug.`);
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanDatabase();
