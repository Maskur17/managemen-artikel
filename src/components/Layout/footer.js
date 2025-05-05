"use client"

import Logo from '@/components/ui/Logo' // sesuaikan path ke file Logo.js Anda

export default function Footer() {
    return (
        <footer className="bg-[#2563EBDB] text-white py-6 mt-auto">
            <div className="flex items-center justify-center gap-3">
                <Logo />
                <p className="text-[16px]">
                    &copy; 2025 Blog Journal. All rights reserved.
                </p>
            </div>
        </footer>
    )
}