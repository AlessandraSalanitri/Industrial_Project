# Getting Started

## To run the webapp in your pc, first install dependencies

npm install

## Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## To view Web app
Application should open a browser automatically,
otherwise open it manually with [http://localhost:3000](http://localhost:3000)


# Structure
## Components contains: 
AuthPanel.js > login and signup, 
Footer.js ,
Layout.js ,
Navbar.js.

## Firebase contains:
the configuration file for the db ;
the auth > signin, signout, signup ;
firestore operation and users collection.

## Pages contains:
Child and Parent folder ,
_app.js > linked to the global.css ,
index.js > homepage ,
about.js ,
contact.js ,
login.js ,
signup.js.

## Public contains:
assets folder > images, logos, icons ;
documents > flowchart, recording prototype.

## Styles contains:
global.css > this file has global style that can be used throughout the webapp such as requirements given by the client: "Colors, typography, logos, font sizes, buttons and layout to keep margins, padding consistant and some media query for responsiveness" 
other pages designs can be found in this folder.

## context:
keep stored the user login, keep track of his status 
then in navbar the condition of display based on the user logged in, and his role,
displays either the avatar (if user == child) or the profile icon (if user == parent)
Makes user data available globally via useUser()

##

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


