import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_DETAILS_QUERY, UPDATE_USER_MUTATION } from './UserDetailsAPI/UserDetailsAPI';
import './UserDetails.scss';
import { jwtDecode } from 'jwt-decode';
import Loader from '../Loader/Loader';
import { Button } from '@mui/material';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const token: any = localStorage.getItem('token');
  const decoded: any = jwtDecode(token);
  const userId = decoded.userId;
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
    skills: '',
    description: '',
  });

  // Fetch user details
  const { data, loading, error } = useQuery(GET_USER_DETAILS_QUERY, {
    fetchPolicy: 'network-only',
    variables: { id: userId },
    onCompleted: (data) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          age: data.user.userdetails?.age || '',
          experience: data.user.userdetails?.experience || '',
          skills: data.user.userdetails?.skills || '',
          description: data.user.userdetails?.description || '',
        });
      }
    },
  });

  // Update user details mutation
  const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
    fetchPolicy: 'network-only',
    onCompleted: () => {
      toast.success('User details updated successfully!');
      navigate('/dashboard');
    },
    onError: (err) => {
      console.error('Error updating user details:', err);
    },
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateUser({
        variables: {
          id: userId,
          input: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            age: parseInt(user.age),
            experience: user.experience,
            skills: user.skills,
            description: user.description,
          },
        },
      });
    } catch (error) {
      console.error('Error updating user details:', error);
      alert('Failed to update user details. Please try again.');
    }
  };

  if (loading) return <Loader />;
  if (error) return <p>Error fetching user details: {error.message}</p>;

  return (
    <div className="outer-class">
      <div className="user-details-container">
        <h1>User Details</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input type="text" name="name" value={user.name} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={user.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input type="text" name="phone" value={user.phone} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Age:</label>
            <input type="number" name="age" value={user.age} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Experience:</label>
            <input name="experience" value={user.experience} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Skills:</label>
            <input name="skills" value={user.skills} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea name="description" value={user.description} onChange={handleInputChange} />
          </div>
          <div className="button-group">
            <Button type="button" variant="outlined" color="secondary" onClick={() => navigate('/dashboard')}>
              Close
            </Button>
            <Button type="submit" className="update-button">
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetails;