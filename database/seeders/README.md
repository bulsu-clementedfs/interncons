# Database Seeders for Internship Placement System

This directory contains seeders that populate the database with sample data for the Internship Placement System, specifically designed to enable comprehensive data visualization for students and administrators.

## Available Seeders

### Core Seeders
- **CategorySeeder** - Creates skill categories (Language Proficiency, Technical Skills, Soft Skills)
- **SubCategorySeeder** - Creates specific skill subcategories within each category
- **SectionSeeder** - Creates academic sections/classes
- **AcademeAccountSeeder** - Creates academic institution accounts
- **HTESeeder** - Creates Host Training Establishment (HTE) accounts
- **InternshipSeeder** - Creates basic internship positions
- **StudentSeeder** - Creates initial student records
- **PlacementSeeder** - Creates student-internship placements

### Enhanced Seeders for Data Visualization
- **ExtendedInternshipSeeder** - Adds 15+ diverse internship positions across various tech domains
- **ExtendedStudentSeeder** - Adds 15+ additional students with diverse backgrounds
- **InternshipCriteriaSeeder** - Creates comprehensive criteria weights for all internship positions
- **StudentScoreSeeder** - Generates realistic student scores across all skill subcategories

## Data Visualization Features

### 1. Internship Criteria Analysis
- **Weight Distribution**: Each internship has specific weight criteria for different skills
- **Skill Requirements**: Clear breakdown of what skills are valued for each position
- **Comparison Data**: Students can compare different internship requirements

### 2. Student Performance Analytics
- **Skill Assessment**: Comprehensive scores across all skill categories
- **Performance Distribution**: Realistic score ranges (excellent, good, average, below average, poor)
- **Standout Students**: Some students have exceptional skills in specific areas for better visualization

### 3. Diverse Internship Opportunities
- **Software Development** - Java, Python, JavaScript focus
- **Data Analytics** - Python, SQL, R emphasis
- **Cybersecurity** - Security tools and programming skills
- **UX/UI Design** - Design and frontend development
- **AI/ML** - Machine learning and data science
- **DevOps** - Infrastructure and automation
- **Mobile Development** - iOS/Android development
- **Quality Assurance** - Testing and quality processes
- **Business Intelligence** - Data warehousing and reporting
- **Cloud Computing** - AWS, Azure, GCP platforms
- **Game Development** - Unity/Unreal Engine
- **Blockchain** - Distributed ledger technology
- **IoT Development** - Connected devices and sensors
- **Data Engineering** - ETL and big data processing
- **Frontend/Backend** - Web development specializations

## Running the Seeders

### Option 1: Run All Seeders
```bash
php artisan db:seed
```

### Option 2: Run Specific Seeders
```bash
# Run only the enhanced seeders for visualization
php artisan db:seed --class=ExtendedInternshipSeeder
php artisan db:seed --class=ExtendedStudentSeeder
php artisan db:seed --class=InternshipCriteriaSeeder
php artisan db:seed --class=StudentScoreSeeder

# Run only the core seeders
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=StudentSeeder
php artisan db:seed --class=InternshipSeeder
```

### Option 3: Fresh Database with All Data
```bash
php artisan migrate:fresh --seed
```

## Data Structure for Visualization

### Student Scores
- **Score Range**: 0.00 - 100.00 (decimal with 2 places)
- **Distribution**: Realistic bell curve with some standout performers
- **Categories**: Language Proficiency, Technical Skills, Soft Skills
- **Subcategories**: Specific skills like Java, Python, Problem-Solving, etc.

### Internship Criteria
- **Weight System**: 0-30 points per skill (total typically 100)
- **Skill Mapping**: Each internship maps to relevant skills
- **Requirement Levels**: High, Medium, Low importance for different skills

### Sample Data Output
- **Students**: 30+ students with diverse skill profiles
- **Internships**: 20+ positions across various tech domains
- **Skill Categories**: 3 main categories with 15+ subcategories
- **Score Records**: 450+ individual skill assessments

## Use Cases for Students

### 1. Skill Gap Analysis
- Compare personal scores with internship requirements
- Identify areas for improvement
- Find best-fit internship opportunities

### 2. Performance Benchmarking
- See how you compare to other students
- Identify your strengths and weaknesses
- Set realistic goals for skill development

### 3. Career Planning
- Explore different career paths in tech
- Understand skill requirements for various roles
- Plan skill development roadmap

## Use Cases for Administrators

### 1. Program Assessment
- Analyze overall student performance
- Identify skill gaps in the curriculum
- Track improvement over time

### 2. Internship Matching
- Optimize student-internship placements
- Ensure fair distribution of opportunities
- Monitor placement success rates

### 3. Curriculum Development
- Identify skills that need more focus
- Balance technical vs. soft skills
- Align curriculum with industry needs

## Notes

- All seeders use `firstOrCreate` to avoid duplicate data
- Scores are generated with realistic distributions
- Some students have standout skills for better visualization
- Internship criteria are industry-aligned and realistic
- Data is designed to show clear patterns and relationships

## Troubleshooting

If you encounter issues:
1. Ensure all migrations have been run first
2. Check that required models exist
3. Verify database connections
4. Run seeders in the correct order (use DatabaseSeeder for proper sequence)
