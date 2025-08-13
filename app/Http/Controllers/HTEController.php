<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\HTE;
use App\Models\CategoryWeight;
use App\Models\SubcategoryWeight;
use App\Models\Category;
use App\Models\SubCategory;
use Inertia\Inertia;

class HTEController extends Controller
{
    /**
     * Check if user already has an HTE
     */
    public function checkExistingHTE()
    {
        $user = Auth::user();
        $existingHTE = $user->hte;
        
        return response()->json([
            'hasExistingHTE' => $existingHTE !== null,
            'hte' => $existingHTE
        ]);
    }

    /**
     * Show HTE form (only if user doesn't have an existing HTE)
     */
    public function showForm()
    {
        $user = Auth::user();
        
        if ($user->hte) {
            return redirect()->route('hte.profile');
        }

        return Inertia::render('hte/form');
    }

    /**
     * Handle HTE form submission
     */
    public function submit(Request $request): RedirectResponse
    {
        // Check if user already has an HTE
        $user = Auth::user();
        if ($user->hte) {
            return redirect()->back()->withErrors(['error' => 'You have already submitted an HTE form. You cannot submit multiple forms.']);
        }

        // Validate the request
        $request->validate([
            'companyName' => 'required|string|max:100',
            'contactPerson' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'position' => 'required|string|max:100',
            'department' => 'required|string|max:100',
            'numberOfInterns' => 'required|string|max:50',
            'duration' => 'required|string|max:100',
            'startDate' => 'required|string|max:50',
            'endDate' => 'required|string|max:50',
            'minimumGPA' => 'required|string|max:10',
            'requiredSkills' => 'required|string',
            'preferredMajors' => 'nullable|string',
            'additionalRequirements' => 'nullable|string',
            'categoryWeights' => 'required|array',
            'subcategoryWeights' => 'required|array',
        ]);

        try {
            // Create HTE record
            $hte = HTE::create([
                'user_id' => $user->id,
                'company_name' => $request->companyName,
                'company_address' => $request->address,
                'company_email' => $request->email,
                'cperson_fname' => $request->contactPerson,
                'cperson_lname' => '',
                'cperson_position' => $request->position,
                'cperson_contactnum' => $request->phone,
                'is_active' => true,
            ]);

            // Store category weights
            foreach ($request->categoryWeights as $categoryId => $weight) {
                CategoryWeight::create([
                    'hte_id' => $hte->id,
                    'category_id' => $categoryId,
                    'weight' => $weight,
                ]);
            }

            // Store subcategory weights
            foreach ($request->subcategoryWeights as $subcategoryId => $weight) {
                SubcategoryWeight::create([
                    'hte_id' => $hte->id,
                    'subcategory_id' => $subcategoryId,
                    'weight' => $weight,
                ]);
            }

            return redirect()->route('hte.profile')->with('success', 'HTE form submitted successfully!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'An error occurred while submitting the form. Please try again.']);
        }
    }

    /**
     * Get categories with subcategories and questions for the criteria step
     */
    public function getCategoriesForCriteria()
    {
        $categories = Category::with(['subCategory.questions' => function($query) {
            $query->where('is_active', true);
        }])->get();

        return response()->json($categories);
    }

    /**
     * Show HTE profile page
     */
    public function profile()
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->route('form');
        }

        // Get HTE with related data
        $hteWithData = HTE::with([
            'categoryWeights.category',
            'subcategoryWeights.subcategory',
            'internships'
        ])->find($hte->id);

        return Inertia::render('hte/profile', [
            'hte' => $hteWithData
        ]);
    }
}
