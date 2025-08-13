<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'category_name',
    ];

    public function subCategory(): HasMany
    {
        return $this->hasMany(SubCategory::class);
    }

    public function categoryWeights(): HasMany
    {
        return $this->hasMany(CategoryWeight::class);
    }
}
