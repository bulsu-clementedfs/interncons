<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubcategoryWeight extends Model
{
    use HasFactory;

    protected $table = 'subcategory_weights';

    protected $fillable = [
        'hte_id',
        'subcategory_id',
        'weight',
    ];

    public function hte(): BelongsTo
    {
        return $this->belongsTo(HTE::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }
}
