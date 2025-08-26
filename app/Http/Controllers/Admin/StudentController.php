<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentMatch;
use App\Models\Internship;
use App\Models\StudentScore;
use App\Models\SubcategoryWeight;
use App\Models\StudentPlacement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\MatchingService;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $students = Student::with('section')
            ->select([
                'id',
                'student_number',
                'first_name',
                'middle_name',
                'last_name',
                'section_id',
                'specialization',
                'is_active'
            ])
            ->where('is_active', true)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // Transform the data to ensure section is a string
        $transformedStudents = $students->map(function ($student) {
            return [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'section' => $student->section->section_name ?? '',
                'specialization' => $student->specialization,
                'is_active' => $student->is_active,
            ];
        });

        return Inertia::render('admin/student/list', ['students' => $transformedStudents]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Student $student)
    {
        $student->load('section');
        
        $formattedStudent = [
            'id' => $student->id,
            'student_number' => $student->student_number,
            'first_name' => $student->first_name,
            'middle_name' => $student->middle_name,
            'last_name' => $student->last_name,
            'section' => $student->section->section_name ?? '',
            'specialization' => $student->specialization,
        ];
        
        return Inertia::render('admin/student/edit', ['student' => $formattedStudent]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'middle_name' => 'nullable|string|max:50',
            'last_name' => 'required|string|max:50',
            'student_number' => 'required|string|max:20',
            'section_id' => 'required|integer|exists:sections,section_id',
            'specialization' => 'required|string|max:10',
        ]);

        $student->update($validated);

        return redirect()->route('student-list')->with('success', 'Student updated successfully');
    }

    /**
     * Archive the specified student (soft delete by setting is_active to false).
     */
    public function archive(Student $student)
    {
        $student->update(['is_active' => false]);
        
        return redirect()->route('student-list')->with('success', 'Student archived successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        //
    }

    /**
     * Get matched students with their highest compatibility scores
     */
    public function getMatchedStudents(Request $request)
    {
        $sectionFilter = $request->get('section');
        $internshipFilter = $request->get('internship');
        $searchQuery = $request->get('search');

        // Get students who have submitted assessments
        $query = Student::with(['user', 'scores.subcategory', 'section'])
            ->where('is_submit', true)
            ->where('is_active', true);

        // Apply section filter
        if ($sectionFilter && $sectionFilter !== 'all') {
            $query->whereHas('section', function($q) use ($sectionFilter) {
                $q->where('section_name', $sectionFilter);
            });
        }

        // Apply search filter
        if ($searchQuery) {
            $query->where(function ($q) use ($searchQuery) {
                $q->where('first_name', 'like', "%{$searchQuery}%")
                  ->orWhere('last_name', 'like', "%{$searchQuery}%")
                  ->orWhere('student_number', 'like', "%{$searchQuery}%");
            });
        }

        $students = $query->get();

        $matchedStudents = $students->map(function ($student) use ($internshipFilter) {
            if ($internshipFilter && $internshipFilter !== 'all') {
                // If specific internship is selected, get compatibility score for that internship
                $specificMatch = $student->compatibilityScores()
                    ->with(['internship.hte:id,company_name', 'internship.subcategoryWeights.subcategory'])
                    ->where('internship_id', $internshipFilter)
                    ->first();

                if ($specificMatch) {
                    return [
                        'id' => $student->id,
                        'student_number' => $student->student_number,
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                        'middle_name' => $student->middle_name,
                        'section' => $student->section->section_name ?? '',
                        'specialization' => $student->specialization,
                        'best_match' => [
                            'internship' => $specificMatch->internship,
                            'compatibility_score' => $specificMatch->compatibility_score,
                        ],
                        'has_matches' => true,
                    ];
                }
            } else {
                // Get the best match from stored compatibility scores
                $bestMatch = $student->compatibilityScores()
                    ->with(['internship.hte:id,company_name', 'internship.subcategoryWeights.subcategory'])
                    ->orderBy('compatibility_score', 'desc')
                    ->first();

                if ($bestMatch) {
                    return [
                        'id' => $student->id,
                        'student_number' => $student->student_number,
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                        'middle_name' => $student->middle_name,
                        'section' => $student->section->section_name ?? '',
                        'specialization' => $student->specialization,
                        'best_match' => [
                            'internship' => $bestMatch->internship,
                            'compatibility_score' => $bestMatch->compatibility_score,
                        ],
                        'has_matches' => true,
                    ];
                }
            }

            return [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_name' => $student->middle_name,
                'section' => $student->section->section_name ?? '',
                'specialization' => $student->specialization,
                'best_match' => null,
                'has_matches' => false,
            ];
        })
        ->filter(function ($student) {
            // Only include students who have at least one match
            return $student['has_matches'];
        });

        // Sort based on filter type
        if ($internshipFilter && $internshipFilter !== 'all') {
            // Sort by rank for specific internship
            $matchedStudents = $matchedStudents->sortBy(function ($student) {
                return $student['best_match']['compatibility_score'];
            })->reverse()->values();
        } else {
            // Sort by compatibility score (highest first) for section-based view
            $matchedStudents = $matchedStudents->sortByDesc(function ($student) {
                return $student['best_match']['compatibility_score'];
            })->values();
        }

        // Get available sections and internships for filters
        $availableSections = Student::with('section')
            ->where('is_submit', true)
            ->where('is_active', true)
            ->get()
            ->pluck('section.section_name')
            ->filter()
            ->unique()
            ->values();

        $availableInternships = Internship::where('is_active', true)
            ->where('slot_count', '>', 0)
            ->with('hte:id,company_name')
            ->get()
            ->map(function ($internship) {
                return [
                    'id' => $internship->id,
                    'title' => $internship->position_title,
                    'company' => $internship->hte->company_name,
                    'department' => $internship->department,
                ];
            });

        return Inertia::render('admin/student/matched', [
            'matchedStudents' => $matchedStudents,
            'filters' => [
                'sections' => $availableSections,
                'internships' => $availableInternships,
                'currentSection' => $sectionFilter,
                'currentInternship' => $internshipFilter,
                'currentSearch' => $searchQuery,
            ]
        ]);
    }

    /**
     * Get all compatibility scores for a student with dynamic sorting
     */
    public function getStudentCompatibilityScores(Request $request, Student $student)
    {
        $student->load('section');
        
        $sortBy = $request->get('sort_by', 'compatibility_score');
        $sortOrder = $request->get('sort_order', 'desc');

        $matchingService = new \App\Services\MatchingService();
        $scores = $matchingService->getCompatibilityScoresSorted($student, $sortBy, $sortOrder);

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_name' => $student->middle_name,
                'section' => $student->section->section_name ?? '',
                'specialization' => $student->specialization,
            ],
            'compatibility_scores' => $scores->map(function ($score) {
                return [
                    'internship' => [
                        'id' => $score['internship']->id,
                        'position_title' => $score['internship']->position_title,
                        'company_name' => $score['internship']->hte->company_name,
                        'department' => $score['internship']->department,
                        'slot_count' => $score['internship']->slot_count,
                        'is_active' => $score['internship']->is_active,
                    ],
                    'compatibility_score' => $score['compatibility_score'],
                    'rank' => $score['rank'],
                ];
            }),
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Calculate compatibility score between a student and an internship
     */
    private function calculateCompatibilityScore($student, $internship): float
    {
        $totalScore = 0;
        $totalWeight = 0;

        // Get the weights for this internship
        $weights = $internship->subcategoryWeights;

        foreach ($weights as $weight) {
            $subcategoryId = $weight->subcategory_id;
            $weightValue = $weight->weight;
            
            // Get student's score for this subcategory
            $studentScore = $student->scores->where('sub_category_id', $subcategoryId)->first();
            
            if ($studentScore) {
                // Convert student score (1-5 scale) to percentage (0-100)
                $scorePercentage = ($studentScore->score / 5) * 100;
                
                // Apply weight to the score
                $weightedScore = $scorePercentage * ($weightValue / 100);
                
                $totalScore += $weightedScore;
                $totalWeight += $weightValue;
            }
        }

        // Calculate final compatibility score
        if ($totalWeight > 0) {
            return round(($totalScore / $totalWeight) * 100, 2);
        }

        return 0;
    }

    /**
     * Get student details with assessment scores and internship criteria
     */
    public function getStudentDetails(Student $student)
    {
        $student->load([
            'scores.subcategory.category',
            'user',
            'section'
        ]);

        // Get the best matching internship
        $activeInternships = Internship::with(['hte:id,company_name', 'subcategoryWeights.subcategory.category'])
            ->where('is_active', true)
            ->where('slot_count', '>', 0)
            ->get();

        $bestMatch = null;
        $highestScore = 0;

        foreach ($activeInternships as $internship) {
            $compatibilityScore = $this->calculateCompatibilityScore($student, $internship);
            
            if ($compatibilityScore > $highestScore) {
                $highestScore = $compatibilityScore;
                $bestMatch = [
                    'internship' => $internship,
                    'compatibility_score' => $compatibilityScore,
                ];
            }
        }

        // Get detailed scores breakdown
        $scoresBreakdown = $student->scores->map(function ($score) {
            return [
                'category' => $score->subcategory->category->name,
                'subcategory' => $score->subcategory->name,
                'score' => $score->score,
                'score_percentage' => ($score->score / 5) * 100,
            ];
        });

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_name' => $student->middle_name,
                'section' => $student->section->section_name ?? '',
                'specialization' => $student->specialization,
            ],
            'best_match' => $bestMatch,
            'scores_breakdown' => $scoresBreakdown,
        ]);
    }

    /**
     * Approve student placement
     */
    public function approvePlacement(Request $request, Student $student)
    {
        // Debug logging
        Log::info('Placement approval request received', [
            'student_id' => $student->id,
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        // Log the raw request data for debugging
        Log::info('Raw request data:', [
            'has_admin_notes' => $request->has('admin_notes'),
            'admin_notes_value' => $request->input('admin_notes'),
            'all_inputs' => $request->all()
        ]);

        $validated = $request->validate([
            'internship_id' => 'required|exists:internships,id',
            'compatibility_score' => 'required|numeric|min:0|max:100',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Ensure admin_notes is always set, even if null or empty
        if (!isset($validated['admin_notes']) || $validated['admin_notes'] === '') {
            $validated['admin_notes'] = null;
        }

        // Log validated data for debugging
        Log::info('Validated data:', [
            'validated' => $validated,
            'admin_notes_final' => $validated['admin_notes']
        ]);

        // Check if student already has a placement
        $existingPlacement = StudentPlacement::where('student_id', $student->id)->first();
        if ($existingPlacement) {
            return response()->json([
                'message' => 'Student already has a placement'
            ], 400);
        }

        // Check if internship exists and has available slots
        $internship = Internship::find($validated['internship_id']);
        if (!$internship) {
            return response()->json([
                'message' => 'Internship not found'
            ], 404);
        }

        if ($internship->slot_count <= 0) {
            return response()->json([
                'message' => 'No available slots for this internship'
            ], 400);
        }

        try {
            // Create placement record using DB::table instead of Eloquent create()
            // This works better with composite primary keys
            $placementData = [
                'student_id' => $student->id,
                'internship_id' => $validated['internship_id'],
                'status' => 'approved',
                'compatibility_score' => $validated['compatibility_score'],
                'admin_notes' => $validated['admin_notes'],
                'placement_date' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Log the placement data being inserted
            Log::info('Placement data to be inserted:', $placementData);
            
            // Ensure all required fields are present and properly formatted
            if (!isset($placementData['student_id']) || !isset($placementData['internship_id']) || !isset($placementData['compatibility_score'])) {
                throw new \Exception('Missing required placement data fields');
            }

            // Ensure data types are correct
            if (!is_numeric($placementData['compatibility_score']) || $placementData['compatibility_score'] < 0 || $placementData['compatibility_score'] > 100) {
                throw new \Exception('Invalid compatibility score');
            }

            if (!is_numeric($placementData['student_id']) || !is_numeric($placementData['internship_id'])) {
                throw new \Exception('Invalid student or internship ID');
            }
            
            Log::info('Attempting to create placement with data:', $placementData);
            
            $inserted = DB::table('student_placements')->insert($placementData);
            
            if (!$inserted) {
                throw new \Exception('Failed to insert placement record');
            }
            
            Log::info('Placement record inserted successfully');
            
            // Get the created placement for response
            $placement = StudentPlacement::where('student_id', $student->id)
                                ->where('internship_id', $validated['internship_id'])
                                ->first();

            if (!$placement) {
                throw new \Exception('Placement record was inserted but could not be retrieved');
            }

            Log::info('Placement created successfully', ['placement_id' => $placement->getAttributes()]);

            // Update student status
            $studentUpdated = $student->update(['is_placed' => true]);
            if (!$studentUpdated) {
                throw new \Exception('Failed to update student status');
            }
            Log::info('Student status updated');

            // Decrease internship slot count
            $internship->decrement('slot_count');
            Log::info('Internship slot count decreased', ['new_count' => $internship->slot_count]);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error in placement approval', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            // Check for specific database errors
            if ($e->getCode() == 23000) { // Integrity constraint violation
                return response()->json([
                    'message' => 'Placement already exists for this student and internship'
                ], 400);
            }
            
            return response()->json([
                'message' => 'Database error: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error in placement approval', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error creating placement: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Student placement approved successfully',
            'placement' => [
                'id' => $placement->id,
                'student_id' => $placement->student_id,
                'internship_id' => $placement->internship_id,
                'status' => $placement->status,
                'compatibility_score' => $placement->compatibility_score,
                'admin_notes' => $placement->admin_notes,
                'placement_date' => $placement->placement_date,
                'created_at' => $placement->created_at,
            ]
        ]);
    }

    /**
     * Reject student placement
     */
    public function rejectPlacement(Request $request, Student $student)
    {
        $validated = $request->validate([
            'internship_id' => 'required|exists:internships,id',
            'compatibility_score' => 'required|numeric|min:0|max:100',
            'admin_notes' => 'required|string|max:500',
        ]);

        // Ensure admin_notes is always set for rejection
        if (!isset($validated['admin_notes']) || empty($validated['admin_notes'])) {
            return response()->json([
                'message' => 'Admin notes are required for rejection'
            ], 400);
        }

        // Check if student already has a placement
        $existingPlacement = StudentPlacement::where('student_id', $student->id)->first();
        if ($existingPlacement) {
            return response()->json([
                'message' => 'Student already has a placement'
            ], 400);
        }

        try {
            // Create placement record using DB::table instead of Eloquent create()
            // This works better with composite primary keys
            $placementData = [
                'student_id' => $student->id,
                'internship_id' => $validated['internship_id'],
                'status' => 'rejected',
                'compatibility_score' => $validated['compatibility_score'],
                'admin_notes' => $validated['admin_notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            Log::info('Attempting to create rejected placement with data:', $placementData);
            
            DB::table('student_placements')->insert($placementData);
            
            Log::info('Rejected placement record inserted successfully');
            
            // Get the created placement for response
            $placement = StudentPlacement::where('student_id', $student->id)
                                ->where('internship_id', $validated['internship_id'])
                                ->first();

            return response()->json([
                'message' => 'Student placement rejected',
                'placement' => $placement
            ]);
        } catch (\Exception $e) {
            Log::error('Error in placement rejection', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error creating placement: ' . $e->getMessage()
            ], 500);
        }
    }
}
