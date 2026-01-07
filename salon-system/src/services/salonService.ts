import { connectDB } from "@/lib/db"; // 👈 Added curly braces { } to fix the import error
import User from "@/models/User";
import Salon from "@/models/Salon";
import bcrypt from "bcryptjs";

// Define the shape of the data we expect (Fixes "Unexpected any")
interface CreateSalonData {
  ownerName: string;
  ownerEmail: string;
  password: string;
  salonName: string;
  address: string;
  contactNumber: string;
}

export const createSalonWithOwner = async (data: CreateSalonData) => {
  await connectDB();

  const { ownerName, ownerEmail, password, salonName, address, contactNumber } = data;

  // 1. Check if email already exists
  const existingUser = await User.findOne({ email: ownerEmail });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // 2. Hash Password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create the User (Salon Owner)
  const newUser = await User.create({
    name: ownerName,
    email: ownerEmail,
    passwordHash,
    role: "SALON_OWNER",
    status: "ACTIVE",
  });

  // 4. Create the Salon
  const newSalon = await Salon.create({
    name: salonName,
    ownerId: newUser._id,
    address,
    contactNumber,
  });

  // 5. Link Salon ID back to User
  newUser.salonId = newSalon._id;
  await newUser.save();

  return { user: newUser, salon: newSalon };
};