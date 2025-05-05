"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Navbar from "@/components/Layout/admin/header";
import Footer from "@/components/Layout/footer";
import { useParams } from "next/navigation";

export default function ArticleDetail() {
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 4;

    useEffect(() => {
        if (!id) return;

        const getArtikelById = async () => {
            try {
                const response = await api.get(`/articles/${id}`);
                setArticle(response.data);
            } catch (error) {
                toast.error(error.message || "Error fetching article details");
            } finally {
                setIsLoading(false);
            }
        };

        const getAllArtikel = async () => {
            try {
                const response = await api.get("/articles", {
                    params: { limit }
                });

                if (Array.isArray(response.data.data)) {
                    const filtered = response.data.data.filter((item) => item.id !== id); // exclude current article
                    setArticles(filtered.slice(0, limit)); // ambil 3 selain yang sedang dibuka
                } else {
                    console.error("Invalid articles format", response.data);
                }
            } catch (error) {
                toast.error(error.message || "Error fetching articles");
            }
        };

        getArtikelById();
        getAllArtikel();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl font-medium text-gray-700">Article not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar logoSrc="/logoLogin.svg" />
            <main className="max-w-screen-xl mx-auto px-4 py-10">
                <div className="text-sm text-center text-gray-500 mt-10 mb-2">
                    {article.createdAt
                        ? new Date(article.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })
                        : "February 9, 2025"}{" "}
                    • Created by {" "}{article.author || "Admin"}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
                    {article.title || "Figma's New Dev Mode: A Game-Changer for Designers & Developers"}
                </h1>

                <div className="mb-8">
                    <img
                        src={article.imageUrl || "https://source.unsplash.com/800x400/?design"}
                        alt={article.title}
                        className="w-full h-96 object-cover rounded-lg shadow-md"
                    />
                </div>

                <div
                    className="prose max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content || "" }}
                />

                <div className="mt-6 mb-12">
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-[#BFDBFE] text-[#1E3A8A] text-sm px-3 py-1 rounded-full ">
                            {article.category?.name || "Design"}
                        </span>
                    </div>
                </div>

                <div className="mt-12 mb-16">
                    <h2 className="text-2xl font-bold mb-6 pb-2">Other articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
                        {articles.map((item) => (
                            <a key={item.id} href={`/article/${item.id}`} className="block">
                                <div
                                    className="w-[333px] h-[432px] bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <img
                                        src={item.imageUrl || "https://source.unsplash.com/300x200/?" + (item.category?.name || "tech")}
                                        alt={item.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <p className="text-xs text-gray-500 mb-1">
                                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </p>
                                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                                        <div
                                            className="text-sm text-gray-600 mb-3 line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: item.content || "" }}
                                        />
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="bg-[#BFDBFE] text-[#1E3A8A] text-xs px-2 py-1 rounded-xl">
                                                {article.category?.name || "Uncategorized"}
                                            </span>
                                            <span className="bg-[#BFDBFE] text-[#1E3A8A] text-xs px-2 py-1 rounded-xl">
                                                {article.user?.username}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
