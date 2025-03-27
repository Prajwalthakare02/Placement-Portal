import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage if available
const loadInitialState = () => {
    try {
        const savedState = localStorage.getItem('auth');
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (e) {
        console.error("Error loading auth state from localStorage", e);
    }
    
    // Default state
    return {
        loading: false,
        user: null,
        token: localStorage.getItem('authToken') || null
    };
};

// Normalize the user data structure to make profile data more accessible
const normalizeUserData = (userData) => {
    if (!userData) return null;
    
    console.log("Normalizing user data:", userData);
    
    // Create a normalized user object
    const normalizedUser = { ...userData };
    
    // If profile data exists, bring its properties to top level for easier access
    if (userData.profile) {
        console.log("Profile data found:", userData.profile);
        // Copy all profile properties to the user object for easy access
        normalizedUser.bio = userData.profile.bio || userData.bio || '';
        normalizedUser.skills = userData.profile.skills || userData.skills || '';
        normalizedUser.resume = userData.profile.resume || userData.resume || '';
        normalizedUser.resumeOriginalName = userData.profile.resumeOriginalName || '';
        // Make sure we preserve profile_picture
        if (!normalizedUser.profile_picture && userData.profile.profile_picture) {
            normalizedUser.profile_picture = userData.profile.profile_picture;
        }
        console.log("Bio after normalization:", normalizedUser.bio);
    } else {
        console.log("No profile data found in user object");
    }
    
    console.log("Normalized user data:", normalizedUser);
    return normalizedUser;
};

const authSlice = createSlice({
    name: "auth",
    initialState: loadInitialState(),
    reducers: {
        // actions
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            // Normalize the user data before storing it
            state.user = normalizeUserData(action.payload);
            
            // If token is in the payload, update it
            if (action.payload && action.payload.token) {
                state.token = action.payload.token;
                localStorage.setItem('authToken', action.payload.token);
            }
            
            // Save to localStorage when user is updated
            try {
                localStorage.setItem('auth', JSON.stringify(state));
            } catch (e) {
                console.error("Error saving auth state to localStorage", e);
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('auth');
        }
    }
});
export const { setLoading, setUser, logout } = authSlice.actions;
export default authSlice.reducer;