import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LoaderIcon } from '../../assets/icons/loaderIcon.jsx';

export const PublicRoute = () => {
    // Consumimos los estados que ya tienes perfectamente creados en tu AuthContext
    const { isAuthenticated } = useContext(AuthContext);

    // 2. Si ya terminó de cargar y SÍ está autenticado, lo redirigimos al dashboard
    if (isAuthenticated) {
        return <Navigate to="/loading" replace />;
    }

    // 3. Si NO está autenticado (y ya terminó de cargar), mostramos la ruta solicitada (Login o Register)
    return <Outlet />;
};