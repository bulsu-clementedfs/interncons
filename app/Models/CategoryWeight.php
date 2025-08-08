<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryWeight extends Model
{
    use HasFactory;

    protected $table = 'category_weights';

    protected $fillable = [
        'hte_id',
        'category_id',
        'weight',
    ];

    public function hte(): BelongsTo
    {
        return $this->belongsTo(HTE::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
