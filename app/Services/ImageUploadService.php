<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    public function uploadSecure(UploadedFile $file, string $directory = 'uploads', int $maxWidth = 1000): string
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (! in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception('Invalid file type');
        }

        if ($file->getSize() > 2048 * 1024) {
            throw new \Exception('File too large');
        }

        try {
            if (! class_exists(\Intervention\Image\ImageManagerStatic::class)) {
                throw new \Exception('Intervention Image package is not installed. Please run: composer require intervention/image');
            }
            $image = \Intervention\Image\ImageManagerStatic::make($file->path());
        } catch (\Exception $e) {
            throw new \Exception('Invalid image file');
        }

        if ($image->width() > $maxWidth) {
            $image->resize($maxWidth, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        $mimeToExt = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
        ];

        $originalMime = $file->getMimeType();
        $ext = $mimeToExt[$originalMime] ?? 'jpg';
        $filename = Str::random(40).'.'.$ext;
        $path = trim($directory, '/').'/'.$filename;

        switch ($ext) {
            case 'png':
                $encoded = (string) $image->encode('png');
                break;
            case 'gif':
                $encoded = (string) $image->encode('gif');
                break;
            case 'jpg':
            default:
                $encoded = (string) $image->encode('jpg', 85);
                break;
        }

        Storage::disk('public')->put($path, $encoded);

        return $path;
    }

    public function deleteSecure(?string $path, string $allowedDirectory = 'uploads'): bool
    {
        if (! $path) {
            return false;
        }

        if (! str_starts_with($path, trim($allowedDirectory, '/').'/')) {
            return false;
        }

        if (! Storage::disk('public')->exists($path)) {
            return false;
        }

        return Storage::disk('public')->delete($path);
    }
}
