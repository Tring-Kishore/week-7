import { gql } from '@apollo/client';

export const GET_USER_DETAILS_QUERY = gql`
  query GetUserDetails($id: ID!) {
    user(id: $id) {
      id
      name
      email
      phone
      userdetails {
        age
        experience
        skills
        description
      }
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      phone
      userdetails {
        age
        experience
        skills
        description
      }
    }
  }
`;