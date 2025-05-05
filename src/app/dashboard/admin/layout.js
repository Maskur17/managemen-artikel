'use client';

import { useEffect, useState } from 'react';
import Sidebar from "@/components/Layout/admin/sidebar";
import Header from "@/components/Layout/admin/header";
import { useRouter } from "next/navigation";

const AdminLayout = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userLoggedIn = localStorage.getItem('access_token');
        if (!userLoggedIn) {
            setIsAuthenticated(false);
            router.push('/404');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-100">
                <Header />
                <main className="p-2 flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
