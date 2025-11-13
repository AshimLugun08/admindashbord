// src/components/OAuthCallback.tsx (Corrected)

import { useEffect, useState } from 'react'; // 🔑 Import useState
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

export default function OAuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUserAndToken } = useAuth(); 
    
    // 🔑 State flag to ensure processing runs only once
    const [isProcessing, setIsProcessing] = useState(false); 

    useEffect(() => {
        // Prevent running if the process has already started or finished
        if (isProcessing) return; 

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const email = params.get('email');
        const id = params.get('id');
        const name = params.get('name');
        const role = params.get('role');

        // Check for required data
        if (token && id && email && name && role) {
            // 🔑 Set processing flag to true BEFORE state update/navigation
            setIsProcessing(true); 

            const userData = { 
                id, 
                name: decodeURIComponent(name), 
                email: decodeURIComponent(email), 
                role 
            };
            
            // 1. Update AuthContext state (triggers re-render)
            setUserAndToken(userData, token); 
            
            // 2. Redirect user immediately (prevents the loop)
            navigate('/admin/dashboard', { replace: true }); 
        } else {
            // Handle failure redirect
            navigate('/login?error=oauth_failed', { replace: true });
        }
        
    // ⚠️ IMPORTANT: We remove setUserAndToken from dependencies. 
    // Since it's a context function, it's stable, and including it here 
    // is often what triggers the warning in development mode.
    // We rely only on location changes to trigger this effect.
    }, [location.search, navigate, isProcessing]); // 🔑 Adjusted dependencies

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
            <div className="text-xl animate-pulse">Processing Sign-In Securely...</div>
            <p className="text-slate-400 mt-2">Completing authentication and setting up your session.</p>
        </div>
    );
}