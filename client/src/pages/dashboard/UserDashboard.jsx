import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const UserDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard - NexusMart</title>
      </Helmet>
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">User Dashboard</h1>
          <div className="grid md:grid-cols-4 gap-8">
            <aside className="card p-6">
              <nav className="space-y-2">
                <a href="/dashboard" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Overview
                </a>
                <a href="/dashboard/orders" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Orders
                </a>
                <a href="/dashboard/wishlist" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Wishlist
                </a>
                <a href="/dashboard/profile" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  Profile
                </a>
              </nav>
            </aside>
            <div className="md:col-span-3">
              <Routes>
                <Route path="/" element={<div>Dashboard Overview</div>} />
                <Route path="/orders" element={<div>Orders List</div>} />
                <Route path="/wishlist" element={<div>Wishlist</div>} />
                <Route path="/profile" element={<div>Profile Settings</div>} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
