import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { PieChart } from '@/components/ui/pie-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Mail, Phone, User, Calendar, Users, Target, Briefcase, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'HTE Profile',
        href: '/hte/profile',
    },
];

interface HTEProfileProps {
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
        created_at: string;
        internships: Array<{
            id: number;
            position_title: string;
            department: string;
            placement_description: string;
            slot_count: number;
            is_active: boolean;
            created_at: string;
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
        }>;
    };
    [key: string]: any;
}

export default function HTEProfilePage() {
    const { hte } = usePage<HTEProfileProps>().props;
    const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(
        hte.internships && hte.internships.length > 0 ? hte.internships[0].id : null
    );

    // Add defensive programming to handle missing data
    if (!hte) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="HTE Profile" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                    <div className="text-center py-8 text-muted-foreground">
                        <p>HTE profile not found.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    const selectedInternship = hte.internships?.find(internship => internship.id === selectedInternshipId);

    // Group subcategory weights by category for separate pie charts
    const getWeightsByCategory = (weights: any[]) => {
        if (!weights || weights.length === 0) return {};
        
        const grouped = weights.reduce((acc, weight) => {
            const categoryName = weight.subcategory?.category?.category_name || 'Unknown';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push({
                name: weight.subcategory?.subcategory_name || 'Unknown',
                value: weight.weight,
                color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'][acc[categoryName].length % 8]
            });
            return acc;
        }, {});
        
        return grouped;
    };

    const weightsByCategory = selectedInternship ? getWeightsByCategory(selectedInternship.subcategory_weights) : {};
    const totalWeight = selectedInternship?.subcategory_weights?.reduce((sum, weight) => sum + weight.weight, 0) || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HTE Profile" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-6 overflow-x-auto">
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                {getInitials(hte.company_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight">{hte.company_name}</h1>
                            <div className="flex items-center gap-2">
                                <Badge variant={hte.is_active ? "default" : "secondary"} className="text-sm px-3 py-1">
                                    {hte.is_active ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Inactive
                                        </>
                                    )}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Member since {new Date(hte.created_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long' 
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-3xl">
                        View and manage your company profile, internship opportunities, and assessment criteria for student matching.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Company Information */}
                    <div className="lg:col-span-2">
                        <Card className="h-fit">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Company Information
                                </CardTitle>
                                <CardDescription>Basic company details and contact information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company Name</label>
                                                <p className="text-lg font-semibold">{hte.company_name}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
                                                <p className="text-sm">{hte.company_address}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                                                <p className="text-sm">{hte.company_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact Person</label>
                                                <p className="text-sm font-medium">{hte.cperson_fname} {hte.cperson_lname}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Position</label>
                                                <p className="text-sm">{hte.cperson_position}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact Number</label>
                                                <p className="text-sm">{hte.cperson_contactnum}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="lg:col-span-1">
                        <Card className="h-fit">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Quick Stats
                                </CardTitle>
                                <CardDescription>Overview of your company</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {hte.internships?.length || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Internships</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {hte.internships?.filter(i => i.is_active).length || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Active Positions</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {hte.internships?.reduce((sum, i) => sum + i.slot_count, 0) || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Slots</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Internships Section */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Internship Opportunities
                                </CardTitle>
                                <CardDescription>Manage your company's internship positions and student applications</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                {hte.internships && hte.internships.length > 0 && (
                                    <Select value={selectedInternshipId?.toString()} onValueChange={(value) => setSelectedInternshipId(Number(value))}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select internship" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hte.internships.map((internship) => (
                                                <SelectItem key={internship.id} value={internship.id.toString()}>
                                                    {internship.position_title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <Button className="bg-primary hover:bg-primary/90">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    Add Internship
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {selectedInternship ? (
                            <div className="space-y-6">
                                {/* Selected Internship Details */}
                                <div className="border rounded-lg p-6 bg-card">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">{selectedInternship.position_title}</h3>
                                            <p className="text-muted-foreground">{selectedInternship.placement_description}</p>
                                        </div>
                                        <Badge variant={selectedInternship.is_active ? "default" : "secondary"} className="text-sm">
                                            {selectedInternship.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                                                    <p className="font-medium">{selectedInternship.department}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">Available Slots</label>
                                                    <p className="font-medium">{selectedInternship.slot_count} slots</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                                    <p className="font-medium">
                                                        {new Date(selectedInternship.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                                                Assessment Criteria Weights
                                            </h4>
                                            {selectedInternship.subcategory_weights && selectedInternship.subcategory_weights.length > 0 ? (
                                                <div className="space-y-2">
                                                    {selectedInternship.subcategory_weights.map((sw) => (
                                                        <div key={sw.id} className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                                                                {sw.subcategory?.subcategory_name || 'Unknown'}
                                                            </span>
                                                            <Badge variant="outline" className="text-sm">
                                                                {sw.weight}%
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No weights assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Criteria Weights by Category - Separate Pie Charts */}
                                {Object.keys(weightsByCategory).length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-lg font-medium">Assessment Criteria Weights by Category</h4>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {Object.entries(weightsByCategory).map(([categoryName, weights]) => {
                                                const categoryTotal = weights.reduce((sum, w) => sum + w.value, 0);
                                                return (
                                                    <Card key={categoryName} className="p-4">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-sm font-medium text-center">
                                                                {categoryName}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="text-center">
                                                            <PieChart 
                                                                data={weights}
                                                                totalWeight={categoryTotal}
                                                                showLabels={false}
                                                                showLegend={true}
                                                            />
                                                            <div className="mt-3 text-center">
                                                                <p className="text-xs text-muted-foreground">
                                                                    Total: {categoryTotal}%
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                        <div className="text-center pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                Overall Total Weight: {totalWeight}%
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No internship opportunities yet</h3>
                                <p className="text-sm mb-4">Create your first internship position to start attracting students.</p>
                                <Button>
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    Create Internship
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
