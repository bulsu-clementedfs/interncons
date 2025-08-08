<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\HTE;
use App\Models\Internship;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class HTETest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles
        Role::create(['name' => 'hte']);
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'student']);
        Role::create(['name' => 'adviser']);
    }

    public function test_hte_user_can_access_form(): void
    {
        $user = User::factory()->hte()->create();

        $response = $this->actingAs($user)->get('/form');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('hte/form'));
    }

    public function test_hte_form_submission_with_single_internship(): void
    {
        $user = User::factory()->hte()->create();

        $data = [
            'companyName' => 'Test Company',
            'contactPerson' => 'John Doe',
            'email' => 'john@testcompany.com',
            'phone' => '1234567890',
            'address' => '123 Test Street, Test City',
            'internships' => [
                [
                    'position' => 'Software Developer Intern',
                    'department' => 'IT Department',
                    'slotCount' => '2',
                    'placementDescription' => 'Develop web applications using modern technologies',
                    'startDate' => '2024-01-15',
                    'endDate' => '2024-04-15',
                ]
            ],
            'minimumGPA' => '2.5',
            'requiredSkills' => 'PHP, JavaScript, HTML, CSS',
            'preferredMajors' => 'Computer Science, Information Technology',
            'additionalRequirements' => 'Must be available for 40 hours per week',
        ];

        $response = $this->actingAs($user)->post('/hte/submit', $data);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check that HTE record was created
        $this->assertDatabaseHas('HTE', [
            'user_id' => $user->id,
            'company_name' => 'Test Company',
            'company_email' => 'john@testcompany.com',
            'cperson_fname' => 'John',
            'cperson_lname' => 'Doe',
        ]);

        // Check that internship record was created
        $hte = HTE::where('user_id', $user->id)->first();
        $this->assertDatabaseHas('internships', [
            'h_t_e_id' => $hte->id,
            'position_title' => 'Software Developer Intern',
            'department' => 'IT Department',
            'slot_count' => 2,
            'placement_description' => 'Develop web applications using modern technologies',
        ]);
    }

    public function test_hte_form_submission_with_multiple_internships(): void
    {
        $user = User::factory()->hte()->create();

        $data = [
            'companyName' => 'Multi-Internship Company',
            'contactPerson' => 'Jane Smith',
            'email' => 'jane@multicompany.com',
            'phone' => '0987654321',
            'address' => '456 Multi Street, Multi City',
            'internships' => [
                [
                    'position' => 'Marketing Intern',
                    'department' => 'Marketing Department',
                    'slotCount' => '3',
                    'placementDescription' => 'Assist with marketing campaigns and social media',
                    'startDate' => '2024-02-01',
                    'endDate' => '2024-05-01',
                ],
                [
                    'position' => 'HR Intern',
                    'department' => 'Human Resources',
                    'slotCount' => '1',
                    'placementDescription' => 'Support HR activities and recruitment',
                    'startDate' => '2024-03-01',
                    'endDate' => '2024-06-01',
                ],
                [
                    'position' => 'Finance Intern',
                    'department' => 'Finance Department',
                    'slotCount' => '2',
                    'placementDescription' => 'Assist with financial analysis and reporting',
                    'startDate' => '2024-01-01',
                    'endDate' => '2024-04-01',
                ]
            ],
            'minimumGPA' => '3.0',
            'requiredSkills' => 'Microsoft Office, Communication Skills',
            'preferredMajors' => 'Business Administration, Marketing, Finance',
            'additionalRequirements' => 'Strong communication and organizational skills',
        ];

        $response = $this->actingAs($user)->post('/hte/submit', $data);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check that HTE record was created
        $this->assertDatabaseHas('HTE', [
            'user_id' => $user->id,
            'company_name' => 'Multi-Internship Company',
            'company_email' => 'jane@multicompany.com',
        ]);

        // Check that all internship records were created
        $hte = HTE::where('user_id', $user->id)->first();
        $this->assertDatabaseHas('internships', [
            'h_t_e_id' => $hte->id,
            'position_title' => 'Marketing Intern',
            'department' => 'Marketing Department',
            'slot_count' => 3,
        ]);
        $this->assertDatabaseHas('internships', [
            'h_t_e_id' => $hte->id,
            'position_title' => 'HR Intern',
            'department' => 'Human Resources',
            'slot_count' => 1,
        ]);
        $this->assertDatabaseHas('internships', [
            'h_t_e_id' => $hte->id,
            'position_title' => 'Finance Intern',
            'department' => 'Finance Department',
            'slot_count' => 2,
        ]);

        // Verify total number of internships created
        $this->assertEquals(3, Internship::where('h_t_e_id', $hte->id)->count());
    }

    public function test_hte_form_validation_requires_at_least_one_internship(): void
    {
        $user = User::factory()->hte()->create();

        $data = [
            'companyName' => 'Test Company',
            'contactPerson' => 'John Doe',
            'email' => 'john@testcompany.com',
            'phone' => '1234567890',
            'address' => '123 Test Street, Test City',
            'internships' => [], // Empty internships array
            'minimumGPA' => '2.5',
            'requiredSkills' => 'PHP, JavaScript',
        ];

        $response = $this->actingAs($user)->post('/hte/submit', $data);

        $response->assertSessionHasErrors(['internships']);
    }

    public function test_hte_form_validation_requires_internship_fields(): void
    {
        $user = User::factory()->hte()->create();

        $data = [
            'companyName' => 'Test Company',
            'contactPerson' => 'John Doe',
            'email' => 'john@testcompany.com',
            'phone' => '1234567890',
            'address' => '123 Test Street, Test City',
            'internships' => [
                [
                    'position' => '', // Missing position
                    'department' => 'IT Department',
                    'slotCount' => '2',
                    'placementDescription' => 'Develop web applications',
                    'startDate' => '2024-01-15',
                    'endDate' => '2024-04-15',
                ]
            ],
            'minimumGPA' => '2.5',
            'requiredSkills' => 'PHP, JavaScript',
        ];

        $response = $this->actingAs($user)->post('/hte/submit', $data);

        $response->assertSessionHasErrors(['internships.0.position']);
    }

    public function test_hte_form_updates_existing_hte_record(): void
    {
        $user = User::factory()->hte()->create();
        $hte = HTE::factory()->create(['user_id' => $user->id]);

        $data = [
            'companyName' => 'Updated Company',
            'contactPerson' => 'Updated Contact',
            'email' => 'updated@company.com',
            'phone' => '9876543210',
            'address' => 'Updated Address',
            'internships' => [
                [
                    'position' => 'Updated Position',
                    'department' => 'Updated Department',
                    'slotCount' => '5',
                    'placementDescription' => 'Updated description',
                    'startDate' => '2024-01-01',
                    'endDate' => '2024-04-01',
                ]
            ],
            'minimumGPA' => '3.0',
            'requiredSkills' => 'Updated Skills',
        ];

        $response = $this->actingAs($user)->post('/hte/submit', $data);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check that HTE record was updated, not created
        $this->assertDatabaseHas('HTE', [
            'id' => $hte->id,
            'company_name' => 'Updated Company',
            'company_email' => 'updated@company.com',
        ]);

        // Verify only one HTE record exists for this user
        $this->assertEquals(1, HTE::where('user_id', $user->id)->count());
    }

    public function test_hte_form_submission_with_weight_assignments(): void
    {
        $user = User::factory()->hte()->create();

        // Create test categories and subcategories
        $category = \App\Models\Category::factory()->create(['category_name' => 'Technical Skill']);
        $subcategory = \App\Models\SubCategory::factory()->create([
            'category_id' => $category->id,
            'subcategory_name' => 'Programming'
        ]);

        $data = [
            'companyName' => 'Test Company',
            'contactPerson' => 'John Doe',
            'email' => 'john@testcompany.com',
            'phone' => '1234567890',
            'address' => '123 Test Street, Test City',
            'internships' => [
                [
                    'position' => 'Software Developer Intern',
                    'department' => 'IT Department',
                    'slotCount' => '2',
                    'placementDescription' => 'Develop web applications using modern technologies',
                    'startDate' => '2024-01-15',
                    'endDate' => '2024-04-15',
                ]
            ],
            'minimumGPA' => '2.5',
            'requiredSkills' => 'PHP, JavaScript, HTML, CSS',
            'categoryWeights' => [
                (string)$category->id => 100
            ],
            'subcategoryWeights' => [
                (string)$category->id => [
                    (string)$subcategory->id => 100
                ]
            ],
        ];

        $response = $this->actingAs($user)->post('/hte/submit', $data);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check that HTE record was created
        $hte = HTE::where('user_id', $user->id)->first();
        $this->assertNotNull($hte);

        // Check that category weight was saved
        $this->assertDatabaseHas('category_weights', [
            'h_t_e_id' => $hte->id,
            'category_id' => $category->id,
            'weight' => 100,
        ]);

        // Check that subcategory weight was saved
        $this->assertDatabaseHas('subcategory_weights', [
            'h_t_e_id' => $hte->id,
            'subcategory_id' => $subcategory->id,
            'weight' => 100,
        ]);
    }
}
