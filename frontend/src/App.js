import React, {Suspense} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import Users from "./user/pages/Users";
// import NewPlace from "./places/pages/NewPlace";
// import UpdatePlace from "./places/pages/UpdatePlace";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
// import UserPlaces from "./places/pages/UserPlaces";
// import Auth from "./user/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";

const Users = React.lazy(() => import('./user/pages/Users'));
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const Auth = React.lazy(() => import('./user/pages/Auth'));


const App = () => {
  const {token, login, logout, userId} = useAuth();
  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/" index element={<Users />} />
        <Route path="/:userId/places" index element={<UserPlaces />} />
        <Route path="/places/new" index element={<NewPlace />} />
        <Route path="/places/:placeId" index element={<UpdatePlace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" index element={<Users />} />
        <Route path="/:userId/places" index element={<UserPlaces />} />
        <Route path="/auth" index element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }
  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!token,userId:userId, token:token, login: login, logout: logout }}
    >
      <Router>
        <MainNavigation />
        <main><Suspense fallback={<div className="center"><LoadingSpinner/></div>}>{routes}</Suspense></main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
