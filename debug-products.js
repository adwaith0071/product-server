const mongoose = require("mongoose");
require("dotenv").config();

async function debugProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    const Product = require("./model/productModel");

    // Check all products without any filter
    const allProducts = await Product.find({});
    console.log(`\nTotal products in database: ${allProducts.length}`);

    if (allProducts.length > 0) {
      console.log("\n=== All Products ===");
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ID: ${product._id}`);
        console.log(`   Title: ${product.title}`);
        console.log(`   isActive: ${product.isActive}`);
        console.log(`   Created: ${product.createdAt}`);
        console.log("   ---");
      });
    }

    // Check active products
    const activeProducts = await Product.find({ isActive: true });
    console.log(`\nActive products: ${activeProducts.length}`);

    // Check inactive products
    const inactiveProducts = await Product.find({ isActive: false });
    console.log(`Inactive products: ${inactiveProducts.length}`);

    // Test the exact query that might be failing
    console.log("\n=== Testing getProducts Query ===");
    const query = {};
    const testProducts = await Product.find(query);
    console.log(
      `Query with empty object returned: ${testProducts.length} products`
    );

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
  }
}

debugProducts();
