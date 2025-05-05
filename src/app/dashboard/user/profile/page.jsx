"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");

    useEffect(() => {
        const getProfile = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    toast.error("Access token is missing");
                    return;
                }

                const response = await api.get("/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProfile(response.data);
                setUsername(response.data.username);
                setPassword(response.data.password || "");
                setRole(response.data.role);
            } catch (error) {
                toast.error(error.message || "Failed to fetch profile");
            }
        };

        getProfile();
    }, []);

    if (!profile) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 md:px-10 md:py-6">
                <div className="flex justify-start">
                    <img src="/logoLogin.svg" alt="Logo" className="w-20 sm:w-24 md:w-28" />
                </div>
                <div className="flex items-center gap-3">
                    {profile ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center cursor-pointer">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#2563EB] font-bold uppercase">
                                        {profile.username?.charAt(0)}
                                    </div>
                                    <span className="font-medium text-sm md:text-lg capitalize underline ml-2">
                                        {profile.username}
                                    </span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white text-black rounded-lg shadow-lg">
                                <DropdownMenuItem
                                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        window.location.href = "/profile";
                                    }}
                                >
                                    My Account
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        localStorage.removeItem("access_token");
                                        window.location.href = "/auth/login";
                                    }}
                                >
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100" />
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-2xl font-semibold text-center mb-6">User Profile</h2>

                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center text-[#2563EB] font-bold uppercase text-xl">
                            {profile.username?.charAt(0)}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Username */}
                        <div className="flex items-center bg-[#F3F4F6] px-4 py-2 rounded border-2 border-gray-200">
                            <span className="w-24 font-bold text-black">Username</span>
                            <span className="w-4 text-center">:</span>
                            <div className="flex-1 text-center">
                                {editMode ? (
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full text-center"
                                    />
                                ) : (
                                    <p className="text-gray-800">{profile.username}</p>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex items-center bg-[#F3F4F6] px-4 py-2 rounded border-2 border-gray-200">
                            <span className="w-24 font-bold text-black">Password</span>
                            <span className="w-4 text-center">:</span>
                            <div className="flex-1 text-center">
                                {editMode ? (
                                    <Input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full text-center"
                                    />
                                ) : (
                                    <p className="text-gray-800">{profile.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-center bg-[#F3F4F6] px-4 py-2 rounded border-2 border-gray-200">
                            <span className="w-24 font-bold text-black">Role</span>
                            <span className="w-4 text-center">:</span>
                            <div className="flex-1 text-center">
                                {editMode ? (
                                    <Input
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full text-center"
                                    />
                                ) : (
                                    <p className="text-gray-800">{profile.role}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => (window.location.href = "/dashboard/user")}
                        className="text-white cursor-pointer rounded bg-[#2563EB] text-center py-2 mt-6"
                    >
                        Back to Home
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#2563EB] text-white text-center py-4 mt-auto">
                <p className="text-sm">&copy; 2025 Blog Journal. All rights reserved.</p>
            </footer>
        </div>
    );
}
