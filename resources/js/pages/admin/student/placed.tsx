import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/layout';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    UserIcon, 
    Building2Icon, 
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Placed Students',
        href: '/student/placed',
    },
];

interface PlacedStudent {
    id: number;
    student: {
        id: number;
        student_number: string;
        first_name: string;
        last_name: string;
        middle_name?: string;
        section: string;
        specialization?: string;
    };
    internship: {
        id: number;
        position_title: string;
        department: string;
        hte: {
            company_name: string;
        };
    };
    status: 'pending' | 'approved' | 'rejected';
    compatibility_score: number;
    admin_notes?: string;
    placement_date?: string;
    created_at: string;
}

interface Props {
    placedStudents: PlacedStudent[];
}

export default function StudentPlaced({ placedStudents = [] }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'rejected':
                return <XCircleIcon className="h-4 w-4" />;
            case 'pending':
            default:
                return <ClockIcon className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Placed Students" />

            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Heading 
                            title="Placed Students" 
                            description="View and manage student internship placements."
                        />
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{placedStudents.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Students with placement decisions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                                <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {placedStudents.filter(s => s.status === 'approved').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Successfully placed students
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {placedStudents.filter(s => s.status === 'pending').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting decision
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Placements Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Placements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {placedStudents.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Placements Found</h3>
                                    <p className="text-gray-500">
                                        Students need to be placed through the matching process.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Student</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Section</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Internship</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Compatibility</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {placedStudents.map((placement) => (
                                                <tr key={placement.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {placement.student.last_name}, {placement.student.first_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {placement.student.student_number}
                                                            </div>
                                                            {placement.student.middle_name && (
                                                                <div className="text-xs text-gray-400">
                                                                    {placement.student.middle_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <Badge variant="outline">{placement.student.section}</Badge>
                                                            {placement.student.specialization && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {placement.student.specialization}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {placement.internship.position_title}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {placement.internship.hte.company_name}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {placement.internship.department}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline">
                                                            {placement.compatibility_score}%
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={getStatusColor(placement.status)}>
                                                            <div className="flex items-center gap-1">
                                                                {getStatusIcon(placement.status)}
                                                                {placement.status.charAt(0).toUpperCase() + placement.status.slice(1)}
                                                            </div>
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(placement.created_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </AppLayout>
    );
}
