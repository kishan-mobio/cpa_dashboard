import sequelize from '../config/sequelize.js';
import RoleModel from './roles.model.js';
import UserModel from './user.model.js';

const User = UserModel(sequelize);
const Role = RoleModel(sequelize);

Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

export { sequelize, Role, User };
