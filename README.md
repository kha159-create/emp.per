# Khaleel Employee Dashboard

## How to Deploy to GitHub Pages

This project is built with **React** and **Vite**, which means it must be "built" before it can be hosted. You cannot simply host the files in this repository directly.

### Recommended: Automated Deployment (GitHub Actions)
I have already set up a GitHub Action for you. To use it:

1. **Push your code** to the `main` branch.
2. Go to your repository on GitHub.
3. Click on the **Settings** tab.
4. Click on **Pages** in the left sidebar.
5. Under **Build and deployment** > **Source**, change the setting to **"GitHub Actions"**.
6. GitHub will now automatically build and update your site every time you push code!

### Troubleshooting 404 Errors
If you see a 404 error for `main.tsx`:
- Ensure you have pushed the latest changes to GitHub.
- Check the **Actions** tab in your repository to make sure the "Deploy to GitHub Pages" build finished successfully.
- Go to **Settings > Pages** and make sure it says **"Your site is live at..."** with the correct URL.

### Manual Deployment (If needed)
If you prefer to deploy manually from your computer:
1. Run `npm install`
2. Run `npm run build`
3. The production-ready files will be created in the `dist/` folder. You would host the contents of **that folder**, not the whole repository.

### Why you saw errors:
Browsers cannot understand `.tsx` files. They only understand `.js` files. The "MIME type" and "404" errors you saw occur because the browser was trying to load the raw source code instead of the compiled version.
