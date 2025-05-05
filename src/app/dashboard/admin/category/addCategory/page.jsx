'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function AddCategory({ refreshCategories, currentPage }) {
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            setError("Category field cannot be empty");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem('access_token');

            if (!token) {
                toast.error("No authentication token found");
                return;
            }

            await api.post('/categories', { name: categoryName }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Category added successfully");
            setCategoryName("");
            setIsOpen(false);
            // Refresh categories after adding
            refreshCategories(currentPage);
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Failed to add category");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="default" className="cursor-pointer bg-blue-500 hover:bg-blue-400" onClick={() => setIsOpen(true)}>
                        <Plus size={16} className="mr-2" />
                        Add Category
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <Label htmlFor="name" className="text-right">
                            Category
                        </Label>
                        <div className="grid grid-cols-2 items-center">
                            <Input
                                id="name"
                                placeholder="Input Category"
                                className="col-span-3"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" className="cursor-pointer bg-white border hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={loading}
                            className="cursor-pointer bg-blue-500 hover:bg-blue-400"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
