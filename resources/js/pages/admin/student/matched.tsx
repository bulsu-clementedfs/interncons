import type { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin/layout';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import StudentDetailsModal from '@/components/student-details-modal';
import { 
    UserIcon, 
    Building2Icon, 
    BriefcaseIcon, 
    TargetIcon,
    TrendingUpIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    SearchIcon,
    FilterIcon
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
                slot_count?: number; // Total slots
                available_slots?: number; // Available slots (total - occupied)
                occupied_slots?: number; // Currently occupied slots
            };
            compatibility_score: number;
            status?: string; // 'pending', 'approved', 'rejected'
        };
}

interface SectionOption {
    name: string;
    total_students: number;
    placed_students: number;
    placement_rate: number;
}

interface InternshipOption {
    id: number;
    title?: string;
    position_title?: string;
    company?: string;
    department?: string;
    total_slots?: number;
    occupied_slots?: number;
    available_slots?: number;
    occupancy_rate?: number;
    hte?: {
        company_name?: string;
    };
}

interface Filters {
    sections: SectionOption[];
    internships: InternshipOption[];
    currentSection: string | null;
    currentInternship: string | null;
    currentSearch: string | null;
}

interface Props {
    matchedStudents: MatchedStudent[];
    filters: Filters;
}

export default function StudentMatched({ matchedStudents, filters }: Props) {
    const { csrf_token } = usePage().props as any;
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<string | null>(null);
    const [localFilters, setLocalFilters] = useState({
        section: filters.currentSection || 'all',
        internship: filters.currentInternship || 'all',
        search: filters.currentSearch || '',
    });

    // Function to get fresh CSRF token
    const getFreshCsrfToken = () => {
        return csrf_token || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    // Function to refresh CSRF token by making a request to get a new one
    const refreshCsrfToken = async () => {
        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update the meta tag with new token
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.setAttribute('content', data.token);
                }
                return data.token;
            }
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
        }
        return getFreshCsrfToken();
    };

    // Ensure CSRF token is set in meta tag when component mounts
    useEffect(() => {
        if (csrf_token) {
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', csrf_token);
            }
        }
    }, [csrf_token]);

    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());

    // Debug logging to see what data is received
    useEffect(() => {
        console.log('Received filters:', filters);
        console.log('Received matchedStudents:', matchedStudents);
        console.log('Filters sections:', filters.sections);
        console.log('Filters internships:', filters.internships);
        
        // Debug slot information for each student
        matchedStudents.forEach((student, index) => {
            if (student.best_match?.internship) {
                console.log(`Student ${index + 1} (${student.first_name} ${student.last_name}):`, {
                    position: student.best_match.internship.position_title,
                    total_slots: student.best_match.internship.slot_count,
                    available_slots: student.best_match.internship.available_slots,
                    occupied_slots: student.best_match.internship.occupied_slots
                });
            }
        });
    }, [filters, matchedStudents]);

    // Update local filters when props change
    useEffect(() => {
        setLocalFilters({
            section: filters.currentSection || 'all',
            internship: filters.currentInternship || 'all',
            search: filters.currentSearch || ''
        });
    }, [filters]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-red-100 text-red-800 dark:bg-green-900 dark:text-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Fair';
    };

    const getStatusBadge = (status?: string) => {
        if (!status || status === 'pending') return null;
        
        if (status === 'approved') {
            return (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Approved
                </Badge>
            );
        }
        
        if (status === 'rejected') {
            return (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Rejected
                </Badge>
            );
        }
        
        return null;
    };

    const handleFilterChange = (filterType: 'section' | 'internship' | 'search', value: string) => {
        const newFilters = { ...localFilters, [filterType]: value };
        setLocalFilters(newFilters);

        // Apply filters immediately
        const params = new URLSearchParams();
        if (newFilters.section && newFilters.section !== 'all') {
            params.append('section', newFilters.section);
        }
        if (newFilters.internship && newFilters.internship !== 'all') {
            params.append('internship', newFilters.internship);
        }
        if (newFilters.search) {
            params.append('search', newFilters.search);
        }

        router.get('/student/matched', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setLocalFilters({ section: 'all', internship: 'all', search: '' });
        router.get('/student/matched', {}, {
            preserveState: true,
            replace: true
        });
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
        
        // Ensure all required data is present
        if (!data.internship_id || !data.compatibility_score) {
            alert('Missing required placement data');
            return;
        }
        
        // Ensure admin_notes is always sent (even if empty)
        const requestData = {
            ...data,
            admin_notes: data.admin_notes || ''
        };
        
        console.log('Approving placement with data:', requestData);
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
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                // Close modal and refresh page or update state
                setIsModalOpen(false);
                setSelectedStudent(null);
                alert('Placement approved successfully!');
                window.location.reload(); // Simple refresh for now
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                
                // Provide more specific error messages
                let errorMessage = errorData.message || 'Unknown error occurred';
                if (response.status === 400) {
                    errorMessage = `Validation error: ${errorMessage}`;
                } else if (response.status === 404) {
                    errorMessage = `Not found: ${errorMessage}`;
                } else if (response.status === 500) {
                    errorMessage = `Server error: ${errorMessage}`;
                }
                
                alert(`Error approving placement: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error approving placement:', error);
            alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
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

    const handleSingleApprove = async (student: any) => {
        if (!student || !student.best_match?.internship) {
            setErrorMessage('Invalid student data or missing internship information');
            setErrorType('error');
            return;
        }

        let csrfToken = getFreshCsrfToken();
        
        try {
            setIsLoading(true);
            setErrorMessage(null);
            setErrorType(null);
            
            console.log('Approving student:', student.id, 'for internship:', student.best_match.internship.id);
            
            const response = await fetch(`/student/${student.id}/approve-placement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json', // Explicitly request JSON response
                },
                body: JSON.stringify({
                    internship_id: student.best_match.internship.id,
                    compatibility_score: student.best_match.compatibility_score || 0,
                }),
            });
            
            console.log('Response status:', response.status);
            
            // Handle CSRF token mismatch
            if (response.status === 419) {
                console.log('CSRF token mismatch detected, refreshing token...');
                csrfToken = await refreshCsrfToken();
                
                // Retry the request with fresh token
                const retryResponse = await fetch(`/student/${student.id}/approve-placement`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        internship_id: student.best_match.internship.id,
                        compatibility_score: student.best_match.compatibility_score || 0,
                    }),
                });
                
                if (retryResponse.ok) {
                    const result = await retryResponse.json();
                    setErrorMessage('Student placement approved successfully!');
                    setErrorType('success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    return;
                }
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Response is not JSON, likely HTML (login page or error page)
                const responseText = await response.text();
                console.error('Non-JSON response received:', responseText.substring(0, 200));
                
                if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                    setErrorMessage('Authentication error: You may have been logged out or do not have permission to perform this action. Please refresh the page and try again.');
                    setErrorType('error');
                } else {
                    setErrorMessage('Server returned an unexpected response format. Please try again or contact support.');
                    setErrorType('error');
                }
                return;
            }
            
            const result = await response.json();
            console.log('Response data:', result);
            
            if (response.ok) {
                setErrorMessage('Student placement approved successfully!');
                setErrorType('success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                // Handle errors
                setErrorMessage(`Error: ${result.message}`);
                setErrorType('error');
            }
        } catch (error) {
            console.error('Error in single approval:', error);
            
            // Check if it's a JSON parsing error
            if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
                setErrorMessage('Server returned an invalid response format. This usually indicates an authentication or permission issue. Please refresh the page and try again.');
                setErrorType('error');
            } else {
                setErrorMessage('Error during approval: ' + (error instanceof Error ? error.message : String(error)));
                setErrorType('error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSingleReject = async (student: any) => {
        if (!student || !student.best_match?.internship) {
            setErrorMessage('Invalid student data or missing internship information');
            setErrorType('error');
            return;
        }

        let csrfToken = getFreshCsrfToken();
        
        try {
            setIsLoading(true);
            setErrorMessage(null);
            setErrorType(null);
            
            console.log('Rejecting student:', student.id, 'for internship:', student.best_match.internship.id);
            
            const response = await fetch(`/student/${student.id}/reject-placement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json', // Explicitly request JSON response
                },
                body: JSON.stringify({
                    internship_id: student.best_match.internship.id,
                    compatibility_score: student.best_match.compatibility_score || 0,
                }),
            });
            
            console.log('Response status:', response.status);
            
            // Handle CSRF token mismatch
            if (response.status === 419) {
                console.log('CSRF token mismatch detected, refreshing token...');
                csrfToken = await refreshCsrfToken();
                
                // Retry the request with fresh token
                const retryResponse = await fetch(`/student/${student.id}/reject-placement`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        internship_id: student.best_match.internship.id,
                        compatibility_score: student.best_match.compatibility_score || 0,
                    }),
                });
                
                if (retryResponse.ok) {
                    const result = await retryResponse.json();
                    setErrorMessage('Student placement rejected successfully!');
                    setErrorType('success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    return;
                }
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Response is not JSON, likely HTML (login page or error page)
                const responseText = await response.text();
                console.error('Non-JSON response received:', responseText.substring(0, 200));
                
                if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                    setErrorMessage('Authentication error: You may have been logged out or do not have permission to perform this action. Please refresh the page and try again.');
                    setErrorType('error');
                } else {
                    setErrorMessage('Server returned an unexpected response format. Please try again or contact support.');
                    setErrorType('error');
                }
                return;
            }
            
            const result = await response.json();
            console.log('Response data:', result);
            
            if (response.ok) {
                setErrorMessage('Student placement rejected successfully!');
                setErrorType('success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                // Handle errors
                setErrorMessage(`Error: ${result.message}`);
                setErrorType('error');
            }
        } catch (error) {
            console.error('Error in single rejection:', error);
            
            // Check if it's a JSON parsing error
            if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
                setErrorMessage('Server returned an invalid response format. This usually indicates an authentication or permission issue. Please refresh the page and try again.');
                setErrorType('error');
            } else {
                setErrorMessage('Error during rejection: ' + (error instanceof Error ? error.message : String(error)));
                setErrorType('error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Batch selection handlers
    const handleSelectStudent = (studentId: number, checked: boolean) => {
        const newSelected = new Set(selectedStudents);
        if (checked) {
            newSelected.add(studentId);
        } else {
            newSelected.delete(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = matchedStudents.map(s => s.id);
            setSelectedStudents(new Set(allIds));
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleBatchApprove = async () => {
        if (selectedStudents.size === 0) return;

        let csrfToken = getFreshCsrfToken();
        
        // Check if CSRF token exists (basic auth check)
        if (!csrfToken) {
            setErrorMessage('Authentication error: CSRF token not found. Please refresh the page and try again.');
            setErrorType('error');
            return;
        }
        
        try {
            setIsLoading(true);
            setErrorMessage(null);
            setErrorType(null);
            
            console.log('Starting batch approval for students:', Array.from(selectedStudents));
            console.log('CSRF Token:', csrfToken);
            
            // Use the new batch approval endpoint
            const response = await fetch('/student/batch-approve-placements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json', // Explicitly request JSON response
                },
                body: JSON.stringify({
                    student_ids: Array.from(selectedStudents)
                }),
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Handle CSRF token mismatch
            if (response.status === 419) {
                console.log('CSRF token mismatch detected, refreshing token...');
                csrfToken = await refreshCsrfToken();
                
                // Retry the request with fresh token
                const retryResponse = await fetch('/student/batch-approve-placements', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        student_ids: Array.from(selectedStudents)
                    }),
                });
                
                if (retryResponse.ok) {
                    const result = await retryResponse.json();
                    if (result.total_approved > 0) {
                        setErrorMessage(`Successfully approved ${result.total_approved} placement(s)!`);
                        setErrorType('success');
                        setSelectedStudents(new Set());
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        setErrorMessage('No placements were approved. Please check the selection and try again.');
                        setErrorType('error');
                    }
                    return;
                }
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Response is not JSON, likely HTML (login page or error page)
                const responseText = await response.text();
                console.error('Non-JSON response received:', responseText.substring(0, 200));
                
                if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                    setErrorMessage('Authentication error: You may have been logged out or do not have permission to perform this action. Please refresh the page and try again.');
                    setErrorType('error');
                } else {
                    setErrorMessage('Server returned an unexpected response format. Please try again or contact support.');
                    setErrorType('error');
                }
                return;
            }
            
            const result = await response.json();
            console.log('Response data:', result);
            
            if (response.ok) {
                // Success
                if (result.total_approved > 0) {
                    setErrorMessage(`Successfully approved ${result.total_approved} placement(s)!`);
                    setErrorType('success');
                    setSelectedStudents(new Set());
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    setErrorMessage('No placements were approved. Please check the selection and try again.');
                    setErrorType('error');
                }
            } else {
                // Handle errors
                setErrorMessage(`Error: ${result.message}`);
                setErrorType('error');
            }
        } catch (error) {
            console.error('Error in batch approval:', error);
            
            // Check if it's a JSON parsing error
            if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
                setErrorMessage('Server returned an invalid response format. This usually indicates an authentication or permission issue. Please refresh the page and try again.');
                setErrorType('error');
            } else {
                setErrorMessage('Error during batch approval: ' + (error instanceof Error ? error.message : String(error)));
                setErrorType('error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBatchReject = async () => {
        if (selectedStudents.size === 0) return;

        let csrfToken = getFreshCsrfToken();
        
        try {
            setIsLoading(true);
            setErrorMessage(null);
            setErrorType(null);
            
            const promises = Array.from(selectedStudents).map(async (studentId) => {
                const student = matchedStudents.find(s => s.id === studentId);
                if (!student) return { success: false, error: 'Student not found' };
                
                if (!student.best_match?.internship) {
                    return { success: false, error: 'Student missing internship information' };
                }
                
                try {
                    let response = await fetch(`/student/${student.id}/reject-placement`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: JSON.stringify({
                            internship_id: student.best_match.internship.id,
                            compatibility_score: student.best_match.compatibility_score || 0,
                        }),
                    });
                    
                    // Handle CSRF token mismatch
                    if (response.status === 419) {
                        console.log('CSRF token mismatch detected, refreshing token...');
                        csrfToken = await refreshCsrfToken();
                        
                        // Retry the request with fresh token
                        response = await fetch(`/student/${student.id}/reject-placement`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                            },
                            body: JSON.stringify({
                                internship_id: student.best_match.internship.id,
                                compatibility_score: student.best_match.compatibility_score || 0,
                            }),
                        });
                    }
                    
                    if (response.ok) {
                        return { success: true };
                    } else {
                        const errorData = await response.json();
                        return { success: false, error: errorData.message || 'Unknown error' };
                    }
                } catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            });

            const results = await Promise.all(promises);
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);
            
            if (failed.length === 0) {
                setErrorMessage(`Successfully rejected ${successful.length} placement(s)!`);
                setErrorType('success');
                setSelectedStudents(new Set());
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                const errorDetails = failed.map((result, index) => {
                    const student = matchedStudents.find(s => s.id === Array.from(selectedStudents)[index]);
                    return `Student ${student?.first_name} ${student?.last_name}: ${result.error}`;
                }).join('\n');
                
                setErrorMessage(`Rejected ${successful.length} out of ${selectedStudents.size} placements.\n\nFailed placements:\n${errorDetails}`);
                setErrorType('error');
            }
        } catch (error) {
            console.error('Error in batch rejection:', error);
            setErrorMessage('Error during batch rejection: ' + (error instanceof Error ? error.message : String(error)));
            setErrorType('error');
        } finally {
            setIsLoading(false);
        }
    };

    // Get filter description
    const getFilterDescription = () => {
        if (localFilters.internship !== 'all') {
            const selectedInternship = filters.internships.find(i => i.id.toString() === localFilters.internship);
            const title = selectedInternship?.title || selectedInternship?.position_title || 'Unknown Internship';
            const company = selectedInternship?.company || selectedInternship?.hte?.company_name || 'Unknown Company';
            return `Showing students ranked by compatibility with "${title}" at ${company}. Rejected matches are shown with status labels.`;
        } else if (localFilters.section !== 'all') {
            return `Showing students from ${localFilters.section} section with their best internship matches (excluding rejected matches)`;
        } else {
            return 'Showing all students with their best internship matches (excluding rejected matches)';
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

                    {/* Authentication Status */}
                    <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="font-medium text-blue-800">
                                        Authentication Status
                                    </div>
                                    <div className="mt-1 text-sm text-blue-700">
                                        {document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
                                            ? '✓ You are logged in and have permission to manage student placements.'
                                            : '⚠ Authentication issue detected. Please refresh the page or log in again.'
                                        }
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="text-sm text-blue-600">
                                        {document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
                                            ? 'Authenticated'
                                            : 'Not Authenticated'
                                        }
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.reload()}
                                        className="text-blue-600 border-blue-300 hover:bg-blue-100"
                                    >
                                        Refresh Page
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Debug Information */}
                    <Card className="border-l-4 border-l-gray-500 bg-gray-50">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-700">Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="font-medium text-gray-700 mb-2">Current Page Info:</div>
                                    <div className="space-y-1 text-gray-600">
                                        <div>URL: {window.location.href}</div>
                                        <div>Path: {window.location.pathname}</div>
                                        <div>CSRF Token: {document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ? '✓ Present' : '✗ Missing'}</div>
                                        <div>Selected Students: {selectedStudents.size}</div>
                                    </div>
                                    <div className="mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // Try to refresh the CSRF token by making a simple request
                                                fetch('/student/matched', { method: 'GET' })
                                                    .then(() => window.location.reload())
                                                    .catch(() => window.location.reload());
                                            }}
                                            className="text-gray-600 border-gray-300 hover:bg-gray-100"
                                        >
                                            Refresh Session
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700 mb-2">API Endpoints:</div>
                                    <div className="space-y-1 text-gray-600">
                                        <div>Batch Approve: /student/batch-approve-placements</div>
                                        <div>Single Approve: /student/{'{id}'}/approve-placement</div>
                                        <div>Single Reject: /student/{'{id}'}/reject-placement</div>
                                    </div>
                                    <div className="mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                try {
                                                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                                    const response = await fetch('/student/batch-approve-placements', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'X-CSRF-TOKEN': csrfToken,
                                                            'Accept': 'application/json',
                                                        },
                                                        body: JSON.stringify({ student_ids: [] }),
                                                    });
                                                    
                                                    const contentType = response.headers.get('content-type');
                                                    if (contentType && contentType.includes('application/json')) {
                                                        const result = await response.json();
                                                        alert(`Test successful! Status: ${response.status}, Response: ${JSON.stringify(result, null, 2)}`);
                                                    } else {
                                                        const text = await response.text();
                                                        alert(`Test failed! Status: ${response.status}, Content-Type: ${contentType}, Response: ${text.substring(0, 200)}...`);
                                                    }
                                                } catch (error) {
                                                    alert(`Test error: ${error}`);
                                                }
                                            }}
                                            className="text-gray-600 border-gray-300 hover:bg-gray-100"
                                        >
                                            Test API Endpoint
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FilterIcon className="h-5 w-5" />
                                Filters & Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Section Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="section-filter">Section</Label>
                                    <Select 
                                        value={localFilters.section} 
                                        onValueChange={(value) => handleFilterChange('section', value)}
                                    >
                                        <SelectTrigger id="section-filter">
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Sections</SelectItem>
                                            {filters.sections && Array.isArray(filters.sections) && filters.sections.map((section) => {
                                                // Handle both string and object formats
                                                if (typeof section === 'string') {
                                                    return (
                                                        <SelectItem key={section} value={section}>
                                                            {section}
                                                        </SelectItem>
                                                    );
                                                }
                                                
                                                // Handle object format
                                                return (
                                                    <SelectItem key={section.name} value={section.name}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{section.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {section.placed_students}/{section.total_students} placed ({section.placement_rate}%)
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Internship Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="internship-filter">Internship</Label>
                                    <Select 
                                        value={localFilters.internship} 
                                        onValueChange={(value) => handleFilterChange('internship', value)}
                                    >
                                        <SelectTrigger id="internship-filter">
                                            <SelectValue placeholder="Select internship" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Internships</SelectItem>
                                            {filters.internships && Array.isArray(filters.internships) && filters.internships.map((internship) => {
                                                // Handle both object and basic formats
                                                if (typeof internship === 'object' && internship !== null) {
                                                    return (
                                                        <SelectItem key={internship.id} value={internship.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{internship.title || internship.position_title || 'Unknown Title'}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {internship.company || internship.hte?.company_name || 'Unknown Company'} • {internship.department || 'Unknown Department'}
                                                                </span>
                                                                {internship.total_slots !== undefined && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {internship.occupied_slots || 0}/{internship.total_slots} slots occupied ({internship.occupancy_rate || 0}%)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                }
                                                
                                                return null;
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Search */}
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search students..."
                                            value={localFilters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <div className="space-y-2">
                                    <Label>&nbsp;</Label>
                                    <Button 
                                        variant="outline" 
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Description */}
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    {getFilterDescription()}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                    💡 The system now allows student placement approvals until all internship slots are filled (0 slots remaining).
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    ✅ When viewing "All Internships", rejected matches are filtered out. When viewing a specific internship, rejected matches show with status labels.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Display */}
                    {errorMessage && (
                        <Card className={`border-l-4 ${
                            errorType === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                        }`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className={`font-medium ${
                                            errorType === 'success' ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {errorType === 'success' ? 'Success' : 'Error'}
                                        </div>
                                        <div className={`mt-1 text-sm ${
                                            errorType === 'success' ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {errorMessage}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setErrorMessage(null);
                                            setErrorType(null);
                                        }}
                                        className="ml-4 text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                        ? Math.round(matchedStudents.reduce((sum, student) => sum + (student.best_match?.compatibility_score || 0), 0) / matchedStudents.length)
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
                                    {matchedStudents.filter(s => (s.best_match?.compatibility_score || 0) >= 80).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Students with 80%+ scores
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Batch Actions */}
                    {selectedStudents.size > 0 && (
                        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-blue-800">
                                            Batch Actions ({selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected)
                                        </div>
                                        <div className="mt-1 text-sm text-blue-700">
                                            You can approve or reject multiple students at once. The system will allow approvals until all slots are filled (0 slots remaining).
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="default"
                                            onClick={handleBatchApprove}
                                            disabled={isLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                            Approve All ({selectedStudents.size})
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleBatchReject}
                                            disabled={isLoading}
                                        >
                                            <XCircleIcon className="h-4 w-4 mr-2" />
                                            Reject All ({selectedStudents.size})
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedStudents(new Set())}
                                        >
                                            Clear Selection
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                        {localFilters.section !== 'all' || localFilters.internship !== 'all' || localFilters.search
                                            ? 'Try adjusting your filters or search criteria.'
                                            : 'Students need to complete their assessments to generate matches.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={selectedStudents.size === matchedStudents.length && matchedStudents.length > 0}
                                                            onCheckedChange={handleSelectAll}
                                                        />
                                                        Select All
                                                    </div>
                                                </th>
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
                                                        <Checkbox
                                                            checked={selectedStudents.has(student.id)}
                                                            onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                                                        />
                                                    </td>
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
                                                                {student.best_match?.internship?.position_title || 'Unknown Position'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {student.best_match?.internship?.hte?.company_name || 'Unknown Company'}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {student.best_match?.internship?.department || 'Unknown Department'}
                                                            </div>
                                                            {student.best_match?.internship?.available_slots !== undefined && (
                                                                <div className="text-xs text-blue-600 font-medium mt-1">
                                                                    {student.best_match.internship.available_slots} slot{student.best_match.internship.available_slots !== 1 ? 's' : ''} available
                                                                </div>
                                                            )}
                                                            {student.best_match?.internship?.slot_count !== undefined && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Total: {student.best_match.internship.slot_count} slot{student.best_match.internship.slot_count !== 1 ? 's' : ''}
                                                                </div>
                                                            )}
                                                            {/* Show status badge when viewing specific internship */}
                                                            {localFilters.internship !== 'all' && student.best_match?.status && (
                                                                <div className="mt-2">
                                                                    {getStatusBadge(student.best_match.status)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge 
                                                                className={getScoreColor(student.best_match?.compatibility_score || 0)}
                                                            >
                                                                {student.best_match?.compatibility_score || 0}%
                                                            </Badge>
                                                            <span className="text-xs text-gray-500">
                                                                {getScoreLabel(student.best_match?.compatibility_score || 0)}
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
                                                            
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleSingleApprove(student)}
                                                                disabled={isLoading}
                                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircleIcon className="h-4 w-4" />
                                                                Approve
                                                            </Button>
                                                            
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleSingleReject(student)}
                                                                disabled={isLoading}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <XCircleIcon className="h-4 w-4" />
                                                                Reject
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
            />

            {/* Debug Information (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-xs">
                    <div className="font-bold mb-2">Debug Info</div>
                    <div>CSRF Token: {csrf_token ? '✓ Present' : '✗ Missing'}</div>
                    <div>Meta Tag: {document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ? '✓ Present' : '✗ Missing'}</div>
                    <div>Session: {csrf_token ? '✓ Active' : '✗ Inactive'}</div>
                </div>
            )}
        </>
    );
}
