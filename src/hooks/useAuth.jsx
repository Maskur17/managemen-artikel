'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState < boolean | null > (null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.push('/auth/login');
        }
    }, [router]);

    return isAuthenticated;
}
