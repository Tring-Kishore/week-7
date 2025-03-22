import { gql } from '@apollo/client';

// Mutation for User Sign-Up
export const SIGNUP_MUTATION = gql`
  mutation SignUpUser($input: UserInput!) {
  signUpUser(input: $input) {
    id
    name
    email
    phone
    role
    created_at
  }
}
`;
export const SIGNUP_ORGANIZATION_MUTATION = gql`
mutation SignUpOrganization($input: OrganizationInput!, $signUpUserInput2: UserInput!) {
  signUpOrganization(input: $input, signUpUserInput2: $signUpUserInput2) {
    id
    organization_id
    website
    status
  }
}
`;