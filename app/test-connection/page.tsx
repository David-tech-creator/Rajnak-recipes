"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function TestConnectionPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "success" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [recipeCount, setRecipeCount] = useState<number | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const [testPassword, setTestPassword] = useState("")
  const [isTestingAuth, setIsTestingAuth] = useState(false)
  const { user, signIn, signUp } = useAuth()
  const { toast } = useToast()

  // Test Supabase connection
  useEffect(() => {
    async function checkConnection() {
      try {
        setIsLoading(true)
        setConnectionStatus("checking")

        // Test basic query
        const { count, error } = await supabase.from("recipes").select("*", { count: "exact", head: true })

        if (error) {
          throw error
        }

        setRecipeCount(count || 0)
        setConnectionStatus("success")
      } catch (error) {
        console.error("Connection error:", error)
        setConnectionStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  // Test account creation
  const handleTestSignUp = async () => {
    if (!testEmail || !testPassword) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      return
    }

    setIsTestingAuth(true)

    try {
      await signUp(testEmail, testPassword)

      toast({
        title: "Account created",
        description: "Test account was created successfully. Check your email to confirm.",
      })
    } catch (error) {
      toast({
        title: "Error creating account",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsTestingAuth(false)
    }
  }

  // Test sign in
  const handleTestSignIn = async () => {
    if (!testEmail || !testPassword) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      return
    }

    setIsTestingAuth(true)

    try {
      await signIn(testEmail, testPassword)

      toast({
        title: "Signed in",
        description: "Test sign in was successful",
      })
    } catch (error) {
      toast({
        title: "Error signing in",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsTestingAuth(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Supabase Connection Test</h1>

      <div className="grid gap-8 max-w-3xl mx-auto">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
            <CardDescription>Testing connection to Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Testing connection...</span>
              </div>
            ) : connectionStatus === "success" ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Connection successful!</p>
                  <p className="text-sm text-gray-500">Found {recipeCount} recipes in the database.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Connection failed</p>
                  <p className="text-sm text-gray-500">{errorMessage}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication Test */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Test account creation and sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password (min 6 characters)"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
              />
            </div>

            {user && (
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-700 font-medium">Currently signed in as:</p>
                <p className="text-sm text-green-600">{user.email}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleTestSignUp} disabled={isTestingAuth}>
              {isTestingAuth ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Sign Up
            </Button>
            <Button onClick={handleTestSignIn} disabled={isTestingAuth}>
              {isTestingAuth ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Sign In
            </Button>
          </CardFooter>
        </Card>

        {/* Recipe Creation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe Creation</CardTitle>
            <CardDescription>Test creating a new recipe</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <p>You are signed in and can create recipes.</p>
            ) : (
              <p className="text-amber-600">You need to sign in first to test recipe creation.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild disabled={!user}>
              <a href="/recipes/new">Go to Recipe Creation</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
