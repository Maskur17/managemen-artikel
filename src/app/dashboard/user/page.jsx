"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Navbar from "@/components/Layout/admin/header";
import Footer from "@/components/Layout/footer";

export default function UserDashboard() {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Debounce search input
    useEffect(() => {
        const delay = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, delay);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Fetch articles
    const getAllArtikel = async (page = 1, query = "", category = "") => {
        try {
            const params = { page, limit, search: query, category };
            const response = await api.get("/articles", { params });

            if (Array.isArray(response.data.data)) {
                setArticles(response.data.data);
                setTotalPages(Math.ceil(response.data.total / limit));
                setTotalItems(response.data.total);
            } else {
                console.error("Invalid articles format", response.data);
            }
        } catch (error) {
            toast.error(error.message || "Error fetching articles");
        } finally {
            setIsLoading(false);
        }
    };

    const getCategories = async () => {
        try {
            setIsLoading(true);
            let allCategories = [];
            let currentPage = 1;
            let totalPages = 1;

            while (currentPage <= totalPages) {
                const response = await api.get("/categories", {
                    params: { page: currentPage, limit: 100 } // Ambil 100 per halaman
                });

                if (response.data?.data && Array.isArray(response.data.data)) {
                    allCategories = [...allCategories, ...response.data.data];
                    totalPages = response.data.totalPages;
                    currentPage++;
                } else {
                    throw new Error("Invalid response format");
                }
            }

            setCategories(allCategories);
        } catch (error) {
            toast.error(error.message || "Error fetching categories");
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        getCategories();
    }, []);

    // Re-fetch articles on filters / page change
    useEffect(() => {
        setIsLoading(true);
        getAllArtikel(currentPage, debouncedQuery, selectedCategory?.id || "");
    }, [debouncedQuery, selectedCategory, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div
                className="relative w-full"
                style={{
                    backgroundImage: "url('/bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="relative z-20">
                    <Navbar />
                </div>
                <div
                    className="absolute inset-0 bg-gradient-to-b from-[#2563EBDB] via-[#2563EBDB] to-[#2563EBDB] opacity-100 z-0"
                ></div>

                {/* Main content section */}
                <section className="relative z-10 text-white flex items-center justify-center px-4 sm:px-8 w-full h-[560px] sm:h-[500px] md:h-[450px] lg:h-[400px] max-w-[1440px] mx-auto">
                    <div className="max-w-[730px] w-full mx-auto text-center flex flex-col gap-3">
                        <p className="text-[16px] sm:text-base">Blog genzet</p>
                        <h1 className="text-[48px] font-semibold">
                            The Journal: Design Resources, Interviews, and Industry News
                        </h1>
                        <p className="text-[24px] sm:text-base">
                            Your daily dose of design insights!
                        </p>

                        <div className="w-full bg-[#3B82F6] backdrop-blur-sm rounded-xl p-2 flex flex-col sm:flex-row gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="px-4 py-2 rounded-lg border text-black bg-white w-full sm:w-[300px] text-left flex items-center justify-between">
                                        <span className="truncate">
                                            {selectedCategory?.name || "Select category"}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white text-black rounded-lg shadow-lg p-1 max-h-[300px] overflow-y-auto">
                                    <DropdownMenuItem
                                        onClick={() => setSelectedCategory(null)}
                                        className="cursor-pointer hover:bg-gray-100 p-2"
                                    >
                                        All Categories
                                    </DropdownMenuItem>

                                    {isLoading ? (
                                        <DropdownMenuItem className="p-2 text-center text-gray-500">
                                            Loading categories...
                                        </DropdownMenuItem>
                                    ) : categories.length > 0 ? (
                                        categories.map((category) => (
                                            <DropdownMenuItem
                                                key={category.id}
                                                onClick={() => setSelectedCategory(category)}
                                                className="cursor-pointer hover:bg-gray-100 p-2"
                                            >
                                                {category.name}
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <DropdownMenuItem className="p-2 text-center text-gray-500">
                                            No categories available
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>


                            <div className="relative w-full sm:w-[600px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Search articles"
                                    className="pl-10 pr-4 w-full sm:h-[40px] bg-white text-black"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Articles Section */}
            <section className="px-6 sm:px-10 py-12 max-w-7xl mx-auto">
                <p className="mb-6 text-sm text-gray-600">
                    Showing: {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, totalItems)} of {totalItems} articles
                </p>

                <div
                    className={`grid gap-6 ${articles.length === 1
                        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                        }`}
                >

                    {isLoading && (
                        <div className="col-span-full text-center text-gray-500">
                            Loading articles...
                        </div>
                    )}
                    {!isLoading && articles.length === 0 && (
                        <p className="text-center col-span-full text-gray-500">
                            No articles found.
                        </p>
                    )}
                    {articles.map((article) => (
                        <div
                            key={article.id}
                            className=" overflow-hidden shadow-sm bg-white flex flex-col"
                        >
                            <a href={`/article/${article.id}`} className="block">
                                <img
                                    src={article.imageUrl || "https://source.unsplash.com/400x250/?tech"}
                                    alt={article.title}
                                    className="w-full h-48 object-contain border-t-lg rounded-t-lg"
                                />
                                <div className="p-4 flex flex-col">
                                    <p className="text-xs text-gray-500 mb-1">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </p>
                                    <h2 className="font-semibold text-[18px] mb-2 text-black">
                                        {article.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        <span className="bg-[#BFDBFE] text-[#1E3A8A] text-xs px-2 py-1 rounded-xl">
                                            {article.category?.name || "Uncategorized"}
                                        </span>
                                        <span className="bg-[#BFDBFE] text-[#1E3A8A] text-xs px-2 py-1 rounded-xl">
                                            {article.user?.username}
                                        </span>
                                    </div>
                                    <div
                                        className="text-[#475569] text-[16px] sm:text-[16px] md:text-[18px] mt-2 line-clamp-3"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                article.content.length > 100
                                                    ? article.content.slice(0, 100) + "..."
                                                    : article.content
                                        }}
                                    />
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <Pagination className="mt-8">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                            </PaginationItem>

                            {currentPage > 3 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {[...Array(totalPages).keys()]
                                .map((i) => i + 1)
                                .slice(currentPage > 3 ? currentPage - 3 : 0, currentPage + 2)
                                .map((i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(i)}
                                            isActive={i === currentPage}
                                        >
                                            {i}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                            {currentPage < totalPages - 2 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
