import { useContext } from 'react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { InputField } from '../components/InputField'
import { Credentials } from '../interfaces/user'
import { SubmitButton } from '../components/SubmitButton'
import { login } from '../actions/users'
import { UserContext } from '../context/userContext'
import { SocketContext } from '../context/socketContext'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router'

const Login = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>()

  const { setUser } = useContext(UserContext)
  const {initSocket} = useContext(SocketContext)

  const { mutate: loginMutate } = useMutation(
    (loginData: Credentials) => login(loginData),
    {
      onSuccess: (data) => {
        console.log('login data: ', data)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({ email: data.email }))

        initSocket(data.token)

        delete data.token
        setUser(data)
        toast.success('Logged in', {
          autoClose: 500,
          hideProgressBar: true,
        })
        navigate('/')
      },
      onError: (error: any) => {
        toast.error(error.response.data.message, { autoClose: 1000 })
      },
    }
  )

  return (
    <div className='w-full flex min-h-screen items-center justify-center'>
      <div className='shadow-md p-3 border rounded-md flex flex-col items-center'>
        <div className='flex flex-col my-2 gap-5'>
          <span className='text-4xl tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-blue-600'>
            Login
          </span>
          <form
            className='flex flex-col gap-2'
            onSubmit={handleSubmit((data) => {
              loginMutate(data)
            })}
          >
            <InputField
              label='Email'
              {...register('email', {
                required: 'Field is required',
                pattern: {
                  value:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: 'Email not valid',
                },
              })}
              error={errors?.email}
            />

            <InputField
              label='Password'
              type='password'
              {...register('password', { required: 'Field is required' })}
              error={errors?.password}
            />

            <SubmitButton>Login</SubmitButton>
          </form>
          <span
            onClick={() => navigate('/signup')}
            className='font-light tracking-tighter cursor-pointer hover:text-blue-700 text-blue-900'
          >
            Don't have an account? Signup!
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login
