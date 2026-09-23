import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
export default function useAuth() { const dispatch = useDispatch(); const auth = useSelector(state => state.auth); const role = auth.user?.role; return { user: auth.user, role, isAuthenticated: Boolean(auth.token && auth.user), loading: auth.loading, login: () => {}, logout: () => dispatch(logout()), hasRole: (...roles) => roles.includes(role), isAdmin: role === 'admin', isEmployee: role === 'employee', isPassenger: role === 'passenger' } }
