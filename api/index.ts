import passport from 'passport';
import { GoogleStrategy } from 'passport-google-oauth20';
import { Request, Response } from 'express';
import cors from 'cors';
import { db } from './firebase';
import { GoogleProfile } from 'passport-google-oauth20';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: 'https://stopalcholnode.vercel.app/auth/google/callback'
        },
        async (accessToken, refreshToken, profile: GoogleProfile, done) => {
            // You could store/fetch user from Firestore here
            return done(null, { ...profile, accessToken });  // Include accessToken in the user object
        }
    )
);

// ... other middleware setup ...

// Update the callback route to redirect to Angular frontend
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'https://stop-al-front.vercel.app/login' }),
    async (req: Request, res: Response) => {
        const userProfile = req.user as GoogleProfile;
        if (userProfile?.id) {
            const docRef = db.collection('users').doc(userProfile.id);
            await docRef.set({
                displayName: userProfile.displayName,
                email: userProfile.emails?.[0]?.value || null,
                photoURL: userProfile.photos?.[0]?.value || null,
                lastLogin: new Date(),
            });
        }
        
        // Redirect to Angular frontend with user info
        const userInfo = encodeURIComponent(JSON.stringify({
            id: userProfile.id,
            displayName: userProfile.displayName,
            email: userProfile.emails?.[0]?.value,
            photoURL: userProfile.photos?.[0]?.value
        }));
        
        res.redirect(`https://stop-al-front.vercel.app/auth-callback?user=${userInfo}`);
    }
);

// Update CORS to include Angular frontend
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:4200',  // Angular dev server
            'https://stopalcholnode.vercel.app',
            'https://stop-al-front.vercel.app'
        ],
        credentials: true,
    })
); 