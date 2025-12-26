const User = require("./src/models/User");
const { faker } = require("@faker-js/faker");
const Product = require("./src/models/Product");
const Voucher = require("./src/models/Voucher");
const Review = require("./src/models/Review");
const { hashPassword } = require("./src/functions/passwordHasing");
const {
  connectDatabase,
  disconnectDatabase,
} = require("./src/database/database");
const Checkout = require("./src/models/Checkout");
const Return = require("./src/models/Return");
const Cancellation = require("./src/models/Cancellation");

faker.seed(23);

const createUser = async (role) => {
  console.log("All passwords are 'password123'");
  const hashedPassword = await hashPassword("password123");
  return {
    username: faker.internet.username(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: hashedPassword,
    phone: faker.phone.number("08##########"),
    address: faker.location.streetAddress(),
    role: role,
    cart: [],
    isBanned: false,
    avatar: null,
  };
};

async function createVouchers() {
  console.log("Creating vouchers...");
  const vouchers = [
    {
      code: "SAVE10",
      discountPercentage: 10,
      maxUses: 100,
      currentUses: 25,
      isActive: true,
    },
    {
      code: "JANAGRO50",
      discountPercentage: 50,
      maxUses: 20,
      currentUses: 19,
      isActive: true,
    },
    {
      code: "NEWUSER15",
      discountPercentage: 15,
      maxUses: 200,
      isActive: false,
    },
  ];
  await Voucher.insertMany(vouchers);
}

async function createProducts() {
  console.log("Creating products...");
  const products = [
    {
      name: "Organic Garden Booster",
      category: "Fertilizer",
      price: 24.99,
      image: "🌱",
      description: "Premium organic fertilizer for all garden plants.",
      rating: 4.8,
      stock: 17,
      detail:
        "A premium organic fertilizer suitable for all garden plants. Great for improving soil fertility and crop yield.",
    },
    {
      name: "Pro Garden Shovel",
      category: "Tools",
      price: 15.5,
      image: "🛠️",
      description: "Durable shovel for all your gardening needs.",
      rating: 4.5,
      stock: 8,
      detail:
        "Made from high-quality steel, rust-resistant and sturdy. Ergonomic handle for maximum comfort.",
    },
    {
      name: "Cherry Tomato Seeds",
      category: "Seeds",
      price: 5.99,
      image: "🍅",
      description: "High-quality cherry tomato seeds, fast-growing variety.",
      rating: 4.9,
      stock: 50,
      detail:
        "One pack contains 50 selected cherry tomato seeds. Resistant to disease and suitable for tropical climates.",
    },
    {
      name: "Neem Organic Pesticide",
      category: "Fertilizer",
      price: 12.0,
      image: "🌿",
      description: "Natural pesticide made from neem leaf extract.",
      rating: 4.6,
      stock: 0,
      detail:
        "Safe for plants and the environment, effective against pests such as aphids, caterpillars, and mites.",
    },
  ];
  await Product.insertMany(products);
}

async function seed() {
  try {
    await connectDatabase();
    await User.deleteMany({});
    await Product.deleteMany({});
    await Checkout.deleteMany({});
    await Voucher.deleteMany({});
    await Cancellation.deleteMany({});
    await Return.deleteMany({});
    console.log("All collections cleared.");

    const adminUser = await createUser("admin");
    await User.create(adminUser);

    const ownerUser = await createUser("owner");
    await User.create(ownerUser);

    for (let i = 0; i < 10; i++) {
      const user = await createUser("user");
      console.log(user);
      await User.create(user);
    }

    await createProducts();
    await createVouchers();
    await Checkout.insertMany([]);
    await Review.insertMany([]);

    console.log("Database seeding successful!");
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    console.log("Disconnected from MongoDB");
  }
}

seed();
