@echo off
echo  Deploying TalentFlow...

echo Building application...
call npm run build

if %errorlevel% equ 0 (
    echo  Build successful!
    echo  Build files are in the 'build' directory
    echo.
    echo  Deployment Options:
    echo 1. Netlify: Drag and drop the 'build' folder to netlify.com
    echo 2. Vercel: Run 'npx vercel' in the project directory
    echo 3. GitHub Pages: Push to gh-pages branch
    echo 4. AWS S3: Upload 'build' folder contents to S3 bucket
    echo.
    echo  Environment Variables to Set:
    echo - REACT_APP_API_URL (if using external API)
    echo - REACT_APP_ENABLE_MOCK=true (for demo purposes)
) else (
    echo  Build failed! Check the errors above.
    exit /b 1
)
