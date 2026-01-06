import { supabase } from './supabase';

// ==========================================
// Authentication Helper Functions
// ==========================================

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} metadata - Additional user data (name, etc.)
 * @returns {Promise<{user, session, error}>}
 */
export const signUp = async (email, password, metadata = {}) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata // Store additional user data (name, etc.)
            }
        });

        if (error) throw error;

        // Also create user profile in our custom table
        if (data.user) {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: data.user.id, // Use Supabase auth user ID
                    email: data.user.email,
                    name: metadata.name || null,
                    created_at: new Date().toISOString()
                });

            if (profileError) {
                console.warn('Profile creation warning:', profileError);
                // Don't throw - auth succeeded, profile is optional
            }
        }

        return { user: data.user, session: data.session, error: null };
    } catch (error) {
        console.error('Signup error:', error);
        return { user: null, session: null, error };
    }
};

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user, session, error}>}
 */
export const signIn = async (email, password) => {
    try {
        console.log('🔐 Attempting login with:', { email, passwordLength: password?.length });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        console.log('📊 Login response:', {
            hasUser: !!data?.user,
            hasSession: !!data?.session,
            error: error?.message
        });

        if (error) throw error;

        return { user: data.user, session: data.session, error: null };
    } catch (error) {
        console.error('❌ Sign in error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            name: error.name
        });
        return { user: null, session: null, error };
    }
};

/**
 * Sign out the current user
 * @returns {Promise<{error}>}
 */
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear local storage
        localStorage.removeItem('signup_data');
        localStorage.removeItem('user_id');

        return { error: null };
    } catch (error) {
        console.error('Sign out error:', error);
        return { error };
    }
};

/**
 * Get the current authenticated user
 * @returns {Promise<{user, error}>}
 */
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        // If there's no session, that's expected for logged-out users
        // Don't treat it as an error
        if (error && error.message === 'Auth session missing!') {
            return { user: null, error: null };
        }

        // Handle invalid/stale JWT tokens
        if (error && error.message.includes('User from sub claim in JWT does not exist')) {
            console.warn('Invalid JWT token detected, clearing session...');
            // Clear the invalid session
            await supabase.auth.signOut();
            return { user: null, error: null };
        }

        if (error) throw error;

        return { user, error: null };
    } catch (error) {
        // Only log actual errors, not missing sessions
        if (error.message !== 'Auth session missing!' && !error.message.includes('User from sub claim')) {
            console.error('Get user error:', error);
        }

        // If it's an invalid token error, clear session
        if (error.message.includes('User from sub claim in JWT does not exist')) {
            await supabase.auth.signOut().catch(() => { });
        }

        return { user: null, error: null }; // Return null instead of error for invalid tokens
    }
};

/**
 * Get current session
 * @returns {Promise<{session, error}>}
 */
export const getSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        // If there's no session, that's expected for logged-out users
        if (error && error.message === 'Auth session missing!') {
            return { session: null, error: null };
        }

        if (error) throw error;

        return { session, error: null };
    } catch (error) {
        // Only log actual errors, not missing sessions
        if (error.message !== 'Auth session missing!') {
            console.error('Get session error:', error);
        }
        return { session: null, error };
    }
};

/**
 * Update user profile in custom table
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateUserProfile = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Update profile error:', error);
        return { data: null, error };
    }
};

/**
 * Get user profile from custom table
 * @param {string} userId - User ID
 * @returns {Promise<{profile, error}>}
 */
export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return { profile: data, error: null };
    } catch (error) {
        console.error('Get profile error:', error);
        return { profile: null, error };
    }
};

/**
 * Listen to auth state changes
 * @param {function} callback - Callback function to handle auth changes
 * @returns {object} Subscription object
 */
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};
