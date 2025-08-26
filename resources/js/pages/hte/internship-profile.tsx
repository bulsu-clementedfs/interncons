import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart } from '@/components/ui/pie-chart';
import { 
    ArrowLeftIcon,
    BriefcaseIcon, 
    UsersIcon, 
    CalendarIcon, 
    MapPinIcon,
    Building2Icon,
    EditIcon
} from 'lucide-react';

interface InternshipProfileProps {
    hte: {
        id: number;
        company_name: string;
        company_address: string;
        company_email: string;
        cperson_fname: string;
        cperson_lname: string;
        cperson_position: string;
        cperson_contactnum: string;
        is_active: boolean;
    };
    internship: {
        id: number;
        position_title: string;
        department: string;
        slot_count: number;
        placement_description: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        subcategory_weights: Array<{
            id: number;
            weight: number;
            subcategory: {
                id: number;
                subcategory_name: string;
                category: {
                    id: number;
                    category_name: string;
                };
            };
        }>;
    };
    isEmbedded?: boolean;
}

export default function InternshipProfilePage({ hte, internship, isEmbedded = false }: InternshipProfileProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/hte/dashboard',
        },
        {
            title: 'Internships',
            href: '/hte/dashboard',
        },
        {
            title: internship.position_title,
            href: `/hte/internship/${internship.id}`,
        },
    ];

    // Extract duration, start date, and end date from placement description
    const extractDuration = (description: string) => {
        const match = description.match(/Duration: ([^-]+)/);
        return match ? match[1].trim() : 'Not specified';
    };

    const extractStartDate = (description: string) => {
        const match = description.match(/from ([^to]+) to/);
        return match ? match[1].trim() : 'Not specified';
    };

    const extractEndDate = (description: string) => {
        const match = description.match(/to (.+)$/);
        return match ? match[1].trim() : 'Not specified';
    };

    // Group subcategory weights by category
    const weightsByCategory = internship.subcategory_weights.reduce((acc, weight) => {
        const categoryName = weight.subcategory.category.category_name;
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(weight);
        return acc;
    }, {} as Record<string, typeof internship.subcategory_weights>);

    // If embedded, render without AppLayout and with simplified header
    if (isEmbedded) {
        return (
            <div className="p-6">
                {/* Embedded Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{internship.position_title}</h3>
                        <p className="text-muted-foreground">
                            {internship.department} • {internship.slot_count} slot{internship.slot_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Badge variant={internship.is_active ? "default" : "secondary"}>
                            {internship.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Link href={`/hte/edit-internship/${internship.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <EditIcon className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BriefcaseIcon className="h-5 w-5" />
                                Position Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Position Title</label>
                                    <p className="text-lg font-semibold">{internship.position_title}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                                    <p className="text-lg font-semibold">{internship.department}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Available Slots</label>
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        <UsersIcon className="h-4 w-4" />
                                        {internship.slot_count} slot{internship.slot_count !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                    <p className="text-lg font-semibold">{extractDuration(internship.placement_description)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        {extractStartDate(internship.placement_description)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        {extractEndDate(internship.placement_description)}
                                    </p>
                                </div>
                            </div>
                            
                            {internship.placement_description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-base text-gray-700 mt-1">{internship.placement_description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category Weights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Criteria & Weights</CardTitle>
                            <CardDescription>
                                Weight distribution for different assessment categories
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Object.entries(weightsByCategory).length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(weightsByCategory).map(([categoryName, weights]) => {
                                        // Calculate category total weight
                                        const categoryTotal = weights.reduce((sum, w) => sum + w.weight, 0);
                                        
                                        // Prepare data for pie chart
                                        const pieData = weights.map(weight => ({
                                            name: weight.subcategory.subcategory_name,
                                            value: weight.weight,
                                            color: `hsl(${Math.random() * 360}, 70%, 50%)`
                                        }));
                                        
                                        return (
                                            <div key={categoryName} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h5 className="font-semibold text-blue-600">{categoryName}</h5>
                                                    <Badge variant="outline" className="font-mono text-sm">
                                                        Total: {categoryTotal}%
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {/* Weight Information */}
                                                    <div className="space-y-2">
                                                        <h6 className="font-medium text-gray-700 mb-2">Weight Distribution</h6>
                                                        {weights.map((weight) => (
                                                            <div key={weight.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                                <span className="font-medium text-sm">{weight.subcategory.subcategory_name}</span>
                                                                <Badge variant="outline" className="font-mono text-xs">
                                                                    {weight.weight}%
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Pie Chart */}
                                                    <div className="flex items-center justify-center pt-4">
                                                        <PieChart 
                                                            data={pieData}
                                                            title={`${categoryName} Weights`}
                                                            totalWeight={categoryTotal}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    <p className="text-sm">No assessment criteria configured for this internship.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Full page version with AppLayout
    return (
        <>
            <Head title={`${internship.position_title} - Internship Profile`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Link href="/hte/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{internship.position_title}</h1>
                        <p className="text-muted-foreground">
                            Internship opportunity at {hte.company_name}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Badge variant={internship.is_active ? "default" : "secondary"}>
                            {internship.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Link href={`/hte/edit-internship/${internship.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <EditIcon className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Internship Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BriefcaseIcon className="h-5 w-5" />
                                    Position Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Position Title</label>
                                        <p className="text-lg font-semibold">{internship.position_title}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                                        <p className="text-lg font-semibold">{internship.department}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Available Slots</label>
                                        <p className="text-lg font-semibold flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4" />
                                            {internship.slot_count} slot{internship.slot_count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                        <p className="text-lg font-semibold">{extractDuration(internship.placement_description)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                        <p className="text-lg font-semibold flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            {extractStartDate(internship.placement_description)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                        <p className="text-lg font-semibold flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            {extractEndDate(internship.placement_description)}
                                        </p>
                                    </div>
                                </div>
                                
                                {internship.placement_description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                                        <p className="text-base text-gray-700 mt-1">{internship.placement_description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Category Weights */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Assessment Criteria & Weights</CardTitle>
                                <CardDescription>
                                    Weight distribution for different assessment categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.entries(weightsByCategory).length > 0 ? (
                                    <div className="space-y-8">
                                        {Object.entries(weightsByCategory).map(([categoryName, weights]) => {
                                            // Calculate category total weight
                                            const categoryTotal = weights.reduce((sum, w) => sum + w.weight, 0);
                                            
                                            // Prepare data for pie chart
                                            const pieData = weights.map(weight => ({
                                                name: weight.subcategory.subcategory_name,
                                                value: weight.weight,
                                                color: `hsl(${Math.random() * 360}, 70%, 50%)`
                                            }));

                                            return (
                                                <div key={categoryName} className="border rounded-lg p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-semibold text-xl text-blue-600">{categoryName}</h4>
                                                        <Badge variant="outline" className="font-mono text-sm">
                                                            Total: {categoryTotal}%
                                                        </Badge>
                                                    </div>
                                                    
                                                                                                         <div className="space-y-6">
                                                         {/* Weight Information */}
                                                         <div className="space-y-3">
                                                             <h5 className="font-medium text-gray-700 mb-3">Weight Distribution</h5>
                                                             {weights.map((weight) => (
                                                                 <div key={weight.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                     <span className="font-medium">{weight.subcategory.subcategory_name}</span>
                                                                     <Badge variant="outline" className="font-mono">
                                                                         {weight.weight}%
                                                                     </Badge>
                                                                 </div>
                                                             ))}
                                                         </div>
                                                         
                                                         {/* Pie Chart */}
                                                         <div className="flex items-center justify-center pt-4">
                                                             <PieChart 
                                                                 data={pieData}
                                                                 title={`${categoryName} Weights`}
                                                                 totalWeight={categoryTotal}
                                                             />
                                                         </div>
                                                     </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No assessment criteria configured for this internship.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Company Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2Icon className="h-5 w-5" />
                                    Company Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                    <p className="font-semibold">{hte.company_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    <p className="text-sm text-gray-700">{hte.company_address}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-sm text-blue-600">{hte.company_email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                                    <p className="font-semibold">{hte.cperson_fname} {hte.cperson_lname}</p>
                                    <p className="text-sm text-gray-600">{hte.cperson_position}</p>
                                    <p className="text-sm text-gray-600">{hte.cperson_contactnum}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Internship Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Internship Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge variant={internship.is_active ? "default" : "secondary"}>
                                        {internship.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Created</span>
                                    <span className="text-sm text-gray-600">
                                        {new Date(internship.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Last Updated</span>
                                    <span className="text-sm text-gray-600">
                                        {new Date(internship.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={`/hte/edit-internship/${internship.id}`} className="w-full">
                                    <Button variant="outline" className="w-full gap-2">
                                        <EditIcon className="h-4 w-4" />
                                        Edit Internship
                                    </Button>
                                </Link>
                                <Link href="/hte/dashboard" className="w-full">
                                    <Button variant="ghost" className="w-full gap-2">
                                        <ArrowLeftIcon className="h-4 w-4" />
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
