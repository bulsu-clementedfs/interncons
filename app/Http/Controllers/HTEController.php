<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\HTE;
use App\Models\Internship;

class HTEController extends Controller
{
    /**
     * Handle HTE form submission
     */
    public function submit(Request $request): RedirectResponse
    {
        // Validate the request
        $request->validate([
            'companyName' => 'required|string|max:100',
            'contactPerson' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'internships' => 'required|array|min:1',
            'internships.*.position' => 'required|string|max:100',
            'internships.*.department' => 'required|string|max:100',
            'internships.*.slotCount' => 'required|string',
            'internships.*.placementDescription' => 'required|string',
            'internships.*.startDate' => 'required|date',
            'internships.*.endDate' => 'required|date|after:internships.*.startDate',
            'minimumGPA' => 'required|string',
            'requiredSkills' => 'required|string',
            'preferredMajors' => 'nullable|string',
            'additionalRequirements' => 'nullable|string',
            'categoryWeights' => 'nullable|array',
            'subcategoryWeights' => 'nullable|array',
        ]);

        try {
            // Get the authenticated user
            $user = Auth::user();
            
            // Parse contact person name
            $contactPersonParts = explode(' ', $request->contactPerson, 2);
            $contactFirstName = $contactPersonParts[0];
            $contactLastName = isset($contactPersonParts[1]) ? $contactPersonParts[1] : '';

            // Create or update HTE record
            $hte = HTE::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $request->companyName,
                    'company_address' => $request->address,
                    'company_email' => $request->email,
                    'cperson_fname' => $contactFirstName,
                    'cperson_lname' => $contactLastName,
                    'cperson_position' => 'Contact Person', // Default position
                    'cperson_contactnum' => $request->phone,
                    'is_active' => true,
                ]
            );

            // Delete existing internships for this HTE
            $hte->internships()->delete();

            // Create new internship records
            foreach ($request->internships as $internshipData) {
                Internship::create([
                    'h_t_e_id' => $hte->id,
                    'position_title' => $internshipData['position'],
                    'department' => $internshipData['department'],
                    'placement_description' => $internshipData['placementDescription'],
                    'slot_count' => (int) $internshipData['slotCount'],
                    'is_active' => true,
                ]);
            }

            // Handle category weights
            if ($request->has('categoryWeights')) {
                // Delete existing category weights for this HTE
                \App\Models\CategoryWeight::where('h_t_e_id', $hte->id)->delete();
                
                foreach ($request->categoryWeights as $categoryId => $weight) {
                    if ($weight > 0) {
                        \App\Models\CategoryWeight::create([
                            'h_t_e_id' => $hte->id,
                            'category_id' => $categoryId,
                            'weight' => $weight,
                        ]);
                    }
                }
            }

            // Handle subcategory weights
            if ($request->has('subcategoryWeights')) {
                // Delete existing subcategory weights for this HTE
                \App\Models\SubcategoryWeight::where('h_t_e_id', $hte->id)->delete();
                
                foreach ($request->subcategoryWeights as $categoryId => $subcategoryWeights) {
                    foreach ($subcategoryWeights as $subcategoryId => $weight) {
                        if ($weight > 0) {
                            \App\Models\SubcategoryWeight::create([
                                'h_t_e_id' => $hte->id,
                                'subcategory_id' => $subcategoryId,
                                'weight' => $weight,
                            ]);
                        }
                    }
                }
            }

            return redirect()->back()->with('success', 'HTE form submitted successfully!');

        } catch (\Exception $e) {
            Log::error('HTE Form Submission Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->back()
                ->withErrors(['error' => 'An error occurred while submitting the form. Please try again.'])
                ->withInput();
        }
    }


}
