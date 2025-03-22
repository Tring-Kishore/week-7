import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../../Pages/Auth/SignUp/SignUp.scss';
import logo from '../../asserts/images/cropped-purple-logo.png';
import { UPDATE_ORGANIZATION_PASSWORD } from './UpdatePasswordAPI/UpdatePasswordAPI';
import { useMutation } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

type FormData = {
  password: string;
};

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [updateOrganizationPassword, { loading }] = useMutation(UPDATE_ORGANIZATION_PASSWORD);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: FormData) => {
    console.log('Updating password:', data);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token found. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const organizationId = decoded.userId;

      await updateOrganizationPassword({
        variables: { id: organizationId, password: data.password },
      });

      toast.success('Password updated successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (loading) return <Loader />;

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="borderSignup">
          <div className="logoContainer">
            <img src={logo} alt="logo" width="205px" height="110px" />
          </div>
          <h2 className="signUpHeading">Update Password</h2>

          {/* Password Field */}
          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long',
                },
              })}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'hide password' : 'show password'}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
            {errors.password && (
              <Typography color="error" variant="body2">
                {errors.password.message}
              </Typography>
            )}
          </FormControl>

          {/* Reset Password Text */}
          

          {/* Buttons Container */}
          <div className="buttons-container" style={{ display: 'flex', gap: '10px' }}>
            {/* Update Password Button */}
            <Button type="submit" variant="contained">
              Update Password
            </Button>

            {/* Skip Button */}
            <Button type="button" variant="outlined" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdatePassword;