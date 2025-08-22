<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'internship_id',
        'rank',
        'compatibility_score',
    ];

    protected $casts = [
        'rank' => 'integer',
        'compatibility_score' => 'decimal:2',
    ];

    /**
     * Get the student that owns the match.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the internship that owns the match.
     */
    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

    /**
     * Get the match score as a percentage.
     */
    public function getMatchScoreAttribute(): float
    {
        return round($this->compatibility_score, 2);
    }

    /**
     * Get the status of the match.
     */
    public function getStatusAttribute(): string
    {
        if ($this->compatibility_score >= 80) {
            return 'Excellent';
        } elseif ($this->compatibility_score >= 70) {
            return 'Good';
        } elseif ($this->compatibility_score >= 60) {
            return 'Fair';
        } else {
            return 'Poor';
        }
    }
}
