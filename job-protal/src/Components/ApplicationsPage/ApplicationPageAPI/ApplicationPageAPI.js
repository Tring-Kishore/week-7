import { gql } from "@apollo/client";

export const GET_ALL_APPLICATIONS = gql`
  query getJobApplied($organizationId: ID!) {
    jobApplied(organizationId: $organizationId) {
      id
      jobpost_id
      organization_id
      user_id
      status
      created_at
      updated_at
      name
      email
      job_title
      category
      company
      openings
      skills
    }
  }
`;

export const GET_ALL_USER_APPLICATIONS = gql`
  query getUserJobApplied($userId: ID!) {
    getUserJobApplied(userId: $userId) {
      id
      jobpost_id
      organization_id
      user_id
      status
      created_at
      updated_at
      name
      email
      job_title
      category
      company
      openings
      skills
    }
  }
`;

export const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($id: ID!, $status: String!, $email: String!) {
    updateApplicationStatus(id: $id, status: $status, email: $email) {
      id
      status
      email
    }
  }
`;
