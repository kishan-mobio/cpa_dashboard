export const QUERY = {
  TABLE_EXIST: `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `,

  CREATE_ROLES_TABLE: `
      CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Insert default roles
      INSERT INTO roles (name, description) 
      VALUES 
        ('admin', 'Administrator role with full access'),
        ('employee', 'Regular employee role');
    `,

  CREATE_USERS_TABLE: `
      -- Create users table
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        role_id INTEGER NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      );

      -- Insert default admin user
      INSERT INTO users (name, role_id, email, password, phone_number)
      VALUES ('admin', (SELECT id FROM roles WHERE name = 'admin'), 'admin@gmail.com', 'Admin@123', '1234567890');
      `,
  UPDATE_USER_LAST_LOGIN: `
    UPDATE users
    SET last_login = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,
  GET_USER_BY_EMAIL: `SELECT * FROM users WHERE email = $1 LIMIT 1`,
  GET_USER_BY_ANY: (key) => `SELECT * FROM users WHERE ${key} = $1 LIMIT 1`,
  INSERT_USER: `
      INSERT INTO users (name, email, password, phone_number, role_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
  UPDATE_USER_PASSWORD: `
    UPDATE users
    SET password = $1,
        reset_password_token = NULL,
        reset_password_expires = NULL,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `,
  FIND_ROLES_BY_NAMES: `SELECT * FROM roles WHERE name = ANY($1)`,
  UPDATE_USER_PASSWORD_AND_TOKEN: `
    UPDATE users
    SET password = $1,
        reset_password_token = $2,
        reset_password_expires = $3,
        updated_at = NOW()
    WHERE id = $4
    RETURNING *;
  `,
  GET_USER_BY_RESET_PASSWORD_TOKEN: `
    SELECT * FROM users 
    WHERE reset_password_token = $1
    LIMIT 1
  `,
  FIND_ROLE_BY_NAME: `SELECT * FROM roles WHERE name = $1 LIMIT 1`,
  UPDATE_USER_PASSWORD: `
    UPDATE users
    SET password = $1,
        reset_password_token = NULL,
        reset_password_expires = NULL,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `,
  FIND_ROLES_BY_NAMES: `SELECT * FROM roles WHERE name = ANY($1)`,
  UPDATE_USER_TOKEN: `
    UPDATE users
    SET reset_password_token = $1,
        reset_password_expires = $2,
        updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `,
  GET_USER_BY_RESET_PASSWORD_TOKEN: `
    SELECT * FROM users 
    WHERE reset_password_token = $1
    LIMIT 1
  `,
  FIND_ROLE_BY_NAME: `SELECT * FROM roles WHERE name = $1 LIMIT 1`,
};
