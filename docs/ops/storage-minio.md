# MinIO (S3-compatible) Setup for Laravel

Example .env settings:
```
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=strong-minio-pass
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_URL=
AWS_ENDPOINT=http://10.10.0.40:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```
Notes:
- Keep MinIO on private IP. Expose only to App VPS (and admins via VPN/bastion).
- For public delivery, prefer presigned URLs or front a CDN on top of an object storage endpoint.
- Ensure the bucket exists and the credentials are restricted to that bucket.
