import React, {useState,useEffect} from 'react'

import UsersList from '../components/UsersList';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { useHttpClient } from '../../shared/hooks/http-hook';

export default function Users() {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState([]);

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users/');
          setLoadedUsers(responseData.users);
        } catch (error) {
        }
      }
      fetchUsers();
    },[sendRequest]);

  

  return (
  <>
    <ErrorModal error={error} onClear={clearError}/>
    {isLoading && <div className='center'>
      <LoadingSpinner />
    </div>
    }
    {!isLoading && loadedUsers && <UsersList items={loadedUsers}/>}
  </>
  )
}
