import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../../Components/CustomSideBar/SideBar';
import TopBar from '../../Components/CustomTopBar/TopBar';
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../Auth/verifyToken';

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decoded = verifyToken(token);

      if (decoded) {
        console.log('Decoded Token:', decoded);
        const { userId, userType, userName }  : any = decoded;
        console.log('User ID:', userId);
        console.log('User Type:', userType);
        console.log('User Name:', userName);
      } else {
        // Token is invalid or expired, clear it from localStorage
        localStorage.removeItem('token');
        navigate('/login'); // Redirect to login page
      }
    } else {
      // No token found, redirect to login
      navigate('/login');
    }
  }, [navigate]);
  return (
    <div className="dashboardLayout">
      {/* Static SideBar */}
      <div className="sideBarContainer">
        <SideBar />
      </div>

      {/* Main Content Area */}
      <div className="mainContent">
        {/* Static TopBar */}
        <div className="topBarContainer">
          <TopBar />
        </div>

        {/* Dynamic Content */}
        <div className="contentContainer">
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;