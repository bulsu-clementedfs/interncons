<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use App\Models\HTE;
use App\Models\Internship;
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

            'subcategoryWeights' => 'required|array',
        ]);

        // Debug: Log the incoming request data
        Log::info('HTE Form Submission - Request Data:', [
            'subcategoryWeights' => $request->subcategoryWeights,
            'subcategoryWeights_count' => count($request->subcategoryWeights),
            'all_request_data' => $request->all()
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

            Log::info('HTE Record Created:', ['hte_id' => $hte->id]);

            // Create Internship record
            $internship = Internship::create([
                'hte_id' => $hte->id,
                'position_title' => $request->position,
                'department' => $request->department,
                'placement_description' => 'Internship opportunity at ' . $request->companyName . ' - Duration: ' . $request->duration . ' from ' . $request->startDate . ' to ' . $request->endDate,
                'slot_count' => (int) $request->numberOfInterns,
                'is_active' => true,
            ]);

            Log::info('Internship Record Created:', ['internship_id' => $internship->id]);

            // Store subcategory weights
            $weightsCreated = 0;
            foreach ($request->subcategoryWeights as $subcategoryId => $weight) {
                try {
                    $subcategoryWeight = SubcategoryWeight::create([
                        'internship_id' => $internship->id,
                        'subcategory_id' => $subcategoryId,
                        'weight' => (int) $weight,
                    ]);
                    $weightsCreated++;
                    Log::info('Subcategory Weight Created:', [
                        'id' => $subcategoryWeight->id,
                        'internship_id' => $internship->id,
                        'subcategory_id' => $subcategoryId,
                        'weight' => $weight
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to create subcategory weight:', [
                        'subcategory_id' => $subcategoryId,
                        'weight' => $weight,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            Log::info('Subcategory Weights Summary:', [
                'total_weights_processed' => count($request->subcategoryWeights),
                'weights_successfully_created' => $weightsCreated
            ]);

            return redirect()->route('hte.dashboard')->with('success', 'HTE form submitted successfully!');

        } catch (\Exception $e) {
            Log::error('HTE Form Submission Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->withErrors(['error' => 'An error occurred while submitting the form. Please try again.']);
        }
    }

    /**
     * Get categories with subcategories and questions for the criteria step
     * Excludes 'Basic Information' category
     */
    public function getCategoriesForCriteria()
    {
        // Get categories with subcategories and questions, excluding 'Basic Information'
        $categories = Category::with(['subCategories.questions' => function($query) {
            $query->where('is_active', true);
        }])
        ->where('category_name', '!=', 'Basic Information')
        ->get();
        
        // Transform the data to ensure proper structure for frontend
        $transformedCategories = $categories->map(function($category) {
            return [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
                'subCategories' => $category->subCategories->map(function($subCategory) {
                    return [
                        'id' => $subCategory->id,
                        'subcategory_name' => $subCategory->subcategory_name,
                        'category_id' => $subCategory->category_id,
                        'created_at' => $subCategory->created_at,
                        'updated_at' => $subCategory->updated_at,
                        'questions' => $subCategory->questions->map(function($question) {
                            return [
                                'id' => $question->id,
                                'question' => $question->question,
                                'access' => $question->access,
                                'is_active' => (bool) $question->is_active,
                                'subcategory_id' => $question->subcategory_id,
                                'created_at' => $question->created_at,
                                'updated_at' => $question->updated_at,
                            ];
                        })->toArray()
                    ];
                })->toArray()
            ];
        });
        
        // Debug: Log the structure of the first category
        if ($transformedCategories->count() > 0) {
            $firstCategory = $transformedCategories->first();
            Log::info('First category structure:', [
                'id' => $firstCategory['id'],
                'name' => $firstCategory['category_name'],
                'subCategories_count' => count($firstCategory['subCategories']),
                'subCategories_key_exists' => isset($firstCategory['subCategories']),
                'first_subcategory_name' => $firstCategory['subCategories'][0]['subcategory_name'] ?? 'N/A'
            ]);
        }
        
        return response()->json($transformedCategories);
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

        // Get HTE with related data including categories
        $hteWithData = HTE::with([
            'internships.subcategoryWeights.subcategory.category'
        ])->find($hte->id);

        // Debug: Log the data being sent to the frontend
        Log::info('HTE Profile Data:', [
            'hte_id' => $hteWithData->id,
            'internships_count' => $hteWithData->internships ? $hteWithData->internships->count() : 0,
            'first_internship_subcategory_weights_count' => $hteWithData->internships && $hteWithData->internships->first() 
                ? ($hteWithData->internships->first()->subcategoryWeights ? $hteWithData->internships->first()->subcategoryWeights->count() : 0) 
                : 0
        ]);

        return Inertia::render('hte/profile', [
            'hte' => $hteWithData
        ]);
    }

    /**
     * Show HTE dashboard page
     */
    public function dashboard()
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->route('form');
        }

        // Get comprehensive dashboard data
        $dashboardData = HTE::with([
            'internships' => function($query) {
                $query->with(['subcategoryWeights.subcategory']);
            },
            'user'
        ])->find($hte->id);

        // Get statistics
        $totalInternships = $dashboardData->internships->count();
        $activeInternships = $dashboardData->internships->where('is_active', true)->count();
        $totalSlots = $dashboardData->internships->sum('slot_count');
        
        // Get internship slots breakdown for detailed view
        $internshipSlots = $dashboardData->internships->map(function($internship) {
            return [
                'id' => $internship->id,
                'position_title' => $internship->position_title,
                'slot_count' => $internship->slot_count,
                'is_active' => $internship->is_active,
                'created_at' => $internship->created_at
            ];
        });

        return Inertia::render('hte/dashboard', [
            'hte' => $dashboardData,
            'stats' => [
                'totalInternships' => $totalInternships,
                'activeInternships' => $activeInternships,
                'totalSlots' => $totalSlots,
                'internshipSlots' => $internshipSlots,
                'companyName' => $dashboardData->company_name,
                'contactPerson' => $dashboardData->cperson_fname . ' ' . $dashboardData->cperson_lname,
                'email' => $dashboardData->company_email,
                'phone' => $dashboardData->cperson_contactnum,
                'address' => $dashboardData->company_address,
            ],
        ]);
    }

    /**
     * Show Add Internship form (only if HTE has already submitted their form)
     */
    public function showAddInternship()
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->route('form');
        }

        // Get categories for criteria selection
        $categories = Category::with(['subCategories.questions' => function($query) {
            $query->where('is_active', true);
        }])
        ->where('category_name', '!=', 'Basic Information')
        ->get();

        // Transform the data to ensure proper structure for frontend
        $transformedCategories = $categories->map(function($category) {
            return [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
                'subCategories' => $category->subCategories->map(function($subCategory) {
                    return [
                        'id' => $subCategory->id,
                        'subcategory_name' => $subCategory->subcategory_name,
                        'category_id' => $subCategory->category_id,
                        'created_at' => $subCategory->created_at,
                        'updated_at' => $subCategory->updated_at,
                        'questions' => $subCategory->questions->map(function($question) {
                            return [
                                'id' => $question->id,
                                'question' => $question->question,
                                'access' => $question->access,
                                'is_active' => (bool) $question->is_active,
                                'subcategory_id' => $question->subcategory_id,
                                'created_at' => $question->created_at,
                                'updated_at' => $question->updated_at,
                            ];
                        })->toArray()
                    ];
                })->toArray()
            ];
        });

        return Inertia::render('hte/add-internship', [
            'hte' => $hte,
            'categories' => $transformedCategories
        ]);
    }

    /**
     * Store new internship
     */
    public function storeInternship(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->back()->withErrors(['error' => 'You must submit an HTE form first.']);
        }

        // Validate the request
        $request->validate([
            'position' => 'required|string|max:100',
            'department' => 'required|string|max:50',
            'numberOfInterns' => 'required|string|max:50',
            'duration' => 'required|string|max:100',
            'startDate' => 'required|string|max:50',
            'endDate' => 'required|string|max:50',
            'subcategoryWeights' => 'required|array',
        ]);

        try {
            // Create Internship record
            $internship = Internship::create([
                'hte_id' => $hte->id,
                'position_title' => $request->position,
                'department' => $request->department,
                'placement_description' => 'Internship opportunity at ' . $hte->company_name . ' - Duration: ' . $request->duration . ' from ' . $request->startDate . ' to ' . $request->endDate,
                'slot_count' => (int) $request->numberOfInterns,
                'is_active' => true,
            ]);

            // Store subcategory weights
            foreach ($request->subcategoryWeights as $subcategoryId => $weight) {
                SubcategoryWeight::create([
                    'internship_id' => $internship->id,
                    'subcategory_id' => $subcategoryId,
                    'weight' => (int) $weight,
                ]);
            }

            return redirect()->route('hte.dashboard')->with('success', 'Internship added successfully!');

        } catch (\Exception $e) {
            Log::error('Internship Creation Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->withErrors(['error' => 'An error occurred while creating the internship. Please try again.']);
        }
    }

    /**
     * Show Internship details
     */
    public function showInternship($id)
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->route('form');
        }

        // Get the internship with its weights and related data
        $internship = Internship::with(['subcategoryWeights.subcategory.category'])
            ->where('id', $id)
            ->where('hte_id', $hte->id)
            ->first();

        if (!$internship) {
            return redirect()->route('hte.dashboard')->withErrors(['error' => 'Internship not found.']);
        }

        // Transform the data for display
        $internshipData = [
            'id' => $internship->id,
            'position_title' => $internship->position_title,
            'department' => $internship->department,
            'slot_count' => $internship->slot_count,
            'placement_description' => $internship->placement_description,
            'is_active' => $internship->is_active,
            'created_at' => $internship->created_at,
            'updated_at' => $internship->updated_at,
            'subcategory_weights' => $internship->subcategoryWeights->map(function($weight) {
                return [
                    'id' => $weight->id,
                    'weight' => $weight->weight,
                    'subcategory' => [
                        'id' => $weight->subcategory->id,
                        'subcategory_name' => $weight->subcategory->subcategory_name,
                        'category' => [
                            'id' => $weight->subcategory->category->id,
                            'category_name' => $weight->subcategory->category->category_name,
                        ]
                    ]
                ];
            })->toArray()
        ];

        return Inertia::render('hte/internship-profile', [
            'hte' => $hte,
            'internship' => $internshipData
        ]);
    }

    /**
     * Show Edit Internship form
     */
    public function showEditInternship($id)
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->route('form');
        }

        // Get the internship with its weights
        $internship = Internship::with(['subcategoryWeights.subcategory.category'])
            ->where('id', $id)
            ->where('hte_id', $hte->id)
            ->first();

        if (!$internship) {
            return redirect()->route('hte.profile')->withErrors(['error' => 'Internship not found.']);
        }

        // Get categories for criteria selection
        $categories = Category::with(['subCategories.questions' => function($query) {
            $query->where('is_active', true);
        }])
        ->where('category_name', '!=', 'Basic Information')
        ->get();

        // Transform the data to ensure proper structure for frontend
        $transformedCategories = $categories->map(function($category) {
            return [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
                'subCategories' => $category->subCategories->map(function($subCategory) {
                    return [
                        'id' => $subCategory->id,
                        'subcategory_name' => $subCategory->subcategory_name,
                        'category_id' => $subCategory->category_id,
                        'created_at' => $subCategory->created_at,
                        'updated_at' => $subCategory->updated_at,
                        'questions' => $subCategory->questions->map(function($question) {
                            return [
                                'id' => $question->id,
                                'question' => $question->question,
                                'access' => $question->access,
                                'is_active' => (bool) $question->is_active,
                                'subcategory_id' => $question->subcategory_id,
                                'created_at' => $question->created_at,
                                'updated_at' => $question->updated_at,
                            ];
                        })->toArray()
                    ];
                })->toArray()
            ];
        });

        // Extract internship data for editing
        $internshipData = [
            'id' => $internship->id,
            'position' => $internship->position_title,
            'department' => $internship->department,
            'numberOfInterns' => (string) $internship->slot_count,
            'duration' => $this->extractDurationFromDescription($internship->placement_description),
            'startDate' => $this->extractStartDateFromDescription($internship->placement_description),
            'endDate' => $this->extractEndDateFromDescription($internship->placement_description),
            'is_active' => $internship->is_active,
        ];

        // Extract existing weights
        $existingWeights = [];
        foreach ($internship->subcategoryWeights as $weight) {
            $existingWeights[$weight->subcategory_id] = $weight->weight;
        }

        return Inertia::render('hte/edit-internship', [
            'hte' => $hte,
            'categories' => $transformedCategories,
            'internship' => $internshipData,
            'existingWeights' => $existingWeights
        ]);
    }

    /**
     * Update existing internship
     */
    public function updateInternship(Request $request, $id): RedirectResponse
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->back()->withErrors(['error' => 'You must submit an HTE form first.']);
        }

        // Validate the request
        $request->validate([
            'position' => 'required|string|max:100',
            'department' => 'required|string|max:50',
            'numberOfInterns' => 'required|string|max:50',
            'duration' => 'required|string|max:100',
            'startDate' => 'required|string|max:50',
            'endDate' => 'required|string|max:50',
            'subcategoryWeights' => 'required|array',
        ]);

        try {
            // Get the internship
            $internship = Internship::where('id', $id)
                ->where('hte_id', $hte->id)
                ->first();

            if (!$internship) {
                return redirect()->back()->withErrors(['error' => 'Internship not found.']);
            }

            // Update Internship record
            $internship->update([
                'position_title' => $request->position,
                'department' => $request->department,
                'placement_description' => 'Internship opportunity at ' . $hte->company_name . ' - Duration: ' . $request->duration . ' from ' . $request->startDate . ' to ' . $request->endDate,
                'slot_count' => (int) $request->numberOfInterns,
            ]);

            // Delete existing weights and create new ones
            $internship->subcategoryWeights()->delete();

            // Store new subcategory weights
            foreach ($request->subcategoryWeights as $subcategoryId => $weight) {
                SubcategoryWeight::create([
                    'internship_id' => $internship->id,
                    'subcategory_id' => $subcategoryId,
                    'weight' => (int) $weight,
                ]);
            }

            return redirect()->route('hte.profile')->with('success', 'Internship updated successfully!');

        } catch (\Exception $e) {
            Log::error('Internship Update Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->withErrors(['error' => 'An error occurred while updating the internship. Please try again.']);
        }
    }

    /**
     * Extract duration from placement description
     */
    private function extractDurationFromDescription($description)
    {
        if (preg_match('/Duration: ([^-]+)/', $description, $matches)) {
            return trim($matches[1]);
        }
        return '';
    }

    /**
     * Extract start date from placement description
     */
    private function extractStartDateFromDescription($description)
    {
        if (preg_match('/from ([^to]+) to/', $description, $matches)) {
            return trim($matches[1]);
        }
        return '';
    }

    /**
     * Extract end date from placement description
     */
    private function extractEndDateFromDescription($description)
    {
        if (preg_match('/to (.+)$/', $description, $matches)) {
            return trim($matches[1]);
        }
        return '';
    }

    /**
     * Toggle internship status
     */
    public function toggleInternshipStatus($id)
    {
        $user = Auth::user();
        $hte = $user->hte;
        
        if (!$hte) {
            return redirect()->back()->withErrors(['error' => 'You must submit an HTE form first.']);
        }

        try {
            // Get the internship
            $internship = Internship::where('id', $id)
                ->where('hte_id', $hte->id)
                ->first();

            if (!$internship) {
                return redirect()->back()->withErrors(['error' => 'Internship not found.']);
            }

            // Toggle status
            $internship->update([
                'is_active' => !$internship->is_active
            ]);

            $status = $internship->is_active ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "Internship {$status} successfully!");

        } catch (\Exception $e) {
            Log::error('Internship Status Toggle Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->withErrors(['error' => 'An error occurred while updating the internship status. Please try again.']);
        }
    }
}
