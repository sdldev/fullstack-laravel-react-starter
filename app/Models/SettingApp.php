<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SettingApp extends Model
{
    protected $table = 'settingapp';

    protected $fillable = [

        'nama_app',
        'description',
        'address',
        'email',
        'phone',
        'facebook',
        'instagram',
        'tiktok',
        'youtube',
        'image',
    ];

    public function getImageAttribute($image)
    {
        if (! $image) {
            return;
        }

        if (Storage::disk('public')->exists('images/'.$image)) {
            return asset('storage/images/'.$image);
        }

    }

    // Sanitize text fields to prevent XSS when used in views
    public function getNamaAppAttribute($value)
    {
        return $value ? strip_tags(trim($value)) : $value;
    }

    public function getDescriptionAttribute($value)
    {
        return $value ? strip_tags(trim($value)) : $value;
    }
}
