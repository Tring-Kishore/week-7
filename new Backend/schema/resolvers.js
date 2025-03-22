const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { pool } = require('../db'); // Assuming you have a PostgreSQL connection pool
const jwt = require('jsonwebtoken');
const { generatePassword } = require('../passwordGenerator')
const { sendEmail } = require('../emailSender');

const resolvers = {
  Mutation: {
    signUpUser: async (_, { input }) => {
      try {
        console.log('Input Data:', input);
    
        const { name, email, phone, password, role } = input;
        const normalizedEmail = email.toLowerCase();
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
    
        console.log('Hashed Password:', hashedPassword);
        const userExists = await pool.query(
          'SELECT * FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL',
          [normalizedEmail]
        );
    
        console.log('User Exists:', userExists.rows);
    
        if (userExists.rows.length > 0) {
          throw new Error('User already exists');
        }
    
        const newUser = await pool.query(
          'INSERT INTO users (id, name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [id, name, normalizedEmail, phone, hashedPassword, 'user']
        );
    
        console.log('New User:', newUser.rows[0]);
    
        const id2 = uuidv4();
        const userDetailsInsert = await pool.query(
          `INSERT INTO userdetails (id, user_id)
           VALUES ($1,$2) RETURNING *`,
          [id2,id]
        );
    
        console.log('User Details Insert:', userDetailsInsert.rows[0]);
    
        return newUser.rows[0];
      } catch (error) {
        console.error('Error in signUpUser resolver:', error);
        throw new Error('Failed to sign up user: ' + error.message);
      }
    },
    

    signUpOrganization: async (_, { input, signUpUserInput2 }) => {
      try {
        const { website, status, description, location } = input;
        const { name, email, phone } = signUpUserInput2;
    
        console.log('Organization details:', input);
        console.log('User details:', signUpUserInput2);
    
        const normalizedEmail = email.toLowerCase();
        const userId = uuidv4();
        const orgId = uuidv4();
    
        const userExists = await pool.query(
          'SELECT * FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL',
          [normalizedEmail]
        );
        if (userExists.rows.length > 0) {
          throw new Error('User already exists');
        }
        const defaultPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newUser = await pool.query(
          'INSERT INTO users (id, name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [userId, name, normalizedEmail, phone, hashedPassword, 'organization']
        );
    
        const newOrg = await pool.query(
          'INSERT INTO organizations (id, organization_id, website, description, status, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [orgId, userId, website, description, status, location]
        );

        await sendEmail({
          from: process.env.EMAIL,
          to: normalizedEmail,
          subject: 'Wait until admin approve',
          text: 'Welcome to Job Found, You have signed up, wait until admin accepts',
        });
    
        return newOrg.rows[0];
      } catch (error) {
        console.error('Error in signUpOrganization resolver:', error);
        throw new Error('Failed to sign up organization');
      }
    },
    login: async (_, { email, password }) => {
      const normalizedEmail = email.toLowerCase();
      const user = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL',
        [normalizedEmail]
      );
    
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }
      const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
    
      let updatePasswordState = null;
      if (user.rows[0].role === 'organization') {
        const orgResult = await pool.query(
          'SELECT update_password_state FROM organizations WHERE organization_id = $1 AND deleted_at IS NULL',
          [user.rows[0].id]
        );
    
        if (orgResult.rows.length > 0) {
          updatePasswordState = orgResult.rows[0].update_password_state;
        }
      }
    

      const token = jwt.sign(
        {
          userId: user.rows[0].id,
          name: user.rows[0].name,
          role: user.rows[0].role,
          update_password_state: updatePasswordState,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return {
        token,
      };
    },
    addJobPost: async (_, { input }) => {
      const {
        job_title,
        category,
        openings,
        experience,
        description,
        package,
        language,
        skills,
        organization_id,
      } = input;

      const id = uuidv4();

      const result = await pool.query(
        `INSERT INTO jobposts (
          id, job_title, category, openings, experience, description, package, language, skills, organization_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          id,
          job_title,
          category,
          openings,
          experience,
          description,
          package,
          language,
          skills,
          organization_id,
        ]
      );
      return result.rows[0];
    },
    updateJobPost: async (_, { input }) => {
      const {
        id,
        job_title,
        category,
        openings,
        experience,
        description,
        package,
        language,
        skills,
      } = input;

      const result = await pool.query(
        `UPDATE jobposts SET
          job_title = $1,
          category = $2,
          openings = $3,
          experience = $4,
          description = $5,
          package = $6,
          language = $7,
          skills = $8,
          updated_at = NOW()
        WHERE id = $9 RETURNING *`,
        [
          job_title,
          category,
          openings,
          experience,
          description,
          package,
          language,
          skills,
          id,
        ]
      );
      return result.rows[0];
    },
    applyForJob : async (_, { input }) => {
      const { jobpost_id, user_id, organization_id } = input;
    
      try {
        // Check if the user has already applied for this job
        const existingApplication = await pool.query(
          `SELECT * FROM jobapplied 
           WHERE jobpost_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
          [jobpost_id, user_id]
        );
    
        if (existingApplication.rows.length > 0) {
          throw new Error('You have already applied for this job');
        }
    
        // If not, insert a new application
        const id = uuidv4();
        const result = await pool.query(
          `INSERT INTO jobapplied (
            id, jobpost_id, user_id, organization_id, status
          ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [id, jobpost_id, user_id, organization_id, 'applied']
        );
    
        return result.rows[0];
      } catch (error) {
        console.error('Error applying for job:', error);
        throw new Error(error.message); // Pass the error message to the frontend
      }
    },    
    updateApplicationStatus: async (_, { id, status }) => {
      const result = await pool.query(
        `UPDATE jobapplied
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );
      return result.rows[0];
    },
    updateOrganizationStatus : async (_, { id, status }) => {
      try {
        // Update the organization status and fetch the updated organization
        const organizationResult = await pool.query(
          `UPDATE organizations
           SET status = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING *`,
          [status, id]
        );
    
        if (organizationResult.rows.length === 0) {
          throw new Error('Organization not found');
        }
    
        const organization = organizationResult.rows[0];
    
        // Fetch the associated user data
        const userResult = await pool.query(
          `SELECT * FROM users WHERE id = $1`,
          [organization.organization_id] // Assuming `organization_id` is the foreign key in the `organizations` table
        );
    
        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }
    
        const user = userResult.rows[0];
    
        // Handle email and password reset for approved or rejected status
        if (status === 'approved' || status === 'rejected') {
          let emailSubject = `Application Status Updated: ${status}`;
          let emailText = '';
    
          if (status === 'approved') {
            // Generate a new password
            const defaultPassword = generatePassword(); // Ensure this function is defined
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
            // Update the user's password in the database
            await pool.query(
              'UPDATE users SET password = $1 WHERE id = $2',
              [hashedPassword, organization.organization_id]
            );
    
            emailText = `Your organization has been approved. 
            The default password is ${defaultPassword}. After logging in, you can change the password.`;
          } else if (status === 'rejected') {
            emailText = `Your application has been rejected.`;
          }
    
          // Send email
          await sendEmail({
            from: process.env.EMAIL, // Ensure this is set in your environment
            to: user.email, // Use the organization's email from the database
            subject: emailSubject,
            text: emailText,
          });
        }
    
        // Return the organization with the user data
        return {
          ...organization,
          user, // Ensure the user field is included
        };
      } catch (error) {
        console.error('Error updating organization status:', error);
        throw new Error('Failed to update organization status');
      }
    },

    // Delete an organization (soft delete)
    deleteOrganization: async (_, { id }) => {
      console.log('Deleting organization with ID:', id); // Debugging
    
      try {
        // Soft delete the organization
        const orgResult = await pool.query(
          `UPDATE organizations
           SET deleted_at = NOW()
           WHERE id = $1 AND deleted_at IS NULL
           RETURNING *`,
          [id]
        );
    
        if (orgResult.rows.length === 0) {
          throw new Error('Organization not found or already deleted');
        }
    
        const deletedOrganization = orgResult.rows[0];
    
        // Soft delete the associated user
        const userResult = await pool.query(
          `UPDATE users
           SET deleted_at = NOW()
           WHERE id = $1 AND deleted_at IS NULL
           RETURNING *`,
          [deletedOrganization.organization_id] // Assuming the column is `user_id`
        );
    
        if (userResult.rows.length === 0) {
          throw new Error('User not found or already deleted');
        }
    
        // Soft delete the associated job posts
        const jobPostsResult = await pool.query(
          `UPDATE jobposts
           SET deleted_at = NOW()
           WHERE organization_id = $1 AND deleted_at IS NULL
           RETURNING *`,
          [deletedOrganization.organization_id] // Use `id` from the deleted organization
        );
    
        // Soft delete the associated job applications
        const jobAppliedResult = await pool.query(
          `UPDATE jobapplied
           SET deleted_at = NOW()
           WHERE organization_id = $1 AND deleted_at IS NULL
           RETURNING *`,
          [deletedOrganization.organization_id] // Use `id` from the deleted organization
        );
    
        // Return the deleted organization with user, job posts, and job applications data
        return {
          ...deletedOrganization,
          user: userResult.rows[0],
          jobPosts: jobPostsResult.rows,
          jobApplied: jobAppliedResult.rows,
        };
      } catch (error) {
        console.error('Error deleting organization:', error);
        throw new Error('Failed to delete organization');
      }
    },
    deleteUser: async (_, { id }) => {
      // Soft delete: Set deleted_at to the current timestamp
      const result = await pool.query(
        `UPDATE users SET deleted_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );

      const updateUserDetails = await pool.query(
        `UPDATE userdetails SET deleted_at = NOW() WHERE user_id = $1 RETURNING *`,[id]
      );

      const updateJopapplied = await pool.query(
        `UPDATE jobapplied SET deleted_at = NOW() WHERE user_id = $1 RETURNING *`,[id]
      )

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    },
    updateUser: async (_, { id, input }) => {
      const { name, email, phone, age, experience, skills, description } = input;
    
      try {
        // Update the `users` table
        await pool.query(
          `UPDATE users
           SET name = $1, email = $2, phone = $3, updated_at = NOW()
           WHERE id = $4`,
          [name, email, phone, id]
        );
    
        // Update the `userdetails` table
        await pool.query(
          `UPDATE userdetails
           SET age = $1, experience = $2, skills = $3, description = $4, updated_at = NOW()
           WHERE user_id = $5`,
          [age, experience, skills, description, id]
        );
    
        // Fetch updated user data
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = userResult.rows[0];
        const userDetailsResult = await pool.query('SELECT * FROM userdetails WHERE user_id = $1', [id]);
        user.userdetails = userDetailsResult.rows[0] || null;
    
        return user;
      } catch (error) {
        console.error('Error updating user details:', error);
        throw new Error('Failed to update user details');
      }
    },
    updateOrganizationPassword : async (_, { id, password }) => {
      try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Update the password in the `users` table
        const userResult = await pool.query(
          `UPDATE users
           SET password = $1, updated_at = NOW()
           WHERE id = $2 AND deleted_at IS NULL
           RETURNING *`,
          [hashedPassword, id]
        );
    
        if (userResult.rows.length === 0) {
          throw new Error('User not found or already deleted');
        }
    
        // Update the `update_password_state` in the `organizations` table
        const orgResult = await pool.query(
          `UPDATE organizations
           SET update_password_state = true, updated_at = NOW()
           WHERE organization_id = $1 AND deleted_at IS NULL
           RETURNING *`,
          [id]
        );
    
        if (orgResult.rows.length === 0) {
          throw new Error('Organization not found or already deleted');
        }
    
        // Return the updated organization with user data
        return {
          ...orgResult.rows[0],
          user: userResult.rows[0],
        };
      } catch (error) {
        console.error('Error updating organization password:', error);
        throw new Error('Failed to update organization password');
      }
    },    
  },

  Query: {
    users: async () => {
      const users = await pool.query(
        'SELECT * FROM users WHERE role = $1 AND deleted_at IS NULL',
        ['user'] // Passing 'user' as a parameter
      );
      return users.rows;
    },    
    user: async (_, { id }) => {
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) throw new Error('User not found');

      const user = userResult.rows[0];
      const userDetailsResult = await pool.query('SELECT * FROM userdetails WHERE user_id = $1', [id]);
      user.userdetails = userDetailsResult.rows[0] || null;

      return user;
    },
    getAllOrganizations: async () => {
      const result = await pool.query(`
        SELECT 
          o.id, o.website, o.description, o.status, o.location, o.created_at, o.updated_at, o.deleted_at, o.organization_id, o.update_password_state,
          u.id AS user_id, u.name, u.email, u.phone, u.role
        FROM users u
        INNER JOIN organizations o ON u.id = o.organization_id
        WHERE u.role = 'organization' AND u.deleted_at IS NULL AND o.status = 'approved';
      `);
      return result.rows.map(row => ({
        ...row,
        user: {
          id: row.user_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          role: row.role,
        },
      }));
    },
    jobPosts: async (_, { organization_id }) => {
      const query = organization_id
        ? `SELECT jp.*, u.name AS organization_name 
           FROM jobposts jp 
           JOIN users u ON jp.organization_id = u.id 
           WHERE jp.organization_id = $1 AND jp.deleted_at IS NULL`
        : `SELECT jp.*, u.name AS organization_name 
           FROM jobposts jp 
           JOIN users u ON jp.organization_id = u.id 
           WHERE jp.deleted_at IS NULL`;
    
      const values = organization_id ? [organization_id] : [];
      const result = await pool.query(query, values);
    
      // Map the result to include the organization's name
      return result.rows.map((row) => ({
        ...row,
        organization: {
          id: row.organization_id,
          name: row.organization_name,
        },
      }));
    },
    getUserJobApplied: async (_, { userId }) => {
      const result = await pool.query(
        `SELECT 
          ja.id, ja.jobpost_id, ja.organization_id, ja.user_id, ja.status, ja.created_at, ja.updated_at,
          u.name, u.email,
          jp.job_title, jp.category, jp.openings, jp.skills,
          org.name AS company
         FROM jobapplied ja
         JOIN users u ON ja.user_id = u.id
         JOIN jobposts jp ON ja.jobpost_id = jp.id
         JOIN users org ON ja.organization_id = org.id
         WHERE ja.user_id = $1 AND ja.deleted_at IS NULL`,
        [userId]
      );
      return result.rows;
    },
    // Fetch all job applications for an organization
    jobApplied: async (_, { organizationId }) => {
      const result = await pool.query(
        `SELECT 
          ja.id, ja.jobpost_id, ja.organization_id, ja.user_id, ja.status, ja.created_at, ja.updated_at,
          u.name, u.email,
          jp.job_title, jp.category, jp.openings, jp.skills,
          org.name AS company
         FROM jobapplied ja
         JOIN users u ON ja.user_id = u.id
         JOIN jobposts jp ON ja.jobpost_id = jp.id
         JOIN users org ON ja.organization_id = org.id
         WHERE ja.organization_id = $1 AND ja.deleted_at IS NULL`,
        [organizationId]
      );
      return result.rows;
    },
    getRequestedCompanies: async () => {
      const result = await pool.query(`
        SELECT 
          o.id, o.website, o.description, o.status, o.location, o.created_at, o.updated_at, o.deleted_at, o.organization_id, o.update_password_state,
          u.id AS user_id, u.name, u.email, u.phone, u.role
        FROM users u
        INNER JOIN organizations o ON u.id = o.organization_id
        WHERE u.role = 'organization' AND u.deleted_at IS NULL AND o.status = 'pending';
      `);
      return result.rows.map(row => ({
        ...row,
        user: {
          id: row.user_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          role: row.role,
        },
      }));
    },
    countOrganizations: async () => {
      const result = await pool.query(
        `SELECT COUNT(id) FROM users WHERE role = 'organization' AND deleted_at IS NULL`
      );
      return result.rows[0].count;
    },
    // Count users
    countUsers: async () => {
      const result = await pool.query(
        `SELECT COUNT(id) FROM users WHERE role = 'user' AND deleted_at IS NULL`
      );
      return result.rows[0].count;
    },

    // Count job posts
    countJobPosts: async () => {
      const result = await pool.query(
        `SELECT COUNT(id) FROM jobposts WHERE deleted_at IS NULL`
      );
      return result.rows[0].count;
    },

    // Count job applications for a user
    countUserApplications: async (_, { userId }) => {
      const result = await pool.query(
        `SELECT COUNT(id) FROM jobapplied WHERE user_id = $1 AND deleted_at IS NULL`,
        [userId]
      );
      return result.rows[0].count;
    },

    // Count job applications for an organization
    countOrganizationApplications: async (_, { organizationId }) => {
      const result = await pool.query(
        `SELECT COUNT(id) FROM jobapplied WHERE organization_id = $1 AND deleted_at IS NULL`,
        [organizationId]
      );
      return result.rows[0].count;
    },

    // Count job posts for an organization
    countOrganizationJobPosts: async (_, { organizationId }) => {
      const result = await pool.query(
        `SELECT COUNT(id) FROM jobposts WHERE organization_id = $1 AND deleted_at IS NULL`,
        [organizationId]
      );
      return result.rows[0].count;
    },
  },  
};

module.exports = resolvers;