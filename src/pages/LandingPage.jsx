import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
const LandingPage = () => {
  return <div className="min-h-screen flex flex-col items-center justify-center p-4 gradient-bg text-white">
      <motion.div initial={{
      opacity: 0,
      y: -50
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.8,
      ease: "easeOut"
    }} className="text-center mb-12">
        <Building className="w-24 h-24 mx-auto mb-6 text-yellow-300 drop-shadow-lg" />
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">Inteligent Intercom System</h1>
        <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
          Seamless communication and access control for modern living.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <motion.div initial={{
        opacity: 0,
        x: -50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.7,
        delay: 0.2,
        ease: "easeOut"
      }}>
          <Card className="glassmorphism-card text-white border-none shadow-2xl hover:shadow-orange-400/50 transition-shadow duration-300 h-full">
            <CardHeader className="items-center">
              <div className="landing-icon-wrapper">
                  <i className="fa-solid fa-user-tie"></i>
              </div>
              <CardTitle className="text-3xl font-semibold">Building Manager</CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Manage your building, residents, and access with powerful tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-end flex-grow space-y-4">
              <Button asChild size="lg" variant="brand" className="w-full font-semibold py-3 text-lg">
                <Link to="/login/manager">Manager Login</Link>
              </Button>
               <p className="text-sm text-gray-300 pt-2">
                New User?{' '}
                <Link to="/signup/manager" className="font-medium text-orange-300 hover:text-orange-200 hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        x: 50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.7,
        delay: 0.4,
        ease: "easeOut"
      }}>
          <Card className="glassmorphism-card text-white border-none shadow-2xl hover:shadow-orange-400/50 transition-shadow duration-300 h-full">
            <CardHeader className="items-center">
              <div className="landing-icon-wrapper">
                  <i className="fa-solid fa-people-roof"></i>
              </div>
              <CardTitle className="text-3xl font-semibold">Resident Manager</CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Access your unit, manage visitors, and communicate easily.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-end flex-grow space-y-4">
              <Button asChild size="lg" variant="brand" className="w-full font-semibold py-3 text-lg">
                <Link to="/login/resident">Resident Login</Link>
              </Button>
              <p className="text-sm text-gray-300 pt-2">
                New User?{' '}
                <Link to="/signup/resident" className="font-medium text-orange-300 hover:text-orange-200 hover:underline">
                  Sign Up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div initial={{
      opacity: 0,
      y: 50
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.8,
      delay: 0.6,
      ease: "easeOut"
    }} className="mt-16 text-center">
        <p className="text-gray-300">
          Powered by Hostinger Horizons. &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>;
};
export default LandingPage;