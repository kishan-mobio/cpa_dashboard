import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { Role, User, initDB } from '../models/index.js';

const seedDefaultData = async () => {
  try {
    // Insert default roles
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator role with full access',
    });

    await Role.create({
      name: 'employee',
      description: 'Regular employee role',
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 8);

    // Insert default admin user
    const adminUser = await User.create({
      name: 'admin',
      role_id: adminRole.id,
      email: 'admin@gmail.com',
      password: hashedPassword,
      phone_number: '1234567890',

    });
    console.log('Admin User:', adminUser);
    console.log('Admin Role:', adminRole);
    console.log('✅ Default roles and admin user seeded');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  }
};


const seedOrgHead = async () => {
  try {
    // Create org_head role
    const orgHeadRole = await Role.create({
      name: 'org_head',
      description: 'Organizational head with elevated privileges',
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('OrgHead@123', 8);

    // Create user with org_head role
    await User.create({
      name: 'org_head_user',
      role_id: orgHeadRole.id,
      email: 'orghead@gmail.com',
      password: hashedPassword,
      phone_number: '9998887777',
    });

    console.log('✅ Org head role and user seeded');
  } catch (error) {
    console.error('❌ Error seeding org head:', error);
  }
};

await seedOrgHead();
// await initDB();
// await seedDefaultData();
