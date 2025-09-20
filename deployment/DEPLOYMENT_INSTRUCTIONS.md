# WATERCOIN HEDERA POS - Hosting Deployment Instructions

## RumahWeb cPanel Deployment

1. **Login to RumahWeb cPanel**
2. **File Manager** → Navigate to public_html
3. **Upload** all files from this deployment folder
4. **Extract** if in ZIP format
5. **Setup Node.js** (if available):
   - cd public_html
   - npm install --production
   - npm run start

## Environment Variables
File .env.production already included with HEDERA TestNet configuration.
Adjust NEXT_PUBLIC_API_URL with your hosting domain.

## Domain Configuration
- Make sure domain points to public_html
- Setup SSL certificate for HTTPS
- Test HEDERA payment at https://your-domain.com/pos

## Support
If there are issues, contact hosting support for Node.js setup assistance.
