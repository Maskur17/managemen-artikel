import ArticleTable from "@/components/Layout/admin/artikelTable";

export default function AdminDashboard() {
    return (
        <ArticleTable
            containerClassName="bg-white shadow-lg border rounded-lg"
            tableClassName="text-sm"
            cellClassName="px-4 py-2"
            rowClassName="hover:bg-gray-100"
            actionButtonClassName="hover:underline"
        />
    );
}
