const roles = [
  {
    name: 'admin',
    description: 'Super Admin',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'org_head',
    description: 'Organization Head',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'emp',
    description: 'Employee',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('roles', roles);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('roles', null);
}
