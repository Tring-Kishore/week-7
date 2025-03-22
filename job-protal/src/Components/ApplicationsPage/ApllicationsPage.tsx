import React, { useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TablePagination,
} from '@mui/material';
import './ApplicationsPage.scss';
import { jwtDecode } from 'jwt-decode';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_APPLICATIONS, GET_ALL_USER_APPLICATIONS, UPDATE_APPLICATION_STATUS } from './ApplicationPageAPI/ApplicationPageAPI';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';
type UserRole = 'user' | 'organization';

interface JobApplication {
  id: string;
  jobpost_id: string;
  organization_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  job_title: string;
  category: string;
  company: string;
  openings: string;
  skills: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  job_title: string;
  skills: string;
  status: string;
}

const ApplicationsPage: React.FC = () => {
  const token: any = localStorage.getItem('token');
  const decoded: any = jwtDecode(token);
  const userType: UserRole = decoded.role;
  const organizationId = decoded.userId;
  const userId = decoded.userId;

  console.log('Decoded Token:', decoded); // Debugging

  // Fetch job applications for user or applicants for organization
  const { data: jobPostsData, loading, error } = useQuery(
    userType === 'user' ? GET_ALL_USER_APPLICATIONS : GET_ALL_APPLICATIONS,
    {
      fetchPolicy: 'network-only',
      variables: {
        userId: userType === 'user' ? userId : null,
        organizationId: organizationId,
      },
      skip: userType === 'organization' && !organizationId, // Skip query if organizationId is not available
    }
  );

  const jobPosts = userType === 'user' ? jobPostsData?.getUserJobApplied || [] : jobPostsData?.jobApplied || [];
  console.log('Job Posts Data:', jobPosts);

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateApplicationStatus] = useMutation(UPDATE_APPLICATION_STATUS,{fetchPolicy:'network-only'});

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle row click for user (job application details)
  const handleJobRowClick = (application: JobApplication) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  // Handle row click for organization (applicant details)
  const handleApplicantRowClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApplication(null);
    setSelectedApplicant(null);
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  // Slice data for the current page
  const paginatedJobPosts = jobPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // Actions for organization
  const handleApprove = async () => {
    if (selectedApplicant) {
      try {
        await updateApplicationStatus({
          variables: { id: selectedApplicant.id, status: 'Approved', email: organizationId },
        });
        toast.success(`Approved: ${selectedApplicant.name}`);
        handleCloseDialog();
      } catch (error) {
        console.error('Error approving application:', error);
        toast.error('Failed to approve application');
      }
    }
  };

  const handleReject = async () => {
    if (selectedApplicant) {
      try {
        await updateApplicationStatus({
          variables: { id: selectedApplicant.id, status: 'Rejected', email: organizationId },
        });
        toast(`Rejected: ${selectedApplicant.name}`);
        handleCloseDialog();
      } catch (error) {
        console.error('Error rejecting application:', error);
        toast.error('Failed to reject application');
      }
    }
  };

  const handleWaitingList = async () => {
    if (selectedApplicant) {
      try {
        await updateApplicationStatus({
          variables: { id: selectedApplicant.id, status: 'Waiting List', email: organizationId },
        });
        toast(`Added to Waiting List: ${selectedApplicant.name}`);
        handleCloseDialog();
      } catch (error) {
        console.error('Error adding to waiting list:', error);
        toast.error('Failed to add to waiting list');
      }
    }
  };

  if (loading) return <Loader/>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="applicationsPage">
      <h1>Applications</h1>

      {/* Table for User */}
      {userType === 'user' && (
  <TableContainer component={Paper} className="applicationsTable">
    <Table>
      <TableHead className="tableHead">
        <TableRow>
          <TableCell align='center' className='tableHeaderContent'>S.No</TableCell>
          <TableCell align='center' className='tableHeaderContent'>Job Title</TableCell>
          <TableCell align='center' className='tableHeaderContent'>Company</TableCell>
          <TableCell align='center' className='tableHeaderContent'>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedJobPosts.map((application: JobApplication, index: number) => (
          <TableRow
            key={application.id}
            hover
            onClick={() => handleJobRowClick(application)}
            style={{ cursor: 'pointer' }}
          >
            <TableCell align='center' className='tableBodyConent'>{index + 1 + page * rowsPerPage}</TableCell>
            <TableCell align='center' className='tableBodyConent'>{application.job_title}</TableCell>
            <TableCell align='center' className='tableBodyConent'>{application.company}</TableCell>
            <TableCell align='center' className='tableBodyConent'>{application.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={jobPosts.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  </TableContainer>
)}

      {/* Table for Organization */}
      {userType === 'organization' && (
        <>
        
        {paginatedJobPosts.length > 0 ? (
        <TableContainer component={Paper} className="applicationsTable">
          <Table>
            <TableHead className="tableHead">
              <TableRow>
                <TableCell className='tableHeaderContent'>Name</TableCell>
                <TableCell className='tableHeaderContent'>Email</TableCell>
                <TableCell className='tableHeaderContent'>Job Role</TableCell>
                {/* <TableCell className='tableHeaderContent'>Skills</TableCell> */}
                <TableCell className='tableHeaderContent'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedJobPosts.map((applicant: Applicant, index: number) => (
                <TableRow
                  key={applicant.id}
                  hover
                  onClick={() => handleApplicantRowClick(applicant)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell className='tableBodyConent'>{applicant.name}</TableCell>
                  <TableCell className='tableBodyConent'>{applicant.email}</TableCell>
                  <TableCell className='tableBodyConent'>{applicant.job_title}</TableCell>
                  {/* <TableCell className='tableBodyConent'>{applicant.skills}</TableCell> */}
                  <TableCell className='tableBodyConent'>{applicant.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={jobPosts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>) : (
          <div className='noDataMessage'>No data Found</div>
        )}
       </> 
      )}

      {/* Dialog for User (Job Application Details) */}
      {userType === 'user' && selectedApplication && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Job Application Details</DialogTitle>
          <DialogContent>
            <div className="jobDetails">
              <p><strong>Job Title:</strong> {selectedApplication.job_title}</p>
              <p><strong>Category:</strong> {selectedApplication.category}</p>
              <p><strong>Company:</strong> {selectedApplication.company}</p>
              <p><strong>Openings:</strong> {selectedApplication.openings}</p>
              <p><strong>Skills:</strong> {selectedApplication.skills}</p>
              <p><strong>Status:</strong> {selectedApplication.status}</p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog for Organization (Applicant Details) */}
      {userType === 'organization' && selectedApplicant && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Applicant Details</DialogTitle>
          <DialogContent>
            <div className="applicantDetails">
              <p><strong>Name:</strong> {selectedApplicant.name}</p>
              <p><strong>Email:</strong> {selectedApplicant.email}</p>
              <p><strong>Job Role:</strong> {selectedApplicant.job_title}</p>
              <p><strong>Skills:</strong> {selectedApplicant.skills}</p>
              <p><strong>Status:</strong> {selectedApplicant.status}</p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleApprove} color="primary">
              Approve
            </Button>
            <Button onClick={handleReject} color="secondary">
              Reject
            </Button>
            <Button onClick={handleWaitingList} color="info">
              Waiting List
            </Button>
            <Button onClick={handleCloseDialog} color="inherit">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
      )}
    </div>
  );
};

export default ApplicationsPage;