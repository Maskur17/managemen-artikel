"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";

export default function ArticleTable({
  containerClassName = "bg-[#F9FAFB] rounded-lg",
  headerClassName = "flex justify-between items-center border-b p-4",
  tableClassName = "",
  cellClassName = "",
  rowClassName = "",
  actionButtonClassName = "",
}) {
  const [articles, setArticles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("Category");
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const debouncedCategory = useDebounce(selectedCategory, 300);

  const router = useRouter();

  useEffect(() => {
    fetchArticles(currentPage, debouncedSearchTerm, debouncedCategory);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchArticles(1, debouncedSearchTerm, debouncedCategory);
  }, [debouncedSearchTerm, debouncedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories", {
          params: {
            page: 1,
            limit: 28,
          }
        });
        if (Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const fetchArticles = async (page, query = "", category = "") => {
    const limit = 10;
    setIsLoading(true);
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

  const handleDeleteClick = (article) => {
    setSelectedArticle(article);
    setOpenModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('access_token');

      await api.delete(`/articles/${selectedArticle.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(prev => prev.filter(item => item.id !== selectedArticle.id));
      setTotalItems(prev => prev - 1);
      toast.success("Article deleted successfully");
    } catch (error) {
      toast.error(error.message || "Error deleting article");
    } finally {
      setOpenModal(false);
      setSelectedArticle(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryName(categoryName || "Category");
    setDropdownOpen(false);
  };

  const loadMoreCategories = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={containerClassName}>
      <h1 className="text-[16px] border-b p-4">Total Artikel: {totalItems}</h1>
      <div className={headerClassName}>
        <div className="flex gap-2">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex justify-between items-center min-w-[120px] bg-white border-[#E2E8F0] text-[#64748B]">
                <span>{selectedCategoryName}</span>
                <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] max-h-[200px] overflow-y-auto">
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleCategorySelect("", "Category")}
              >
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleCategorySelect(category.id, category.name)}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
              {currentPage < totalPages && (
                <DropdownMenuItem
                  className="cursor-pointer text-center"
                  onClick={loadMoreCategories}
                >
                  Load More
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by title"
              className="border-2 rounded-sm border-[#E2E8F0] px-2 py-1 text-[#94A3B8] pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {isLoading && searchTerm !== debouncedSearchTerm && (
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Searching...
              </span>
            )}
          </div>
        </div>
        <Link href="/dashboard/admin/artikel/addArtikel">
          <Button className="bg-[#2563EB] w-[135px] h-[40px] hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer">
            <Plus size={16} />
            Add Articles
          </Button>
        </Link>
      </div>

      <Table className={tableClassName}>
        <TableHeader className="bg-[#F3F4F6]">
          <TableRow>
            <TableHead className="text-center">Thumbnails</TableHead>
            <TableHead className="text-center">Title</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Created at</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Loading articles...
              </TableCell>
            </TableRow>
          ) : articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No articles found
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article.id} className={rowClassName}>
                <TableCell className={`text-center ${cellClassName}`}>
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt="Article thumbnail"
                      className="w-[60px] h-[60px] rounded object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] rounded bg-gray-200 mx-auto flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </TableCell>

                <TableCell className={`text-start w-10 text-[#475569] ${cellClassName} whitespace-normal break-words`}>
                  {article.title}
                </TableCell>
                <TableCell className={`text-center text-[#475569] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] ${cellClassName}`}>
                  {article.category?.name}
                </TableCell>
                <TableCell className={`text-center text-[#475569] ${cellClassName}`}>
                  {new Date(article.created_at).toLocaleString()}
                </TableCell>
                <TableCell className={`text-center ${cellClassName}`}>
                  <Button
                    variant="link"
                    className="text-blue-600 cursor-pointer"
                    onClick={() => router.push(`/article/${article.id}`)}
                  >
                    Preview
                  </Button>


                  <Button
                    variant="link"
                    className={`text-green-500 cursor-pointer  ${actionButtonClassName}`}
                    onClick={() => router.push(`/dashboard/admin/artikel/editArtikel/${article.id}`)}
                  >
                    Edit
                  </Button>
                  <Button variant="link" className="text-red-600 cursor-pointer" onClick={() => handleDeleteClick(article)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center p-4 space-x-2 text-sm">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-1 rounded-md border ${currentPage === 1 ? 'text-black cursor-not-allowed' : 'text-black hover:bg-blue-50'
            }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={() => goToPage(1)}
          className={`px-3 py-1 rounded-md border ${currentPage === 1 ? 'text-black' : 'text-black hover:bg-blue-50'
            }`}
        >
          1
        </button>

        <button
          onClick={() => goToPage(2)}
          className={`px-3 py-1 rounded-md border ${currentPage === 2 ? 'text-black' : 'text-black hover:bg-blue-50'
            }`}
        >
          2
        </button>

        <span className="px-2 text-gray-500">...</span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-1 rounded-md border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-blue-50'
            }`}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Confirm Delete Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Articles</DialogTitle>
          </DialogHeader>
          <p className="text-[#64748B] text-sm">Deleting this article is permanent and cannot be undone. All related content will be removed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
