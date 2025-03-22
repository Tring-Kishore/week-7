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
      organization {
        name
      }
    }
  }`
;

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

export const ADD_JOB_POST_MUTATION = gql`
  mutation AddJobPost($input: JobPostInput!) {
    addJobPost(input: $input) {
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

export const UPDATE_JOB_POST_MUTATION = gql`
  mutation UpdateJobPost($input: UpdateJobPostInput!) {
    updateJobPost(input: $input) {
      id
      job_title
      category
      openings
      experience
      description
      package
      language
      skills
    }
  }
`;

export const APPLY_FOR_JOB_MUTATION = gql`
  mutation ApplyForJob($input: JobApplicationInput!) {
    applyForJob(input: $input) {
      id
      jobpost_id
      user_id
      organization_id
      status
    }
  }
`;