import bcrypt from 'bcryptjs';

export async function up(queryInterface, Sequelize) {
  const hashedPassword = await bcrypt.hash('admin@123', 8);

  const superAdmin = {
    name: 'admin',
    role_id: 1,
    email: 'admin@gmail.com',
    password: hashedPassword, // ✅ already resolved
    phone_number: '1234567899',
    reset_token: null,
    reset_token_expires: null,
    last_login: null,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
    is_active: true,
  };

  await queryInterface.bulkInsert('users', [superAdmin]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('users', { email: 'admin@gmail.com' }, {});
}
