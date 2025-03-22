import { gql } from '@apollo/client';

// Fetch all organizations
export const GET_ALL_ORGANIZATIONS = gql`
  query GetAllOrganizations {
    getAllOrganizations {
      id
      website
      description
      status
      location
      created_at
      updated_at
      deleted_at
      organization_id
      update_password_state
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;

// Fetch requested organizations (pending status)
export const GET_REQUESTED_COMPANIES = gql`
  query GetRequestedCompanies {
    getRequestedCompanies {
      id
      website
      description
      status
      location
      created_at
      updated_at
      deleted_at
      organization_id
      update_password_state
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;

// Update organization status
export const UPDATE_ORGANIZATION_STATUS = gql`
  mutation UpdateOrganizationStatus($id: ID!, $status: String!) {
    updateOrganizationStatus(id: $id, status: $status) {
      id
      status
      user {
        id
        name
        email
      }
    }
  }
`;

// Delete an organization
export const DELETE_ONE_ORGANIZATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id) {
      id
      user {
        id
        name
        email
      }
    }
  }
`;
