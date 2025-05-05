"use client";

import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function HeaderAdmin({ logoSrc = "/logo.svg", buttonBlue = "bg-[#2563EB] hover:bg-[#2563ABE] text-white" }) {
    const [profile, setProfile] = useState(null);
    const router = useRouter();
    const [openModal, setOpenModal] = useState(false);

    const getProfile = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Access token is missing");
                return;
            }

            const response = await api.get("/auth/profile", {
                headers: { Authorization: `Bearer ${token} ` },
            });
            setProfile(response.data);
        } catch (error) {
            toast.error(error.message || "Failed to fetch profile");
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    // Handle logout action
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        router.push("/auth/login");
    };

    return (
        <header className="flex justify-between items-center px-6 py-4 md:px-10 md:py-6 z-10">
            <img src={logoSrc} alt="Logo" className="w-20 sm:w-24 md:w-28" />
            <div className="flex items-center gap-3">
                {profile ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#2563EB] font-bold uppercase">
                                    {profile.username?.charAt(0)}
                                </div>
                                <span className="ml-2 font-medium text-sm sm:text-base md:text-lg capitalize underline">
                                    {profile.username}
                                </span>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white text-black rounded-lg shadow-lg ">
                            <DropdownMenuItem onClick={() => router.push("/profile")}>
                                <p className="text-[#0F172A] cursor-pointer">
                                    My Account
                                </p>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={() => setOpenModal(true)}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                )}
            </div>

            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Logout</DialogTitle>
                    </DialogHeader>
                    <p className="text-[#64748B] text-[14px]">Are you sure you want to logout?</p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button>
                        <Button onClick={handleLogout} className={buttonBlue}>Logout</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
}
