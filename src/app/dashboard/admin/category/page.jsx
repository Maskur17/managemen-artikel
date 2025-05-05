import CategoryTable from "@/components/Layout/admin/categoryTable";

export default function AdminDashboard() {
    return (
        <CategoryTable
            containerClassName="bg-white shadow-lg p-6 border rounded-lg"
            tableClassName="text-sm"
            cellClassName="px-4 py-2"
            rowClassName="hover:bg-gray-100"
            actionButtonClassName="hover:underline"
        />
    );
}
