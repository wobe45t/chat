import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { InputField } from '../components/InputField'
import { ISignupForm } from '../interfaces/user'
import { SubmitButton } from '../components/SubmitButton'
import { signup } from '../actions/users'
import { UserContext } from '../context/userContext'
import { useMutation } from 'react-query'


const Signup = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ISignupForm>()

  const { mutate: signupMutate } = useMutation(
    (signupData: ISignupForm) => signup(signupData),
    {
      onSuccess: (data) => {
        toast.success('Account created', {
          autoClose: 1000,
          hideProgressBar: true,
        })
        navigate('/login')
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
            Signup
          </span>
          <form
            className='flex flex-col gap-2'
            onSubmit={handleSubmit((data) => {
              signupMutate(data)
            })}
          >
            <InputField
              label='Email'
              {...register('email', {
                required: 'Field is required',
                pattern: {
                  value:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: 'Invalid email',
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

            <InputField
              label='First name'
              {...register('firstName')}
              error={errors?.firstName}
            />

            <InputField
              label='Last name'
              {...register('lastName')}
              error={errors?.lastName}
            />

            <SubmitButton>Signup</SubmitButton>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
