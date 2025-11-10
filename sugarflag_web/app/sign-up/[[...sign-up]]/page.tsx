import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            card: 'shadow-xl',
          },
        }}
        afterSignUpUrl="/scan"
        redirectUrl="/scan"
      />
    </div>
  )
}
