import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import {AuthProvider} from "../contexts/AuthContext.jsx";
import {SessionProvider} from "../contexts/SessionContext.jsx";
import {BoardProvider} from "../contexts/BoardContext.jsx";
import NotFound from "./NotFound.jsx";
import Board from "../canvas/Board.jsx";

function AppLayout() {
    return (
        <AuthProvider>
            <SessionProvider>
                <BoardProvider>
                    <Outlet/>
                </BoardProvider>
            </SessionProvider>
        </AuthProvider>
    );
}

const router = createBrowserRouter([
    {
        element: <AppLayout/>,
        errorElement: <div>Something went wrong on our side</div>,
        children: [
            {
                path: "/",
                element: <Board/>
            },
            {
                path: "/room/:roomCode",
                element: <Board/>
            }
        ]
    },
    {
        path: "*",
        element: <NotFound/>
    }
]);

function AppRouter() {
    return <RouterProvider router={router}/>;
}

export default AppRouter;