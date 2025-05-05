'use client'

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import AddCategory from "@/app/dashboard/admin/category/addCategory/page";
import useDebounce from "@/hooks/useDebounce";

export default function CategoryTable({
    containerClassName = "bg-[#F9FAFB] rounded-lg p-4",
    headerClassName = "flex justify-between items-center border-b",
    tableClassName = "",
    cellClassName = "",
    rowClassName = "",
    actionButtonClassName = "",
}) {
    const [categories, setCategories] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false); // State for edit modal
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 400);

    const getCategories = async (page = currentPage, query = "") => {
        const limit = 10;
        try {
            const params = query
                ? { page, limit, search: query }
                : { page, limit };

            const response = await api.get("/categories", { params });

            if (Array.isArray(response.data.data)) {
                setCategories(response.data.data);
                setTotalPages(Math.ceil(response.data.totalData / limit));
                setTotalItems(response.data.totalData);
            } else {
                console.error("Invalid categories format", response.data);
            }
        } catch (error) {
            toast.error(error.message || "Error fetching categories");
        } finally {
            setIsLoading(false);
        }
    };

    const updateCategory = async () => {
        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                toast.error("No token found. Please login.");
                return;
            }

            const response = await api.put(
                `/categories/${selectedCategory.id}`,
                {
                    name: selectedCategory.name,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setCategories(prevCategories =>
                    prevCategories.map(category =>
                        category.id === selectedCategory.id
                            ? { ...category, name: selectedCategory.name }
                            : category
                    )
                );

                toast.success("Category updated successfully");
                setOpenEditModal(false);
            } else {
                toast.error("Failed to update category");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while updating the category");
        }
    };


    useEffect(() => {
        getCategories(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    const handleDeleteClick = (category) => {
        setSelectedCategory(category);
        setOpenModal(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                toast.error("No token found. Please login.");
                return;
            }

            const response = await api.delete(`/categories/${selectedCategory.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setCategories(prev => prev.filter(item => item.id !== selectedCategory.id));
                toast.success("Category deleted successfully");
                setOpenModal(false);
                setSelectedCategory(null);
            } else {
                toast.error("Failed to delete category");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while deleting the category");
        }
    };


    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setOpenEditModal(true);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const range = 2;

        let start = Math.max(currentPage - range, 1);
        let end = Math.min(currentPage + range, totalPages);

        if (currentPage > 3) {
            pageNumbers.push(1);
            if (start > 2) pageNumbers.push('...');
        }

        for (let i = start; i <= end; i++) {
            pageNumbers.push(i);
        }

        if (currentPage < totalPages - 2) {
            if (end < totalPages - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return (
        <div className={containerClassName}>
            <h1 className="text-[16px] border-b">Total Category: {totalItems}</h1>
            <div className={headerClassName}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by name"
                        className="border rounded px-2 py-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <AddCategory refreshCategories={getCategories} currentPage={currentPage} />
            </div>

            <Table className={tableClassName}>
                <TableHeader className="bg-[#F3F4F6]">
                    <TableRow>
                        <TableHead className="text-center">Category</TableHead>
                        <TableHead className="text-center">Created at</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id} className={rowClassName}>
                            <TableCell className={`text-center text-[#475569] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] ${cellClassName}`}>
                                {category.name}
                            </TableCell>
                            <TableCell className={`text-center text-[#475569] ${cellClassName}`}>
                                {new Date(category.createdAt).toLocaleString("en-US", {
                                    year: "numeric", month: "long", day: "numeric",
                                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                                    hour12: false, timeZone: "Asia/Jakarta",
                                }).replace(/(\d{1,2}) (\w+ \d{4})/, '$1, $2').replace(' at', '')}
                            </TableCell>
                            <TableCell className={`text-center text-[#475569] space-x-2 ${cellClassName}`}>
                                <Button
                                    variant="link"
                                    className={`text-green-500 cursor-pointer ${actionButtonClassName}`}
                                    onClick={() => handleEditClick(category)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="link"
                                    className={`text-red-500 cursor-pointer ${actionButtonClassName}`}
                                    onClick={() => handleDeleteClick(category)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-4 flex justify-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="cursor-pointer flex items-center gap-1"
                >
                    <ChevronLeft size={16} />
                    Previous
                </Button>

                {renderPageNumbers().map((page, index) => (
                    <Button
                        key={index}
                        onClick={() => page !== '...' && handlePageChange(page)}
                        className={`cursor-pointer ${page === currentPage
                            ? "bg-white text-black border hover:bg-gray-100"
                            : "bg-transparent text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer flex items-center gap-1"
                >
                    Next
                    <ChevronRight size={16} />
                </Button>
            </div>

            {/* Edit Category Modal */}
            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-[20px]">Edit Category</DialogTitle>
                    </DialogHeader>
                    <form className="grid gap-2 py-2">
                        <label htmlFor="categoryName" className="text-sm" >Category </label>
                        <div className="grid grid-cols-1 items-center">
                            <input
                                id="categoryName"
                                type="text"
                                value={selectedCategory ? selectedCategory.name : ""}
                                onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                                className="border rounded px-2 py-1 text-[14px]"
                            />
                        </div>
                    </form>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" className="cursor-pointer bg-white border hover:bg-gray-100" onClick={() => setOpenEditModal(false)}>Cancel</Button>
                        <Button
                            variant="default"
                            className="cursor-pointer bg-blue-500 hover:bg-blue-400"
                            onClick={updateCategory}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                    </DialogHeader>
                    <p className="text-[#64748B] text-[14px]">
                        Are you sure you want to delete the category “{selectedCategory?.name}”? This will remove it from master data permanently.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
