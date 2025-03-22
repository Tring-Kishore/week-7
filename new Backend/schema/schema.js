const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
  id: ID!
  name: String!
  email: String!
  password: String!
  phone:String
  role: String!
  created_at: String!
  updated_at: String!
  deleted_at: String
  userdetails: UserDetails
}

type Organization {
  id: ID!
  organization_id: ID!
  website: String!
  status: String!
  description: String
  location: String
  role: String!
  created_at: String!
  updated_at: String!
  deleted_at: String
  update_password_state: Boolean!
  user: User!
}

  input UserInput {
  name: String!
  email: String!
  password: String!
  phone:String
  role: String
}

input OrganizationInput {
  website: String!
  description: String
  status: String!
  location: String
}

type UserDetails {
  id: ID!
  user_id: ID!
  age: Int
  experience: String
  skills: String
  description: String
  created_at: String
  updated_at: String
  deleted_at: String
}

input UpdateUserInput {
  name: String
  email: String
  phone: String
  age: Int
  experience: String
  skills: String
  description: String
}


 type AuthPayload {
  token: String!
  }

  type JobPost {
  id: ID!
  job_title: String!
  category: String!
  openings: String!
  experience: String!
  description: String!
  package: String!
  language: String!
  skills: String!
  organization_id: ID!
  created_at: String!
  company: String!
  updated_at: String!
  deleted_at: String
  organization: User!
}

type JobApplied {
  id: ID!
  jobpost_id: ID!
  organization_id: ID!
  user_id: ID!
  status: String!
  created_at: String!
  updated_at: String!
  deleted_at: String
  name: String
  email: String
  job_title: String
  category: String
  company: String
  openings: String
  skills: String
}

input JobPostInput {
  job_title: String!
  category: String!
  openings: String!
  experience: String!
  description: String!
  package: String!
  language: String!
  skills: String!
  organization_id: ID!
}

input UpdateJobPostInput {
  id: ID!
  job_title: String!
  category: String!
  openings: String!
  experience: String!
  description: String!
  package: String!
  language: String!
  skills: String!
}

input JobApplicationInput {
  jobpost_id: ID!
  user_id: ID!
  organization_id: ID!
}


  type Mutation {
    signUpUser(input: UserInput!): User!
    signUpOrganization(input: OrganizationInput!, signUpUserInput2: UserInput!): Organization
    login(email: String!, password: String!): AuthPayload
    addJobPost(input: JobPostInput!): JobPost!
    updateJobPost(input: UpdateJobPostInput!): JobPost!
    applyForJob(input: JobApplicationInput!): JobApplied!
    updateApplicationStatus(id: ID!, status: String!, email: String!): JobApplied!
    updateOrganizationStatus(id: ID!, status: String!): Organization!
    deleteOrganization(id: ID!): Organization!
    deleteUser(id: ID!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    updateOrganizationPassword(id: ID!, password: String!): Organization
  }

  type Query {
    users: [User]
    user(id: ID!): User
    getAllOrganizations: [Organization]
    jobPosts(organization_id: ID): [JobPost]
    jobApplied(organizationId: ID!): [JobApplied]
    requestedCompanies(status: String): [Organization]
    countOrganizations: String!
    countUsers: String!
    countJobPosts: String!
    countUserApplications(userId: ID!): String!
    countOrganizationApplications(organizationId: ID!): String!
    countOrganizationJobPosts(organizationId: ID!): String!
    getUserJobApplied(userId: ID!): [JobApplied]!
    getRequestedCompanies: [Organization]
  }
`;

module.exports = typeDefs;