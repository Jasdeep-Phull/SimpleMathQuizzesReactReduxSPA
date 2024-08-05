An SPA (Single Page Application) which provides a user interface for users to create, view, edit and delete simple math quizzes. This project makes HTTP requests to the SimpleMathQuizzesAPI project for all quiz and account operations. Users must have an account.
Uses: React, React-Redux, React Router Dom, Vite, TypeScript

This uses the vite-template-redux template as a base


CORS is not set up on the SPA or the API. The SPA and API were tested with CORS disabled.

Tested on chrome with CORS disabled using: 'chrome.exe --disable-web-security --user-data-dir=~/chromeTemp'

(from folder: 'C:\Program Files\Google\Chrome\Application')

--

Original readMe from template:

"""

# vite-template-redux

Uses [Vite](https://vitejs.dev/), [Vitest](https://vitest.dev/), and [React Testing Library](https://github.com/testing-library/react-testing-library) to create a modern [React](https://react.dev/) app compatible with [Create React App](https://create-react-app.dev/)

```sh
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app
```

## Goals

- Easy migration from Create React App or Vite
- As beginner friendly as Create React App
- Optimized performance compared to Create React App
- Customizable without ejecting

## Scripts

- `dev`/`start` - start dev server and open browser
- `build` - build for production
- `preview` - locally preview production build
- `test` - launch test runner

## Inspiration

- [Create React App](https://github.com/facebook/create-react-app/tree/main/packages/cra-template)
- [Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react)
- [Vitest](https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib)

"""
