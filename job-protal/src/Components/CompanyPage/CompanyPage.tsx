import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination,
} from '@mui/material';
import './CompanyPage.scss';
import { GET_ALL_ORGANIZATIONS, GET_REQUESTED_COMPANIES, UPDATE_ORGANIZATION_STATUS, DELETE_ONE_ORGANIZATION } from './CompanyPageAPI/CompanyPageAPI';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

interface Company {
  id: string;
  website: string;
  description: string;
  status: string;
  location: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  organization_id: string;
  update_password_state: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

const CompanyPage: React.FC = () => {
  const { data: allCompaniesData, loading: allCompaniesLoading, error: allCompaniesError, refetch: refetchAllCompanies } = useQuery(GET_ALL_ORGANIZATIONS,{fetchPolicy:'network-only'});
  const { data: requestedCompaniesData, loading: requestedCompaniesLoading, error: requestedCompaniesError, refetch: refetchRequestedCompanies } = useQuery(GET_REQUESTED_COMPANIES,{fetchPolicy:'network-only'});
  const [updateOrganizationStatus] = useMutation(UPDATE_ORGANIZATION_STATUS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      toast.success(`Status updated: ${data.updateOrganizationStatus.user.name}`);
      handleCloseDialog();
      refetchRequestedCompanies(); // Refetch data to update the table
      refetchAllCompanies(); // Refetch all companies to update the list
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Failed to update organization status');
    },
  });
  const [deleteOrganization] = useMutation(DELETE_ONE_ORGANIZATION, {
    fetchPolicy:'network-only',
    onCompleted: (data) => {
      console.log('Mutation completed:', data);
      toast.success(`Deleted: ${data.deleteOrganization.user.name}`);
      handleCloseDialog();
      refetchRequestedCompanies(); // Refetch data to update the table
      refetchAllCompanies(); // Refetch all companies to update the list
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Failed to delete organization');
    },
  });
  const [showRequestedCompanies, setShowRequestedCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (allCompaniesLoading || requestedCompaniesLoading) return <Loader />;
  if (allCompaniesError) return <p>Error: {allCompaniesError.message}</p>;
  if (requestedCompaniesError) return <p>Error: {requestedCompaniesError.message}</p>;

  const allCompanies = allCompaniesData?.getAllOrganizations || [];
  const requestedCompanies = requestedCompaniesData?.getRequestedCompanies || [];

  // Filter companies based on whether to show requested companies or all companies
  const filteredCompanies = showRequestedCompanies ? requestedCompanies : allCompanies;

  // Pagination logic
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  // Slice data for the current page
  const paginatedCompanies = filteredCompanies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleRequestedCompaniesClick = () => {
    setShowRequestedCompanies(true);
    refetchRequestedCompanies(); // Refetch data to ensure it's up-to-date
  };

  const handleBackToAllCompanies = () => {
    setShowRequestedCompanies(false);
  };

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
  };

  const handleApprove = async () => {
    if (selectedCompany) {
      try {
        await updateOrganizationStatus({
          variables: { id: selectedCompany.id, status: 'approved' },
        });
      } catch (error) {
        console.error('Error approving organization:', error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedCompany) {
      try {
        await updateOrganizationStatus({
          variables: { id: selectedCompany.id, status: 'rejected' },
        });
      } catch (error) {
        console.error('Error rejecting organization:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCompany) {
      console.log('Deleting organization with ID:', selectedCompany.id); // Debugging
      try {
        await deleteOrganization({ variables: { id: selectedCompany.id } });
      } catch (error) {
        console.error('Error deleting organization:', error);
      }
    }
  };

  return (
    <div className="companyPage">
      <h1>Companies</h1>
      <div className="btns">
        {!showRequestedCompanies ? (
          <Button onClick={handleRequestedCompaniesClick}>Requested Companies</Button>
        ) : (
          <Button onClick={handleBackToAllCompanies}>Back to All Companies</Button>
        )}
      </div>

      {/* Table for Companies */}
      {paginatedCompanies.length > 0 ? (
        <TableContainer component={Paper} className="companyTable">
          <Table>
            <TableHead className="tableHead">
              <TableRow>
                <TableCell className='tableHeaderContent'>S.No</TableCell>
                <TableCell className='tableHeaderContent'>Company Name</TableCell>
                <TableCell className='tableHeaderContent'>Email</TableCell>
                <TableCell className='tableHeaderContent'>Website</TableCell>
                <TableCell className='tableHeaderContent'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCompanies.map((company: Company, index: number) => (
                <TableRow key={company.id} hover onClick={() => handleRowClick(company)} style={{ cursor: 'pointer' }}>
                  <TableCell className='tableBodyConent'>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell className='tableBodyConent'>{company.user.name}</TableCell>
                  <TableCell className='tableBodyConent'>{company.user.email}</TableCell>
                  <TableCell className='tableBodyConent'>{company.website}</TableCell>
                  <TableCell className='tableBodyConent'>{company.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCompanies.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <div className='noDataMessage'>No data Found</div>
      )}

      {/* Dialog for Company Details */}
      {selectedCompany && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Company Details</DialogTitle>
          <DialogContent>
            <div className="companyDetails">
              <p><strong>Name:</strong> {selectedCompany.user.name}</p>
              <p><strong>Email:</strong> {selectedCompany.user.email}</p>
              <p><strong>Website:</strong> {selectedCompany.website}</p>
              <p><strong>Status:</strong> {selectedCompany.status}</p>
            </div>
          </DialogContent>
          <DialogActions>
            {selectedCompany.status === 'pending' ? (
              <>
                <Button onClick={handleApprove} color="primary">Approve</Button>
                <Button onClick={handleReject} color="secondary">Reject</Button>
              </>
            ) : selectedCompany.status === 'approved' ? (
              <Button onClick={handleDelete} color="secondary">Delete</Button>
            ) : null}
            <Button onClick={handleCloseDialog} color="inherit">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default CompanyPage;