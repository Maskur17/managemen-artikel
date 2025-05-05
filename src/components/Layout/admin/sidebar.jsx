"use client";
import { LogOut, Newspaper, Folder } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function Sidebar({ logoSrc = "/logo.svg" }) {
    const router = useRouter();
    const [openLogoutModal, setOpenLogoutModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        router.push("/auth/login");
    };

    const navItemClass =
        "flex items-center gap-2 hover:bg-[#3B82F6] rounded px-2 py-1 transition-colors duration-200 cursor-pointer";

    return (
        <aside className="w-[267px] h-screen bg-blue-600 text-white flex flex-col p-4">
            <div className="flex items-center mb-6 p-2">
                <img src={logoSrc} alt="Logo" className="w-[134px] h-[24px] sm:w-24 md:w-28" />
            </div>
            <nav className="flex flex-col gap-4 flex-1 p-2">
                <Link href="/dashboard/admin/artikel" className={navItemClass}>
                    <Newspaper size={20} />
                    <span>Articles</span>
                </Link>
                <Link href="/dashboard/admin/category" className={navItemClass}>
                    <Folder size={20} />
                    <span>Category</span>
                </Link>
                <button
                    onClick={() => setOpenLogoutModal(true)}
                    className={navItemClass}
                    aria-label="Logout"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </nav>

            {/* Logout Confirmation Modal */}
            <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Logout</DialogTitle>
                        <DialogDescription className="text-[#64748B] text-[14px]">Are you sure want to logout?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" className="cursor-pointer" onClick={() => setOpenLogoutModal(false)}>Cancel</Button>
                        <Button
                            variant="default"
                            className="cursor-pointer bg-blue-500 hover:bg-blue-400 text-white"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
