import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
        category_weights: Array<{
            id: number;
            weight: number;
            category: {
                id: number;
                category_name: string;
            };
        }>;
        subcategory_weights: Array<{
            id: number;
            weight: number;
            subcategory: {
                id: number;
                subcategory_name: string;
            };
        }>;
        internships: Array<{
            id: number;
            title: string;
            description: string;
            requirements: string;
            is_active: boolean;
            created_at: string;
        }>;
    };
}

export default function HTEProfilePage() {
    const { hte } = usePage<HTEProfileProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HTE Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
                    <p className="text-muted-foreground">
                        View your company information and internship opportunities
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>Basic company details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                <p className="text-lg font-semibold">{hte.company_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Address</label>
                                <p className="text-sm">{hte.company_address}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-sm">{hte.company_email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                                <p className="text-sm">{hte.cperson_fname} {hte.cperson_lname}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Position</label>
                                <p className="text-sm">{hte.cperson_position}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                                <p className="text-sm">{hte.cperson_contactnum}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <Badge variant={hte.is_active ? "default" : "secondary"}>
                                    {hte.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Weights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Criteria Weights</CardTitle>
                            <CardDescription>Category and subcategory weights for student matching</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Category Weights</h4>
                                <div className="space-y-2">
                                    {hte.category_weights.map((cw) => (
                                        <div key={cw.id} className="flex justify-between items-center">
                                            <span className="text-sm">{cw.category.category_name}</span>
                                            <Badge variant="outline">{cw.weight}%</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-medium mb-2">Subcategory Weights</h4>
                                <div className="space-y-2">
                                    {hte.subcategory_weights.map((sw) => (
                                        <div key={sw.id} className="flex justify-between items-center">
                                            <span className="text-sm">{sw.subcategory.subcategory_name}</span>
                                            <Badge variant="outline">{sw.weight}%</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Internships */}
                <Card>
                    <CardHeader>
                        <CardTitle>Internship Opportunities</CardTitle>
                        <CardDescription>Manage your company's internship positions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hte.internships.length > 0 ? (
                            <div className="space-y-4">
                                {hte.internships.map((internship) => (
                                    <div key={internship.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium">{internship.title}</h4>
                                            <Badge variant={internship.is_active ? "default" : "secondary"}>
                                                {internship.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{internship.description}</p>
                                        <div className="text-sm">
                                            <strong>Requirements:</strong> {internship.requirements}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            Created: {new Date(internship.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No internship opportunities created yet.</p>
                                <p className="text-sm">Create your first internship position to start attracting students.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
