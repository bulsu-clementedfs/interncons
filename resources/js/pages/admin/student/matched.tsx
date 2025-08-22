import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin/layout';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentDetailsModal from '@/components/student-details-modal';
import { 
    UserIcon, 
    Building2Icon, 
    BriefcaseIcon, 
    TargetIcon,
    TrendingUpIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student Matches',
        href: '/student/matched',
    },
];

interface MatchedStudent {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    section: string;
    specialization?: string;
    best_match: {
        internship: {
            id: number;
            position_title: string;
            department: string;
            hte: {
                company_name: string;
            };
        };
        compatibility_score: number;
    };
}

interface Props {
    matchedStudents: MatchedStudent[];
}

export default function StudentMatched({ matchedStudents }: Props) {
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Fair';
    };

    const handleViewDetails = async (student: any) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/student/${student.id}/details`);
            if (response.ok) {
                const data = await response.json();
                setSelectedStudent(data);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprovePlacement = async (data: { internship_id: number; compatibility_score: number; admin_notes?: string }) => {
        if (!selectedStudent) return;
        
        console.log('Approving placement with data:', data);
        console.log('Selected student:', selectedStudent);
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        console.log('CSRF Token:', csrfToken);
        
        try {
            setIsLoading(true);
            const response = await fetch(`/student/${selectedStudent.student.id}/approve-placement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Close modal and refresh page or update state
                setIsModalOpen(false);
                setSelectedStudent(null);
                window.location.reload(); // Simple refresh for now
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                alert(errorData.message || 'Error approving placement');
            }
        } catch (error) {
            console.error('Error approving placement:', error);
            alert('Error approving placement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectPlacement = async (data: { internship_id: number; compatibility_score: number; admin_notes: string }) => {
        if (!selectedStudent) return;
        
        try {
            setIsLoading(true);
            const response = await fetch(`/student/${selectedStudent.student.id}/reject-placement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Close modal and refresh page or update state
                setIsModalOpen(false);
                setSelectedStudent(null);
                window.location.reload(); // Simple refresh for now
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error rejecting placement');
            }
        } catch (error) {
            console.error('Error rejecting placement:', error);
            alert('Error rejecting placement');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Student Matches" />

            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Heading 
                            title="Student Matches" 
                            description="View and manage student-internship matches based on compatibility scores."
                        />
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                                <TargetIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{matchedStudents.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Students with completed assessments
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {matchedStudents.length > 0 
                                        ? Math.round(matchedStudents.reduce((sum, student) => sum + student.best_match.compatibility_score, 0) / matchedStudents.length)
                                        : 0
                                    }%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Overall compatibility
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {matchedStudents.filter(s => s.best_match.compatibility_score >= 80).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Students with 80%+ scores
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Matches Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Student-Internship Matches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {matchedStudents.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                                    <p className="text-gray-500">
                                        Students need to complete their assessments to generate matches.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Student</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Section</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Best Match</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Compatibility</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matchedStudents.map((student) => (
                                                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {student.last_name}, {student.first_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {student.student_number}
                                                            </div>
                                                            {student.middle_name && (
                                                                <div className="text-xs text-gray-400">
                                                                    {student.middle_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <Badge variant="outline">{student.section}</Badge>
                                                            {student.specialization && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {student.specialization}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {student.best_match.internship.position_title}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {student.best_match.internship.hte.company_name}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {student.best_match.internship.department}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge 
                                                                className={getScoreColor(student.best_match.compatibility_score)}
                                                            >
                                                                {student.best_match.compatibility_score}%
                                                            </Badge>
                                                            <span className="text-xs text-gray-500">
                                                                {getScoreLabel(student.best_match.compatibility_score)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewDetails(student)}
                                                                disabled={isLoading}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                                View Details
                                                            </Button>
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

            {/* Student Details Modal */}
            <StudentDetailsModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedStudent(null);
                }}
                student={selectedStudent}
                onApprove={handleApprovePlacement}
                onReject={handleRejectPlacement}
                isLoading={isLoading}
            />
        </>
    );
}
