// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { User, Lock } from 'lucide-react';
// import { Button, Input } from '../atoms';

// export const LoginForm = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Simulate API Call
//     setTimeout(() => {
//       setLoading(false);
//       // Redirect ไป Dashboard เมื่อ Login สำเร็จ
//       router.push('/dashboard');
//     }, 800);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="w-full space-y-4">
//       <Input 
//         label="Username" 
//         icon={User} 
//         placeholder="telesale_demo" 
//         defaultValue="telesale_demo"
//         required
//       />
//       <Input 
//         label="Password" 
//         type="password" 
//         icon={Lock} 
//         placeholder="••••••••" 
//         defaultValue="password"
//         required
//       />
      
//       <Button 
//         type="submit" 
//         className="w-full py-3 mt-4" 
//         disabled={loading}
//       >
//         {loading ? 'Authenticating...' : 'Login to Dashboard'}
//       </Button>
//     </form>
//   );
// };