import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';

interface Category {
    id: number;
    category_name: string;
    subCategory: SubCategory[];
}

interface SubCategory {
    id: number;
    subcategory_name: string;
    questions: Question[];
}

interface Question {
    id: number;
    question: string;
    access: string;
    is_active: boolean;
}

export default function Criteria() {
    const { control, watch, setValue } = useFormContext();
    const [categories, setCategories] = useState<Category[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const [expandedSubcategories, setExpandedSubcategories] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    // Watch the weight values for validation
    const categoryWeights: Record<string, number> = watch('categoryWeights') || {};
    const subcategoryWeights: Record<string, number> = watch('subcategoryWeights') || {};

    useEffect(() => {
        // Fetch categories from the API
        fetch('/hte/categories')
            .then(response => response.json())
            .then(data => {
                console.log('Categories data received:', data);
                // Ensure all categories have subCategory property
                const processedData = data.map((category: any) => ({
                    ...category,
                    subCategory: category.subCategory || []
                }));
                console.log('Processed categories data:', processedData);
                setCategories(processedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    }, []);

    const toggleCategory = (categoryId: number) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleSubcategory = (subcategoryId: number) => {
        const newExpanded = new Set(expandedSubcategories);
        if (newExpanded.has(subcategoryId)) {
            newExpanded.delete(subcategoryId);
        } else {
            newExpanded.add(subcategoryId);
        }
        setExpandedSubcategories(newExpanded);
    };

    const handleCategoryWeightChange = (categoryId: number, weight: number) => {
        setValue(`categoryWeights.${categoryId}`, weight);
    };

    const handleSubcategoryWeightChange = (subcategoryId: number, weight: number) => {
        setValue(`subcategoryWeights.${subcategoryId}`, weight);
    };

    const calculateCategoryTotalWeight = () => {
        return Object.values(categoryWeights).reduce((sum: number, weight: number) => sum + weight, 0);
    };

    const calculateSubcategoryTotalWeight = (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category || !category.subCategory) return 0;
        
        return category.subCategory.reduce((sum, subcat) => {
            const weight = subcategoryWeights[subcat.id] || 0;
            return sum + (Number(weight) || 0);
        }, 0);
    };

    const getWeightValidationColor = (total: number) => {
        if (total === 100) return 'text-green-600';
        if (total > 100) return 'text-red-600';
        return 'text-yellow-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading criteria...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Assessment Criteria and Weights</h2>
                <p className="text-gray-600">
                    Assign weights to categories and subcategories. Each category must total 100%, and subcategories within each category must also total 100%.
                </p>
                
                {/* Category Weights Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Category Weights Summary</h3>
                    <div className="flex items-center gap-4">
                        <span>Total: {calculateCategoryTotalWeight()}%</span>
                        <span className={getWeightValidationColor(calculateCategoryTotalWeight())}>
                            {calculateCategoryTotalWeight() === 100 ? '✓ Valid' : 
                             calculateCategoryTotalWeight() > 100 ? '✗ Exceeds 100%' : '⚠ Incomplete'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {categories.map((category) => {
                    const isExpanded = expandedCategories.has(category.id);
                    const categoryWeight = categoryWeights[category.id] || 0;
                    const subcategoryTotal = calculateSubcategoryTotalWeight(category.id);
                    
                    return (
                        <div key={category.id} className="border rounded-lg">
                            <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                                <CollapsibleTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-between p-4 h-auto"
                                    >
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                            <span className="font-medium">{category.category_name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span>Weight:</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={categoryWeight}
                                                    onChange={(e) => handleCategoryWeightChange(category.id, Number(e.target.value))}
                                                    className="w-20"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span>%</span>
                                            </div>
                                        </div>
                                    </Button>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className="p-4 border-t">
                                    <div className="space-y-4">
                                        {/* Subcategory Total Weight */}
                                        <div className="bg-blue-50 p-3 rounded">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Subcategory Total: {subcategoryTotal}%</span>
                                                <span className={`text-sm ${getWeightValidationColor(subcategoryTotal)}`}>
                                                    {subcategoryTotal === 100 ? '✓ Valid' : 
                                                     subcategoryTotal > 100 ? '✗ Exceeds 100%' : '⚠ Incomplete'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subcategories */}
                                        <div className="space-y-3">
                                            {category.subCategory && category.subCategory.length > 0 ? (
                                                category.subCategory.map((subcategory) => {
                                                    const isSubExpanded = expandedSubcategories.has(subcategory.id);
                                                    const subcategoryWeight = subcategoryWeights[subcategory.id] || 0;
                                                    
                                                    return (
                                                        <div key={subcategory.id} className="border rounded-lg">
                                                            <Collapsible open={isSubExpanded} onOpenChange={() => toggleSubcategory(subcategory.id)}>
                                                                <CollapsibleTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        className="w-full justify-between p-3 h-auto"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            {isSubExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                                                            <span className="font-medium">{subcategory.subcategory_name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <span>Weight:</span>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    value={subcategoryWeight}
                                                                                    onChange={(e) => handleSubcategoryWeightChange(subcategory.id, Number(e.target.value))}
                                                                                    className="w-20"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                                <span>%</span>
                                                                            </div>
                                                                        </div>
                                                                    </Button>
                                                                </CollapsibleTrigger>
                                                                
                                                                <CollapsibleContent className="p-3 border-t">
                                                                    <div className="space-y-2">
                                                                        <h4 className="font-medium text-sm text-gray-700">Questions:</h4>
                                                                        <div className="space-y-2">
                                                                            {subcategory.questions && subcategory.questions.length > 0 ? (
                                                                                subcategory.questions.map((question) => (
                                                                                    <div key={question.id} className="text-sm text-gray-600 pl-4">
                                                                                        • {question.question}
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <div className="text-sm text-gray-500 pl-4">No questions available</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    No subcategories available for this category
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
