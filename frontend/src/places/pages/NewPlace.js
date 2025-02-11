import React,{useContext} from 'react';
import { useNavigate } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from "../../shared/context/auth-context";
import './PlaceForm.css';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  const navigate = useNavigate();

  const placeSubmitHandler = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title',formState.inputs.title.value);
    formData.append('description',formState.inputs.description.value);
    formData.append('address',formState.inputs.address.value);
    // formData.append('coordinates',{
    //   lat: 40.7484405,
    //   lng: -73.9878584
    // });
    formData.append('image',formState.inputs.image.value);
    // formData.append('creator',auth.userId);
    await sendRequest(process.env.REACT_APP_BACKEND_URL + '/places/','POST',formData,
      {
        Authorization: 'Bearer '+ auth.token
      }
      // JSON.stringify({
      //   title:formState.inputs.title.value,
      //   description:formState.inputs.description.value,
      //   address:formState.inputs.address.value,
      //   coordinates: {
      //     lat: 40.7484405,
      //     lng: -73.9878584
      //   },
      //   creator:auth.userId,
      // }),
      // {
      //   'Content-Type':'application/json'
      // }
    );
    navigate('/');
    // console.log(formState.inputs); // send this to the backend!
  };

  return (
    <>
    <ErrorModal error={error} onClear={clearError}/>
    <form className="place-form" onSubmit={placeSubmitHandler}>
    {isLoading && <LoadingSpinner asOverlay/> }
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter a valid description (at least 5 characters)."
        onInput={inputHandler}
      />
      <Input
        id="address"
        element="input"
        label="Address"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid address."
        onInput={inputHandler}
      />
      <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide an Image!" />
      <Button type="submit" disabled={!formState.isValid}>
        ADD PLACE
      </Button>
    </form>
    </>
  );
};

export default NewPlace;
