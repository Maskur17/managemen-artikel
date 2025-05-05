"use client";

import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ImagePlus } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { Editor } from 'primereact/editor';

const formSchema = z.object({
    title: z.string().min(1, "Please enter title"),
    categoryId: z.string().min(1, "Please select category"),
    content: z.string().min(1, "Content field cannot be empty"),
    imageUrl: z.any().refine((val) => val && typeof val === "string", {
        message: "Please enter picture",
    }),
});

export default function EditArtikel({
    containerClassName = "bg-[#F9FAFB] border rounded-lg p-4",
    headerClassName = "flex justify-between items-center border-b p-4",
}) {
    const [categories, setCategories] = useState([]);
    const [article, setArticle] = useState(null);
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const router = useRouter();
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [wordCount, setWordCount] = useState(0);

    const { id } = useParams();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            categoryId: "",
            content: "",
            imageUrl: "",
        },
    });

    useEffect(() => {
        const getData = async () => {
            try {
                const [articleRes, categoryRes] = await Promise.all([
                    api.get(`/articles/${id}`),
                    api.get('/categories', {
                        params: {
                            page: 1,
                            limit: 28,
                        },
                    }),
                ]);

                setArticle(articleRes.data);
                setCategories(categoryRes.data.data);
                setPreviewUrl(articleRes.data.imageUrl || null);
                setValue('title', articleRes.data.title);
                setValue('content', articleRes.data.content);
                setValue('categoryId', articleRes.data.categoryId);
                setText(articleRes.data.content);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        getData();
    }, [id, setValue]);

    const handleClick = () => fileInputRef.current?.click();

    const handleChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            toast.error("Only JPG or PNG files are allowed.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return toast.error("No authentication token found");

            const formData = new FormData();
            formData.append("image", file);

            const res = await api.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            const uploadedUrl = res.data?.imageUrl;
            if (uploadedUrl) {
                setImageUrl(uploadedUrl);
                setValue("imageUrl", uploadedUrl, { shouldValidate: true });
                toast.success("Image uploaded successfully!");
            } else {
                toast.error("Failed to get image URL.");
            }

        } catch (error) {
            toast.error("Upload failed.");
            console.error(error);
        }
    };

    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('access_token');

            const payload = {
                title: data.title,
                content: data.content,
                categoryId: data.categoryId,
                imageUrl: data.imageUrl,
            };

            const res = await api.put(`/articles/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200 || res.status === 201) {
                toast.success("Article uploaded successfully!");
                router.push("/dashboard/admin/artikel");
            } else {
                toast.error("Upload failed.");
            }

        } catch (error) {
            toast.error("Something went wrong.");
            console.error(error);
        }
    };

    const selectedCategory = categories.find(cat => cat.id === watch("categoryId"));

    const handleTextChange = (e) => {
        const content = e.htmlValue || '';
        setText(content);
        setValue("content", content, { shouldValidate: true });

        const wordCount = content.trim().split(/\s+/).length;
        setWordCount(wordCount);
    };

    const handleDeleteImage = () => {
        setPreviewUrl(null);
        setImageUrl(null);
        setValue("imageUrl", "", { shouldValidate: true });
        toast.success("Image deleted.");
    };



    return (
        <form className={containerClassName} onSubmit={handleSubmit(onSubmit)}>
            <div className={headerClassName} onClick={() => router.back()}>
                <h1 className="text-xl font-bold flex items-center cursor-pointer">
                    <ArrowLeft className="mr-2" /> Edit Article
                </h1>
            </div>

            {/* Upload Image */}
            <label className="block text-sm font-medium mb-1 mt-2">Thumbnails</label>
            <div
                className="flex justify-center bg-white border border-dashed border-gray-300 p-4 w-[223px] h-[163px] rounded-lg text-center cursor-pointer hover:bg-gray-50"
                onClick={handleClick}
            >
                <input
                    type="file"
                    accept="image/png, image/jpeg"
                    ref={fileInputRef}
                    onChange={handleChange}
                    className="hidden"
                />
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-48 object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <ImagePlus className="text-[#64748B]" />
                        <p className="text-sm text-[#64748B] underline">Click to select files</p>
                        <p className="text-xs text-[#64748B] mt-1">Support File Type: jpg or png</p>
                    </div>
                )}
            </div>
            <div className="flex gap-5 mb-3 ml-8">
                <p
                    className="text-sm text-[#2563EB] underline cursor-pointer"
                    onClick={handleClick}
                >
                    Change
                </p>
                <p
                    className="text-sm text-[#EF4444] underline cursor-pointer"
                    onClick={handleDeleteImage}
                >
                    Delete Image
                </p>
            </div>

            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}

            {/* Title */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input placeholder="Input Title" className="text-sm pr-10" {...register("title")} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between text-sm">
                            {selectedCategory?.name || "Select category"}
                            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="bottom" sideOffset={4} className="p-1">
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <DropdownMenuItem
                                    key={category.id}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setValue("categoryId", category.id, { shouldValidate: true });
                                    }}
                                >
                                    {category.name}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>

                </DropdownMenu>
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            {/* Content */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Content</label>
                <Editor
                    value={text}
                    onTextChange={handleTextChange}
                    style={{
                        height: '320px',
                        border: '1px solid #D1D5DB',
                        padding: '10px',
                        backgroundColor: '#F9FAFB',
                        fontSize: '14px',
                    }}
                />
                <p className="text-sm text-gray-500 p-2 bg-white border-b border-r border-l rounded-b-lg">Words {wordCount}</p>

                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                <Button type="button" className="bg-white border text-black">Cancel</Button>
                <Button type="button" className="bg-gray-200">Preview</Button>
                <Button type="submit" className="bg-blue-600 text-white">Upload</Button>
            </div>
        </form>
    );
}
