import { Role, User } from "../models/index.js";

const clearUsersAndRoles = async () => {
  try {
    // Delete all users first to avoid FK constraint error
    await User.destroy({ where: {}, truncate: true, cascade: true });
    await Role.destroy({ where: {}, truncate: true, cascade: true });

    console.log('✅ All users and roles removed');
  } catch (err) {
    console.error('❌ Error clearing users and roles:', err);
  }
};


const fetchAllRolesAndUsers = async () => {
  try {
    const roles = await Role.findAll({ raw: true });
    const users = await User.findAll({ raw: true });

    console.log('📄 Roles:', roles);
    console.log('📄 Users:', users);

    return { roles, users };
  } catch (err) {
    console.error('❌ Error fetching roles and users:', err);
    return null;
  }
};

// await fetchAllRolesAndUsers();


await clearUsersAndRoles();
