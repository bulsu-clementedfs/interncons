import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface CriteriaStepProps {
    form: UseFormReturn<any>;
    categories: Category[];
}

export default function CriteriaStep({ form, categories }: CriteriaStepProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    
    // Get weights from form state
    const categoryWeights = form.watch('categoryWeights') || {};
    const subcategoryWeights = form.watch('subcategoryWeights') || {};

    // Add error handling for categories
    if (!categories || !Array.isArray(categories)) {
        console.error('Categories prop is invalid:', categories);
        return (
            <div className="space-y-6">
                <div className="text-red-600 bg-red-50 p-4 rounded border">
                    Error: Categories data is not available. Please refresh the page.
                </div>
            </div>
        );
    }

    // Filter out "Basic Information" category
    const filteredCategories = categories.filter(category => 
        category.category_name !== 'Basic Information'
    );

    const toggleCategory = (categoryId: number) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategoryWeightChange = (categoryId: number, weight: number) => {
        const newWeights = {
            ...categoryWeights,
            [categoryId]: weight
        };
        form.setValue('categoryWeights', newWeights);
    };

    const handleSubcategoryWeightChange = (categoryId: number, subcategoryId: number, weight: number) => {
        const newWeights = {
            ...subcategoryWeights,
            [categoryId]: {
                ...subcategoryWeights[categoryId],
                [subcategoryId]: weight
            }
        };
        form.setValue('subcategoryWeights', newWeights);
    };

    const calculateCategoryTotal = () => {
        const weights = Object.values(categoryWeights);
        return weights.reduce((sum: number, weight: any) => sum + (weight || 0), 0);
    };

    const calculateSubcategoryTotal = (categoryId: number) => {
        const weights = Object.values(subcategoryWeights[categoryId] || {});
        return weights.reduce((sum: number, weight: any) => sum + (weight || 0), 0);
    };

    const getCategoryWeight = (categoryId: number) => {
        return categoryWeights[categoryId] || 0;
    };

    const getSubcategoryWeight = (categoryId: number, subcategoryId: number) => {
        return subcategoryWeights[categoryId]?.[subcategoryId] || 0;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Criteria and Weight Assignment</h2>
                <div className="text-sm text-gray-600">
                    Total Category Weight: {calculateCategoryTotal()}%
                </div>
            </div>

            <div className="space-y-4">
                {filteredCategories.map((category) => (
                    <Collapsible
                        key={category.id}
                        open={expandedCategories.has(category.id)}
                        onOpenChange={() => toggleCategory(category.id)}
                    >
                        <div className="border border-gray-200 rounded-lg">
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-2">
                                        {expandedCategories.has(category.id) ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                        <span className="font-medium">{category.category_name}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-gray-600">
                                            Weight: {getCategoryWeight(category.id)}%
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Subcategories: {category.subCategory.length}
                                        </div>
                                    </div>
                                </Button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                    {/* Category Weight Input */}
                                    <div className="mb-4">
                                        <Label htmlFor={`category-weight-${category.id}`}>
                                            Category Weight (%)
                                        </Label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Input
                                                id={`category-weight-${category.id}`}
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={getCategoryWeight(category.id)}
                                                onChange={(e) => handleCategoryWeightChange(category.id, Number(e.target.value))}
                                                className="w-24"
                                            />
                                            <span className="text-sm text-gray-600">%</span>
                                        </div>
                                    </div>

                                    {/* Subcategories */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm">Subcategories</h4>
                                        {category.subCategory.map((subcategory) => (
                                            <div key={subcategory.id} className="ml-4 p-3 bg-white rounded border">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-sm">
                                                        {subcategory.subcategory_name}
                                                    </span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-600">
                                                            Weight: {getSubcategoryWeight(category.id, subcategory.id)}%
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            Questions: {subcategory.questions.length}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Subcategory Weight Input */}
                                                <div className="mb-3">
                                                    <Label htmlFor={`subcategory-weight-${subcategory.id}`} className="text-xs">
                                                        Subcategory Weight (%)
                                                    </Label>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Input
                                                            id={`subcategory-weight-${subcategory.id}`}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={getSubcategoryWeight(category.id, subcategory.id)}
                                                            onChange={(e) => handleSubcategoryWeightChange(category.id, subcategory.id, Number(e.target.value))}
                                                            className="w-20 text-sm"
                                                        />
                                                        <span className="text-xs text-gray-600">%</span>
                                                    </div>
                                                </div>

                                                {/* Questions */}
                                                {subcategory.questions.length > 0 && (
                                                    <div className="ml-4">
                                                        <h5 className="text-xs font-medium text-gray-700 mb-2">Questions:</h5>
                                                        <ul className="space-y-1">
                                                            {subcategory.questions.map((question) => (
                                                                <li key={question.id} className="text-xs text-gray-600">
                                                                    • {question.question}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Subcategory Weight Total */}
                                        <div className="ml-4 text-sm text-gray-600">
                                            Subcategory Total: {calculateSubcategoryTotal(category.id)}%
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                ))}
            </div>

            {/* Validation Messages */}
            {calculateCategoryTotal() !== 100 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border">
                    ⚠️ Category weights must sum to 100%. Current total: {calculateCategoryTotal()}%
                </div>
            )}

            {filteredCategories.some(category => calculateSubcategoryTotal(category.id) !== 100) && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border">
                    ⚠️ Subcategory weights within each category must sum to 100%
                </div>
            )}
        </div>
    );
}
