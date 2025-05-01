export const supabase = createBrowserClient(
  'https://fbuwyojoibwjcugeuvnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidXd5b2pvaWJ3amN1Z2V1dm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMzgwMjEsImV4cCI6MjA2MDcxNDAyMX0.6dCGTQOPGQ2wG5OeIOGpoHiKFbSjZ5Zm5Ksf5_4ugR4',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Add these for better security
      storageKey: 'family-recipe-auth-token',
      storage: {
        getItem: (key) => {
          try {
            return localStorage.getItem(key)
          } catch (error) {
            return null
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value)
          } catch (error) {
            console.error('Error setting auth storage', error)
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key)
          } catch (error) {
            console.error('Error removing auth storage', error)
          }
        },
      },
    },
  }
) 