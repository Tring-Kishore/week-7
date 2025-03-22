import { gql } from '@apollo/client';

export const UPDATE_ORGANIZATION_PASSWORD = gql`
  mutation UpdateOrganizationPassword($id: ID!, $password: String!) {
    updateOrganizationPassword(id: $id, password: $password) {
      id
      website
      description
      status
      location
      update_password_state
      user {
        id
        name
        email
        phone
      }
    }
  }
`;