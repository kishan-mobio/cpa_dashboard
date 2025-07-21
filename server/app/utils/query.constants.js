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
};
