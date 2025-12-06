import { useSelector, useDispatch } from 'react-redux';
import { login, logoutAsync } from '../features/user/userSlice';


const useAuth = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, profile, token } = useSelector((state) => state.user);

    const handleLogin = (payload) => {
        dispatch(login(payload));
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return {
        isAuthenticated,
        user: profile,
        token,
        login: handleLogin,
        logout: handleLogout
    };
};

export default useAuth;
