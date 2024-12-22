# [Deployment Steps](https://nx.dev/recipes/react/deploy-nextjs-to-vercel)

Open Vercel and import a new project. After importing select `Next.JS` as the framework. **Do not** alter the root directory.

Override `Build and Output Settings`
>npx nx build ttt-frontend --prod

Toggle the override switch for the output directory. Point it to the .next directory inside the built app:
>apps/tic-tac-toe/frontend/.next



