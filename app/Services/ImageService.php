<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;

class ImageService
{
    protected ImageManager $imageManager;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver);
    }

    /**
     * Process and store an uploaded image (converts to WebP)
     *
     * @return string|false
     */
    public function processImage(
        UploadedFile $file,
        string $storagePath,
        ?int $scaleHeight = null,
        ?string $title = null
    ) {
        try {
            // Validate the uploaded file
            if (! $file->isValid() || ! $this->isValidImage($file)) {
                throw new \Exception('Invalid image file');
            }

            // Create storage directory if it doesn't exist
            $this->ensureDirectoryExists($storagePath);

            // Generate unique filename (always WebP)
            $filename = $this->generateFilename($file, $title, 'webp');

            // Process the image
            $image = $this->imageManager->read($file->getRealPath());

            // Scale down if height is specified
            if ($scaleHeight !== null) {
                $image->scaleDown(height: $scaleHeight);
            }

            // Convert to WebP
            $image->toWebp();

            // Save the processed image using Laravel's Storage facade
            $filePath = $storagePath.'/'.$filename;

            // Save to temporary file first
            $tempPath = tempnam(sys_get_temp_dir(), 'webp_');
            $image->save($tempPath);

            // Store using Laravel's filesystem
            $result = Storage::disk('public')->put($filePath, file_get_contents($tempPath));

            // Clean up temporary file
            unlink($tempPath);

            return $result ? $filename : false;

        } catch (\Exception $e) {
            \Log::error('Error processing image: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Delete an image from storage
     */
    public function deleteImage(?string $filename, string $storagePath): bool
    {
        if (empty($filename)) {
            return false;
        }

        try {
            // Extract just the filename
            $cleanFilename = $this->extractFilenameFromUrl($filename);
            $filePath = $storagePath.'/'.$cleanFilename;

            if (Storage::disk('public')->exists($filePath)) {
                return Storage::disk('public')->delete($filePath);
            }

            return false;
        } catch (\Exception $e) {
            \Log::error('Error deleting image: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Generate a unique filename
     */
    protected function generateFilename(UploadedFile $file, ?string $title, string $format): string
    {
        $baseName = $title ? Str::slug($title) : Str::random(10);
        $timestamp = time();
        $extension = $format;

        return "{$baseName}-{$timestamp}.{$extension}";
    }

    /**
     * Ensure the storage directory exists
     */
    protected function ensureDirectoryExists(string $path): void
    {
        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->makeDirectory($path);
        }
    }

    /**
     * Extract filename from URL if full URL is provided
     */
    protected function extractFilenameFromUrl(string $filename): string
    {
        // If it's a URL, extract the filename part
        if (filter_var($filename, FILTER_VALIDATE_URL)) {
            $path = parse_url($filename, PHP_URL_PATH);

            return basename($path);
        }

        // If it's already just a filename, return as is
        return $filename;
    }

    /**
     * Process and store logo PNG with specific size (180x180)
     *
     * @return string|false
     */
    public function processImageLogo(
        UploadedFile $file,
        string $storagePath,
        int $size = 180,
        string $filename = 'logo'
    ) {
        try {
            // Validate the uploaded file
            if (! $file->isValid() || ! $this->isValidImage($file)) {
                throw new \Exception('Invalid image file');
            }

            // Create storage directory if it doesn't exist
            $this->ensureDirectoryExists($storagePath);

            // Fixed filename for logo
            $logoFilename = $filename.'.png';

            // Process the image
            $image = $this->imageManager->read($file->getRealPath());

            // Resize to exact dimensions (180x180) and maintain aspect ratio
            $image->resize($size, $size);

            // Convert to PNG
            $image->toPng();

            // Save the processed image using Laravel's Storage facade
            $filePath = $storagePath.'/'.$logoFilename;

            // Save to temporary file first
            $tempPath = tempnam(sys_get_temp_dir(), 'png_logo_');
            $image->save($tempPath);

            // Store using Laravel's filesystem
            $result = Storage::disk('public')->put($filePath, file_get_contents($tempPath));

            // Clean up temporary file
            unlink($tempPath);

            return $result ? $logoFilename : false;

        } catch (\Exception $e) {
            \Log::error('Error processing logo image: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Validate if file is a valid image
     */
    protected function isValidImage(UploadedFile $file): bool
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        return in_array($file->getMimeType(), $allowedMimes, true) &&
               $file->getSize() <= 10 * 1024 * 1024; // 10MB max
    }
}
