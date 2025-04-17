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




## TO DO - 08/04/25
1. Enhance Reset password logic- If email do not exist, Error message pop-up {We did not found this email. If you do not have an account, please signup or double check you've insert the right email} -> FIREBASE AUTH SHOULD MANAGE CHANGING PASSWORD --- DO WE WANT THE USER TO BE ABLE TO CHANGE EMAI TOO? ✅ DONE ✅

2. Implment logic for dynamic Search and Filter by genre IN STORY LIST DASHBOARD

3. Implement story play buttons -> (AI Story Generator needs to be implemented first)

4. Add toggle mode light/dark in child accounts -- Add it in the navbar-next to avatar ✅ DONE ✅

5. Check button disabled > GRAY as for requirements in settings for mode.

6. After Signup redirect on Login --> This is already implemented but currently not working (CHECK)✅

7. Parent/detail.js -> in the tables, retrive info already existing and stored in db and show placeholders for info not existing in db and optional as "full name","address","phone number" - 

8. Parent/detail.js -> enhance subscription plan field -> dropdown windows with "free","pro" and "unlimited" --> Implement logic: If user has a free plan and in this dropdown select pro, redirect in subscription plan page (as he will need to complete payment)

9. Test logic in Linking parent/child accounts.

10. Add some sort of visual icon in the voices cards.

11. DarkMode currently reset if user logs out or refresh page and when the user logs back in the mode is back to light as default > 
    QUESTIONS: 
    1. Do we want to store his mode preference and keep the mode he prefer each time that he logs in?
    2. Do we want to implement an automatic timing set that changes mode based on day/eve time?

12. Implement TTS with ElevenLabs.

13. CHECK ALL DESIGN ADHERE TO DESIRED REQUIREMENTS BY CLIENT.   

14. Create new story with AI or be inspired by AI needs to be implemente as for prototype. 
(AI Story Generator needs to be implemented first)