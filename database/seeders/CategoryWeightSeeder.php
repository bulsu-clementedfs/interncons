<?php

namespace Database\Seeders;

use App\Models\HTE;
use App\Models\Internship;
use App\Models\Category;
use App\Models\CategoryWeight;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoryWeightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all categories
        $categories = Category::all();
        
        // Get all HTEs
        $htes = HTE::all();
        
        // Get all internships
        $internships = Internship::all();

        // Create category weights for specific internships
        $categoryWeightData = [
            // TechCorp Solutions - Software Development Intern
            [
                'internship_id' => $internships->where('position_title', 'Software Development Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Language Proficiency')->first()->id,
                'weight' => 40,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Software Development Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Technical Skill')->first()->id,
                'weight' => 35,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Software Development Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Soft Skill')->first()->id,
                'weight' => 25,
            ],

            // DataFlow Analytics - Data Analytics Intern
            [
                'internship_id' => $internships->where('position_title', 'Data Analytics Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Language Proficiency')->first()->id,
                'weight' => 30,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Data Analytics Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Technical Skill')->first()->id,
                'weight' => 45,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Data Analytics Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Soft Skill')->first()->id,
                'weight' => 25,
            ],

            // GreenTech Industries - Environmental Research Intern
            [
                'internship_id' => $internships->where('position_title', 'Environmental Research Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Language Proficiency')->first()->id,
                'weight' => 25,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Environmental Research Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Technical Skill')->first()->id,
                'weight' => 30,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Environmental Research Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Soft Skill')->first()->id,
                'weight' => 45,
            ],

            // Creative Marketing Pro - Digital Marketing Intern
            [
                'internship_id' => $internships->where('position_title', 'Digital Marketing Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Language Proficiency')->first()->id,
                'weight' => 20,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Digital Marketing Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Technical Skill')->first()->id,
                'weight' => 25,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Digital Marketing Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Soft Skill')->first()->id,
                'weight' => 55,
            ],

            // FinanceFirst Bank - Finance Intern
            [
                'internship_id' => $internships->where('position_title', 'Finance Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Language Proficiency')->first()->id,
                'weight' => 35,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Finance Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Technical Skill')->first()->id,
                'weight' => 30,
            ],
            [
                'internship_id' => $internships->where('position_title', 'Finance Intern')->first()->id,
                'category_id' => $categories->where('category_name', 'Soft Skill')->first()->id,
                'weight' => 35,
            ],
        ];

        foreach ($categoryWeightData as $data) {
            CategoryWeight::firstOrCreate(
                [
                    'internship_id' => $data['internship_id'],
                    'category_id' => $data['category_id'],
                ],
                [
                    'internship_id' => $data['internship_id'],
                    'category_id' => $data['category_id'],
                    'weight' => $data['weight'],
                ]
            );
        }
    }
}
