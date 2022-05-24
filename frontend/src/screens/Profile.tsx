import { useEffect, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { InputField } from '../components/InputField'
import { SubmitButton } from '../components/SubmitButton'
import { Fieldset } from '../components/Fieldset'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { UserContext } from '../context/userContext'

const Profile = () => {
  const navigate = useNavigate()
  const { user, setUser } = useContext(UserContext)

  // const {
  //   register,
  //   handleSubmit,
  //   setValue,
  //   formState: { errors },
  // } = useForm<IProfile>()

  // const { mutate: updateProfileMutate } = useMutation(
  //   (profileData: IProfile) => updateProfile(profileData),
  //   {
  //     onSuccess: (data) => {
  //       setUser((prevState: any) => ({ ...prevState, profile: data.profile }))
  //       toast.success('Update successful', { autoClose: 1000 })
  //     },
  //     onError: (error: any) => {
  //       toast.error(error.response.data.message, { autoClose: 1000 })
  //     },
  //   }
  // )

  // const handleSubmitContractor = (data: IProfile) => {
  //   updateProfileMutate(data)
  // }

  // useEffect(() => {
  //   if (user?.profile)
  //     Object.entries(user.profile).forEach(([name, value]: any) => {
  //       setValue(name, value)
  //     })
  // }, [user, setValue])

  const [edit, setEdit] = useState<boolean>(false)

  return (
    <div className='container mx-auto'>
      {/* <PageHeader>{t('profile.header')}</PageHeader> */}
      Profile
      {/* <form onSubmit={handleSubmit((data) => handleSubmitContractor(data))}>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-2'>
          <Fieldset label='Profile information'>
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
          </Fieldset>
        </div>
        <SubmitButton className='mt-3'>Update profile</SubmitButton>
      </form> */}
      <div className='mt-5' />
    </div>
  )
}
export default Profile
