import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { UserProvider } from './context/userContext'
import { ChatProvider } from './context/chatContext'
import { SocketProvider } from './context/socketContext'
import Home from './screens/Home'
import Notifications from './screens/Notifications'

const withSuspense =
  (WrappedComponent: React.FunctionComponent, fallback: any) => (props: any) =>
    (
      <Suspense fallback={fallback}>
        <WrappedComponent {...props} />
      </Suspense>
    )

// const HomeWithSuspense = withSuspense(
//   lazy(() => import('./screens/Home')),
//   <div>Loading...</div>
// )

const ProfileWithSuspense = withSuspense(
  lazy(() => import('./screens/Profile')),
  <div>Loading...</div>
)
const LoginWithSuspense = withSuspense(
  lazy(() => import('./screens/Login')),
  <div>Loading...</div>
)
const SignupWithSuspense = withSuspense(
  lazy(() => import('./screens/Signup')),
  <div>Loading...</div>
)

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UserProvider>
          <ChatProvider>
            <SocketProvider>
              <main className='w-full h-screen'>
                <ToastContainer />
                <Routes>
                  <Route path='/*'>
                    <Route index element={<Home />} />
                    <Route path='notifications' element={<Notifications />} />
                    <Route path='login' element={<LoginWithSuspense />} />
                    <Route path='signup' element={<SignupWithSuspense />} />
                    <Route path='profile' element={<ProfileWithSuspense />} />
                  </Route>
                </Routes>
              </main>
            </SocketProvider>
          </ChatProvider>
        </UserProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
