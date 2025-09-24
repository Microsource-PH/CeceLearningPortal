// Quick script to add Sarah Johnson to the mock authentication system
// Run this to ensure Sarah Johnson can login

const setupSarahJohnsonAuth = () => {
  // Mock users for authentication (this simulates what the backend would have)
  const mockAuthUsers = [
    {
      id: 'admin-user',
      email: 'admin@example.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'Admin'
    },
    {
      id: 'student-user',
      email: 'student@example.com',
      password: 'student123',
      fullName: 'John Smith',
      role: 'Learner'
    },
    {
      id: 'instructor-user',
      email: 'instructor@example.com',
      password: 'instructor123',
      fullName: 'Dr. Sarah Johnson',
      role: 'Creator'
    },
    {
      id: 'sarah-johnson',
      email: 'sarah.johnson@example.com',
      password: 'Creator123!',
      fullName: 'Dr. Sarah Johnson',
      role: 'Creator'
    }
  ];

  // Store in localStorage for mock authentication
  localStorage.setItem('mockAuthUsers', JSON.stringify(mockAuthUsers));
  
  console.log('Sarah Johnson authentication setup complete!');
  console.log('You can now login with:');
  console.log('Email: sarah.johnson@example.com');
  console.log('Password: Creator123!');
  console.log('');
  console.log('Alternative instructor account:');
  console.log('Email: instructor@example.com');
  console.log('Password: instructor123');
};

// Run the setup
setupSarahJohnsonAuth();