import { gql } from '@apollo/client';
export const GET_JOB_ALL_POSTS_QUERY = gql`
  query GetJobPosts {
    jobPosts {
      id
      job_title
      category
      openings
      experience
      description
      package
      language
      skills
      organization_id
    }
  }
`;

export const GET_JOB_POSTS_QUERY = gql`
  query GetJobPosts($organization_id: ID) {
    jobPosts(organization_id: $organization_id) {
      id
      job_title
      category
      openings
      experience
      description
      package
      language
      skills
      organization_id
    }
  }
`;

export const COUNT_ORGANIZATIONS = gql`
  query CountOrganizations {
    countOrganizations
  }
`;

export const COUNT_USERS = gql`
  query CountUsers {
    countUsers
  }
`;

export const COUNT_JOB_POSTS = gql`
  query CountJobPosts {
    countJobPosts
  }
`;

export const COUNT_USER_APPLICATIONS = gql`
  query CountUserApplications($userId: ID!) {
    countUserApplications(userId: $userId)
  }
`;

export const COUNT_ORGANIZATION_APPLICATIONS = gql`
  query CountOrganizationApplications($organizationId: ID!) {
    countOrganizationApplications(organizationId: $organizationId)
  }
`;

export const COUNT_ORGANIZATION_JOB_POSTS = gql`
  query CountOrganizationJobPosts($organizationId: ID!) {
    countOrganizationJobPosts(organizationId: $organizationId)
  }
`;