import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student List',
        href: '/student/list',
    },
];

interface Student {
    id: number | string;
    student_number: string;
    last_name: string;
    first_name: string;
    middle_name?: string;
    section: string;
    specialization?: string;
    is_active: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedStudents {
    data: Student[];
    links: PaginationLink[];
}

export default function StudentList({ students }: { students: PaginatedStudents }) {
    const handleEdit = (studentId: number | string) => {
        router.get(`/student/${studentId}/edit`);
    };

    const handleArchive = (studentId: number | string) => {
        if (confirm('Are you sure you want to archive this student?')) {
            router.patch(`/student/${studentId}/archive`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Student List" />

            <div className="space-y-6">
                <div className="overflow-auto max-h-[60vh]">
                    <table className="w-full bg-white shadow-md">
                        <thead className="border-b-2 border-gray-200">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide text-left">Last Name</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-left">First Name</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-left">Middle Initial</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-left">Student Number</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-left">Section</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-left">Specialization</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-left">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.data.map((stud) => (
                            <tr key={stud.id} className="border-b border-gray-200 hover:bg-[#f3f3f3]">
                                <td className="p-3 text-sm font-normal">{stud.last_name}</td>
                                <td className="p-3 text-sm font-normal">{stud.first_name}</td>
                                <td className="p-3 text-sm font-normal">{stud.middle_name ? stud.middle_name.charAt(0).toUpperCase() + '.' : ''}</td>
                                <td className="p-3 text-sm font-normal">{stud.student_number}</td>
                                <td className="p-3 text-sm font-normal">{stud.section}</td>
                                <td className="p-3 text-sm font-normal">{stud.specialization || ''}</td>
                                <td className="p-3 text-sm font-normal">
                                    <button
                                        onClick={() => handleEdit(stud.id)}
                                        className="mr-3 text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleArchive(stud.id)}
                                        className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors">
                                        Archive
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center items-center">
                    {students.links.map((link) => (
                        link.url ? (
                            <Link
                                key={link.label}
                                href={link.url}
                                className={`p-1 mx-1 ${link.active ? 'font-bold text-blue-400 underline' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={link.label}
                                className="cursor-not-allowed text-gray-300"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
