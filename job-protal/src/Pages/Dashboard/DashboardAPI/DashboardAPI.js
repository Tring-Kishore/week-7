import { gql } from '@apollo/client';

export const GET_CUURENT_USER_OR_ORGANIZATION_QUERY = gql`
  query GetCurrentUser {
    getCurrentUser {
      token
      user {
        id
        name
        email
      }
      organization {
        id
        company_name
        email
      }
    }
  }
`;